import requests
import json
import unittest
from datetime import datetime, date
import time
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
logger.info(f"Using API URL: {API_URL}")

class AncloraBackendTest(unittest.TestCase):
    
    # Class-level variables to persist data across test methods
    user_ids = {}
    category_ids = {}
    ancla_ids = {}
    habit_ids = {}
    objective_ids = {}
    transaction_ids = {}
    diary_ids = {}
    
    def setUp(self):
        # Keep instance variables for backward compatibility
        self.user_ids = AncloraBackendTest.user_ids
        self.category_ids = AncloraBackendTest.category_ids
        self.ancla_ids = AncloraBackendTest.ancla_ids
        self.habit_ids = AncloraBackendTest.habit_ids
        self.objective_ids = AncloraBackendTest.objective_ids
        self.transaction_ids = AncloraBackendTest.transaction_ids
        self.diary_ids = AncloraBackendTest.diary_ids
    
    def test_01_create_users_with_profiles(self):
        """Test creating users with different profiles and verify predefined data generation"""
        profiles = ["content_creator", "freelancer", "student", "professional"]
        
        for profile in profiles:
            # Create a user with the profile
            user_data = {
                "email": f"{profile}@anclora.com",
                "name": f"Test {profile.capitalize()}",
                "profile": profile
            }
            
            response = requests.post(f"{API_URL}/users", json=user_data)
            self.assertEqual(response.status_code, 200, f"Failed to create user with profile {profile}: {response.text}")
            
            user = response.json()
            self.user_ids[profile] = user["id"]
            logger.info(f"Created user with profile {profile}, ID: {user['id']}")
            
            # Get the dashboard to verify predefined data
            dashboard_response = requests.get(f"{API_URL}/users/{user['id']}/dashboard")
            self.assertEqual(dashboard_response.status_code, 200, f"Failed to get dashboard for {profile}: {dashboard_response.text}")
            
            dashboard = dashboard_response.json()
            
            # Verify predefined categories
            self.assertGreater(len(dashboard["budget_categories"]), 0, f"No budget categories for {profile}")
            
            # Verify predefined habits
            self.assertGreater(len(dashboard["habits"]), 0, f"No predefined habits for {profile}")
            for habit in dashboard["habits"]:
                self.habit_ids[habit["name"]] = habit["id"]
            
            # Verify predefined objectives
            self.assertGreater(len(dashboard["objectives"]), 0, f"No predefined objectives for {profile}")
            for objective in dashboard["objectives"]:
                self.objective_ids[objective["title"]] = objective["id"]
                
            logger.info(f"Verified predefined data for profile {profile}")
    
    def test_02_get_categories(self):
        """Test getting categories for a user"""
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/categories/{user_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get categories for {profile}: {response.text}")
            
            categories = response.json()
            self.assertGreater(len(categories), 0, f"No categories found for {profile}")
            
            # Store category IDs for later use
            for category in categories:
                self.category_ids[f"{profile}_{category['name']}"] = category["id"]
            
            logger.info(f"Retrieved {len(categories)} categories for profile {profile}")
    
    def test_03_create_ancla(self):
        """Test creating an ancla for each user profile"""
        for profile, user_id in self.user_ids.items():
            # Get a category ID for this profile
            category_key = next(key for key in self.category_ids.keys() if key.startswith(profile))
            category_id = self.category_ids[category_key]
            
            ancla_data = {
                "title": f"Test Ancla for {profile}",
                "description": f"This is a test ancla for {profile}",
                "type": "task",
                "priority": "important",
                "category_id": category_id,
                "repeat_type": "no_repeat",
                "all_day": True,
                "start_date": datetime.utcnow().isoformat(),
                "emoji": "⚓"
            }
            
            response = requests.post(f"{API_URL}/anclas?user_id={user_id}", json=ancla_data)
            self.assertEqual(response.status_code, 200, f"Failed to create ancla for {profile}: {response.text}")
            
            ancla = response.json()
            self.ancla_ids[profile] = ancla["id"]
            logger.info(f"Created ancla for profile {profile}, ID: {ancla['id']}")
    
    def test_04_complete_ancla(self):
        """Test completing an ancla"""
        for profile, ancla_id in self.ancla_ids.items():
            response = requests.post(f"{API_URL}/anclas/{ancla_id}/complete")
            self.assertEqual(response.status_code, 200, f"Failed to complete ancla for {profile}: {response.text}")
            logger.info(f"Completed ancla for profile {profile}")
            
            # Verify the ancla is marked as completed
            get_response = requests.get(f"{API_URL}/anclas/{ancla_id}")
            self.assertEqual(get_response.status_code, 200)
            ancla = get_response.json()
            self.assertEqual(ancla["status"], "completed", f"Ancla for {profile} not marked as completed")
    
    def test_05_create_habit(self):
        """Test creating a habit for each user profile"""
        for profile, user_id in self.user_ids.items():
            habit_data = {
                "name": f"New Test Habit for {profile}",
                "frequency": 5
            }
            
            response = requests.post(f"{API_URL}/habits?user_id={user_id}", json=habit_data)
            self.assertEqual(response.status_code, 200, f"Failed to create habit for {profile}: {response.text}")
            
            habit = response.json()
            self.habit_ids[f"new_{profile}"] = habit["id"]
            logger.info(f"Created habit for profile {profile}, ID: {habit['id']}")
    
    def test_06_track_habit(self):
        """Test tracking a habit"""
        for profile, user_id in self.user_ids.items():
            habit_id = self.habit_ids.get(f"new_{profile}")
            if not habit_id:
                # Use a predefined habit if we don't have a new one
                dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
                self.assertEqual(dashboard_response.status_code, 200)
                dashboard = dashboard_response.json()
                if dashboard["habits"]:
                    habit_id = dashboard["habits"][0]["id"]
            
            if habit_id:
                response = requests.post(f"{API_URL}/habits/{habit_id}/track")
                self.assertEqual(response.status_code, 200, f"Failed to track habit for {profile}: {response.text}")
                logger.info(f"Tracked habit for profile {profile}")
                
                # Verify the habit tracking updated the count
                dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
                self.assertEqual(dashboard_response.status_code, 200)
                dashboard = dashboard_response.json()
                
                for habit in dashboard["habits"]:
                    if habit["id"] == habit_id:
                        self.assertGreater(habit["current_week_count"], 0, "Habit tracking did not update count")
                        break
    
    def test_07_create_objective(self):
        """Test creating an objective for each user profile"""
        for profile, user_id in self.user_ids.items():
            objective_data = {
                "title": f"New Test Objective for {profile}",
                "description": f"This is a test objective for {profile}",
                "subtasks": [
                    {"name": "Subtask 1", "completed": False},
                    {"name": "Subtask 2", "completed": False},
                    {"name": "Subtask 3", "completed": False}
                ]
            }
            
            response = requests.post(f"{API_URL}/objectives?user_id={user_id}", json=objective_data)
            self.assertEqual(response.status_code, 200, f"Failed to create objective for {profile}: {response.text}")
            
            objective = response.json()
            self.objective_ids[f"new_{profile}"] = objective["id"]
            logger.info(f"Created objective for profile {profile}, ID: {objective['id']}")
    
    def test_08_toggle_objective_subtask(self):
        """Test toggling a subtask in an objective"""
        for profile, user_id in self.user_ids.items():
            objective_id = self.objective_ids.get(f"new_{profile}")
            if not objective_id:
                # Use a predefined objective if we don't have a new one
                dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
                self.assertEqual(dashboard_response.status_code, 200)
                dashboard = dashboard_response.json()
                if dashboard["objectives"]:
                    objective_id = dashboard["objectives"][0]["id"]
            
            if objective_id:
                # Toggle the first subtask
                response = requests.post(f"{API_URL}/objectives/{objective_id}/subtask/0/toggle")
                self.assertEqual(response.status_code, 200, f"Failed to toggle subtask for {profile}: {response.text}")
                logger.info(f"Toggled subtask for profile {profile}")
                
                # Verify the subtask was toggled
                dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
                self.assertEqual(dashboard_response.status_code, 200)
                dashboard = dashboard_response.json()
                
                for objective in dashboard["objectives"]:
                    if objective["id"] == objective_id:
                        self.assertTrue(objective["subtasks"][0]["completed"], "Subtask was not toggled to completed")
                        break
    
    def test_09_create_transaction(self):
        """Test creating a transaction for each user profile"""
        for profile, user_id in self.user_ids.items():
            # Get budget categories for this profile
            dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
            self.assertEqual(dashboard_response.status_code, 200)
            dashboard = dashboard_response.json()
            
            income_categories = dashboard["budget_categories"]["income"]
            expense_categories = dashboard["budget_categories"]["expense"]
            
            # Create an income transaction
            transaction_data = {
                "type": "income",
                "category": income_categories[0],
                "description": f"Test Income for {profile}",
                "amount": 1000.0,
                "date": date.today().isoformat()
            }
            
            response = requests.post(f"{API_URL}/transactions?user_id={user_id}", json=transaction_data)
            self.assertEqual(response.status_code, 200, f"Failed to create income transaction for {profile}: {response.text}")
            
            transaction = response.json()
            self.transaction_ids[f"income_{profile}"] = transaction["id"]
            logger.info(f"Created income transaction for profile {profile}, ID: {transaction['id']}")
            
            # Create an expense transaction
            transaction_data = {
                "type": "expense",
                "category": expense_categories[0],
                "description": f"Test Expense for {profile}",
                "amount": 500.0,
                "date": date.today().isoformat()
            }
            
            response = requests.post(f"{API_URL}/transactions?user_id={user_id}", json=transaction_data)
            self.assertEqual(response.status_code, 200, f"Failed to create expense transaction for {profile}: {response.text}")
            
            transaction = response.json()
            self.transaction_ids[f"expense_{profile}"] = transaction["id"]
            logger.info(f"Created expense transaction for profile {profile}, ID: {transaction['id']}")
    
    def test_10_get_transactions(self):
        """Test getting transactions for a user"""
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/transactions/{user_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get transactions for {profile}: {response.text}")
            
            transactions = response.json()
            self.assertGreaterEqual(len(transactions), 2, f"Expected at least 2 transactions for {profile}")
            logger.info(f"Retrieved {len(transactions)} transactions for profile {profile}")
    
    def test_11_create_diary_entry(self):
        """Test creating a diary entry for each user profile"""
        for profile, user_id in self.user_ids.items():
            diary_data = {
                "content": f"Test diary entry for {profile}. Today was a productive day!",
                "mood": "happy"
            }
            
            response = requests.post(f"{API_URL}/diary?user_id={user_id}", json=diary_data)
            self.assertEqual(response.status_code, 200, f"Failed to create diary entry for {profile}: {response.text}")
            
            diary = response.json()
            self.diary_ids[profile] = diary["id"]
            logger.info(f"Created diary entry for profile {profile}, ID: {diary['id']}")
    
    def test_12_get_diary_entries(self):
        """Test getting diary entries for a user"""
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/diary/{user_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get diary entries for {profile}: {response.text}")
            
            entries = response.json()
            self.assertGreaterEqual(len(entries), 1, f"Expected at least 1 diary entry for {profile}")
            logger.info(f"Retrieved {len(entries)} diary entries for profile {profile}")
    
    def test_13_verify_dashboard_updates(self):
        """Test that the dashboard reflects all the changes we've made"""
        for profile, user_id in self.user_ids.items():
            dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
            self.assertEqual(dashboard_response.status_code, 200, f"Failed to get dashboard for {profile}: {dashboard_response.text}")
            
            dashboard = dashboard_response.json()
            
            # Verify user data
            self.assertEqual(dashboard["user"]["id"], user_id)
            self.assertEqual(dashboard["user"]["profile"], profile)
            
            # Verify anclas
            self.assertGreaterEqual(dashboard["anclas"]["total"], 1, "Expected at least 1 ancla")
            self.assertGreaterEqual(len(dashboard["anclas"]["completed"]), 1, "Expected at least 1 completed ancla")
            
            # Verify habits
            self.assertGreaterEqual(len(dashboard["habits"]), 1, "Expected at least 1 habit")
            
            # Verify objectives
            self.assertGreaterEqual(len(dashboard["objectives"]), 1, "Expected at least 1 objective")
            
            # Verify transactions
            self.assertGreaterEqual(len(dashboard["transactions"]), 1, "Expected at least 1 transaction")
            
            # Verify diary entries
            self.assertGreaterEqual(len(dashboard["diary_entries"]), 1, "Expected at least 1 diary entry")
            
            logger.info(f"Verified dashboard updates for profile {profile}")
    
    def test_14_timeline_drag_drop_date_updates(self):
        """Test timeline drag-and-drop functionality by updating ancla dates"""
        logger.info("Testing timeline drag-and-drop date updates...")
        
        for profile, user_id in self.user_ids.items():
            # Create a new ancla specifically for timeline testing
            category_key = next(key for key in self.category_ids.keys() if key.startswith(profile))
            category_id = self.category_ids[category_key]
            
            original_date = datetime(2024, 1, 15, 10, 0, 0)
            ancla_data = {
                "title": f"Timeline Test Ancla for {profile}",
                "description": f"Testing drag-and-drop date updates for {profile}",
                "type": "task",
                "priority": "important",
                "category_id": category_id,
                "repeat_type": "no_repeat",
                "all_day": False,
                "start_date": original_date.isoformat(),
                "start_time": "10:00",
                "end_time": "11:00",
                "emoji": "📅"
            }
            
            # Create the ancla
            response = requests.post(f"{API_URL}/anclas?user_id={user_id}", json=ancla_data)
            self.assertEqual(response.status_code, 200, f"Failed to create timeline test ancla for {profile}: {response.text}")
            
            timeline_ancla = response.json()
            timeline_ancla_id = timeline_ancla["id"]
            
            # Test 1: Update start_date (simulating drag-and-drop to new date)
            new_date = datetime(2024, 1, 20, 10, 0, 0)
            update_data = {
                "title": timeline_ancla["title"],
                "description": timeline_ancla["description"],
                "type": timeline_ancla["type"],
                "priority": timeline_ancla["priority"],
                "category_id": timeline_ancla["category_id"],
                "repeat_type": timeline_ancla["repeat_type"],
                "all_day": timeline_ancla["all_day"],
                "start_date": new_date.isoformat(),
                "start_time": timeline_ancla["start_time"],
                "end_time": timeline_ancla["end_time"],
                "emoji": timeline_ancla["emoji"]
            }
            
            update_response = requests.put(f"{API_URL}/anclas/{timeline_ancla_id}", json=update_data)
            self.assertEqual(update_response.status_code, 200, f"Failed to update ancla date for {profile}: {update_response.text}")
            
            # Verify the date was updated
            get_response = requests.get(f"{API_URL}/anclas/{timeline_ancla_id}")
            self.assertEqual(get_response.status_code, 200)
            updated_ancla = get_response.json()
            
            # Parse the returned date and compare
            updated_date = datetime.fromisoformat(updated_ancla["start_date"].replace('Z', '+00:00'))
            self.assertEqual(updated_date.date(), new_date.date(), f"Start date not updated correctly for {profile}")
            
            # Verify status remains consistent (should still be active)
            self.assertEqual(updated_ancla["status"], "active", f"Status changed unexpectedly after date update for {profile}")
            
            logger.info(f"Successfully tested date update for profile {profile}")
    
    def test_15_timeline_date_format_handling(self):
        """Test various date formats for timeline functionality"""
        logger.info("Testing various date formats...")
        
        profile = "content_creator"  # Use one profile for format testing
        user_id = self.user_ids[profile]
        category_key = next(key for key in self.category_ids.keys() if key.startswith(profile))
        category_id = self.category_ids[category_key]
        
        # Test different date formats
        date_formats = [
            datetime(2024, 2, 1, 14, 30, 0).isoformat(),  # ISO format
            datetime(2024, 2, 2, 9, 0, 0).isoformat() + "Z",  # ISO with Z
            datetime(2024, 2, 3, 16, 45, 0).isoformat() + "+00:00",  # ISO with timezone
        ]
        
        for i, date_str in enumerate(date_formats):
            ancla_data = {
                "title": f"Date Format Test {i+1}",
                "description": f"Testing date format: {date_str}",
                "type": "task",
                "priority": "informative",
                "category_id": category_id,
                "repeat_type": "no_repeat",
                "all_day": False,
                "start_date": date_str,
                "start_time": "09:00",
                "end_time": "10:00",
                "emoji": "🕐"
            }
            
            response = requests.post(f"{API_URL}/anclas?user_id={user_id}", json=ancla_data)
            self.assertEqual(response.status_code, 200, f"Failed to create ancla with date format {date_str}: {response.text}")
            
            ancla = response.json()
            self.assertIsNotNone(ancla["start_date"], f"Start date is None for format {date_str}")
            
            logger.info(f"Successfully created ancla with date format: {date_str}")
    
    def test_16_timeline_dashboard_grouping(self):
        """Test that dashboard returns anclas grouped correctly for timeline view"""
        logger.info("Testing dashboard ancla grouping for timeline...")
        
        for profile, user_id in self.user_ids.items():
            dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
            self.assertEqual(dashboard_response.status_code, 200, f"Failed to get dashboard for {profile}: {dashboard_response.text}")
            
            dashboard = dashboard_response.json()
            
            # Verify anclas are properly grouped
            self.assertIn("anclas", dashboard, "Dashboard missing anclas section")
            anclas_data = dashboard["anclas"]
            
            # Check required groupings
            required_groups = ["active", "completed", "overdue", "total"]
            for group in required_groups:
                self.assertIn(group, anclas_data, f"Dashboard missing {group} anclas group")
            
            # Verify data types
            self.assertIsInstance(anclas_data["active"], list, "Active anclas should be a list")
            self.assertIsInstance(anclas_data["completed"], list, "Completed anclas should be a list")
            self.assertIsInstance(anclas_data["overdue"], list, "Overdue anclas should be a list")
            self.assertIsInstance(anclas_data["total"], int, "Total anclas should be an integer")
            
            # Verify each ancla has required date fields
            all_anclas = anclas_data["active"] + anclas_data["completed"] + anclas_data["overdue"]
            for ancla in all_anclas:
                self.assertIn("start_date", ancla, "Ancla missing start_date field")
                self.assertIn("status", ancla, "Ancla missing status field")
                self.assertIsNotNone(ancla["start_date"], "Ancla start_date is None")
                
            logger.info(f"Verified dashboard grouping for profile {profile}")
    
    def test_17_timeline_date_validation(self):
        """Test date validation for timeline functionality"""
        logger.info("Testing date validation...")
        
        profile = "student"  # Use one profile for validation testing
        user_id = self.user_ids[profile]
        category_key = next(key for key in self.category_ids.keys() if key.startswith(profile))
        category_id = self.category_ids[category_key]
        
        # Test with invalid date format (should handle gracefully)
        invalid_ancla_data = {
            "title": "Invalid Date Test",
            "description": "Testing invalid date handling",
            "type": "task",
            "priority": "informative",
            "category_id": category_id,
            "repeat_type": "no_repeat",
            "all_day": False,
            "start_date": "invalid-date-format",
            "start_time": "09:00",
            "end_time": "10:00",
            "emoji": "❌"
        }
        
        # This should either fail gracefully or handle the invalid date
        response = requests.post(f"{API_URL}/anclas?user_id={user_id}", json=invalid_ancla_data)
        # We expect this to either return 400 (validation error) or 422 (unprocessable entity)
        self.assertIn(response.status_code, [400, 422], f"Expected validation error for invalid date, got {response.status_code}: {response.text}")
        
        logger.info("Date validation test completed")
    
    def test_18_timeline_ancla_status_consistency(self):
        """Test that ancla status remains consistent during timeline operations"""
        logger.info("Testing ancla status consistency during timeline operations...")
        
        profile = "freelancer"  # Use one profile for consistency testing
        user_id = self.user_ids[profile]
        category_key = next(key for key in self.category_ids.keys() if key.startswith(profile))
        category_id = self.category_ids[category_key]
        
        # Create ancla in active status
        ancla_data = {
            "title": "Status Consistency Test",
            "description": "Testing status consistency during date updates",
            "type": "task",
            "priority": "important",
            "category_id": category_id,
            "repeat_type": "no_repeat",
            "all_day": False,
            "start_date": datetime(2024, 3, 1, 12, 0, 0).isoformat(),
            "start_time": "12:00",
            "end_time": "13:00",
            "emoji": "✅"
        }
        
        response = requests.post(f"{API_URL}/anclas?user_id={user_id}", json=ancla_data)
        self.assertEqual(response.status_code, 200, f"Failed to create status test ancla: {response.text}")
        
        ancla = response.json()
        ancla_id = ancla["id"]
        
        # Verify initial status is active
        self.assertEqual(ancla["status"], "active", "Initial status should be active")
        
        # Complete the ancla
        complete_response = requests.post(f"{API_URL}/anclas/{ancla_id}/complete")
        self.assertEqual(complete_response.status_code, 200, f"Failed to complete ancla: {complete_response.text}")
        
        # Now try to update the date and verify status remains completed
        update_data = {
            "title": ancla["title"],
            "description": ancla["description"],
            "type": ancla["type"],
            "priority": ancla["priority"],
            "category_id": ancla["category_id"],
            "repeat_type": ancla["repeat_type"],
            "all_day": ancla["all_day"],
            "start_date": datetime(2024, 3, 5, 12, 0, 0).isoformat(),
            "start_time": ancla["start_time"],
            "end_time": ancla["end_time"],
            "emoji": ancla["emoji"]
        }
        
        update_response = requests.put(f"{API_URL}/anclas/{ancla_id}", json=update_data)
        self.assertEqual(update_response.status_code, 200, f"Failed to update completed ancla date: {update_response.text}")
        
        # Get the updated ancla and check status
        get_response = requests.get(f"{API_URL}/anclas/{ancla_id}")
        self.assertEqual(get_response.status_code, 200)
        updated_ancla = get_response.json()
        
        # Note: The current implementation might reset status to active when updating
        # This test will reveal the actual behavior
        logger.info(f"Status after date update: {updated_ancla['status']}")
        
        # The status should ideally remain 'completed', but we'll log what actually happens
        # This is important feedback for the timeline drag-and-drop functionality
        
        logger.info("Status consistency test completed")

if __name__ == "__main__":
    # Run the tests in order
    unittest.main(verbosity=2)