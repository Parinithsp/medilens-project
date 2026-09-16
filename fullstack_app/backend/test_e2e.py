import sys
import httpx

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== STARTING MEDILENS E2E INTEGRATION TESTS ===")
    client = httpx.Client(base_url=BASE_URL, timeout=30.0)

    # 1. Health check
    print("\n[1/7] Testing Health Check endpoint...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print(f"  [OK] Health Check Passed: {res.json()['status']} ({res.json()['app']} v{res.json()['version']})")

    # 2. Demo login
    print("\n[2/7] Testing Authentication (Demo Login)...")
    res = client.post("/auth/demo")
    assert res.status_code == 200, f"Demo login failed: {res.text}"
    token_data = res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"  [OK] Authenticated as: {token_data['user']['full_name']} ({token_data['user']['email']})")

    # 3. Load Sample Metabolic Panel Report
    print("\n[3/7] Testing Sample Report Loading (Metabolic Panel PDF)...")
    res = client.post("/reports/load-sample/metabolic", headers=headers)
    assert res.status_code == 200, f"Load sample failed: {res.text}"
    rep = res.json()
    print(f"  [OK] Loaded Report ID {rep['id']}: {rep['patient_name']} ({rep['original_name']})")
    print(f"    - Extracted Biomarkers: {len(rep['biomarkers'])}")
    for b in rep['biomarkers'][:5]:
        print(f"      - {b['test_name']:<22}: {b['value_str']} {b['unit']:<10} [{b['status']}] (Ref: {b['reference_range']})")

    # 4. Load Sample CBC Report
    print("\n[4/7] Testing Sample Report Loading (CBC Panel PDF)...")
    res = client.post("/reports/load-sample/cbc", headers=headers)
    assert res.status_code == 200, f"Load sample CBC failed: {res.text}"
    rep_cbc = res.json()
    print(f"  [OK] Loaded Report ID {rep_cbc['id']}: {rep_cbc['patient_name']}")
    print(f"    - Extracted Biomarkers: {len(rep_cbc['biomarkers'])}")
    for b in rep_cbc['biomarkers'][:4]:
        print(f"      - {b['test_name']:<22}: {b['value_str']} {b['unit']:<10} [{b['status']}]")

    # 5. Test AI Report Chat Q&A
    print("\n[5/7] Testing Context-Grounded AI Report Chat Assistant...")
    chat_query = {
        "report_id": rep["id"],
        "message": "What does my elevated fasting glucose mean?"
    }
    res = client.post("/chat/ask", json=chat_query, headers=headers)
    assert res.status_code == 200, f"Chat failed: {res.text}"
    chat_resp = res.json()
    print(f"  [OK] AI Response Received ({len(chat_resp['content'])} chars):")
    print("    " + "\n    ".join(chat_resp['content'].split("\n")[:8]))

    # Verify disclaimer in response
    assert "MediLens" in chat_resp['content'] or "diagnosis" in chat_resp['content'], "Disclaimer missing in chat"
    print("  [OK] Clinical disclaimer verified in chat response.")

    # 6. Test ReportLab PDF Summary Generation
    print("\n[6/7] Testing Downloadable PDF Summary (ReportLab)...")
    res = client.get(f"/reports/{rep['id']}/pdf")
    assert res.status_code == 200, f"PDF export failed: {res.text}"
    assert res.content.startswith(b"%PDF-"), "Output is not valid PDF binary"
    print(f"  [OK] Generated PDF Summary Verified: {len(res.content)} bytes, Content-Type: {res.headers.get('content-type')}")

    # 7. Test Dashboard Aggregated Metrics
    print("\n[7/7] Testing Dashboard Stats...")
    res = client.get("/reports/stats/dashboard", headers=headers)
    assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
    stats = res.json()
    print(f"  [OK] Dashboard Metrics: {stats['total_reports']} Reports, {stats['total_biomarkers']} Biomarkers, {stats['abnormal_biomarkers']} Flagged")

    print("\n=== ALL MEDILENS E2E INTEGRATION TESTS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    run_tests()
