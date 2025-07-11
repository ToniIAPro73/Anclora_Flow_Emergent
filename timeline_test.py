import requests
import json
from datetime import datetime, date
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
logger.info(f"Using API URL: {API_URL}")

def test_timeline_functionality():
    """Test core timeline functionality for drag-and-drop date updates"""
    
    # Step 1: Create a test user
    user_data = {
        "email": "timeline_test@anclora.com",
        "name": "Timeline Test User",
        "profile": "content_creator"
    }
    
    logger.info("Creating test user...")
    response = requests.post(f"{API_URL}/users", json=user_data)
    if response.status_code != 200:
        logger.error(f"Failed to create user: {response.text}")
        return False
    
    user = response.json()
    user_id = user["id"]
    logger.info(f"Created user with ID: {user_id}")
    
    # Step 2: Get categories for the user
    logger.info("Getting categories...")
    categories_response = requests.get(f"{API_URL}/categories/{user_id}")
    if categories_response.status_code != 200:
        logger.error(f"Failed to get categories: {categories_response.text}")
        return False
    
    categories = categories_response.json()
    if not categories:
        logger.error("No categories found")
        return False
    
    category_id = categories[0]["id"]
    logger.info(f"Using category ID: {category_id}")
    
    # Step 3: Create an ancla for timeline testing
    original_date = datetime(2024, 1, 15, 10, 0, 0)
    ancla_data = {
        "title": "Timeline Test Ancla",
        "description": "Testing drag-and-drop date updates",
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
    
    logger.info("Creating test ancla...")
    response = requests.post(f"{API_URL}/anclas?user_id={user_id}", json=ancla_data)
    if response.status_code != 200:
        logger.error(f"Failed to create ancla: {response.text}")
        return False
    
    ancla = response.json()
    ancla_id = ancla["id"]
    logger.info(f"Created ancla with ID: {ancla_id}")
    
    # Step 4: Test drag-and-drop date update (PUT /api/anclas/{ancla_id})
    new_date = datetime(2024, 1, 20, 10, 0, 0)
    update_data = {
        "title": ancla["title"],
        "description": ancla["description"],
        "type": ancla["type"],
        "priority": ancla["priority"],
        "category_id": ancla["category_id"],
        "repeat_type": ancla["repeat_type"],
        "all_day": ancla["all_day"],
        "start_date": new_date.isoformat(),
        "start_time": ancla["start_time"],
        "end_time": ancla["end_time"],
        "emoji": ancla["emoji"]
    }
    
    logger.info("Testing date update (drag-and-drop simulation)...")
    update_response = requests.put(f"{API_URL}/anclas/{ancla_id}", json=update_data)
    if update_response.status_code != 200:
        logger.error(f"Failed to update ancla date: {update_response.text}")
        return False
    
    # Step 5: Verify the date was updated and status remains consistent
    logger.info("Verifying date update...")
    get_response = requests.get(f"{API_URL}/anclas/{ancla_id}")
    if get_response.status_code != 200:
        logger.error(f"Failed to get updated ancla: {get_response.text}")
        return False
    
    updated_ancla = get_response.json()
    
    # Parse and compare dates
    updated_date = datetime.fromisoformat(updated_ancla["start_date"].replace('Z', '+00:00'))
    if updated_date.date() != new_date.date():
        logger.error(f"Date not updated correctly. Expected: {new_date.date()}, Got: {updated_date.date()}")
        return False
    
    # Verify status consistency
    if updated_ancla["status"] != "active":
        logger.error(f"Status changed unexpectedly. Expected: active, Got: {updated_ancla['status']}")
        return False
    
    logger.info("✅ Date update successful and status consistent")
    
    # Step 6: Test dashboard data grouping
    logger.info("Testing dashboard data grouping...")
    dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
    if dashboard_response.status_code != 200:
        logger.error(f"Failed to get dashboard: {dashboard_response.text}")
        return False
    
    dashboard = dashboard_response.json()
    
    # Verify anclas are properly grouped
    if "anclas" not in dashboard:
        logger.error("Dashboard missing anclas section")
        return False
    
    anclas_data = dashboard["anclas"]
    required_groups = ["active", "completed", "overdue", "total"]
    for group in required_groups:
        if group not in anclas_data:
            logger.error(f"Dashboard missing {group} anclas group")
            return False
    
    # Verify our test ancla appears in active group
    active_anclas = anclas_data["active"]
    test_ancla_found = any(a["id"] == ancla_id for a in active_anclas)
    if not test_ancla_found:
        logger.error("Test ancla not found in active anclas")
        return False
    
    logger.info("✅ Dashboard grouping working correctly")
    
    # Step 7: Test completing ancla and verify status consistency
    logger.info("Testing ancla completion...")
    complete_response = requests.post(f"{API_URL}/anclas/{ancla_id}/complete")
    if complete_response.status_code != 200:
        logger.error(f"Failed to complete ancla: {complete_response.text}")
        return False
    
    # Verify ancla is now in completed group
    dashboard_response = requests.get(f"{API_URL}/users/{user_id}/dashboard")
    if dashboard_response.status_code != 200:
        logger.error(f"Failed to get dashboard after completion: {dashboard_response.text}")
        return False
    
    dashboard = dashboard_response.json()
    completed_anclas = dashboard["anclas"]["completed"]
    test_ancla_completed = any(a["id"] == ancla_id for a in completed_anclas)
    if not test_ancla_completed:
        logger.error("Completed ancla not found in completed anclas group")
        return False
    
    logger.info("✅ Ancla completion working correctly")
    
    # Step 8: Test various date formats
    logger.info("Testing various date formats...")
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
        if response.status_code != 200:
            logger.error(f"Failed to create ancla with date format {date_str}: {response.text}")
            return False
        
        logger.info(f"✅ Successfully created ancla with date format: {date_str}")
    
    logger.info("🎉 All timeline functionality tests passed!")
    return True

if __name__ == "__main__":
    success = test_timeline_functionality()
    if success:
        print("✅ Timeline functionality tests PASSED")
    else:
        print("❌ Timeline functionality tests FAILED")