import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { 
  ProfileSelection, 
  Dashboard, 
  Timeline,
  AdvancedBudget,
  NotificationSettings,
  NotificationToast,
  MobileNavigation,
  MobileHeader,
  AnclaForm, 
  HabitForm, 
  ObjectiveForm, 
  TransactionForm, 
  DiaryForm,
  BudgetLimitForm,
  SavingsGoalForm,
  AddMoneyForm
} from "./components";
import useNotifications from "./useNotifications";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('profile-selection');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({});
  const [activeNotifications, setActiveNotifications] = useState([]);

  // Initialize notifications hook
  const {
    permission,
    isSupported,
    requestPermission,
    scheduleBudgetAlert,
    scheduleAnclaReminder,
    scheduleSavingsGoalUpdate,
    scheduleHabitReminder
  } = useNotifications();

  // Auto-request notification permission on first load
  useEffect(() => {
    if (isSupported && permission === 'default') {
      // Show a banner or prompt to enable notifications
      const banner = {
        title: '🔔 Habilitar Notificaciones',
        body: 'Recibe recordatorios de tus anclas y alertas de presupuesto',
        action: 'enable-notifications'
      };
      setActiveNotifications([banner]);
    }
  }, [isSupported, permission]);

  // Test API connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get(`${API}/`);
        console.log('API Connection:', response.data.message);
      } catch (error) {
        console.error('API Connection Error:', error);
      }
    };
    testConnection();
  }, []);

  const handleProfileSelection = async (profileData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/users`, profileData);
      setCurrentUser(response.data);
      await loadDashboardData(response.data.id);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (userId) => {
    try {
      const response = await axios.get(`${API}/users/${userId}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleCreateAncla = async (anclaData) => {
    try {
      await axios.post(`${API}/anclas?user_id=${currentUser.id}`, anclaData);
      await loadDashboardData(currentUser.id);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating ancla:', error);
    }
  };

  const handleCompleteAncla = async (anclaId) => {
    try {
      await axios.post(`${API}/anclas/${anclaId}/complete`);
      await loadDashboardData(currentUser.id);
    } catch (error) {
      console.error('Error completing ancla:', error);
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      await axios.post(`${API}/habits?user_id=${currentUser.id}`, habitData);
      await loadDashboardData(currentUser.id);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleTrackHabit = async (habitId) => {
    try {
      await axios.post(`${API}/habits/${habitId}/track`);
      await loadDashboardData(currentUser.id);
    } catch (error) {
      console.error('Error tracking habit:', error);
    }
  };

  const handleCreateObjective = async (objectiveData) => {
    try {
      await axios.post(`${API}/objectives?user_id=${currentUser.id}`, objectiveData);
      await loadDashboardData(currentUser.id);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating objective:', error);
    }
  };

  const handleToggleSubtask = async (objectiveId, subtaskIndex) => {
    try {
      await axios.post(`${API}/objectives/${objectiveId}/subtask/${subtaskIndex}/toggle`);
      await loadDashboardData(currentUser.id);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleCreateTransaction = async (transactionData) => {
    try {
      await axios.post(`${API}/transactions?user_id=${currentUser.id}`, transactionData);
      await loadDashboardData(currentUser.id);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleCreateDiaryEntry = async (diaryData) => {
    try {
      await axios.post(`${API}/diary?user_id=${currentUser.id}`, diaryData);
      await loadDashboardData(currentUser.id);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating diary entry:', error);
    }
  };

  const handleUpdateAnclaDate = async (anclaId, newDate) => {
    try {
      await axios.put(`${API}/anclas/${anclaId}`, { start_date: newDate });
      await loadDashboardData(currentUser.id);
    } catch (error) {
      console.error('Error updating ancla date:', error);
    }
  };

  const handleCreateBudgetLimit = async (limitData) => {
    try {
      await axios.post(`${API}/budget-limits?user_id=${currentUser.id}`, limitData);
      await loadDashboardData(currentUser.id);
      setCurrentView('advanced-budget');
    } catch (error) {
      console.error('Error creating budget limit:', error);
    }
  };

  const handleCreateSavingsGoal = async (goalData) => {
    try {
      await axios.post(`${API}/savings-goals?user_id=${currentUser.id}`, goalData);
      await loadDashboardData(currentUser.id);
      setCurrentView('advanced-budget');
    } catch (error) {
      console.error('Error creating savings goal:', error);
    }
  };

  const handleAddToSavingsGoal = async (goalId, amount) => {
    try {
      await axios.put(`${API}/savings-goals/${goalId}/add-money?amount=${amount}`);
      await loadDashboardData(currentUser.id);
      setCurrentView('advanced-budget');
    } catch (error) {
      console.error('Error adding money to savings goal:', error);
    }
  };

  const handleOpenAddMoney = (goalId, goalTitle) => {
    setSelectedGoalId(goalId);
    setSelectedGoalTitle(goalTitle);
    setCurrentView('add-money');
  };

  const handleSaveNotificationSettings = async (settings) => {
    try {
      await axios.post(`${API}/notification-settings?user_id=${currentUser.id}`, settings);
      setNotificationSettings(settings);
      
      // Schedule notifications based on settings
      if (settings.budget_alerts && dashboardData?.budget_analytics?.budget_alerts) {
        dashboardData.budget_analytics.budget_alerts.forEach(alert => {
          if (alert.percentage >= 90) {
            scheduleBudgetAlert(alert.category, alert.percentage, alert.limit, alert.spent);
          }
        });
      }

      if (settings.ancla_reminders && dashboardData?.anclas?.active) {
        dashboardData.anclas.active.forEach(ancla => {
          scheduleAnclaReminder(ancla, settings.reminder_time);
        });
      }

      if (settings.habit_reminders && dashboardData?.habits) {
        dashboardData.habits.forEach(habit => {
          scheduleHabitReminder(habit, settings.habit_time);
        });
      }

    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Auto-schedule notifications when dashboard data changes
  useEffect(() => {
    if (currentUser && dashboardData && notificationSettings.budget_alerts) {
      // Auto-schedule budget alerts
      const budgetAnalytics = dashboardData.budget_analytics;
      if (budgetAnalytics?.budget_alerts) {
        budgetAnalytics.budget_alerts.forEach(alert => {
          if (alert.percentage >= 90) {
            scheduleBudgetAlert(alert.category, alert.percentage, alert.limit, alert.spent);
          }
        });
      }
    }
  }, [currentUser, dashboardData, notificationSettings, scheduleBudgetAlert]);

  const handleDismissNotification = (index) => {
    setActiveNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnableNotifications = async () => {
    try {
      await requestPermission();
      setActiveNotifications([]);
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile-selection':
        return (
          <ProfileSelection 
            onProfileSelect={handleProfileSelection}
            loading={loading}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            user={currentUser}
            data={dashboardData}
            onViewChange={setCurrentView}
            onCompleteAncla={handleCompleteAncla}
            onTrackHabit={handleTrackHabit}
            onToggleSubtask={handleToggleSubtask}
          />
        );
      case 'timeline':
        return (
          <Timeline 
            user={currentUser}
            data={dashboardData}
            onUpdateAnclaDate={handleUpdateAnclaDate}
            onCompleteAncla={handleCompleteAncla}
            onViewChange={setCurrentView}
          />
        );
      case 'advanced-budget':
        return (
          <AdvancedBudget 
            user={currentUser}
            data={dashboardData}
            onViewChange={setCurrentView}
            onCreateTransaction={handleCreateTransaction}
            onCreateBudgetLimit={handleCreateBudgetLimit}
            onCreateSavingsGoal={handleCreateSavingsGoal}
            onAddToSavingsGoal={handleOpenAddMoney}
          />
        );
      case 'create-ancla':
        return (
          <AnclaForm 
            onSubmit={handleCreateAncla}
            onCancel={() => setCurrentView('dashboard')}
            categories={dashboardData?.categories || []}
          />
        );
      case 'create-habit':
        return (
          <HabitForm 
            onSubmit={handleCreateHabit}
            onCancel={() => setCurrentView('dashboard')}
            userProfile={currentUser?.profile}
          />
        );
      case 'create-objective':
        return (
          <ObjectiveForm 
            onSubmit={handleCreateObjective}
            onCancel={() => setCurrentView('dashboard')}
            userProfile={currentUser?.profile}
          />
        );
      case 'create-transaction':
        return (
          <TransactionForm 
            onSubmit={handleCreateTransaction}
            onCancel={() => setCurrentView('dashboard')}
            budgetCategories={dashboardData?.budget_categories || {}}
          />
        );
      case 'create-diary':
        return (
          <DiaryForm 
            onSubmit={handleCreateDiaryEntry}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      case 'create-budget-limit':
        return (
          <BudgetLimitForm 
            onSubmit={handleCreateBudgetLimit}
            onCancel={() => setCurrentView('advanced-budget')}
            userProfile={currentUser?.profile}
          />
        );
      case 'create-savings-goal':
        return (
          <SavingsGoalForm 
            onSubmit={handleCreateSavingsGoal}
            onCancel={() => setCurrentView('advanced-budget')}
          />
        );
      case 'add-money':
        return (
          <AddMoneyForm 
            onSubmit={(amount) => handleAddToSavingsGoal(selectedGoalId, amount)}
            onCancel={() => setCurrentView('advanced-budget')}
            goalTitle={selectedGoalTitle}
          />
        );
      case 'notification-settings':
        return (
          <NotificationSettings 
            user={currentUser}
            onViewChange={setCurrentView}
            onSaveSettings={handleSaveNotificationSettings}
          />
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
      
      {/* Notification Permission Banner */}
      {isSupported && permission === 'default' && (
        <div className="notification-permission-banner">
          <span>🔔 Habilita las notificaciones para recibir recordatorios de tus anclas y alertas de presupuesto</span>
          <button onClick={handleEnableNotifications}>
            Habilitar Notificaciones
          </button>
        </div>
      )}
      
      {/* Notification Toasts */}
      <NotificationToast 
        notifications={activeNotifications}
        onDismiss={handleDismissNotification}
      />
    </div>
  );
}

export default App;