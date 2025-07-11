import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { 
  ProfileSelection, 
  Dashboard, 
  Timeline,
  AnclaForm, 
  HabitForm, 
  ObjectiveForm, 
  TransactionForm, 
  DiaryForm 
} from "./components";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('profile-selection');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

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
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;