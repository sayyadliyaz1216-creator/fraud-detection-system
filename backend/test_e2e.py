import urllib.request
import json

BASE = 'http://127.0.0.1:8000'

def post(url, data):
    req = urllib.request.Request(f'{BASE}{url}', data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def patch(url, data):
    req = urllib.request.Request(f'{BASE}{url}', data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def get(url):
    with urllib.request.urlopen(f'{BASE}{url}') as r:
        return json.loads(r.read().decode('utf-8'))

print('=== 1. Testing Login ===')
login_res = post('/api/auth/login', {'username': 'admin', 'password': 'admin123'})
print('Login success! User:', login_res['user']['full_name'], 'Role:', login_res['user']['role'])

print('\n=== 2. Testing Core Transaction Evaluation (User Prompt Example) ===')
tx1 = post('/api/transactions', {'user_id': 'user_101', 'amount': 75000, 'device': 'New', 'location': 'Delhi'})
print('Transaction ID:', tx1['transaction_id'])
print('Transaction Ref:', tx1['transaction_ref'])
print('Risk Score:', tx1['risk_score'])
print('Decision:', tx1['decision'])
print('Reasons:', tx1['reasons'])
print('ML Model:', tx1['ml_prediction'], f"({tx1['ml_anomaly_score']}%)")
print('Case Ref:', tx1['case_ref'])
assert tx1['risk_score'] == 85, f"Expected 85, got {tx1['risk_score']}"
assert tx1['decision'] == 'BLOCK', f"Expected BLOCK, got {tx1['decision']}"
print('--> Prompt example test: PASSED (Score: 85, Decision: BLOCK)!')

print('\n=== 3. Testing Alerts Feed ===')
alerts = get('/api/alerts')
found_alert = any(a['transaction_ref'] == tx1['transaction_ref'] for a in alerts)
print(f"Alert count: {len(alerts)}, Newly submitted TX in alerts: {found_alert}")
assert found_alert, 'New BLOCK transaction not found in alerts'
print('--> Alerts test: PASSED!')

print('\n=== 4. Testing Cases Docket & Update ===')
cases = get('/api/cases')
found_case = next((c for c in cases if c['transaction_ref'] == tx1['transaction_ref']), None)
print(f"Found case {found_case['case_ref']} for transaction {tx1['transaction_ref']}, Status: {found_case['status']}")
update_res = patch(f"/api/cases/{found_case['id']}", {'status': 'RESOLVED_FRAUD', 'notes': 'Verified unauthorized access'})
print('Case update result:', update_res['message'])
updated_cases = get('/api/cases')
c_after = next(c for c in updated_cases if c['id'] == found_case['id'])
print(f"Verified updated status: {c_after['status']}, Notes: {c_after['notes']}")
assert c_after['status'] == 'RESOLVED_FRAUD'
print('--> Case management test: PASSED!')

print('\n=== 5. Testing Normal Transaction (ALLOW) ===')
tx_allow = post('/api/transactions', {'user_id': 'user_101', 'amount': 2500, 'device': 'Existing', 'location': 'Mumbai'})
print('Allow Tx -> Score:', tx_allow['risk_score'], 'Decision:', tx_allow['decision'])
assert tx_allow['decision'] == 'ALLOW'
print('--> ALLOW test: PASSED!')

print('\n=== 6. Testing Medium Risk Transaction (REVIEW) ===')
tx_review = post('/api/transactions', {'user_id': 'user_102', 'amount': 55000, 'device': 'New', 'location': 'Delhi'})
print('Review Tx -> Score:', tx_review['risk_score'], 'Decision:', tx_review['decision'], 'Reasons:', tx_review['reasons'])
assert tx_review['decision'] == 'REVIEW'
print('--> REVIEW test: PASSED!')

print('\n=== 7. Testing Velocity Rule (>5 transactions) ===')
for i in range(5):
    post('/api/transactions', {'user_id': 'velocity_test_user', 'amount': 100, 'device': 'Existing', 'location': 'Delhi'})
tx_burst = post('/api/transactions', {'user_id': 'velocity_test_user', 'amount': 100, 'device': 'Existing', 'location': 'Delhi'})
print('Burst 6th Tx -> Score:', tx_burst['risk_score'], 'Reasons:', tx_burst['reasons'])
assert any('velocity' in r.lower() for r in tx_burst['reasons'])
print('--> Velocity rule test: PASSED!')

print('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY! ===')
