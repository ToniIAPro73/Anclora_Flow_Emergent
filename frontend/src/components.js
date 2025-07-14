import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
);

// Profile Selection Component
export const ProfileSelection = ({ onProfileSelect, loading }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  const profiles = [
    {
      id: 'content_creator',
      title: 'Creadores de Contenido y Emprendedores Digitales',
      description: 'Para influencers, YouTubers y emprendedores digitales',
      icon: '🎬',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'freelancer',
      title: 'Freelancers y Profesionales Independientes',
      description: 'Para consultores, diseñadores y trabajadores independientes',
      icon: '💼',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'student',
      title: 'Estudiantes y Académicos',
      description: 'Para estudiantes universitarios y investigadores',
      icon: '📚',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'professional',
      title: 'Profesionales con Proyectos Paralelos',
      description: 'Para empleados con proyectos personales',
      icon: '🚀',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProfile && userInfo.name && userInfo.email) {
      onProfileSelect({
        name: userInfo.name,
        email: userInfo.email,
        profile: selectedProfile
      });
    }
  };

  return (
    <div className="profile-selection">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⚓ Bienvenido a Anclora
          </h1>
          <p className="text-xl text-white opacity-90">
            Ancla tus tareas en el tiempo y navega hacia el éxito
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`profile-card ${selectedProfile === profile.id ? 'selected' : ''}`}
                onClick={() => setSelectedProfile(profile.id)}
              >
                <div className="text-4xl mb-4">{profile.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{profile.title}</h3>
                <p className="text-sm opacity-80">{profile.description}</p>
              </div>
            ))}
          </div>

          {selectedProfile && (
            <div className="max-w-md mx-auto">
              <div className="form-card">
                <h3 className="text-xl font-semibold mb-4 text-center">
                  Información Personal
                </h3>
                
                {/* Usuario de prueba */}
                <div className="demo-user-section">
                  <div className="demo-user-card">
                    <div className="demo-header">
                      <span className="demo-icon">🎯</span>
                      <span className="demo-text">¿Quieres probar la aplicación?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserInfo({
                        name: 'Marina Demo',
                        email: 'marina@anclora.demo'
                      })}
                      className="demo-button"
                    >
                      Usar usuario de prueba
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    '⚓ Comenzar mi viaje'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Notifications Settings Component
export const NotificationSettings = ({ user, onViewChange, onSaveSettings }) => {
  const [settings, setSettings] = useState({
    budget_alerts: true,
    ancla_reminders: true,
    savings_goals: true,
    habit_reminders: true,
    reminder_time: 30, // minutes before
    habit_time: '09:00',
    daily_summary: true,
    weekly_report: true
  });
  const [permission, setPermission] = useState(Notification.permission);

  const requestNotificationPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Test notification
        new Notification('⚓ Anclora', {
          body: '¡Notificaciones activadas correctamente!',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
  };

  const handleSave = () => {
    onSaveSettings(settings);
    onViewChange('dashboard');
  };

  const testNotification = (type) => {
    if (permission !== 'granted') {
      alert('Primero debes permitir las notificaciones');
      return;
    }

    const notifications = {
      budget: {
        title: '⚠️ Alerta de Presupuesto (Prueba)',
        body: 'Has superado el 90% de tu límite en "Alimentación"'
      },
      ancla: {
        title: '⚓ Recordatorio de Ancla (Prueba)',
        body: 'Tienes una tarea que comienza en 30 minutos'
      },
      savings: {
        title: '🏦 Meta de Ahorro (Prueba)',
        body: 'Has alcanzado el 75% de tu meta "Vacaciones"'
      },
      habit: {
        title: '📊 Recordatorio de Hábito (Prueba)',
        body: 'Es hora de "Ejercicio diario". ¡Mantén tu racha!'
      }
    };

    const notification = notifications[type];
    new Notification(notification.title, {
      body: notification.body,
      icon: '/favicon.ico'
    });
  };

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <button
          onClick={() => onViewChange('dashboard')}
          className="btn-secondary"
        >
          ← Volver al Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          🔔 Configuración de Notificaciones
        </h1>
      </div>

      <div className="settings-content">
        {/* Permission Status */}
        <div className="permission-section">
          <h3>Estado de Permisos</h3>
          <div className="permission-status">
            <div className={`status-indicator ${permission === 'granted' ? 'granted' : 'denied'}`}>
              {permission === 'granted' ? '✅' : '❌'} 
              {permission === 'granted' ? 'Permitido' : 
               permission === 'denied' ? 'Denegado' : 'No solicitado'}
            </div>
            {permission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="btn-primary"
              >
                Permitir Notificaciones
              </button>
            )}
          </div>
        </div>

        {/* Budget Alerts */}
        <div className="setting-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>⚠️ Alertas de Presupuesto</h4>
              <p>Recibe notificaciones cuando te acerques a tus límites de gasto</p>
            </div>
            <div className="setting-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.budget_alerts}
                  onChange={(e) => handleSettingChange('budget_alerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <button
                onClick={() => testNotification('budget')}
                className="btn-secondary btn-small"
                disabled={permission !== 'granted'}
              >
                Probar
              </button>
            </div>
          </div>
        </div>

        {/* Ancla Reminders */}
        <div className="setting-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>⚓ Recordatorios de Anclas</h4>
              <p>Recibe recordatorios antes de que comiencen tus tareas</p>
            </div>
            <div className="setting-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.ancla_reminders}
                  onChange={(e) => handleSettingChange('ancla_reminders', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <button
                onClick={() => testNotification('ancla')}
                className="btn-secondary btn-small"
                disabled={permission !== 'granted'}
              >
                Probar
              </button>
            </div>
          </div>
          
          {settings.ancla_reminders && (
            <div className="setting-sub-item">
              <label>Recordar con:</label>
              <select
                value={settings.reminder_time}
                onChange={(e) => handleSettingChange('reminder_time', parseInt(e.target.value))}
                className="form-select"
              >
                <option value={10}>10 minutos de anticipación</option>
                <option value={30}>30 minutos de anticipación</option>
                <option value={60}>1 hora de anticipación</option>
                <option value={1440}>1 día de anticipación</option>
              </select>
            </div>
          )}
        </div>

        {/* Savings Goals */}
        <div className="setting-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>🏦 Metas de Ahorro</h4>
              <p>Recibe actualizaciones sobre el progreso de tus metas</p>
            </div>
            <div className="setting-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.savings_goals}
                  onChange={(e) => handleSettingChange('savings_goals', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <button
                onClick={() => testNotification('savings')}
                className="btn-secondary btn-small"
                disabled={permission !== 'granted'}
              >
                Probar
              </button>
            </div>
          </div>
        </div>

        {/* Habit Reminders */}
        <div className="setting-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>📊 Recordatorios de Hábitos</h4>
              <p>Recibe recordatorios diarios para mantener tus hábitos</p>
            </div>
            <div className="setting-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.habit_reminders}
                  onChange={(e) => handleSettingChange('habit_reminders', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <button
                onClick={() => testNotification('habit')}
                className="btn-secondary btn-small"
                disabled={permission !== 'granted'}
              >
                Probar
              </button>
            </div>
          </div>
          
          {settings.habit_reminders && (
            <div className="setting-sub-item">
              <label>Hora del recordatorio:</label>
              <input
                type="time"
                value={settings.habit_time}
                onChange={(e) => handleSettingChange('habit_time', e.target.value)}
                className="form-input"
              />
            </div>
          )}
        </div>

        {/* Reports */}
        <div className="setting-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>📋 Reportes Automáticos</h4>
              <p>Recibe resúmenes automáticos de tu progreso</p>
            </div>
            <div className="setting-controls">
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={settings.daily_summary}
                    onChange={(e) => handleSettingChange('daily_summary', e.target.checked)}
                  />
                  Resumen diario
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={settings.weekly_report}
                    onChange={(e) => handleSettingChange('weekly_report', e.target.checked)}
                  />
                  Reporte semanal
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            💾 Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
export const Dashboard = ({ 
  user, 
  data, 
  onViewChange, 
  onCompleteAncla, 
  onTrackHabit, 
  onToggleSubtask 
}) => {
  const getRankEmoji = (rank) => {
    const ranks = {
      'grumete': '⚓',
      'marinero': '🌊',
      'contramaestre': '🧭',
      'capitan': '👨‍✈️'
    };
    return ranks[rank] || '⚓';
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      'happy': '😊',
      'neutral': '😐',
      'sad': '😢',
      'excited': '🤩',
      'stressed': '😰'
    };
    return moods[mood] || '😐';
  };

  const groupAnclasByDate = (anclas) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const groups = {
      today: [],
      tomorrow: [],
      upcoming: []
    };

    anclas.forEach(ancla => {
      const anclaDate = new Date(ancla.start_date);
      if (anclaDate.toDateString() === today.toDateString()) {
        groups.today.push(ancla);
      } else if (anclaDate.toDateString() === tomorrow.toDateString()) {
        groups.tomorrow.push(ancla);
      } else {
        groups.upcoming.push(ancla);
      }
    });

    return groups;
  };

  const activeAnclas = groupAnclasByDate(data?.anclas?.active || []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              ⚓ Puente de Mando
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {user?.name} - {getRankEmoji(user?.rank)} {user?.rank}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onViewChange('ai-assistant')}
              className="btn-primary"
              title="Asistente Financiero IA"
            >
              🤖 IA Financiera
            </button>
            <button
              onClick={() => onViewChange('notification-settings')}
              className="btn-secondary"
              title="Configurar Notificaciones"
            >
              🔔 Notificaciones
            </button>
            <button
              onClick={() => onViewChange('timeline')}
              className="btn-secondary"
              title="Ver Marea de Tiempo"
            >
              🌊 Timeline
            </button>
            <div className="rank-badge">
              {getRankEmoji(user?.rank)} {user?.rank}
            </div>
            <div className="streak-counter">
              🔥 {user?.current_streak} días
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="stats-card stats-card-active">
            <div className="text-2xl font-bold">{data?.anclas?.active?.length || 0}</div>
            <div className="text-sm opacity-90">Anclas Activas</div>
          </div>
          <div className="stats-card stats-card-completed">
            <div className="text-2xl font-bold">{data?.anclas?.completed?.length || 0}</div>
            <div className="text-sm opacity-90">Completadas</div>
          </div>
          <div className="stats-card stats-card-overdue">
            <div className="text-2xl font-bold">{data?.anclas?.overdue?.length || 0}</div>
            <div className="text-sm opacity-90">Vencidas</div>
          </div>
          <div className="stats-card stats-card-total">
            <div className="text-2xl font-bold">{data?.anclas?.total || 0}</div>
            <div className="text-sm opacity-90">Total</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Gestión de Anclas */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>⚓ Gestión de Anclas</h3>
            <button
              onClick={() => onViewChange('create-ancla')}
              className="btn-primary"
            >
              + Nueva Ancla
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Anclajes Activos</h4>
            
            {data?.anclas?.active?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⚓</div>
                <h4>No tienes anclas activas</h4>
                <p>¡Comienza creando tu primera ancla para organizar tus tareas!</p>
                <button
                  onClick={() => onViewChange('create-ancla')}
                  className="btn-primary mt-3"
                >
                  🚀 Crear mi primera ancla
                </button>
              </div>
            ) : (
              <>
                {activeAnclas.today.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">🌅 Hoy</h5>
                    {activeAnclas.today.map((ancla) => (
                      <AnclaItem key={ancla.id} ancla={ancla} onComplete={onCompleteAncla} />
                    ))}
                  </div>
                )}

                {activeAnclas.tomorrow.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">🌄 Mañana</h5>
                    {activeAnclas.tomorrow.map((ancla) => (
                      <AnclaItem key={ancla.id} ancla={ancla} onComplete={onCompleteAncla} />
                    ))}
                  </div>
                )}

                {activeAnclas.upcoming.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">🌊 Próximamente</h5>
                    {activeAnclas.upcoming.map((ancla) => (
                      <AnclaItem key={ancla.id} ancla={ancla} onComplete={onCompleteAncla} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {(data?.anclas?.completed?.length > 0 || data?.anclas?.overdue?.length > 0) && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Resto de Anclajes</h4>
              {[...data.anclas.completed, ...data.anclas.overdue].map((ancla) => (
                <AnclaItem key={ancla.id} ancla={ancla} onComplete={onCompleteAncla} />
              ))}
            </div>
          )}
        </div>

        {/* Seguimiento de Hábitos */}
        <div className="dashboard-section">
          <h3>📊 Seguimiento de Hábitos</h3>
          <div className="space-y-3">
            {data?.habits?.map((habit) => (
              <div key={habit.id} className="habit-item">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{habit.name}</span>
                  <button
                    onClick={() => onTrackHabit(habit.id)}
                    className="btn-secondary btn-small"
                  >
                    Marcar
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {habit.current_week_count}/{habit.frequency} esta semana
                </div>
                <div className="habit-progress">
                  <div 
                    className="habit-progress-bar"
                    style={{ width: `${habit.completion_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onViewChange('create-habit')}
            className="btn-secondary w-full mt-4"
          >
            + Nuevo Hábito
          </button>
        </div>

        {/* Objetivos del Mes */}
        <div className="dashboard-section">
          <h3>🎯 Objetivos del Mes</h3>
          <div className="space-y-3">
            {data?.objectives?.map((objective) => (
              <div key={objective.id} className="objective-item">
                <h4 className="font-semibold">{objective.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                <div className="text-sm font-medium mb-2">
                  Progreso: {objective.completion_percentage.toFixed(0)}%
                </div>
                <div className="space-y-1">
                  {objective.subtasks?.map((subtask, index) => (
                    <div key={index} className="subtask-item">
                      <div
                        className={`subtask-checkbox ${subtask.completed ? 'completed' : ''}`}
                        onClick={() => onToggleSubtask(objective.id, index)}
                      >
                        {subtask.completed && '✓'}
                      </div>
                      <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                        {subtask.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onViewChange('create-objective')}
            className="btn-secondary w-full mt-4"
          >
            + Nuevo Objetivo
          </button>
        </div>

        {/* Presupuesto */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>💰 Presupuesto</h3>
            <button
              onClick={() => onViewChange('advanced-budget')}
              className="btn-primary"
            >
              📊 Ver Análisis Completo
            </button>
          </div>
          <div className="space-y-3">
            {data?.transactions?.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-gray-600">{transaction.category}</div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onViewChange('create-transaction')}
            className="btn-secondary w-full mt-4"
          >
            + Nueva Transacción
          </button>
        </div>

        {/* Diario */}
        <div className="dashboard-section">
          <h3>📔 Diario</h3>
          <div className="space-y-3">
            {data?.diary_entries?.slice(0, 3).map((entry) => (
              <div key={entry.id} className="diary-entry">
                <div className="flex items-center mb-2">
                  <span className="mood-emoji">{getMoodEmoji(entry.mood)}</span>
                  <span className="text-sm text-gray-600">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{entry.content}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onViewChange('create-diary')}
            className="btn-secondary w-full mt-4"
          >
            + Nueva Entrada
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => onViewChange('create-ancla')}
        className="btn-floating"
        title="Nueva Ancla"
      >
        ⚓
      </button>
    </div>
  );
};

// Mobile Optimized Dashboard Component
export const MobileDashboard = ({ 
  user, 
  data, 
  onViewChange, 
  onCompleteAncla, 
  onTrackHabit, 
  onToggleSubtask 
}) => {
  const [activeTab, setActiveTab] = useState('anclas');

  const getRankEmoji = (rank) => {
    const ranks = {
      'grumete': '⚓',
      'marinero': '🌊',
      'contramaestre': '🧭',
      'capitan': '👨‍✈️'
    };
    return ranks[rank] || '⚓';
  };

  const tabs = [
    { id: 'anclas', label: 'Anclas', icon: '⚓' },
    { id: 'habits', label: 'Hábitos', icon: '📊' },
    { id: 'objectives', label: 'Objetivos', icon: '🎯' },
    { id: 'budget', label: 'Dinero', icon: '💰' },
    { id: 'diary', label: 'Diario', icon: '📔' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'anclas':
        return (
          <div className="mobile-tab-content">
            <div className="mobile-stats-grid">
              <div className="mobile-stat-card active">
                <div className="stat-number">{data?.anclas?.active?.length || 0}</div>
                <div className="stat-label">Activas</div>
              </div>
              <div className="mobile-stat-card completed">
                <div className="stat-number">{data?.anclas?.completed?.length || 0}</div>
                <div className="stat-label">Completadas</div>
              </div>
              <div className="mobile-stat-card overdue">
                <div className="stat-number">{data?.anclas?.overdue?.length || 0}</div>
                <div className="stat-label">Vencidas</div>
              </div>
            </div>
            
            <div className="mobile-anclas-list">
              {data?.anclas?.active?.slice(0, 5).map((ancla) => (
                <div key={ancla.id} className="mobile-ancla-card">
                  <div className="mobile-ancla-header">
                    <span className="ancla-emoji">{ancla.emoji}</span>
                    <div className="ancla-info">
                      <div className="ancla-title">{ancla.title}</div>
                      <div className="ancla-meta">
                        {ancla.start_time} • {ancla.priority}
                      </div>
                    </div>
                    <button
                      onClick={() => onCompleteAncla(ancla.id)}
                      className="mobile-complete-btn"
                    >
                      ✓
                    </button>
                  </div>
                  <div className="ancla-description">{ancla.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'habits':
        return (
          <div className="mobile-tab-content">
            {data?.habits?.map((habit) => (
              <div key={habit.id} className="mobile-habit-card">
                <div className="habit-header">
                  <div className="habit-name">{habit.name}</div>
                  <button
                    onClick={() => onTrackHabit(habit.id)}
                    className="mobile-track-btn"
                  >
                    +
                  </button>
                </div>
                <div className="habit-progress-container">
                  <div className="habit-progress-text">
                    {habit.current_week_count}/{habit.frequency} esta semana
                  </div>
                  <div className="mobile-habit-progress">
                    <div 
                      className="habit-progress-bar"
                      style={{ width: `${habit.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'objectives':
        return (
          <div className="mobile-tab-content">
            {data?.objectives?.map((objective) => (
              <div key={objective.id} className="mobile-objective-card">
                <div className="objective-header">
                  <div className="objective-title">{objective.title}</div>
                  <div className="objective-percentage">
                    {objective.completion_percentage.toFixed(0)}%
                  </div>
                </div>
                <div className="objective-progress-container">
                  <div className="mobile-objective-progress">
                    <div 
                      className="objective-progress-bar"
                      style={{ width: `${objective.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="objective-subtasks">
                  {objective.subtasks?.slice(0, 3).map((subtask, index) => (
                    <div key={index} className="mobile-subtask">
                      <button
                        className={`mobile-subtask-check ${subtask.completed ? 'completed' : ''}`}
                        onClick={() => onToggleSubtask(objective.id, index)}
                      >
                        {subtask.completed && '✓'}
                      </button>
                      <span className={subtask.completed ? 'line-through' : ''}>
                        {subtask.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'budget':
        return (
          <div className="mobile-tab-content">
            <div className="mobile-budget-summary">
              <div className="budget-balance">
                <div className="balance-amount">
                  ${(data?.budget_analytics?.total_income - data?.budget_analytics?.total_expenses || 0).toFixed(2)}
                </div>
                <div className="balance-label">Balance del Mes</div>
              </div>
            </div>
            
            <div className="mobile-transactions">
              {data?.transactions?.slice(0, 4).map((transaction) => (
                <div key={transaction.id} className="mobile-transaction">
                  <div className="transaction-info">
                    <div className="transaction-desc">{transaction.description}</div>
                    <div className="transaction-category">{transaction.category}</div>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => onViewChange('advanced-budget')}
              className="mobile-action-btn primary"
            >
              Ver Análisis Completo
            </button>
          </div>
        );

      case 'diary':
        return (
          <div className="mobile-tab-content">
            {data?.diary_entries?.slice(0, 3).map((entry) => (
              <div key={entry.id} className="mobile-diary-entry">
                <div className="diary-header">
                  <span className="diary-mood">{entry.mood === 'happy' ? '😊' : '😐'}</span>
                  <span className="diary-date">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="diary-content">{entry.content}</div>
              </div>
            ))}
            
            <button
              onClick={() => onViewChange('create-diary')}
              className="mobile-action-btn secondary"
            >
              + Nueva Entrada
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mobile-dashboard">
      {/* Mobile User Header */}
      <div className="mobile-user-header">
        <div className="user-greeting">
          <div className="greeting-text">¡Hola, {user?.name}!</div>
          <div className="user-rank">
            {getRankEmoji(user?.rank)} {user?.rank} • 🔥 {user?.current_streak} días
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="mobile-tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mobile-tab-container">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Ancla Item Component
const AnclaItem = ({ ancla, onComplete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className={`ancla-item ${ancla.status}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium">{ancla.emoji} {ancla.title}</span>
            <span className={`ancla-priority ${ancla.priority}`}>
              {ancla.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{ancla.description}</p>
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(ancla.start_date)}
            {ancla.start_time && ` - ${ancla.start_time}`}
          </div>
        </div>
        {ancla.status === 'active' && (
          <button
            onClick={() => onComplete(ancla.id)}
            className="btn-primary btn-small"
          >
            Completar
          </button>
        )}
      </div>
    </div>
  );
};

// Ancla Form Component
export const AnclaForm = ({ onSubmit, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task',
    priority: 'important',
    category_id: '',
    repeat_type: 'no_repeat',
    all_day: false,
    start_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_date: new Date().toISOString().split('T')[0],
    end_time: '10:00',
    alert_enabled: false,
    alert_time: '10 minutos antes',
    title_color: '#000000',
    emoji: '⚓'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      start_date: new Date(`${formData.start_date}T${formData.start_time}`),
      end_date: formData.type === 'event' ? new Date(`${formData.end_date}T${formData.end_time}`) : null
    };
    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">⚓ Nueva Ancla</h2>
        
        <div className="form-group">
          <label className="form-label">Título</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formData.emoji}
              onChange={(e) => handleInputChange('emoji', e.target.value)}
              className="form-input w-16"
              placeholder="⚓"
            />
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="form-input flex-1"
              placeholder="Nombre de la ancla"
              required
            />
            <input
              type="color"
              value={formData.title_color}
              onChange={(e) => handleInputChange('title_color', e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-textarea"
            placeholder="Describe tu ancla..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tipo</label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="form-select"
          >
            <option value="task">📋 Tarea</option>
            <option value="event">📅 Evento</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Prioridad</label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="form-select"
          >
            <option value="urgent">🔴 Urgente</option>
            <option value="important">🟡 Importante</option>
            <option value="informative">🟢 Informativa</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="form-select"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Repetir</label>
          <select
            value={formData.repeat_type}
            onChange={(e) => handleInputChange('repeat_type', e.target.value)}
            className="form-select"
          >
            <option value="no_repeat">No repetir</option>
            <option value="daily">Diariamente</option>
            <option value="weekly">Semanalmente</option>
            <option value="monthly">Mensualmente</option>
          </select>
        </div>

        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.all_day}
              onChange={(e) => handleInputChange('all_day', e.target.checked)}
              className="form-checkbox"
            />
            Todo el día
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Fecha y Hora</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Fecha desde</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="form-input"
                required
              />
            </div>
            {!formData.all_day && (
              <div>
                <label className="text-sm text-gray-600">Hora desde</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="form-input"
                />
              </div>
            )}
          </div>
          
          {formData.type === 'event' && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-sm text-gray-600">Fecha hasta</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="form-input"
                />
              </div>
              {!formData.all_day && (
                <div>
                  <label className="text-sm text-gray-600">Hora hasta</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className="form-input"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.alert_enabled}
              onChange={(e) => handleInputChange('alert_enabled', e.target.checked)}
              className="form-checkbox"
            />
            Añadir una notificación
          </label>
          
          {formData.alert_enabled && (
            <div className="mt-2">
              <select
                value={formData.alert_time}
                onChange={(e) => handleInputChange('alert_time', e.target.value)}
                className="form-select"
              >
                <option value="10 minutos antes">10 minutos antes</option>
                <option value="30 minutos antes">30 minutos antes</option>
                <option value="1 hora antes">1 hora antes</option>
                <option value="1 día antes">1 día antes</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            ⚓ Crear Ancla
          </button>
        </div>
      </form>
    </div>
  );
};

// Habit Form Component
export const HabitForm = ({ onSubmit, onCancel, userProfile }) => {
  const [formData, setFormData] = useState({
    name: '',
    frequency: 7
  });

  const predefinedHabits = {
    content_creator: [
      'Crear contenido diario',
      'Analizar métricas',
      'Interactuar con audiencia',
      'Investigar tendencias'
    ],
    freelancer: [
      'Prospectar clientes',
      'Actualizar portfolio',
      'Networking',
      'Aprender nuevas habilidades'
    ],
    student: [
      'Estudiar',
      'Hacer ejercicio',
      'Leer',
      'Meditar'
    ],
    professional: [
      'Planificar día',
      'Ejercicio',
      'Desarrollo profesional',
      'Networking'
    ]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">📊 Nuevo Hábito</h2>
        
        <div className="form-group">
          <label className="form-label">Nombre del hábito</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="form-input"
            placeholder="Ejemplo: Ejercicio diario"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Frecuencia semanal</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({...formData, frequency: parseInt(e.target.value)})}
            className="form-select"
          >
            <option value={1}>1 vez por semana</option>
            <option value={2}>2 veces por semana</option>
            <option value={3}>3 veces por semana</option>
            <option value={4}>4 veces por semana</option>
            <option value={5}>5 veces por semana</option>
            <option value={6}>6 veces por semana</option>
            <option value={7}>Diariamente</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Hábitos sugeridos</label>
          <div className="grid grid-cols-1 gap-2">
            {predefinedHabits[userProfile]?.map((habit) => (
              <button
                key={habit}
                type="button"
                onClick={() => setFormData({...formData, name: habit})}
                className="text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                {habit}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            📊 Crear Hábito
          </button>
        </div>
      </form>
    </div>
  );
};

// Objective Form Component
export const ObjectiveForm = ({ onSubmit, onCancel, userProfile }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subtasks: [{ name: '', completed: false }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSubtask = () => {
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, { name: '', completed: false }]
    });
  };

  const removeSubtask = (index) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((_, i) => i !== index)
    });
  };

  const updateSubtask = (index, name) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index].name = name;
    setFormData({
      ...formData,
      subtasks: newSubtasks
    });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">🎯 Nuevo Objetivo</h2>
        
        <div className="form-group">
          <label className="form-label">Título del objetivo</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="form-input"
            placeholder="Ejemplo: Lanzar mi proyecto"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="form-textarea"
            placeholder="Describe tu objetivo..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Subtareas</label>
          {formData.subtasks.map((subtask, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={subtask.name}
                onChange={(e) => updateSubtask(index, e.target.value)}
                className="form-input flex-1"
                placeholder={`Subtarea ${index + 1}`}
                required
              />
              {formData.subtasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  className="btn-secondary"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSubtask}
            className="btn-secondary"
          >
            + Añadir subtarea
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            🎯 Crear Objetivo
          </button>
        </div>
      </form>
    </div>
  );
};

// Transaction Form Component
export const TransactionForm = ({ onSubmit, onCancel, budgetCategories }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const currentCategories = budgetCategories[formData.type] || [];

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">💰 Nueva Transacción</h2>
        
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
            className="form-select"
          >
            <option value="expense">💸 Gasto</option>
            <option value="income">💰 Ingreso</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="form-select"
            required
          >
            <option value="">Selecciona una categoría</option>
            {currentCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="form-input"
            placeholder="Describe la transacción..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Importe</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="form-input"
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="form-input"
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            💰 Crear Transacción
          </button>
        </div>
      </form>
    </div>
  );
};

// Diary Form Component
export const DiaryForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    mood: 'neutral'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const moods = [
    { value: 'happy', label: '😊 Feliz', emoji: '😊' },
    { value: 'excited', label: '🤩 Emocionado', emoji: '🤩' },
    { value: 'neutral', label: '😐 Neutral', emoji: '😐' },
    { value: 'stressed', label: '😰 Estresado', emoji: '😰' },
    { value: 'sad', label: '😢 Triste', emoji: '😢' }
  ];

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">📔 Nueva Entrada del Diario</h2>
        
        <div className="form-group">
          <label className="form-label">¿Cómo te sientes hoy?</label>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setFormData({...formData, mood: mood.value})}
                className={`p-3 rounded-lg border-2 ${
                  formData.mood === mood.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl">{mood.emoji}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notas del día</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="form-textarea"
            placeholder="¿Qué tal ha ido tu día? Comparte tus pensamientos..."
            rows="6"
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            📔 Guardar Entrada
          </button>
        </div>
      </form>
    </div>
  );
};

// Budget Limit Form Component
export const BudgetLimitForm = ({ onSubmit, onCancel, userProfile }) => {
  const [formData, setFormData] = useState({
    category: '',
    limit_amount: '',
    period: 'monthly'
  });

  const predefinedCategories = {
    content_creator: ['Equipo', 'Marketing', 'Suscripciones', 'Educación'],
    freelancer: ['Herramientas', 'Marketing', 'Oficina', 'Capacitación'],
    student: ['Libros', 'Transporte', 'Alimentación', 'Entretenimiento'],
    professional: ['Transporte', 'Alimentación', 'Ropa', 'Entretenimiento']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      limit_amount: parseFloat(formData.limit_amount)
    });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">🎯 Nuevo Límite de Presupuesto</h2>
        
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="form-select"
            required
          >
            <option value="">Selecciona una categoría</option>
            {predefinedCategories[userProfile]?.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Límite de Gasto</label>
          <input
            type="number"
            step="0.01"
            value={formData.limit_amount}
            onChange={(e) => setFormData({...formData, limit_amount: e.target.value})}
            className="form-input"
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Período</label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({...formData, period: e.target.value})}
            className="form-select"
          >
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            🎯 Crear Límite
          </button>
        </div>
      </form>
    </div>
  );
};

// Savings Goal Form Component
export const SavingsGoalForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    target_date: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target_amount: parseFloat(formData.target_amount)
    });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">🏦 Nueva Meta de Ahorro</h2>
        
        <div className="form-group">
          <label className="form-label">Título de la Meta</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="form-input"
            placeholder="Ej: Vacaciones de verano"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cantidad Objetivo</label>
          <input
            type="number"
            step="0.01"
            value={formData.target_amount}
            onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
            className="form-input"
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha Objetivo</label>
          <input
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({...formData, target_date: e.target.value})}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="form-textarea"
            placeholder="Describe tu meta de ahorro..."
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            🏦 Crear Meta
          </button>
        </div>
      </form>
    </div>
  );
};

// Add Money to Savings Form Component
export const AddMoneyForm = ({ onSubmit, onCancel, goalTitle }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(parseFloat(amount));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="text-2xl font-bold mb-6 text-center">💰 Añadir Dinero</h2>
        
        <div className="form-group">
          <label className="form-label">Meta: {goalTitle}</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            placeholder="Cantidad a añadir"
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            💰 Añadir
          </button>
        </div>
      </form>
    </div>
  );
};

// Timeline Component - Marea de Tiempo
export const Timeline = ({ 
  user, 
  data, 
  onUpdateAnclaDate, 
  onCompleteAncla, 
  onViewChange 
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  // Group anclas by date
  const groupAnclasByDate = (anclas) => {
    const grouped = {};
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = [];
    });

    anclas.forEach(ancla => {
      const anclaDate = format(parseISO(ancla.start_date), 'yyyy-MM-dd');
      if (grouped[anclaDate]) {
        grouped[anclaDate].push(ancla);
      }
    });

    return grouped;
  };

  const allAnclas = [
    ...(data?.anclas?.active || []),
    ...(data?.anclas?.completed || []),
    ...(data?.anclas?.overdue || [])
  ];

  const groupedAnclas = groupAnclasByDate(allAnclas);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }

    // Find the ancla being moved
    const anclaId = draggableId;
    const newDate = destination.droppableId;

    // Update the ancla date
    onUpdateAnclaDate(anclaId, newDate);
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDate(today);
  };

  const getTimelineHeader = () => {
    const weekStartStr = format(weekStart, 'dd MMM', { locale: es });
    const weekEndStr = format(weekEnd, 'dd MMM yyyy', { locale: es });
    return `${weekStartStr} - ${weekEndStr}`;
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onViewChange('dashboard')}
              className="btn-secondary"
              title="Volver al Dashboard"
            >
              ← Dashboard
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              🌊 Marea de Tiempo
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="btn-secondary"
            >
              ← Semana Anterior
            </button>
            <button
              onClick={goToToday}
              className="btn-primary"
            >
              Hoy
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="btn-secondary"
            >
              Semana Siguiente →
            </button>
          </div>
        </div>
        <div className="text-center text-gray-600 mb-4">
          {getTimelineHeader()}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="timeline-grid">
          {weekDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAnclas = groupedAnclas[dateKey] || [];
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={dateKey}
                className={`timeline-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="timeline-day-header">
                  <div className="text-sm font-medium text-gray-600">
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {format(day, 'd')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(day, 'MMM', { locale: es })}
                  </div>
                </div>

                <Droppable droppableId={dateKey}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`timeline-day-content ${
                        snapshot.isDraggingOver ? 'dragover' : ''
                      }`}
                    >
                      {dayAnclas.map((ancla, anclaIndex) => (
                        <Draggable
                          key={ancla.id}
                          draggableId={ancla.id}
                          index={anclaIndex}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`timeline-ancla ${ancla.status} ${
                                snapshot.isDragging ? 'dragging' : ''
                              }`}
                            >
                              <div className="timeline-ancla-header">
                                <span className="timeline-ancla-emoji">{ancla.emoji}</span>
                                <span className="timeline-ancla-time">
                                  {ancla.start_time && format(parseISO(`2000-01-01T${ancla.start_time}`), 'HH:mm')}
                                </span>
                              </div>
                              <div className="timeline-ancla-title">
                                {ancla.title}
                              </div>
                              <div className="timeline-ancla-category">
                                {ancla.category}
                              </div>
                              <div className="timeline-ancla-actions">
                                {ancla.status === 'active' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCompleteAncla(ancla.id);
                                    }}
                                    className="timeline-action-btn complete"
                                  >
                                    ✓
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implement edit functionality
                                  }}
                                  className="timeline-action-btn edit"
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Add new ancla button */}
                      <button
                        onClick={() => {
                          onViewChange('create-ancla', { selectedDate: dateKey });
                        }}
                        className="timeline-add-ancla"
                      >
                        + Añadir Ancla
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Timeline Legend */}
      <div className="timeline-legend">
        <div className="legend-item">
          <div className="legend-color active"></div>
          <span>Activas</span>
        </div>
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Completadas</span>
        </div>
        <div className="legend-item">
          <div className="legend-color overdue"></div>
          <span>Vencidas</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="timeline-stats">
        <div className="stat-item">
          <div className="stat-number">{data?.anclas?.active?.length || 0}</div>
          <div className="stat-label">Anclas Activas</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{data?.anclas?.completed?.length || 0}</div>
          <div className="stat-label">Completadas</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{user?.current_streak || 0}</div>
          <div className="stat-label">Días de Racha</div>
        </div>
      </div>
    </div>
  );
};

// AI Financial Assistant Component
export const AIFinancialAssistant = ({ user, onViewChange }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadAIInsights();
  }, [user?.id]);

  const loadAIInsights = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/ai-recommendations/${user.id}`);
      const insights = await response.json();
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (recommendationId, action) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      await fetch(`${BACKEND_URL}/api/ai-recommendations/${recommendationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      await loadAIInsights(); // Refresh
    } catch (error) {
      console.error('Error handling recommendation action:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    setChatLoading(true);
    const userMessage = { type: 'user', message: newMessage, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${BACKEND_URL}/api/ai-chat/${user.id}?question=${encodeURIComponent(newMessage)}`
      );
      const data = await response.json();
      
      const aiMessage = { 
        type: 'ai', 
        message: data.response, 
        suggestions: data.suggestions,
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage = { 
        type: 'ai', 
        message: '🌊 Disculpa, capitán. Hay problemas en las comunicaciones. Intenta de nuevo.',
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setNewMessage('');
      setChatLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return '🌊 Navegación Excelente';
    if (score >= 60) return '⛵ Rumbo Estable';
    return '⚠️ Aguas Turbulentas';
  };

  const getPriorityIcon = (priority) => {
    if (priority >= 5) return '🚨';
    if (priority >= 4) return '⚠️';
    if (priority >= 3) return '📢';
    return 'ℹ️';
  };

  if (loading) {
    return (
      <div className="ai-assistant">
        <div className="ai-loading">
          <div className="loading-spinner"></div>
          <p>🤖 Analizando tus patrones financieros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <button
          onClick={() => onViewChange('dashboard')}
          className="btn-secondary"
        >
          ← Volver al Dashboard
        </button>
        <h1 className="ai-title">🤖 Asistente Financiero IA</h1>
        <div className="ai-health-score">
          <div 
            className="health-score-circle"
            style={{ '--score-color': getHealthScoreColor(aiInsights?.spending_health_score || 0) }}
          >
            <span className="score-number">{Math.round(aiInsights?.spending_health_score || 0)}</span>
            <span className="score-label">Salud Financiera</span>
          </div>
        </div>
      </div>

      <div className="ai-tab-navigation">
        <button
          className={`ai-tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          🧠 Insights
        </button>
        <button
          className={`ai-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 Recomendaciones
        </button>
        <button
          className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
      </div>

      <div className="ai-content">
        {activeTab === 'insights' && (
          <div className="ai-insights">
            <div className="insights-summary">
              <h3>{getHealthScoreLabel(aiInsights?.spending_health_score || 0)}</h3>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-number">{aiInsights?.total_recommendations || 0}</span>
                  <span className="stat-label">Recomendaciones</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">${aiInsights?.potential_monthly_savings?.toFixed(0) || 0}</span>
                  <span className="stat-label">Ahorro Potencial/Mes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{aiInsights?.high_priority_count || 0}</span>
                  <span className="stat-label">Prioridad Alta</span>
                </div>
              </div>
            </div>

            <div className="spending-patterns">
              <h4>🔍 Análisis de Patrones</h4>
              <div className="patterns-grid">
                {Object.entries(aiInsights?.spending_patterns?.category_averages || {}).map(([category, avg]) => (
                  <div key={category} className="pattern-card">
                    <div className="pattern-category">{category}</div>
                    <div className="pattern-amount">${avg.toFixed(0)}/mes promedio</div>
                    <div className="pattern-volatility">
                      Volatilidad: ${aiInsights?.spending_patterns?.spending_volatility?.[category]?.toFixed(0) || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-insights">
              <h4>⚓ Consejos para {user?.profile?.replace('_', ' ')}</h4>
              <div className="profile-advice">
                <p>{aiInsights?.financial_goals_analysis?.advice}</p>
                <p className="maritime-analogy">
                  <em>{aiInsights?.financial_goals_analysis?.maritime_analogy}</em>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="ai-recommendations">
            <div className="recommendations-header">
              <h3>💡 Recomendaciones Personalizadas</h3>
              <p>Basadas en análisis de tus últimos 90 días</p>
            </div>

            <div className="recommendations-list">
              {aiInsights?.top_recommendations?.map((rec, index) => (
                <div key={index} className={`recommendation-card ${rec.type}`}>
                  <div className="rec-header">
                    <span className="rec-priority">{getPriorityIcon(rec.priority)}</span>
                    <h4 className="rec-title">{rec.title}</h4>
                    <span className="rec-confidence">{Math.round(rec.confidence_score * 100)}%</span>
                  </div>
                  
                  <p className="rec-message">{rec.message}</p>
                  
                  <div className="rec-details">
                    <div className="rec-category">📂 {rec.category}</div>
                    {rec.potential_savings > 0 && (
                      <div className="rec-savings">💰 ${rec.potential_savings.toFixed(0)} ahorro potencial</div>
                    )}
                  </div>
                  
                  <div className="rec-actions">
                    <button
                      onClick={() => handleRecommendationAction(rec.id, 'completed')}
                      className="btn-primary btn-small"
                    >
                      ✓ Aplicar
                    </button>
                    <button
                      onClick={() => handleRecommendationAction(rec.id, 'dismissed')}
                      className="btn-secondary btn-small"
                    >
                      ✕ Descartar
                    </button>
                  </div>
                  
                  <div className="rec-suggestion">
                    <strong>💡 Acción sugerida:</strong> {rec.action_suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="ai-chat">
            <div className="chat-header">
              <h3>💬 Chat con tu Asistente Financiero</h3>
              <p>Pregunta sobre tus finanzas, presupuesto, ahorros y más</p>
            </div>

            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-welcome">
                  <div className="welcome-message">
                    🧭 ¡Hola, capitán! Soy tu asistente financiero de Anclora. 
                    Estoy aquí para ayudarte a navegar hacia una mejor salud financiera.
                  </div>
                  <div className="chat-suggestions">
                    <h4>Pregúntame sobre:</h4>
                    <div className="suggestion-buttons">
                      <button 
                        className="suggestion-btn"
                        onClick={() => setNewMessage('¿Cómo puedo ahorrar más dinero?')}
                      >
                        💰 Ahorrar dinero
                      </button>
                      <button 
                        className="suggestion-btn"
                        onClick={() => setNewMessage('Analiza mis gastos del último mes')}
                      >
                        📊 Analizar gastos
                      </button>
                      <button 
                        className="suggestion-btn"
                        onClick={() => setNewMessage('¿Qué presupuesto me recomiendas?')}
                      >
                        🎯 Presupuesto
                      </button>
                      <button 
                        className="suggestion-btn"
                        onClick={() => setNewMessage('Ayúdame a establecer metas')}
                      >
                        🏝️ Metas de ahorro
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.type}`}>
                  <div className="message-content">
                    {msg.type === 'ai' && <span className="message-icon">🤖</span>}
                    <div className="message-text">{msg.message}</div>
                  </div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                  {msg.suggestions && (
                    <div className="message-suggestions">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="suggestion-btn small"
                          onClick={() => setNewMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="chat-message ai">
                  <div className="message-content">
                    <span className="message-icon">🤖</span>
                    <div className="typing-indicator">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input">
              <div className="input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Pregúntame sobre tus finanzas..."
                  className="chat-input-field"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !newMessage.trim()}
                  className="chat-send-btn"
                >
                  📤
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export const AdvancedBudget = ({ 
  user, 
  data, 
  onViewChange, 
  onCreateTransaction, 
  onCreateBudgetLimit, 
  onCreateSavingsGoal, 
  onAddToSavingsGoal 
}) => {
  const [budgetData, setBudgetData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load budget analytics
  useEffect(() => {
    const loadBudgetAnalytics = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${BACKEND_URL}/api/budget-analytics/${user.id}?period=${selectedPeriod}`);
        const analytics = await response.json();
        setBudgetData(analytics);
      } catch (error) {
        console.error('Error loading budget analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadBudgetAnalytics();
    }
  }, [user?.id, selectedPeriod]);

  if (loading) {
    return (
      <div className="advanced-budget">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando análisis financiero...</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const categoryChartData = {
    labels: Object.keys(budgetData?.category_breakdown || {}),
    datasets: [
      {
        label: 'Gastos por Categoría',
        data: Object.values(budgetData?.category_breakdown || {}),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const trendsChartData = {
    labels: budgetData?.expense_trends?.map(t => t.month) || [],
    datasets: [
      {
        label: 'Gastos Mensuales',
        data: budgetData?.expense_trends?.map(t => t.amount) || [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.parsed.toFixed(2)}`;
          }
        }
      }
    }
  };

  const renderOverview = () => (
    <div className="budget-overview">
      {/* Financial Summary Cards */}
      <div className="financial-summary">
        <div className="summary-card income">
          <div className="card-header">
            <h3>💰 Ingresos</h3>
            <span className="period">{selectedPeriod}</span>
          </div>
          <div className="amount">${budgetData?.total_income?.toFixed(2) || '0.00'}</div>
          <div className="trend positive">↗ +5.2%</div>
        </div>
        
        <div className="summary-card expenses">
          <div className="card-header">
            <h3>💸 Gastos</h3>
            <span className="period">{selectedPeriod}</span>
          </div>
          <div className="amount">${budgetData?.total_expenses?.toFixed(2) || '0.00'}</div>
          <div className="trend negative">↘ -2.1%</div>
        </div>
        
        <div className="summary-card balance">
          <div className="card-header">
            <h3>💵 Balance</h3>
            <span className="period">{selectedPeriod}</span>
          </div>
          <div className={`amount ${budgetData?.net_balance >= 0 ? 'positive' : 'negative'}`}>
            ${budgetData?.net_balance?.toFixed(2) || '0.00'}
          </div>
          <div className="trend positive">↗ +12.3%</div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetData?.budget_alerts?.length > 0 && (
        <div className="budget-alerts">
          <h3>⚠️ Alertas de Presupuesto</h3>
          <div className="alerts-list">
            {budgetData.budget_alerts.map((alert, index) => (
              <div key={index} className={`alert ${alert.severity}`}>
                <div className="alert-icon">
                  {alert.severity === 'high' ? '🔴' : '🟡'}
                </div>
                <div className="alert-content">
                  <h4>{alert.category}</h4>
                  <p>Has gastado ${alert.spent.toFixed(2)} de ${alert.limit.toFixed(2)} ({alert.percentage.toFixed(1)}%)</p>
                </div>
                <div className="alert-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>📊 Distribución de Gastos</h3>
          <div className="chart-wrapper">
            <Pie data={categoryChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-container">
          <h3>📈 Tendencias de Gastos</h3>
          <div className="chart-wrapper">
            <Line data={trendsChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudgetLimits = () => (
    <div className="budget-limits">
      <div className="section-header">
        <h3>🎯 Límites de Presupuesto</h3>
        <button 
          className="btn-primary"
          onClick={() => onViewChange('create-budget-limit')}
        >
          + Nuevo Límite
        </button>
      </div>
      
      <div className="limits-grid">
        {Object.entries(budgetData?.category_breakdown || {}).map(([category, spent]) => (
          <div key={category} className="limit-card">
            <div className="limit-header">
              <h4>{category}</h4>
              <span className="spent-amount">${spent.toFixed(2)}</span>
            </div>
            <div className="limit-progress">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
            <div className="limit-info">
              <span>65% del límite</span>
              <span>$500.00 límite</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSavingsGoals = () => (
    <div className="savings-goals">
      <div className="section-header">
        <h3>🏦 Metas de Ahorro</h3>
        <button 
          className="btn-primary"
          onClick={() => onViewChange('create-savings-goal')}
        >
          + Nueva Meta
        </button>
      </div>
      
      <div className="goals-grid">
        {budgetData?.savings_progress?.map((goal) => (
          <div key={goal.id} className="goal-card">
            <div className="goal-header">
              <h4>{goal.title}</h4>
              <span className="goal-percentage">{goal.progress.toFixed(1)}%</span>
            </div>
            <div className="goal-progress">
              <div 
                className="progress-bar"
                style={{ width: `${Math.min(goal.progress, 100)}%` }}
              ></div>
            </div>
            <div className="goal-amounts">
              <span>${goal.current_amount.toFixed(2)}</span>
              <span>${goal.target_amount.toFixed(2)}</span>
            </div>
            <button 
              className="btn-secondary"
              onClick={() => onAddToSavingsGoal(goal.id)}
            >
              💰 Añadir Dinero
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="financial-reports">
      <div className="section-header">
        <h3>📋 Reportes Financieros</h3>
        <button className="btn-primary">
          📄 Generar Reporte
        </button>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <h4>Reporte Mensual</h4>
          <p>Resumen completo del mes actual</p>
          <div className="report-stats">
            <div className="stat">
              <span>Balance:</span>
              <span>${budgetData?.net_balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="stat">
              <span>Mejor categoría:</span>
              <span>Trabajo</span>
            </div>
          </div>
          <button className="btn-secondary">Ver Reporte</button>
        </div>
        
        <div className="report-card">
          <h4>Predicciones</h4>
          <p>Proyecciones para el próximo mes</p>
          <div className="report-stats">
            <div className="stat">
              <span>Gastos estimados:</span>
              <span>${budgetData?.predictions?.next_month_expenses?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="stat">
              <span>Ahorro estimado:</span>
              <span>$250.00</span>
            </div>
          </div>
          <button className="btn-secondary">Ver Predicción</button>
        </div>
      </div>
    </div>
  );

  const renderComparatives = () => (
    <div className="budget-comparatives">
      <div className="section-header">
        <h3>📊 Comparativas</h3>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="period-selector"
        >
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
          <option value="yearly">Anual</option>
        </select>
      </div>
      
      <div className="comparative-charts">
        <div className="chart-container">
          <h4>Gastos por Categoría - Comparativa</h4>
          <div className="chart-wrapper">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="comparison-table">
          <h4>Comparación Mes a Mes</h4>
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Este Mes</th>
                <th>Mes Anterior</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(budgetData?.category_breakdown || {}).map(([category, amount]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>${amount.toFixed(2)}</td>
                  <td>${(amount * 0.9).toFixed(2)}</td>
                  <td className="positive">+${(amount * 0.1).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: '🏠 Resumen', component: renderOverview },
    { id: 'limits', label: '🎯 Límites', component: renderBudgetLimits },
    { id: 'savings', label: '🏦 Ahorros', component: renderSavingsGoals },
    { id: 'reports', label: '📋 Reportes', component: renderReports },
    { id: 'comparatives', label: '📊 Comparativas', component: renderComparatives }
  ];

  return (
    <div className="advanced-budget">
      <div className="budget-header">
        <div className="header-top">
          <button
            onClick={() => onViewChange('dashboard')}
            className="btn-secondary"
          >
            ← Volver al Dashboard
          </button>
          <h1>💰 Presupuesto Avanzado</h1>
          <div className="header-controls">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>
        
        <div className="budget-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="budget-content">
        {tabs.find(tab => tab.id === activeTab)?.component()}
      </div>
    </div>
  );
};

// Notification Toast Component
export const NotificationToast = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="notification-toast-container">
      {notifications.map((notification, index) => (
        <div key={index} className="notification-toast">
          <div className="toast-content">
            <div className="toast-title">{notification.title}</div>
            <div className="toast-body">{notification.body}</div>
          </div>
          <button
            onClick={() => onDismiss(index)}
            className="toast-dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

// Mobile Navigation Component
export const MobileNavigation = ({ currentView, onViewChange, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      view: 'dashboard'
    },
    {
      id: 'ai',
      label: 'IA',
      icon: '🤖',
      view: 'ai-assistant'
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: '🌊',
      view: 'timeline'
    },
    {
      id: 'budget',
      label: 'Presupuesto',
      icon: '💰',
      view: 'advanced-budget'
    }
  ];

  const quickActions = [
    {
      id: 'add-ancla',
      label: 'Nueva Ancla',
      icon: '⚓',
      view: 'create-ancla'
    },
    {
      id: 'add-transaction',
      label: 'Transacción',
      icon: '💸',
      view: 'create-transaction'
    },
    {
      id: 'add-habit',
      label: 'Hábito',
      icon: '📊',
      view: 'create-habit'
    }
  ];

  const handleNavigation = (view) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.view ? 'active' : ''}`}
            onClick={() => handleNavigation(item.view)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="mobile-fab-container">
        <button
          className={`mobile-fab ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '+'}
        </button>
        
        {/* Quick Actions Menu */}
        {isMenuOpen && (
          <div className="fab-menu">
            {quickActions.map((action, index) => (
              <button
                key={action.id}
                className="fab-action"
                onClick={() => handleNavigation(action.view)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="fab-icon">{action.icon}</span>
                <span className="fab-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="fab-backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

// Mobile Header Component
export const MobileHeader = ({ title, onBack, actions }) => {
  return (
    <div className="mobile-header">
      <div className="header-left">
        {onBack && (
          <button className="header-back-btn" onClick={onBack}>
            ←
          </button>
        )}
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-actions">
        {actions?.map((action, index) => (
          <button
            key={index}
            className="header-action-btn"
            onClick={action.onClick}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </div>
  );
};