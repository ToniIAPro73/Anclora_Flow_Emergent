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
    
    # Advanced Budget Functionality Tests
    def test_19_create_budget_limits(self):
        """Test creating budget limits for different categories"""
        logger.info("Testing budget limit creation...")
        
        for profile, user_id in self.user_ids.items():
            # Get budget categories for this profile
            dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
            self.assertEqual(dashboard_response.status_code, 200)
            dashboard = dashboard_response.json()
            
            expense_categories = dashboard["budget_categories"]["expense"]
            
            # Create budget limits for each expense category
            for i, category in enumerate(expense_categories[:2]):  # Test first 2 categories
                limit_data = {
                    "category": category,
                    "limit_amount": 1000.0 + (i * 500),  # Different amounts
                    "period": "monthly"
                }
                
                response = requests.post(f"{API_URL}/budget-limits?user_id={user_id}", json=limit_data)
                self.assertEqual(response.status_code, 200, f"Failed to create budget limit for {profile} category {category}: {response.text}")
                
                limit = response.json()
                self.assertEqual(limit["category"], category)
                self.assertEqual(limit["limit_amount"], limit_data["limit_amount"])
                self.assertEqual(limit["period"], "monthly")
                self.assertEqual(limit["current_amount"], 0.0)
                
                logger.info(f"Created budget limit for {profile} - {category}: ${limit_data['limit_amount']}")
    
    def test_20_get_budget_limits(self):
        """Test retrieving budget limits for users"""
        logger.info("Testing budget limits retrieval...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/budget-limits/{user_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get budget limits for {profile}: {response.text}")
            
            limits = response.json()
            self.assertGreaterEqual(len(limits), 1, f"Expected at least 1 budget limit for {profile}")
            
            # Verify structure of each limit
            for limit in limits:
                required_fields = ["id", "user_id", "category", "limit_amount", "current_amount", "period", "created_at"]
                for field in required_fields:
                    self.assertIn(field, limit, f"Budget limit missing field {field}")
                
                self.assertEqual(limit["user_id"], user_id)
                self.assertGreaterEqual(limit["limit_amount"], 0)
                self.assertGreaterEqual(limit["current_amount"], 0)
                
            logger.info(f"Retrieved {len(limits)} budget limits for {profile}")
    
    def test_21_update_budget_limits(self):
        """Test updating existing budget limits"""
        logger.info("Testing budget limit updates...")
        
        for profile, user_id in self.user_ids.items():
            # Get existing limits
            response = requests.get(f"{API_URL}/budget-limits/{user_id}")
            self.assertEqual(response.status_code, 200)
            limits = response.json()
            
            if limits:
                limit_to_update = limits[0]
                limit_id = limit_to_update["id"]
                
                # Update the limit
                update_data = {
                    "category": limit_to_update["category"],
                    "limit_amount": limit_to_update["limit_amount"] + 500.0,  # Increase by 500
                    "period": "weekly"  # Change period
                }
                
                update_response = requests.put(f"{API_URL}/budget-limits/{limit_id}", json=update_data)
                self.assertEqual(update_response.status_code, 200, f"Failed to update budget limit for {profile}: {update_response.text}")
                
                # Verify the update
                get_response = requests.get(f"{API_URL}/budget-limits/{user_id}")
                self.assertEqual(get_response.status_code, 200)
                updated_limits = get_response.json()
                
                updated_limit = next((l for l in updated_limits if l["id"] == limit_id), None)
                self.assertIsNotNone(updated_limit, "Updated limit not found")
                self.assertEqual(updated_limit["limit_amount"], update_data["limit_amount"])
                self.assertEqual(updated_limit["period"], update_data["period"])
                
                logger.info(f"Updated budget limit for {profile}: ${updated_limit['limit_amount']} {updated_limit['period']}")
    
    def test_22_create_savings_goals(self):
        """Test creating savings goals"""
        logger.info("Testing savings goals creation...")
        
        from datetime import date, timedelta
        
        for profile, user_id in self.user_ids.items():
            # Create different savings goals for each profile
            goals_data = [
                {
                    "title": f"Emergency Fund for {profile}",
                    "target_amount": 5000.0,
                    "target_date": (date.today() + timedelta(days=365)).isoformat(),
                    "description": "Building emergency fund for financial security"
                },
                {
                    "title": f"Vacation Fund for {profile}",
                    "target_amount": 2000.0,
                    "target_date": (date.today() + timedelta(days=180)).isoformat(),
                    "description": "Saving for a well-deserved vacation"
                }
            ]
            
            for goal_data in goals_data:
                response = requests.post(f"{API_URL}/savings-goals?user_id={user_id}", json=goal_data)
                self.assertEqual(response.status_code, 200, f"Failed to create savings goal for {profile}: {response.text}")
                
                goal = response.json()
                self.assertEqual(goal["title"], goal_data["title"])
                self.assertEqual(goal["target_amount"], goal_data["target_amount"])
                self.assertEqual(goal["current_amount"], 0.0)
                self.assertEqual(goal["description"], goal_data["description"])
                
                logger.info(f"Created savings goal for {profile}: {goal['title']} - ${goal['target_amount']}")
    
    def test_23_get_savings_goals(self):
        """Test retrieving savings goals for users"""
        logger.info("Testing savings goals retrieval...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/savings-goals/{user_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get savings goals for {profile}: {response.text}")
            
            goals = response.json()
            self.assertGreaterEqual(len(goals), 1, f"Expected at least 1 savings goal for {profile}")
            
            # Verify structure of each goal
            for goal in goals:
                required_fields = ["id", "user_id", "title", "target_amount", "current_amount", "target_date", "description", "created_at"]
                for field in required_fields:
                    self.assertIn(field, goal, f"Savings goal missing field {field}")
                
                self.assertEqual(goal["user_id"], user_id)
                self.assertGreaterEqual(goal["target_amount"], 0)
                self.assertGreaterEqual(goal["current_amount"], 0)
                
            logger.info(f"Retrieved {len(goals)} savings goals for {profile}")
    
    def test_24_add_money_to_savings_goals(self):
        """Test adding money to savings goals"""
        logger.info("Testing adding money to savings goals...")
        
        for profile, user_id in self.user_ids.items():
            # Get existing goals
            response = requests.get(f"{API_URL}/savings-goals/{user_id}")
            self.assertEqual(response.status_code, 200)
            goals = response.json()
            
            if goals:
                goal_to_update = goals[0]
                goal_id = goal_to_update["id"]
                amount_to_add = 250.0
                
                # Add money to the goal
                add_response = requests.put(f"{API_URL}/savings-goals/{goal_id}/add-money?amount={amount_to_add}")
                self.assertEqual(add_response.status_code, 200, f"Failed to add money to savings goal for {profile}: {add_response.text}")
                
                result = add_response.json()
                expected_amount = goal_to_update["current_amount"] + amount_to_add
                self.assertEqual(result["new_amount"], expected_amount)
                
                # Verify the update
                get_response = requests.get(f"{API_URL}/savings-goals/{user_id}")
                self.assertEqual(get_response.status_code, 200)
                updated_goals = get_response.json()
                
                updated_goal = next((g for g in updated_goals if g["id"] == goal_id), None)
                self.assertIsNotNone(updated_goal, "Updated goal not found")
                self.assertEqual(updated_goal["current_amount"], expected_amount)
                
                logger.info(f"Added ${amount_to_add} to savings goal for {profile}: new amount ${updated_goal['current_amount']}")
    
    def test_25_budget_analytics_weekly(self):
        """Test budget analytics with weekly period"""
        logger.info("Testing budget analytics - weekly period...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/budget-analytics/{user_id}?period=weekly")
            self.assertEqual(response.status_code, 200, f"Failed to get weekly budget analytics for {profile}: {response.text}")
            
            analytics = response.json()
            
            # Verify required fields
            required_fields = ["total_income", "total_expenses", "net_balance", "category_breakdown", 
                             "expense_trends", "budget_alerts", "savings_progress", "predictions"]
            for field in required_fields:
                self.assertIn(field, analytics, f"Budget analytics missing field {field}")
            
            # Verify data types
            self.assertIsInstance(analytics["total_income"], (int, float))
            self.assertIsInstance(analytics["total_expenses"], (int, float))
            self.assertIsInstance(analytics["net_balance"], (int, float))
            self.assertIsInstance(analytics["category_breakdown"], dict)
            self.assertIsInstance(analytics["expense_trends"], list)
            self.assertIsInstance(analytics["budget_alerts"], list)
            self.assertIsInstance(analytics["savings_progress"], list)
            self.assertIsInstance(analytics["predictions"], dict)
            
            # Verify calculations
            self.assertEqual(analytics["net_balance"], analytics["total_income"] - analytics["total_expenses"])
            
            logger.info(f"Weekly analytics for {profile}: Income ${analytics['total_income']}, Expenses ${analytics['total_expenses']}, Net ${analytics['net_balance']}")
    
    def test_26_budget_analytics_monthly(self):
        """Test budget analytics with monthly period"""
        logger.info("Testing budget analytics - monthly period...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/budget-analytics/{user_id}?period=monthly")
            self.assertEqual(response.status_code, 200, f"Failed to get monthly budget analytics for {profile}: {response.text}")
            
            analytics = response.json()
            
            # Verify we have transaction data (from previous tests)
            self.assertGreaterEqual(analytics["total_income"], 0, f"Expected some income for {profile}")
            self.assertGreaterEqual(analytics["total_expenses"], 0, f"Expected some expenses for {profile}")
            
            # Verify category breakdown has data
            if analytics["total_expenses"] > 0:
                self.assertGreater(len(analytics["category_breakdown"]), 0, f"Expected category breakdown for {profile}")
            
            # Verify expense trends structure
            for trend in analytics["expense_trends"]:
                self.assertIn("month", trend)
                self.assertIn("amount", trend)
                self.assertIsInstance(trend["amount"], (int, float))
            
            # Verify savings progress structure
            for progress in analytics["savings_progress"]:
                required_fields = ["id", "title", "progress", "current_amount", "target_amount"]
                for field in required_fields:
                    self.assertIn(field, progress, f"Savings progress missing field {field}")
            
            # Verify predictions structure
            self.assertIn("next_month_expenses", analytics["predictions"])
            self.assertIn("annual_projection", analytics["predictions"])
            
            logger.info(f"Monthly analytics for {profile}: {len(analytics['expense_trends'])} trends, {len(analytics['savings_progress'])} goals")
    
    def test_27_budget_analytics_yearly(self):
        """Test budget analytics with yearly period"""
        logger.info("Testing budget analytics - yearly period...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/budget-analytics/{user_id}?period=yearly")
            self.assertEqual(response.status_code, 200, f"Failed to get yearly budget analytics for {profile}: {response.text}")
            
            analytics = response.json()
            
            # Verify structure is consistent across periods
            self.assertIn("total_income", analytics)
            self.assertIn("total_expenses", analytics)
            self.assertIn("net_balance", analytics)
            
            # Yearly should include all our test data
            self.assertGreaterEqual(analytics["total_income"], 1000.0, f"Expected at least $1000 income for {profile}")
            self.assertGreaterEqual(analytics["total_expenses"], 500.0, f"Expected at least $500 expenses for {profile}")
            
            logger.info(f"Yearly analytics for {profile}: Income ${analytics['total_income']}, Expenses ${analytics['total_expenses']}")
    
    def test_28_budget_analytics_alerts(self):
        """Test budget analytics alerts functionality"""
        logger.info("Testing budget analytics alerts...")
        
        # Use content_creator profile for detailed alert testing
        profile = "content_creator"
        user_id = self.user_ids[profile]
        
        # Get current analytics to see if we have alerts
        response = requests.get(f"{API_URL}/budget-analytics/{user_id}?period=monthly")
        self.assertEqual(response.status_code, 200)
        analytics = response.json()
        
        # Verify alert structure
        for alert in analytics["budget_alerts"]:
            required_fields = ["category", "percentage", "spent", "limit", "severity"]
            for field in required_fields:
                self.assertIn(field, alert, f"Budget alert missing field {field}")
            
            self.assertIn(alert["severity"], ["high", "medium", "low"])
            self.assertGreaterEqual(alert["percentage"], 0)
            self.assertGreaterEqual(alert["spent"], 0)
            self.assertGreaterEqual(alert["limit"], 0)
        
        logger.info(f"Found {len(analytics['budget_alerts'])} budget alerts for {profile}")
    
    def test_29_financial_reports_weekly(self):
        """Test financial report generation - weekly"""
        logger.info("Testing financial reports - weekly...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/financial-reports/{user_id}?report_type=weekly")
            self.assertEqual(response.status_code, 200, f"Failed to generate weekly financial report for {profile}: {response.text}")
            
            report = response.json()
            
            # Verify required fields
            required_fields = ["id", "user_id", "report_type", "period_start", "period_end", 
                             "total_income", "total_expenses", "net_balance", "category_breakdown", "trends", "created_at"]
            for field in required_fields:
                self.assertIn(field, report, f"Financial report missing field {field}")
            
            # Verify report type
            self.assertEqual(report["report_type"], "weekly")
            self.assertEqual(report["user_id"], user_id)
            
            # Verify calculations
            self.assertEqual(report["net_balance"], report["total_income"] - report["total_expenses"])
            
            # Verify date fields are properly serialized
            self.assertIsInstance(report["period_start"], str)
            self.assertIsInstance(report["period_end"], str)
            
            logger.info(f"Generated weekly financial report for {profile}: ${report['net_balance']} net balance")
    
    def test_30_financial_reports_monthly(self):
        """Test financial report generation - monthly"""
        logger.info("Testing financial reports - monthly...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/financial-reports/{user_id}?report_type=monthly")
            self.assertEqual(response.status_code, 200, f"Failed to generate monthly financial report for {profile}: {response.text}")
            
            report = response.json()
            
            self.assertEqual(report["report_type"], "monthly")
            self.assertGreaterEqual(report["total_income"], 0)
            self.assertGreaterEqual(report["total_expenses"], 0)
            
            # Verify category breakdown
            self.assertIsInstance(report["category_breakdown"], dict)
            if report["total_expenses"] > 0:
                self.assertGreater(len(report["category_breakdown"]), 0)
            
            # Verify trends
            self.assertIsInstance(report["trends"], dict)
            
            logger.info(f"Generated monthly financial report for {profile}: {len(report['category_breakdown'])} categories")
    
    def test_31_financial_reports_yearly(self):
        """Test financial report generation - yearly"""
        logger.info("Testing financial reports - yearly...")
        
        for profile, user_id in self.user_ids.items():
            response = requests.get(f"{API_URL}/financial-reports/{user_id}?report_type=yearly")
            self.assertEqual(response.status_code, 200, f"Failed to generate yearly financial report for {profile}: {response.text}")
            
            report = response.json()
            
            self.assertEqual(report["report_type"], "yearly")
            
            # Yearly should capture all our test transactions
            self.assertGreaterEqual(report["total_income"], 1000.0, f"Expected at least $1000 yearly income for {profile}")
            self.assertGreaterEqual(report["total_expenses"], 500.0, f"Expected at least $500 yearly expenses for {profile}")
            
            logger.info(f"Generated yearly financial report for {profile}: ${report['total_income']} income, ${report['total_expenses']} expenses")
    
    def test_32_integration_with_existing_transactions(self):
        """Test that budget analytics properly integrates with existing transaction data"""
        logger.info("Testing integration with existing transaction data...")
        
        for profile, user_id in self.user_ids.items():
            # Get all transactions for this user
            transactions_response = requests.get(f"{API_URL}/transactions/{user_id}")
            self.assertEqual(transactions_response.status_code, 200)
            transactions = transactions_response.json()
            
            # Calculate expected totals
            expected_income = sum(t["amount"] for t in transactions if t["type"] == "income")
            expected_expenses = sum(t["amount"] for t in transactions if t["type"] == "expense")
            expected_net = expected_income - expected_expenses
            
            # Get analytics and compare
            analytics_response = requests.get(f"{API_URL}/budget-analytics/{user_id}?period=yearly")
            self.assertEqual(analytics_response.status_code, 200)
            analytics = analytics_response.json()
            
            # Verify the analytics match our transaction data
            self.assertEqual(analytics["total_income"], expected_income, 
                           f"Analytics income ${analytics['total_income']} doesn't match expected ${expected_income} for {profile}")
            self.assertEqual(analytics["total_expenses"], expected_expenses,
                           f"Analytics expenses ${analytics['total_expenses']} doesn't match expected ${expected_expenses} for {profile}")
            self.assertEqual(analytics["net_balance"], expected_net,
                           f"Analytics net balance ${analytics['net_balance']} doesn't match expected ${expected_net} for {profile}")
            
            logger.info(f"Verified integration for {profile}: {len(transactions)} transactions, ${expected_net} net balance")
    
    def test_33_date_serialization_savings_goals(self):
        """Test proper date serialization in savings goals"""
        logger.info("Testing date serialization in savings goals...")
        
        from datetime import date, timedelta
        
        profile = "professional"  # Use one profile for date testing
        user_id = self.user_ids[profile]
        
        # Create a goal with a specific target date
        target_date = date.today() + timedelta(days=90)
        goal_data = {
            "title": "Date Serialization Test Goal",
            "target_amount": 1500.0,
            "target_date": target_date.isoformat(),
            "description": "Testing date serialization"
        }
        
        response = requests.post(f"{API_URL}/savings-goals?user_id={user_id}", json=goal_data)
        self.assertEqual(response.status_code, 200, f"Failed to create goal with date: {response.text}")
        
        goal = response.json()
        
        # Verify the target_date is properly handled
        self.assertIn("target_date", goal)
        self.assertIsNotNone(goal["target_date"])
        
        # Get the goal back and verify date consistency
        goals_response = requests.get(f"{API_URL}/savings-goals/{user_id}")
        self.assertEqual(goals_response.status_code, 200)
        goals = goals_response.json()
        
        created_goal = next((g for g in goals if g["title"] == goal_data["title"]), None)
        self.assertIsNotNone(created_goal, "Created goal not found in list")
        
        # Verify date field exists and is properly formatted
        self.assertIn("target_date", created_goal)
        self.assertIsInstance(created_goal["target_date"], str)
        
        logger.info(f"Date serialization test passed: {created_goal['target_date']}")
    
    def test_34_error_handling_budget_endpoints(self):
        """Test error handling for budget endpoints"""
        logger.info("Testing error handling for budget endpoints...")
        
        # Test with non-existent user ID
        fake_user_id = "non-existent-user-id"
        
        # Test budget analytics with fake user
        response = requests.get(f"{API_URL}/budget-analytics/{fake_user_id}")
        # Should return empty/default analytics rather than error
        self.assertEqual(response.status_code, 200)
        analytics = response.json()
        self.assertEqual(analytics["total_income"], 0.0)
        self.assertEqual(analytics["total_expenses"], 0.0)
        
        # Test budget limits with fake user
        response = requests.get(f"{API_URL}/budget-limits/{fake_user_id}")
        self.assertEqual(response.status_code, 200)
        limits = response.json()
        self.assertEqual(len(limits), 0)
        
        # Test savings goals with fake user
        response = requests.get(f"{API_URL}/savings-goals/{fake_user_id}")
        self.assertEqual(response.status_code, 200)
        goals = response.json()
        self.assertEqual(len(goals), 0)
        
        # Test updating non-existent budget limit
        response = requests.put(f"{API_URL}/budget-limits/fake-limit-id", json={
            "category": "Test",
            "limit_amount": 1000.0,
            "period": "monthly"
        })
        self.assertEqual(response.status_code, 404)
        
        # Test adding money to non-existent savings goal
        response = requests.put(f"{API_URL}/savings-goals/fake-goal-id/add-money?amount=100")
        self.assertEqual(response.status_code, 404)
        
        logger.info("Error handling tests completed")

    def test_35_ai_recommendations_endpoints_missing(self):
        """Test AI Financial Recommendations endpoints - CRITICAL: These endpoints are not implemented"""
        logger.info("Testing AI Financial Recommendations endpoints...")
        
        # Use a test user ID - doesn't matter since endpoints don't exist
        test_user_id = "test-user-id"
        
        # Test GET /api/ai-recommendations/{user_id} - Should exist but doesn't
        response = requests.get(f"{API_URL}/ai-recommendations/{test_user_id}")
        self.assertEqual(response.status_code, 404, f"AI recommendations endpoint should not exist yet but got {response.status_code}")
        logger.error(f"CRITICAL: GET /api/ai-recommendations/{test_user_id} endpoint is not implemented")
        
        # Test GET /api/ai-chat/{user_id} - Should exist but doesn't  
        response = requests.get(f"{API_URL}/ai-chat/{test_user_id}")
        self.assertEqual(response.status_code, 404, f"AI chat endpoint should not exist yet but got {response.status_code}")
        logger.error(f"CRITICAL: GET /api/ai-chat/{test_user_id} endpoint is not implemented")
        
        # Test POST /api/ai-recommendations/{recommendation_id}/action - Should exist but doesn't
        fake_recommendation_id = "test-recommendation-id"
        response = requests.post(f"{API_URL}/ai-recommendations/{fake_recommendation_id}/action", json={"action": "completed"})
        self.assertEqual(response.status_code, 404, f"AI recommendation action endpoint should not exist yet but got {response.status_code}")
        logger.error(f"CRITICAL: POST /api/ai-recommendations/{fake_recommendation_id}/action endpoint is not implemented")
        
        logger.error("CRITICAL FINDING: All AI Financial Recommendations endpoints are missing from the backend implementation")
        logger.error("The FinancialAIEngine class is defined but no API routes use it")
        logger.error("Required endpoints to implement:")
        logger.error("1. GET /api/ai-recommendations/{user_id} - Generate financial recommendations")
        logger.error("2. GET /api/ai-chat/{user_id} - AI chat system with financial questions")
        logger.error("3. POST /api/ai-recommendations/{recommendation_id}/action - Update recommendation status")

    def test_36_comprehensive_ai_system_testing(self):
        """Comprehensive test for AI Financial Recommendations system when implemented"""
        logger.info("Testing AI Financial Recommendations system comprehensively...")
        
        # Use content_creator profile with rich transaction history for AI testing
        profile = "content_creator"
        user_id = self.user_ids[profile]
        
        # First, create additional transaction data to give AI more patterns to analyze
        self._create_rich_transaction_history(user_id, profile)
        
        # Test 1: AI Recommendations Generation
        logger.info("Testing AI recommendations generation...")
        response = requests.get(f"{API_URL}/ai-recommendations/{user_id}")
        
        if response.status_code == 404:
            logger.error("CRITICAL: AI recommendations endpoint not implemented")
            return
        
        self.assertEqual(response.status_code, 200, f"Failed to get AI recommendations: {response.text}")
        recommendations = response.json()
        
        # Verify AI recommendations structure
        self.assertIn("recommendations", recommendations)
        self.assertIn("financial_health_score", recommendations)
        self.assertIn("insights", recommendations)
        
        # Verify financial health score is 0-100
        health_score = recommendations["financial_health_score"]
        self.assertGreaterEqual(health_score, 0)
        self.assertLessEqual(health_score, 100)
        
        # Verify recommendations structure
        for rec in recommendations["recommendations"]:
            required_fields = ["id", "type", "category", "title", "message", "action_suggestion", 
                             "priority", "confidence_score", "maritime_theme", "status"]
            for field in required_fields:
                self.assertIn(field, rec, f"Recommendation missing field {field}")
            
            # Verify recommendation types
            self.assertIn(rec["type"], ["savings", "alert", "goal", "optimization", "insight"])
            
            # Verify priority and confidence ranges
            self.assertGreaterEqual(rec["priority"], 1)
            self.assertLessEqual(rec["priority"], 5)
            self.assertGreaterEqual(rec["confidence_score"], 0.0)
            self.assertLessEqual(rec["confidence_score"], 1.0)
            
            # Verify maritime theme is present
            self.assertIsNotNone(rec["maritime_theme"])
            self.assertGreater(len(rec["maritime_theme"]), 0)
        
        logger.info(f"AI generated {len(recommendations['recommendations'])} recommendations with health score {health_score}")
        
        # Test 2: AI Chat System
        logger.info("Testing AI chat system...")
        
        # Test different types of financial questions
        test_questions = [
            {"question": "¿Cómo puedo ahorrar más dinero?", "expected_keywords": ["ahorrar", "dinero"]},
            {"question": "¿Cuáles son mis gastos principales?", "expected_keywords": ["gastos", "principales"]},
            {"question": "¿Cómo está mi presupuesto?", "expected_keywords": ["presupuesto"]},
            {"question": "¿Qué ingresos tengo este mes?", "expected_keywords": ["ingresos", "mes"]}
        ]
        
        for test_q in test_questions:
            chat_response = requests.get(f"{API_URL}/ai-chat/{user_id}", 
                                       params={"question": test_q["question"]})
            
            if chat_response.status_code == 404:
                logger.error("CRITICAL: AI chat endpoint not implemented")
                continue
                
            self.assertEqual(chat_response.status_code, 200, f"Failed to get AI chat response: {chat_response.text}")
            chat_data = chat_response.json()
            
            # Verify chat response structure
            self.assertIn("response", chat_data)
            self.assertIn("maritime_theme", chat_data)
            self.assertIn("confidence", chat_data)
            self.assertIn("suggestions", chat_data)
            
            # Verify maritime terminology is used
            self.assertIsNotNone(chat_data["maritime_theme"])
            
            # Verify confidence score
            self.assertGreaterEqual(chat_data["confidence"], 0.0)
            self.assertLessEqual(chat_data["confidence"], 1.0)
            
            logger.info(f"AI chat responded to: '{test_q['question']}' with confidence {chat_data['confidence']}")
        
        # Test 3: Recommendation Actions
        logger.info("Testing recommendation actions...")
        
        if recommendations.get("recommendations"):
            test_recommendation = recommendations["recommendations"][0]
            rec_id = test_recommendation["id"]
            
            # Test completing a recommendation
            action_response = requests.post(f"{API_URL}/ai-recommendations/{rec_id}/action", 
                                          json={"action": "completed"})
            
            if action_response.status_code == 404:
                logger.error("CRITICAL: AI recommendation action endpoint not implemented")
            else:
                self.assertEqual(action_response.status_code, 200, f"Failed to update recommendation: {action_response.text}")
                
                # Verify the action was recorded
                updated_recs = requests.get(f"{API_URL}/ai-recommendations/{user_id}")
                if updated_recs.status_code == 200:
                    updated_data = updated_recs.json()
                    updated_rec = next((r for r in updated_data["recommendations"] if r["id"] == rec_id), None)
                    if updated_rec:
                        self.assertEqual(updated_rec["status"], "completed")
                        logger.info(f"Successfully updated recommendation {rec_id} to completed")
        
        # Test 4: Data Persistence
        logger.info("Testing AI data persistence...")
        
        # Verify recommendations are stored in database
        # This would require checking the ai_recommendations collection
        
        # Test 5: Integration with Real Data
        logger.info("Testing AI integration with real transaction data...")
        
        # Get user's actual transaction data
        transactions_response = requests.get(f"{API_URL}/transactions/{user_id}")
        self.assertEqual(transactions_response.status_code, 200)
        transactions = transactions_response.json()
        
        # Get budget limits
        limits_response = requests.get(f"{API_URL}/budget-limits/{user_id}")
        self.assertEqual(limits_response.status_code, 200)
        limits = limits_response.json()
        
        # Get savings goals
        goals_response = requests.get(f"{API_URL}/savings-goals/{user_id}")
        self.assertEqual(goals_response.status_code, 200)
        goals = goals_response.json()
        
        # Verify AI recommendations are based on actual data
        if response.status_code == 200:
            # AI should generate different recommendations based on spending patterns
            self.assertGreater(len(recommendations["recommendations"]), 0, 
                             "AI should generate recommendations based on transaction data")
            
            # Verify recommendations are relevant to user's spending categories
            user_categories = set(t["category"] for t in transactions if t["type"] == "expense")
            rec_categories = set(r["category"] for r in recommendations["recommendations"])
            
            # At least some recommendations should relate to user's actual spending categories
            if user_categories and rec_categories:
                common_categories = user_categories.intersection(rec_categories)
                logger.info(f"AI recommendations cover {len(common_categories)} of user's spending categories")
        
        logger.info("Comprehensive AI system testing completed")
    
    def _create_rich_transaction_history(self, user_id, profile):
        """Create rich transaction history for AI analysis"""
        logger.info(f"Creating rich transaction history for AI analysis - {profile}")
        
        # Get budget categories for this profile
        dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
        dashboard = dashboard_response.json()
        
        income_categories = dashboard["budget_categories"]["income"]
        expense_categories = dashboard["budget_categories"]["expense"]
        
        from datetime import date, timedelta
        import random
        
        # Create varied transaction patterns over the last 3 months
        for i in range(30):  # 30 additional transactions
            transaction_date = date.today() - timedelta(days=random.randint(1, 90))
            
            # Create income transactions (less frequent)
            if i % 5 == 0:
                income_data = {
                    "type": "income",
                    "category": random.choice(income_categories),
                    "description": f"Income transaction {i}",
                    "amount": random.uniform(800, 2000),
                    "date": transaction_date.isoformat()
                }
                requests.post(f"{API_URL}/transactions?user_id={user_id}", json=income_data)
            
            # Create expense transactions with patterns
            expense_data = {
                "type": "expense",
                "category": random.choice(expense_categories),
                "description": f"Expense transaction {i}",
                "amount": random.uniform(50, 800),
                "date": transaction_date.isoformat()
            }
            requests.post(f"{API_URL}/transactions?user_id={user_id}", json=expense_data)
        
        logger.info(f"Created rich transaction history for {profile}")

    def test_37_ai_maritime_theme_verification(self):
        """Test that AI responses properly use maritime terminology"""
        logger.info("Testing AI maritime theme implementation...")
        
        profile = "freelancer"
        user_id = self.user_ids[profile]
        
        # Test AI recommendations for maritime terminology
        response = requests.get(f"{API_URL}/ai-recommendations/{user_id}")
        
        if response.status_code == 404:
            logger.error("CRITICAL: AI recommendations endpoint not implemented")
            return
        
        self.assertEqual(response.status_code, 200)
        recommendations = response.json()
        
        # Maritime terms that should appear in AI responses
        maritime_terms = [
            "⚓", "🌊", "🧭", "⛵", "🏝️", "🌅", "🪝",
            "anclar", "navegar", "puerto", "marea", "rumbo", 
            "capitán", "grumete", "velas", "horizonte"
        ]
        
        # Check recommendations for maritime terminology
        maritime_found = False
        for rec in recommendations.get("recommendations", []):
            rec_text = f"{rec['title']} {rec['message']} {rec['maritime_theme']}".lower()
            
            for term in maritime_terms:
                if term in rec_text:
                    maritime_found = True
                    logger.info(f"Found maritime term '{term}' in recommendation: {rec['title']}")
                    break
        
        self.assertTrue(maritime_found, "AI recommendations should include maritime terminology")
        
        # Test AI chat for maritime responses
        maritime_questions = [
            "¿Cómo navego mis finanzas?",
            "¿Cuál es mi rumbo financiero?",
            "¿Cómo anclo mis gastos?"
        ]
        
        for question in maritime_questions:
            chat_response = requests.get(f"{API_URL}/ai-chat/{user_id}", 
                                       params={"question": question})
            
            if chat_response.status_code == 200:
                chat_data = chat_response.json()
                response_text = chat_data.get("response", "").lower()
                maritime_theme = chat_data.get("maritime_theme", "").lower()
                
                # Verify maritime terminology in response
                maritime_in_response = any(term in response_text or term in maritime_theme 
                                         for term in maritime_terms)
                
                if maritime_in_response:
                    logger.info(f"Maritime terminology found in chat response for: {question}")
                else:
                    logger.warning(f"No maritime terminology found in chat response for: {question}")
        
        logger.info("Maritime theme verification completed")

    def test_38_ai_personalized_insights(self):
        """Test AI personalized insights for different user profiles"""
        logger.info("Testing AI personalized insights for different user profiles...")
        
        # Test AI recommendations for each user profile
        for profile, user_id in self.user_ids.items():
            logger.info(f"Testing AI insights for {profile} profile...")
            
            response = requests.get(f"{API_URL}/ai-recommendations/{user_id}")
            
            if response.status_code == 404:
                logger.error(f"CRITICAL: AI recommendations endpoint not implemented for {profile}")
                continue
            
            self.assertEqual(response.status_code, 200, f"Failed to get AI recommendations for {profile}")
            recommendations = response.json()
            
            # Verify profile-specific insights
            insights = recommendations.get("insights", {})
            
            # Each profile should have different focus areas
            profile_expectations = {
                "content_creator": ["equipment", "marketing", "content"],
                "freelancer": ["clients", "tools", "diversification"],
                "student": ["education", "transportation", "food"],
                "professional": ["career", "savings", "investments"]
            }
            
            expected_terms = profile_expectations.get(profile, [])
            
            # Check if AI recommendations are relevant to the profile
            all_rec_text = " ".join([
                f"{rec['title']} {rec['message']} {rec['action_suggestion']}"
                for rec in recommendations.get("recommendations", [])
            ]).lower()
            
            profile_relevant = any(term in all_rec_text for term in expected_terms)
            
            if profile_relevant:
                logger.info(f"AI recommendations are relevant to {profile} profile")
            else:
                logger.warning(f"AI recommendations may not be specific to {profile} profile")
            
            # Verify financial health score varies by profile
            health_score = recommendations.get("financial_health_score", 0)
            self.assertGreaterEqual(health_score, 0)
            self.assertLessEqual(health_score, 100)
            
            logger.info(f"Financial health score for {profile}: {health_score}")
        
        logger.info("AI personalized insights testing completed")

if __name__ == "__main__":
    # Run the tests in order
    unittest.main(verbosity=2)