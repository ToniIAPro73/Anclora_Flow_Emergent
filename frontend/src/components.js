import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
          <h3>⚓ Gestión de Anclas</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Anclajes Activos</h4>
            
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
                    className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded"
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
          <h3>💰 Presupuesto</h3>
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
            className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded ml-2"
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
          <h2 className="text-2xl font-bold text-gray-800">
            🌊 Marea de Tiempo
          </h2>
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