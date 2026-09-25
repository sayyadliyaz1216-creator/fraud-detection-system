import sqlite3
import json
from datetime import datetime, timezone
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "fraud_detection.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Users table for authentication & profile
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        home_location TEXT NOT NULL
    );
    """)

    # 2. Transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_ref TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        device TEXT NOT NULL,
        location TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        decision TEXT NOT NULL,
        reasons TEXT NOT NULL,
        ml_anomaly_score REAL DEFAULT 0.0,
        ml_prediction TEXT DEFAULT 'NORMAL',
        status TEXT DEFAULT 'PROCESSED'
    );
    """)

    # 3. Fraud Cases table for case investigation
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fraud_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_ref TEXT UNIQUE NOT NULL,
        transaction_id INTEGER NOT NULL,
        status TEXT DEFAULT 'OPEN',
        severity TEXT DEFAULT 'HIGH',
        notes TEXT DEFAULT '',
        assigned_to TEXT DEFAULT 'Unassigned',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions (id)
    );
    """)

    # Check and seed default users with hashed passwords
    import bcrypt
    def _quick_hash(pwd: str) -> str:
        return bcrypt.hashpw(pwd.encode('utf-8')[:72], bcrypt.gensalt(12)).decode('utf-8')

    default_seed_users = [
        ('admin', _quick_hash('admin123'), 'System Administrator', 'ADMIN', 'Mumbai'),
        ('analyst', _quick_hash('analyst123'), 'Fraud Risk Analyst', 'ANALYST', 'Delhi'),
        ('viewer', _quick_hash('viewer123'), 'Auditor (Read-Only)', 'VIEWER', 'Bangalore')
    ]

    for u, p_hash, name, r, loc in default_seed_users:
        cursor.execute("SELECT id, password FROM users WHERE LOWER(username) = LOWER(?)", (u,))
        existing = cursor.fetchone()
        if not existing:
            cursor.execute("""
            INSERT INTO users (username, password, full_name, role, home_location)
            VALUES (?, ?, ?, ?, ?)
            """, (u, p_hash, name, r, loc))
        elif not existing["password"].startswith("$2b$") and not existing["password"].startswith("$2a$"):
            cursor.execute("UPDATE users SET password = ?, role = ? WHERE id = ?", (p_hash, r, existing["id"]))

    # Upgrade any remaining plaintext passwords
    cursor.execute("SELECT id, password FROM users")
    for row in cursor.fetchall():
        if not row["password"].startswith("$2b$") and not row["password"].startswith("$2a$"):
            cursor.execute("UPDATE users SET password = ? WHERE id = ?", (_quick_hash(row["password"]), row["id"]))

    cursor.execute("SELECT COUNT(*) as count FROM transactions")
    if cursor.fetchone()["count"] == 0:
        # Seed a few realistic transactions so dashboard and alerts look populated
        seed_data = [
            (
                "TXN-1001", "user_101", 1250.00, "Existing", "Mumbai",
                datetime.now(timezone.utc).isoformat(), 0, "ALLOW",
                json.dumps(["Normal low-value transaction", "Recognized device"]),
                5.2, "NORMAL", "COMPLETED"
            ),
            (
                "TXN-1002", "user_102", 52000.00, "Existing", "Delhi",
                datetime.now(timezone.utc).isoformat(), 45, "REVIEW",
                json.dumps(["High transaction amount (> 50,000)"]),
                48.5, "SUSPICIOUS", "FLAGGED"
            ),
            (
                "TXN-1003", "user_103", 85000.00, "New", "London",
                datetime.now(timezone.utc).isoformat(), 85, "BLOCK",
                json.dumps(["High transaction amount (> 50,000)", "New device", "Unusual location"]),
                92.0, "FRAUD", "BLOCKED"
            ),
            (
                "TXN-1004", "user_104", 4500.00, "Existing", "Bangalore",
                datetime.now(timezone.utc).isoformat(), 0, "ALLOW",
                json.dumps(["Standard transaction amount", "Verified device"]),
                8.1, "NORMAL", "COMPLETED"
            ),
            (
                "TXN-1005", "user_105", 64000.00, "New", "Delhi",
                datetime.now(timezone.utc).isoformat(), 65, "REVIEW",
                json.dumps(["High transaction amount (> 50,000)", "New device"]),
                62.4, "SUSPICIOUS", "FLAGGED"
            )
        ]
        
        for tx in seed_data:
            cursor.execute("""
            INSERT INTO transactions (
                transaction_ref, user_id, amount, device, location,
                timestamp, risk_score, decision, reasons, ml_anomaly_score,
                ml_prediction, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, tx)
            
            tx_id = cursor.lastrowid
            decision = tx[7]
            if decision in ("REVIEW", "BLOCK"):
                case_ref = f"CASE-{tx_id + 5000}"
                severity = "CRITICAL" if decision == "BLOCK" else "ELEVATED"
                status = "OPEN" if decision == "BLOCK" else "UNDER_REVIEW"
                notes = f"Auto-generated case for {decision} decision with risk score {tx[6]}."
                cursor.execute("""
                INSERT INTO fraud_cases (
                    case_ref, transaction_id, status, severity, notes, assigned_to, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    case_ref, tx_id, status, severity, notes, "AI Security Officer",
                    datetime.now(timezone.utc).isoformat(), datetime.now(timezone.utc).isoformat()
                ))

    conn.commit()
    conn.close()

def get_user_recent_tx_count(user_id: str, minutes: int = 10) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT timestamp FROM transactions
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 20
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    now = datetime.now(timezone.utc)
    count = 0
    for row in rows:
        try:
            ts = datetime.fromisoformat(row["timestamp"])
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            diff = (now - ts).total_seconds()
            if -10 <= diff <= (minutes * 60):
                count += 1
        except Exception:
            pass
    return count

def get_user_home_location(user_id: str) -> str:
    # Known profile locations for typical demo users
    user_locations = {
        "user_101": "Mumbai",
        "user_102": "Delhi",
        "user_103": "Bangalore",
        "user_104": "Bangalore",
        "user_105": "Delhi",
        "demo_user": "Delhi",
        "student": "Delhi"
    }
    return user_locations.get(user_id, "Delhi")

def save_transaction(tx_data: dict) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    
    reasons_json = json.dumps(tx_data.get("reasons", []))
    status = "BLOCKED" if tx_data["decision"] == "BLOCK" else ("FLAGGED" if tx_data["decision"] == "REVIEW" else "COMPLETED")
    
    cursor.execute("""
    INSERT INTO transactions (
        transaction_ref, user_id, amount, device, location, timestamp,
        risk_score, decision, reasons, ml_anomaly_score, ml_prediction, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        tx_data["transaction_ref"],
        tx_data["user_id"],
        tx_data["amount"],
        tx_data["device"],
        tx_data["location"],
        tx_data["timestamp"],
        tx_data["risk_score"],
        tx_data["decision"],
        reasons_json,
        tx_data.get("ml_anomaly_score", 0.0),
        tx_data.get("ml_prediction", "NORMAL"),
        status
    ))
    
    tx_id = cursor.lastrowid
    
    # Auto-create case if suspicious
    case_id = None
    case_ref = None
    if tx_data["decision"] in ("REVIEW", "BLOCK"):
        case_ref = f"CASE-{tx_id + 5000}"
        severity = "CRITICAL" if tx_data["decision"] == "BLOCK" else "ELEVATED"
        notes = f"Transaction flagged with risk score {tx_data['risk_score']}/100. Reasons: {', '.join(tx_data.get('reasons', []))}"
        
        cursor.execute("""
        INSERT INTO fraud_cases (
            case_ref, transaction_id, status, severity, notes, assigned_to, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            case_ref, tx_id, "OPEN", severity, notes, "AI Security Officer",
            tx_data["timestamp"], tx_data["timestamp"]
        ))
        case_id = cursor.lastrowid

    conn.commit()
    conn.close()
    
    return {
        "id": tx_id,
        "transaction_ref": tx_data["transaction_ref"],
        "case_id": case_id,
        "case_ref": case_ref
    }

def get_all_transactions(limit: int = 100):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM transactions
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        item = dict(r)
        try:
            item["reasons"] = json.loads(item["reasons"])
        except Exception:
            item["reasons"] = [item["reasons"]]
        results.append(item)
    return results

def get_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, c.id as case_id, c.case_ref, c.status as case_status
        FROM transactions t
        LEFT JOIN fraud_cases c ON t.id = c.transaction_id
        WHERE t.decision IN ('REVIEW', 'BLOCK')
        ORDER BY t.id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    alerts = []
    for r in rows:
        item = dict(r)
        try:
            item["reasons"] = json.loads(item["reasons"])
        except Exception:
            item["reasons"] = [item["reasons"]]
        alerts.append(item)
    return alerts

def get_cases():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            c.*,
            t.transaction_ref,
            t.user_id,
            t.amount,
            t.device,
            t.location,
            t.risk_score,
            t.decision,
            t.reasons,
            t.timestamp as tx_timestamp
        FROM fraud_cases c
        JOIN transactions t ON c.transaction_id = t.id
        ORDER BY c.id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    cases = []
    for r in rows:
        item = dict(r)
        try:
            item["reasons"] = json.loads(item["reasons"])
        except Exception:
            item["reasons"] = [item["reasons"]]
        cases.append(item)
    return cases

def update_case_status(case_id: int, status: str, notes: str = None, assigned_to: str = None):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    
    fields = ["status = ?", "updated_at = ?"]
    params = [status, now]
    
    if notes is not None:
        fields.append("notes = ?")
        params.append(notes)
    if assigned_to is not None:
        fields.append("assigned_to = ?")
        params.append(assigned_to)
        
    params.append(case_id)
    query = f"UPDATE fraud_cases SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, params)
    conn.commit()
    conn.close()
    return True

def get_dashboard_metrics():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0) as total_volume, COALESCE(AVG(risk_score), 0) as avg_risk FROM transactions")
    summary = cursor.fetchone()
    
    cursor.execute("SELECT decision, COUNT(*) as count FROM transactions GROUP BY decision")
    decision_rows = cursor.fetchall()
    decisions = {r["decision"]: r["count"] for r in decision_rows}
    
    cursor.execute("SELECT COUNT(*) as open_cases FROM fraud_cases WHERE status != 'RESOLVED'")
    open_cases = cursor.fetchone()["open_cases"]
    
    # Recent 6 transactions
    cursor.execute("SELECT * FROM transactions ORDER BY id DESC LIMIT 6")
    recent_txs = []
    for r in cursor.fetchall():
        item = dict(r)
        try:
            item["reasons"] = json.loads(item["reasons"])
        except Exception:
            item["reasons"] = [item["reasons"]]
        recent_txs.append(item)
        
    conn.close()
    
    return {
        "total_transactions": summary["total_count"],
        "total_volume": round(summary["total_volume"], 2),
        "avg_risk_score": round(summary["avg_risk"], 1),
        "allowed_count": decisions.get("ALLOW", 0),
        "review_count": decisions.get("REVIEW", 0),
        "blocked_count": decisions.get("BLOCK", 0),
        "total_alerts": decisions.get("REVIEW", 0) + decisions.get("BLOCK", 0),
        "open_cases": open_cases,
        "recent_transactions": recent_txs
    }
