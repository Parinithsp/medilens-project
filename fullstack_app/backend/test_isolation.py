import os
import sys
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine
from app.models import User, Report, Biomarker

client = TestClient(app)

class TestUserDataIsolation(unittest.TestCase):
    def setUp(self):
        # Register User A
        self.user_a_email = f"usera_{os.urandom(4).hex()}@example.com"
        res_a = client.post("/api/auth/register", json={
            "email": self.user_a_email,
            "password": "Password123!",
            "full_name": "User Alpha"
        })
        self.assertEqual(res_a.status_code, 200, res_a.text)
        self.token_a = res_a.json()["access_token"]
        self.headers_a = {"Authorization": f"Bearer {self.token_a}"}

        # Register User B
        self.user_b_email = f"userb_{os.urandom(4).hex()}@example.com"
        res_b = client.post("/api/auth/register", json={
            "email": self.user_b_email,
            "password": "Password123!",
            "full_name": "User Beta"
        })
        self.assertEqual(res_b.status_code, 200, res_b.text)
        self.token_b = res_b.json()["access_token"]
        self.headers_b = {"Authorization": f"Bearer {self.token_b}"}

    def test_new_user_starts_with_clean_dashboard(self):
        """Requirement 2: Newly registered user must see 0 reports, 0 biomarkers, 0 flagged."""
        res = client.get("/api/reports/stats/dashboard", headers=self.headers_b)
        self.assertEqual(res.status_code, 200)
        stats = res.json()
        self.assertEqual(stats["total_reports"], 0)
        self.assertEqual(stats["total_biomarkers"], 0)
        self.assertEqual(stats["abnormal_biomarkers"], 0)
        self.assertEqual(len(stats["recent_reports"]), 0)

        # List reports is empty
        res_list = client.get("/api/reports", headers=self.headers_b)
        self.assertEqual(res_list.status_code, 200)
        self.assertEqual(len(res_list.json()), 0)

    def test_user_data_isolation(self):
        """Requirement 1 & 4: User A uploads report; User B must NOT see it."""
        # Load sample report for User A
        res_load = client.post("/api/reports/load-sample/metabolic", headers=self.headers_a)
        self.assertEqual(res_load.status_code, 200, res_load.text)
        rep_a = res_load.json()
        rep_a_id = rep_a["id"]

        # Verify User A sees 1 report in dashboard stats
        res_stats_a = client.get("/api/reports/stats/dashboard", headers=self.headers_a)
        self.assertEqual(res_stats_a.status_code, 200)
        self.assertEqual(res_stats_a.json()["total_reports"], 1)

        # Verify User B STILL sees 0 reports in dashboard stats
        res_stats_b = client.get("/api/reports/stats/dashboard", headers=self.headers_b)
        self.assertEqual(res_stats_b.status_code, 200)
        self.assertEqual(res_stats_b.json()["total_reports"], 0)
        self.assertEqual(len(res_stats_b.json()["recent_reports"]), 0)

        # Verify User B cannot list User A's report
        res_list_b = client.get("/api/reports", headers=self.headers_b)
        self.assertEqual(res_list_b.status_code, 200)
        b_ids = [r["id"] for r in res_list_b.json()]
        self.assertNotIn(rep_a_id, b_ids)

        # Verify User B cannot access User A's report directly (404)
        res_detail_b = client.get(f"/api/reports/{rep_a_id}", headers=self.headers_b)
        self.assertEqual(res_detail_b.status_code, 404)

        # Verify User B cannot download PDF of User A's report (404)
        res_pdf_b = client.get(f"/api/reports/{rep_a_id}/pdf", headers=self.headers_b)
        self.assertEqual(res_pdf_b.status_code, 404)

        # Verify User B cannot delete User A's report (404)
        res_del_b = client.delete(f"/api/reports/{rep_a_id}", headers=self.headers_b)
        self.assertEqual(res_del_b.status_code, 404)

        # Verify User B cannot ask chat questions about User A's report (404)
        res_chat_b = client.post("/api/chat/ask", json={
            "report_id": rep_a_id,
            "message": "What is the glucose level?"
        }, headers=self.headers_b)
        self.assertEqual(res_chat_b.status_code, 404)

        # User A CAN access their own report
        res_detail_a = client.get(f"/api/reports/{rep_a_id}", headers=self.headers_a)
        self.assertEqual(res_detail_a.status_code, 200)
        self.assertEqual(res_detail_a.json()["id"], rep_a_id)

        # User A deleting report removes it from User A
        res_del_a = client.delete(f"/api/reports/{rep_a_id}", headers=self.headers_a)
        self.assertEqual(res_del_a.status_code, 200)

        res_stats_a2 = client.get("/api/reports/stats/dashboard", headers=self.headers_a)
        self.assertEqual(res_stats_a2.json()["total_reports"], 0)

    def test_profile_and_settings_features(self):
        """Test profile update, change password, data export, clear-all reports, and account deletion."""
        # 1. Update Profile
        res_prof = client.put("/api/auth/profile", json={"full_name": "Updated Dr. Alpha"}, headers=self.headers_a)
        self.assertEqual(res_prof.status_code, 200)
        self.assertEqual(res_prof.json()["full_name"], "Updated Dr. Alpha")

        # 2. Change Password
        res_pass = client.put("/api/auth/change-password", json={
            "current_password": "Password123!",
            "new_password": "NewSecurePassword456!"
        }, headers=self.headers_a)
        self.assertEqual(res_pass.status_code, 200)

        # Login with new password succeeds
        res_login = client.post("/api/auth/login", json={
            "email": self.user_a_email,
            "password": "NewSecurePassword456!"
        })
        self.assertEqual(res_login.status_code, 200)

        # 3. Load report for User A then Export Data
        client.post("/api/reports/load-sample/metabolic", headers=self.headers_a)
        res_export = client.get("/api/reports/export-data", headers=self.headers_a)
        self.assertEqual(res_export.status_code, 200)
        export_data = res_export.json()
        self.assertEqual(export_data["user"]["email"], self.user_a_email)
        self.assertEqual(export_data["reports_count"], 1)

        # 4. Clear all reports
        res_clear = client.post("/api/reports/clear-all", headers=self.headers_a)
        self.assertEqual(res_clear.status_code, 200)
        res_stats = client.get("/api/reports/stats/dashboard", headers=self.headers_a)
        self.assertEqual(res_stats.json()["total_reports"], 0)

        # 5. Delete Account
        res_del_acc = client.delete("/api/auth/account", headers=self.headers_a)
        self.assertEqual(res_del_acc.status_code, 200)

        # Subsequent requests with token_a fail with 401
        res_me = client.get("/api/auth/me", headers=self.headers_a)
        self.assertEqual(res_me.status_code, 401)


if __name__ == "__main__":
    unittest.main()
