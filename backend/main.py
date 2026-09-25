import random
import string
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import (
    init_db,
    get_db,
    save_transaction,
    get_all_transactions,
    get_alerts,
    get_cases,
    update_case_status,
    get_dashboard_metrics,
    get_user_recent_tx_count,
    get_user_home_location
)
from rules_engine import evaluate_transaction_rules
from ml_model import fraud_detector_ml

# Initialize DB tables and seed data if needed
init_db()

app = FastAPI(
    title="Real-Time Fraud Detection System API",
    description="FastAPI Backend for Real-Time Financial Fraud Risk Assessment",
    version="1.0.0"
)

# Enable CORS for React + Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class LoginRequest(BaseModel):
    username: str
    password: str

class TransactionRequest(BaseModel):
    user_id: str = Field(default="user_101", description="Account or user identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    device: str = Field(..., description="Device used, e.g. 'Existing' or 'New'")
    location: str = Field(..., description="Transaction location, e.g. 'Delhi', 'Mumbai'")

class CaseUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

# --- Helper Functions ---

def generate_tx_ref() -> str:
    digits = ''.join(random.choices(string.digits, k=5))
    return f"TXN-{digits}"

# --- API Endpoints ---

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Real-Time Fraud Detection System",
        "version": "1.0.0",
        "endpoints": [
            "/api/auth/login",
            "/api/transactions",
            "/api/alerts",
            "/api/cases",
            "/api/dashboard/stats"
        ]
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (req.username.strip(),))
    user = cursor.fetchone()
    conn.close()

    if not user or user["password"] != req.password.strip():
        # Allow fallback login for demo convenience if user types demo credentials
        if req.username in ("admin", "student", "analyst") and req.password in ("admin123", "demo123", "password"):
            return {
                "token": "demo-jwt-token-12345",
                "user": {
                    "id": 1,
                    "username": req.username,
                    "full_name": "Security Analyst",
                    "role": "Fraud Investigation Lead",
                    "home_location": "Delhi"
                }
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Default demo accounts: admin / admin123 or student / demo123"
        )

    return {
        "token": f"bearer-token-{user['id']}",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
            "home_location": user["home_location"]
        }
    }

@app.post("/api/transactions")
def submit_transaction(tx: TransactionRequest):
    """
    Core Function:
    Analyzes transaction, evaluates rule-based risk score + scikit-learn ML anomaly detection,
    stores in SQLite, and returns transaction ID, risk score, decision, and reasons.
    """
    user_id = tx.user_id.strip() or "user_101"
    amount = float(tx.amount)
    device = tx.device.strip()
    location = tx.location.strip()
    
    # 1. Fetch user's registered home location from SQLite
    home_location = get_user_home_location(user_id)

    # 2. Velocity check: Count recent transactions from SQLite in the last 10 minutes
    recent_tx_count = get_user_recent_tx_count(user_id, minutes=10)

    # 3. Rule Engine Evaluation
    rule_results = evaluate_transaction_rules(
        amount=amount,
        device=device,
        location=location,
        home_location=home_location,
        recent_tx_count=recent_tx_count
    )

    # 4. Scikit-Learn ML Model Evaluation
    is_new_device = device.lower() in ("new", "new device", "unknown")
    is_unusual_loc = (location.lower() != home_location.lower()) or (location.lower() in ("unusual", "foreign", "london", "moscow", "lagos"))
    ml_result = fraud_detector_ml.predict(
        amount=amount,
        is_new_device=is_new_device,
        is_unusual_loc=is_unusual_loc,
        recent_tx_count=recent_tx_count
    )

    # 5. Save to SQLite database
    now_iso = datetime.now(timezone.utc).isoformat()
    tx_ref = generate_tx_ref()

    record_to_save = {
        "transaction_ref": tx_ref,
        "user_id": user_id,
        "amount": amount,
        "device": device,
        "location": location,
        "timestamp": now_iso,
        "risk_score": rule_results["risk_score"],
        "decision": rule_results["decision"],
        "reasons": rule_results["reasons"],
        "ml_anomaly_score": ml_result["ml_anomaly_score"],
        "ml_prediction": ml_result["ml_prediction"]
    }

    db_res = save_transaction(record_to_save)

    # Return response adhering strictly to API specifications
    return {
        "transaction_id": db_res["id"],
        "transaction_ref": tx_ref,
        "amount": amount,
        "device": device,
        "location": location,
        "user_id": user_id,
        "risk_score": rule_results["risk_score"],
        "decision": rule_results["decision"],
        "reasons": rule_results["reasons"],
        "ml_anomaly_score": ml_result["ml_anomaly_score"],
        "ml_prediction": ml_result["ml_prediction"],
        "timestamp": now_iso,
        "case_ref": db_res.get("case_ref")
    }

@app.get("/api/transactions")
def list_transactions():
    """Retrieve all processed transactions from SQLite."""
    return get_all_transactions(limit=100)

@app.get("/api/alerts")
def list_alerts():
    """Retrieve suspicious transactions flagged for REVIEW or BLOCK."""
    return get_alerts()

@app.get("/api/cases")
def list_cases():
    """Retrieve fraud investigation cases."""
    return get_cases()

@app.patch("/api/cases/{case_id}")
def update_case(case_id: int, req: CaseUpdateRequest):
    """Update case status (OPEN, UNDER_REVIEW, RESOLVED_FRAUD, RESOLVED_LEGIT) and notes."""
    success = update_case_status(
        case_id=case_id,
        status=req.status,
        notes=req.notes,
        assigned_to=req.assigned_to
    )
    if not success:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case updated successfully", "case_id": case_id, "status": req.status}

@app.get("/api/dashboard/stats")
def dashboard_stats():
    """Aggregated stats and recent transactions for real-time dashboard display."""
    return get_dashboard_metrics()
@app.get("/api/ml/metrics")
def ml_metrics():
    """Return Random Forest model evaluation metrics."""
    return fraud_detector_ml.get_metrics()