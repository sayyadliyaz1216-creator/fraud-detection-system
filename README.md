# 🛡️ Real-Time Fraud Detection System (SentinelShield)

A lightweight, real-time full-stack fraud detection system built for hackathons by combining **Rule-Based Heuristic Scoring** with **Scikit-Learn Machine Learning (Random Forest Anomaly Detection)**.

Designed specifically to be simple, robust, and running 100% locally with zero external dependencies (no Docker, no Redis, no Kafka, no cloud databases).

---

## 🚀 Tech Stack

- **Frontend:** React + Vite (Vanilla CSS, Modern Dark Glassmorphism, Responsive)
- **Backend:** Python + FastAPI (RESTful API, CORS enabled)
- **Database:** SQLite (`fraud_detection.db`)
- **AI/ML:** Python + Scikit-Learn (`RandomForestClassifier` on transaction behavioral patterns)

---

## 📌 Core Features & Pages

1. **🔐 Login Page:**
   - Role-based analyst login (`admin` / `admin123` or `student` / `demo123`).
   - One-click quick-fill demo buttons for presentation speed.

2. **📊 Dashboard:**
   - Real-time KPI metrics: Total Transactions, Total Volume, Blocked Fraud, Flagged Alerts.
   - Decision distribution ratio bar (Allow vs Review vs Block).
   - Live stream of recent transactions processed.

3. **⚡ Transaction Page (Core Evaluation Engine):**
   - Submit new transactions (Amount, Device, Location, Account ID).
   - Instant live evaluation modal showing:
     - Transaction ID & Reference code
     - Final Decision (`ALLOW`, `REVIEW`, `BLOCK`)
     - Risk Score (/100)
     - Explainable Rule Violations
     - Scikit-Learn AI Anomaly Confidence (%)
   - One-click presentation preset scenarios for live demonstration.

4. **⚠️ Alerts Page:**
   - Real-time queue of all flagged transactions (`REVIEW` and `BLOCK`).
   - Filter by severity (`BLOCK` vs `REVIEW`) and search by city/user/ID.
   - Direct button to launch a fraud case investigation.

5. **📁 Fraud Case Page:**
   - Security analyst docket for managing flagged incidents.
   - Update case status (`OPEN`, `UNDER_REVIEW`, `RESOLVED_FRAUD`, `RESOLVED_LEGIT`).
   - Add investigator notes and save audit trail directly to SQLite.

---

## ⚙️ Fraud Risk Rules Matrix

| Condition | Risk Added | Reason Triggered |
| :--- | :--- | :--- |
| **Amount > ₹50,000** | **+25 risk** (+20 if ≥ ₹70k) | High transaction amount threshold |
| **New Device** | **+20 risk** | Unrecognized / new hardware detected |
| **Unusual Location** | **+20 risk** | Location differs from account home |
| **> 5 Transactions in short period** | **+25 risk** | High velocity burst anomaly |

### Decision Thresholds:
- **Risk < 40:** `ALLOW` (Green)
- **Risk 40 - 69:** `REVIEW` (Yellow / Amber)
- **Risk ≥ 70:** `BLOCK` (Crimson / Red)

---

## 🏃 Quick Start Guide

### Step 1: Start Backend (FastAPI)
Open a terminal in `backend`:
```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```
Backend API will be running at: ``  
Interactive Swagger Docs: `/docs`

### Step 2: Start Frontend (React + Vite)
Open a second terminal in `frontend`:
```powershell
cd frontend
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

## 🎯 Hackathon Demo Example (Try This Live!)

In the Transaction Page, enter:
- **Amount:** `75000`
- **Device:** `New`
- **Location:** `Delhi` (for `user_101` whose registered home is Mumbai)

**Output Result:**
- **Risk Score:** `85 / 100`
- **Decision:** `BLOCK`
- **Reasons:**
  - High transaction amount (Exceeds INR 50,000 threshold)
  - New device detected
  - Unusual location (Location 'Delhi' differs from usual profile 'Mumbai')
- **Scikit-Learn AI:** `FRAUD (91.2% anomaly probability)`
- Automatically added to **Alerts** and generated a new **Fraud Case** docket!
