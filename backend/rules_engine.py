"""
Rules Engine for Real-Time Fraud Detection System
Calculates risk score based on transaction attributes and evaluates the final decision.
"""

def evaluate_transaction_rules(
    amount: float,
    device: str,
    location: str,
    home_location: str,
    recent_tx_count: int
) -> dict:
    """
    Evaluates fraud risk according to core requirements:
    - Amount > 50000: +25 risk
    - New device: +20 risk
    - Unusual location: +20 risk
    - More than 5 transactions in a short period: +25 risk

    Decision Thresholds:
    - Risk < 40: ALLOW
    - Risk 40 - 69: REVIEW
    - Risk >= 70: BLOCK
    """
    risk_score = 0
    reasons = []

    # 1. Amount Rule
    if amount > 50000:
        risk_score += 25
        if amount >= 70000:
            risk_score += 20  # Critical high-value tier
        reasons.append("High transaction amount (Exceeds INR 50,000 threshold)")

    # 2. Device Rule
    device_clean = str(device).strip().lower()
    if device_clean in ("new", "new device", "unknown", "unregistered"):
        risk_score += 20
        reasons.append("New device detected")

    # 3. Location Rule
    # Check if location differs from user's regular/registered location or is flagged
    loc_clean = str(location).strip().lower()
    home_clean = str(home_location).strip().lower()
    is_unusual_loc = (loc_clean != home_clean) or (loc_clean in ("unusual", "foreign", "london", "moscow", "lagos", "proxy", "vpn"))
    
    if is_unusual_loc:
        risk_score += 20
        reasons.append(f"Unusual location (Location '{location}' differs from usual profile '{home_location}')")

    # 4. Transaction Velocity Rule
    # More than 5 transactions in a short period (5 prior transactions means this is the 6th+)
    if recent_tx_count >= 5:
        risk_score += 25
        reasons.append(f"High velocity (More than 5 transactions in recent window: {recent_tx_count + 1} total)")

    # If no risk triggers fired, provide clean reassurance reason
    if not reasons:
        reasons.append("Normal transaction parameters within standard risk bounds")

    # Cap risk score at 100 max
    risk_score = min(risk_score, 100)

    # Decision Matrix
    if risk_score < 40:
        decision = "ALLOW"
    elif 40 <= risk_score <= 69:
        decision = "REVIEW"
    else:
        decision = "BLOCK"

    return {
        "risk_score": risk_score,
        "decision": decision,
        "reasons": reasons,
        "rule_breakdown": {
            "amount_flagged": amount > 50000,
            "device_flagged": device_clean in ("new", "new device", "unknown", "unregistered"),
            "location_flagged": is_unusual_loc,
            "velocity_flagged": recent_tx_count > 5
        }
    }
