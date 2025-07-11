from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date
from enum import Enum
import json
from bson import ObjectId

# Custom JSON encoder to handle ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserProfile(str, Enum):
    CONTENT_CREATOR = "content_creator"
    FREELANCER = "freelancer"
    STUDENT = "student"
    PROFESSIONAL = "professional"

class AnclaType(str, Enum):
    TASK = "task"
    EVENT = "event"

class Priority(str, Enum):
    URGENT = "urgent"
    IMPORTANT = "important"
    INFORMATIVE = "informative"

class AnclaStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    OVERDUE = "overdue"

class RepeatType(str, Enum):
    NO_REPEAT = "no_repeat"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class Mood(str, Enum):
    HAPPY = "happy"
    NEUTRAL = "neutral"
    SAD = "sad"
    EXCITED = "excited"
    STRESSED = "stressed"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    profile: UserProfile
    created_at: datetime = Field(default_factory=datetime.utcnow)
    rank: str = "grumete"
    total_completed: int = 0
    current_streak: int = 0
    best_streak: int = 0

class UserCreate(BaseModel):
    email: str
    name: str
    profile: UserProfile

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    color: str
    icon: str
    profile: UserProfile
    user_id: str

class CategoryCreate(BaseModel):
    name: str
    color: str
    icon: str

class Ancla(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    type: AnclaType
    priority: Priority
    category_id: str
    status: AnclaStatus = AnclaStatus.ACTIVE
    repeat_type: RepeatType = RepeatType.NO_REPEAT
    all_day: bool = False
    start_date: datetime
    end_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    alert_enabled: bool = False
    alert_time: Optional[str] = None
    title_color: str = "#000000"
    emoji: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class AnclaCreate(BaseModel):
    title: str
    description: str
    type: AnclaType
    priority: Priority
    category_id: str
    repeat_type: RepeatType = RepeatType.NO_REPEAT
    all_day: bool = False
    start_date: datetime
    end_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    alert_enabled: bool = False
    alert_time: Optional[str] = None
    title_color: str = "#000000"
    emoji: str = ""

class Habit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    frequency: int  # times per week
    current_week_count: int = 0
    completion_percentage: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HabitCreate(BaseModel):
    name: str
    frequency: int

class Objective(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    completion_percentage: float = 0.0
    subtasks: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ObjectiveCreate(BaseModel):
    title: str
    description: str
    subtasks: List[Dict[str, Any]] = []

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: TransactionType
    category: str
    description: str
    amount: float
    date: date
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TransactionCreate(BaseModel):
    type: TransactionType
    category: str
    description: str
    amount: float
    date: date

class DiaryEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    mood: Mood
    date: date
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Budget Models
class BudgetLimit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    category: str
    limit_amount: float
    current_amount: float = 0.0
    period: str = "monthly"  # monthly, weekly, yearly
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BudgetLimitCreate(BaseModel):
    category: str
    limit_amount: float
    period: str = "monthly"

class SavingsGoal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    target_amount: float
    current_amount: float = 0.0
    target_date: date
    description: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SavingsGoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: date
    description: str = ""

class FinancialReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    report_type: str  # weekly, monthly, yearly
    period_start: date
    period_end: date
    total_income: float
    total_expenses: float
    net_balance: float
    category_breakdown: Dict[str, float]
    trends: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BudgetAnalytics(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    category_breakdown: Dict[str, float]
    expense_trends: List[Dict[str, Any]]
    budget_alerts: List[Dict[str, Any]]
    savings_progress: List[Dict[str, Any]]
    predictions: Dict[str, Any]

class DiaryEntryCreate(BaseModel):
    content: str
    mood: Mood

# Predefined data for each profile
PREDEFINED_CATEGORIES = {
    UserProfile.CONTENT_CREATOR: [
        {"name": "Creación de Contenido", "color": "#8B5CF6", "icon": "📹"},
        {"name": "Marketing", "color": "#EC4899", "icon": "📢"},
        {"name": "Colaboraciones", "color": "#06B6D4", "icon": "🤝"},
        {"name": "Análisis", "color": "#10B981", "icon": "📊"},
        {"name": "Networking", "color": "#F59E0B", "icon": "🌐"}
    ],
    UserProfile.FREELANCER: [
        {"name": "Proyectos Cliente", "color": "#8B5CF6", "icon": "💼"},
        {"name": "Administración", "color": "#EC4899", "icon": "📋"},
        {"name": "Marketing Personal", "color": "#06B6D4", "icon": "🚀"},
        {"name": "Desarrollo", "color": "#10B981", "icon": "⚡"},
        {"name": "Formación", "color": "#F59E0B", "icon": "📚"}
    ],
    UserProfile.STUDENT: [
        {"name": "Estudios", "color": "#8B5CF6", "icon": "📖"},
        {"name": "Exámenes", "color": "#EC4899", "icon": "📝"},
        {"name": "Proyectos", "color": "#06B6D4", "icon": "🎯"},
        {"name": "Investigación", "color": "#10B981", "icon": "🔬"},
        {"name": "Extracurriculares", "color": "#F59E0B", "icon": "🎨"}
    ],
    UserProfile.PROFESSIONAL: [
        {"name": "Trabajo Principal", "color": "#8B5CF6", "icon": "💼"},
        {"name": "Proyectos Paralelos", "color": "#EC4899", "icon": "🚀"},
        {"name": "Reuniones", "color": "#06B6D4", "icon": "👥"},
        {"name": "Desarrollo Personal", "color": "#10B981", "icon": "📈"},
        {"name": "Networking", "color": "#F59E0B", "icon": "🌐"}
    ]
}

PREDEFINED_HABITS = {
    UserProfile.CONTENT_CREATOR: [
        {"name": "Crear contenido diario", "frequency": 7},
        {"name": "Analizar métricas", "frequency": 3},
        {"name": "Interactuar con audiencia", "frequency": 5},
        {"name": "Investigar tendencias", "frequency": 4}
    ],
    UserProfile.FREELANCER: [
        {"name": "Prospectar clientes", "frequency": 3},
        {"name": "Actualizar portfolio", "frequency": 1},
        {"name": "Networking", "frequency": 2},
        {"name": "Aprender nuevas habilidades", "frequency": 4}
    ],
    UserProfile.STUDENT: [
        {"name": "Estudiar", "frequency": 5},
        {"name": "Hacer ejercicio", "frequency": 3},
        {"name": "Leer", "frequency": 4},
        {"name": "Meditar", "frequency": 7}
    ],
    UserProfile.PROFESSIONAL: [
        {"name": "Planificar día", "frequency": 7},
        {"name": "Ejercicio", "frequency": 3},
        {"name": "Desarrollo profesional", "frequency": 2},
        {"name": "Networking", "frequency": 1}
    ]
}

PREDEFINED_OBJECTIVES = {
    UserProfile.CONTENT_CREATOR: [
        {
            "title": "Lanzar nuevo canal de YouTube",
            "description": "Crear y configurar un nuevo canal especializado",
            "subtasks": [
                {"name": "Definir nicho y audiencia", "completed": False},
                {"name": "Diseñar branding", "completed": False},
                {"name": "Crear primeros 3 videos", "completed": False},
                {"name": "Configurar canal", "completed": False}
            ]
        }
    ],
    UserProfile.FREELANCER: [
        {
            "title": "Conseguir 3 clientes nuevos",
            "description": "Expandir la cartera de clientes este mes",
            "subtasks": [
                {"name": "Actualizar portfolio", "completed": False},
                {"name": "Contactar prospectos", "completed": False},
                {"name": "Enviar propuestas", "completed": False},
                {"name": "Cerrar contratos", "completed": False}
            ]
        }
    ],
    UserProfile.STUDENT: [
        {
            "title": "Aprobar todas las materias",
            "description": "Mantener buen rendimiento académico",
            "subtasks": [
                {"name": "Organizar horario de estudio", "completed": False},
                {"name": "Completar todas las tareas", "completed": False},
                {"name": "Preparar exámenes", "completed": False},
                {"name": "Participar en clases", "completed": False}
            ]
        }
    ],
    UserProfile.PROFESSIONAL: [
        {
            "title": "Lanzar proyecto paralelo",
            "description": "Desarrollar y lanzar un proyecto personal",
            "subtasks": [
                {"name": "Definir concepto", "completed": False},
                {"name": "Crear plan de desarrollo", "completed": False},
                {"name": "Desarrollar MVP", "completed": False},
                {"name": "Lanzar beta", "completed": False}
            ]
        }
    ]
}

BUDGET_CATEGORIES = {
    UserProfile.CONTENT_CREATOR: {
        "income": ["Patrocinios", "Publicidad", "Productos", "Consultoría"],
        "expense": ["Equipo", "Software", "Marketing", "Formación"]
    },
    UserProfile.FREELANCER: {
        "income": ["Proyectos", "Consultoría", "Productos", "Cursos"],
        "expense": ["Herramientas", "Marketing", "Formación", "Oficina"]
    },
    UserProfile.STUDENT: {
        "income": ["Beca", "Trabajo Parcial", "Familia", "Tutorías"],
        "expense": ["Matrícula", "Libros", "Transporte", "Alimentación"]
    },
    UserProfile.PROFESSIONAL: {
        "income": ["Salario", "Proyecto Paralelo", "Inversiones", "Freelance"],
        "expense": ["Vivienda", "Transporte", "Alimentación", "Entretenimiento"]
    }
}

# Routes
@api_router.get("/")
async def root():
    return {"message": "Anclora API - Navegando hacia el éxito"}

# User routes
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    user_dict = user.dict()
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    
    # Create predefined categories
    categories = PREDEFINED_CATEGORIES.get(user.profile, [])
    for cat_data in categories:
        category = Category(
            name=cat_data["name"],
            color=cat_data["color"],
            icon=cat_data["icon"],
            profile=user.profile,
            user_id=user_obj.id
        )
        await db.categories.insert_one(category.dict())
    
    # Create predefined habits
    habits = PREDEFINED_HABITS.get(user.profile, [])
    for habit_data in habits:
        habit = Habit(
            name=habit_data["name"],
            frequency=habit_data["frequency"],
            user_id=user_obj.id
        )
        await db.habits.insert_one(habit.dict())
    
    # Create predefined objectives
    objectives = PREDEFINED_OBJECTIVES.get(user.profile, [])
    for obj_data in objectives:
        objective = Objective(
            title=obj_data["title"],
            description=obj_data["description"],
            subtasks=obj_data["subtasks"],
            user_id=user_obj.id
        )
        await db.objectives.insert_one(objective.dict())
    
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return User(**user)

@api_router.get("/users/{user_id}/dashboard")
async def get_dashboard(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get anclas
    anclas = await db.anclas.find({"user_id": user_id}).to_list(1000)
    active_anclas = [a for a in anclas if a["status"] == "active"]
    completed_anclas = [a for a in anclas if a["status"] == "completed"]
    overdue_anclas = [a for a in anclas if a["status"] == "overdue"]
    
    # Get habits
    habits = await db.habits.find({"user_id": user_id}).to_list(1000)
    
    # Get objectives
    objectives = await db.objectives.find({"user_id": user_id}).to_list(1000)
    
    # Get recent transactions
    transactions = await db.transactions.find({"user_id": user_id}).sort("created_at", -1).limit(10).to_list(10)
    
    # Get recent diary entries
    diary_entries = await db.diary_entries.find({"user_id": user_id}).sort("created_at", -1).limit(5).to_list(5)
    
    # Convert ObjectId to string in all documents
    def convert_objectid(item):
        if isinstance(item, dict):
            for k, v in list(item.items()):
                if isinstance(v, ObjectId):
                    item[k] = str(v)
                elif isinstance(v, (dict, list)):
                    convert_objectid(v)
        elif isinstance(item, list):
            for i in range(len(item)):
                if isinstance(item[i], ObjectId):
                    item[i] = str(item[i])
                elif isinstance(item[i], (dict, list)):
                    convert_objectid(item[i])
        return item
    
    # Convert all ObjectId to string
    user = convert_objectid(user)
    active_anclas = convert_objectid(active_anclas)
    completed_anclas = convert_objectid(completed_anclas)
    overdue_anclas = convert_objectid(overdue_anclas)
    habits = convert_objectid(habits)
    objectives = convert_objectid(objectives)
    transactions = convert_objectid(transactions)
    diary_entries = convert_objectid(diary_entries)
    
    return {
        "user": User(**user),
        "anclas": {
            "active": active_anclas,
            "completed": completed_anclas,
            "overdue": overdue_anclas,
            "total": len(anclas)
        },
        "habits": habits,
        "objectives": objectives,
        "transactions": transactions,
        "diary_entries": diary_entries,
        "budget_categories": BUDGET_CATEGORIES.get(user["profile"], {})
    }

# Ancla routes
@api_router.post("/anclas", response_model=Ancla)
async def create_ancla(ancla: AnclaCreate, user_id: str):
    ancla_dict = ancla.dict()
    ancla_dict["user_id"] = user_id
    ancla_obj = Ancla(**ancla_dict)
    await db.anclas.insert_one(ancla_obj.dict())
    return ancla_obj

@api_router.get("/anclas/{ancla_id}", response_model=Ancla)
async def get_ancla(ancla_id: str):
    ancla = await db.anclas.find_one({"id": ancla_id})
    if not ancla:
        raise HTTPException(status_code=404, detail="Ancla no encontrada")
    return Ancla(**ancla)

@api_router.put("/anclas/{ancla_id}", response_model=Ancla)
async def update_ancla(ancla_id: str, ancla: AnclaCreate):
    ancla_dict = ancla.dict()
    result = await db.anclas.update_one({"id": ancla_id}, {"$set": ancla_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ancla no encontrada")
    
    updated_ancla = await db.anclas.find_one({"id": ancla_id})
    return Ancla(**updated_ancla)

@api_router.post("/anclas/{ancla_id}/complete")
async def complete_ancla(ancla_id: str):
    result = await db.anclas.update_one(
        {"id": ancla_id}, 
        {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ancla no encontrada")
    
    # Update user stats
    ancla = await db.anclas.find_one({"id": ancla_id})
    if ancla:
        await db.users.update_one(
            {"id": ancla["user_id"]},
            {"$inc": {"total_completed": 1, "current_streak": 1}}
        )
    
    return {"message": "Ancla completada exitosamente"}

@api_router.delete("/anclas/{ancla_id}")
async def delete_ancla(ancla_id: str):
    result = await db.anclas.delete_one({"id": ancla_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ancla no encontrada")
    return {"message": "Ancla eliminada exitosamente"}

# Category routes
@api_router.get("/categories/{user_id}")
async def get_categories(user_id: str):
    categories = await db.categories.find({"user_id": user_id}).to_list(1000)
    
    # Convert ObjectId to string in all categories
    def convert_objectid(item):
        if isinstance(item, dict):
            for k, v in list(item.items()):
                if isinstance(v, ObjectId):
                    item[k] = str(v)
                elif isinstance(v, (dict, list)):
                    convert_objectid(v)
        elif isinstance(item, list):
            for i in range(len(item)):
                if isinstance(item[i], ObjectId):
                    item[i] = str(item[i])
                elif isinstance(item[i], (dict, list)):
                    convert_objectid(item[i])
        return item
    
    categories = convert_objectid(categories)
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate, user_id: str, profile: UserProfile):
    category_dict = category.dict()
    category_dict["user_id"] = user_id
    category_dict["profile"] = profile
    category_obj = Category(**category_dict)
    await db.categories.insert_one(category_obj.dict())
    return category_obj

# Habit routes
@api_router.post("/habits", response_model=Habit)
async def create_habit(habit: HabitCreate, user_id: str):
    habit_dict = habit.dict()
    habit_dict["user_id"] = user_id
    habit_obj = Habit(**habit_dict)
    await db.habits.insert_one(habit_obj.dict())
    return habit_obj

@api_router.post("/habits/{habit_id}/track")
async def track_habit(habit_id: str):
    habit = await db.habits.find_one({"id": habit_id})
    if not habit:
        raise HTTPException(status_code=404, detail="Hábito no encontrado")
    
    new_count = habit["current_week_count"] + 1
    percentage = min((new_count / habit["frequency"]) * 100, 100)
    
    await db.habits.update_one(
        {"id": habit_id},
        {"$set": {"current_week_count": new_count, "completion_percentage": percentage}}
    )
    
    return {"message": "Hábito registrado exitosamente"}

# Objective routes
@api_router.post("/objectives", response_model=Objective)
async def create_objective(objective: ObjectiveCreate, user_id: str):
    objective_dict = objective.dict()
    objective_dict["user_id"] = user_id
    objective_obj = Objective(**objective_dict)
    await db.objectives.insert_one(objective_obj.dict())
    return objective_obj

@api_router.post("/objectives/{objective_id}/subtask/{subtask_index}/toggle")
async def toggle_subtask(objective_id: str, subtask_index: int):
    objective = await db.objectives.find_one({"id": objective_id})
    if not objective:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    
    if subtask_index >= len(objective["subtasks"]):
        raise HTTPException(status_code=400, detail="Subtarea no encontrada")
    
    objective["subtasks"][subtask_index]["completed"] = not objective["subtasks"][subtask_index]["completed"]
    
    # Calculate completion percentage
    completed_count = sum(1 for st in objective["subtasks"] if st["completed"])
    total_count = len(objective["subtasks"])
    percentage = (completed_count / total_count) * 100 if total_count > 0 else 0
    
    await db.objectives.update_one(
        {"id": objective_id},
        {"$set": {"subtasks": objective["subtasks"], "completion_percentage": percentage}}
    )
    
    return {"message": "Subtarea actualizada exitosamente"}

# Transaction routes
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate, user_id: str):
    transaction_dict = transaction.dict()
    transaction_dict["user_id"] = user_id
    transaction_obj = Transaction(**transaction_dict)
    
    # Convert the Transaction object to dict and handle date serialization
    trans_dict = transaction_obj.dict()
    if isinstance(trans_dict.get("date"), date):
        trans_dict["date"] = trans_dict["date"].isoformat()
    
    await db.transactions.insert_one(trans_dict)
    return transaction_obj

@api_router.get("/transactions/{user_id}")
async def get_transactions(user_id: str):
    transactions = await db.transactions.find({"user_id": user_id}).sort("created_at", -1).to_list(1000)
    
    # Convert ObjectId to string in all transactions
    def convert_objectid(item):
        if isinstance(item, dict):
            for k, v in list(item.items()):
                if isinstance(v, ObjectId):
                    item[k] = str(v)
                elif isinstance(v, (dict, list)):
                    convert_objectid(v)
        elif isinstance(item, list):
            for i in range(len(item)):
                if isinstance(item[i], ObjectId):
                    item[i] = str(item[i])
                elif isinstance(item[i], (dict, list)):
                    convert_objectid(item[i])
        return item
    
    transactions = convert_objectid(transactions)
    return transactions

# Diary routes
@api_router.post("/diary", response_model=DiaryEntry)
async def create_diary_entry(entry: DiaryEntryCreate, user_id: str):
    entry_dict = entry.dict()
    entry_dict["user_id"] = user_id
    entry_dict["date"] = date.today().isoformat()  # Convert date to string
    entry_obj = DiaryEntry(**entry_dict)
    
    # Convert the DiaryEntry object to dict and handle date serialization
    diary_dict = entry_obj.dict()
    if isinstance(diary_dict.get("date"), date):
        diary_dict["date"] = diary_dict["date"].isoformat()
    
    await db.diary_entries.insert_one(diary_dict)
    return entry_obj

@api_router.get("/diary/{user_id}")
async def get_diary_entries(user_id: str):
    entries = await db.diary_entries.find({"user_id": user_id}).sort("created_at", -1).to_list(1000)
    
    # Convert ObjectId to string in all entries
    def convert_objectid(item):
        if isinstance(item, dict):
            for k, v in list(item.items()):
                if isinstance(v, ObjectId):
                    item[k] = str(v)
                elif isinstance(v, (dict, list)):
                    convert_objectid(v)
        elif isinstance(item, list):
            for i in range(len(item)):
                if isinstance(item[i], ObjectId):
                    item[i] = str(item[i])
                elif isinstance(item[i], (dict, list)):
                    convert_objectid(item[i])
        return item
    
    entries = convert_objectid(entries)
    return entries

# Budget Limits routes
@api_router.post("/budget-limits", response_model=BudgetLimit)
async def create_budget_limit(limit: BudgetLimitCreate, user_id: str):
    limit_dict = limit.dict()
    limit_dict["user_id"] = user_id
    limit_obj = BudgetLimit(**limit_dict)
    await db.budget_limits.insert_one(limit_obj.dict())
    return limit_obj

@api_router.get("/budget-limits/{user_id}")
async def get_budget_limits(user_id: str):
    limits = await db.budget_limits.find({"user_id": user_id}).to_list(1000)
    
    # Convert ObjectId to string in all limits
    def convert_objectid(item):
        if isinstance(item, dict):
            for k, v in list(item.items()):
                if isinstance(v, ObjectId):
                    item[k] = str(v)
                elif isinstance(v, (dict, list)):
                    convert_objectid(v)
        elif isinstance(item, list):
            for i in range(len(item)):
                if isinstance(item[i], ObjectId):
                    item[i] = str(item[i])
                elif isinstance(item[i], (dict, list)):
                    convert_objectid(item[i])
        return item
    
    limits = convert_objectid(limits)
    return limits

@api_router.put("/budget-limits/{limit_id}")
async def update_budget_limit(limit_id: str, limit: BudgetLimitCreate):
    limit_dict = limit.dict()
    result = await db.budget_limits.update_one({"id": limit_id}, {"$set": limit_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Budget limit not found")
    return {"message": "Budget limit updated successfully"}

# Savings Goals routes
@api_router.post("/savings-goals", response_model=SavingsGoal)
async def create_savings_goal(goal: SavingsGoalCreate, user_id: str):
    goal_dict = goal.dict()
    goal_dict["user_id"] = user_id
    if isinstance(goal_dict.get("target_date"), date):
        goal_dict["target_date"] = goal_dict["target_date"].isoformat()
    goal_obj = SavingsGoal(**goal_dict)
    await db.savings_goals.insert_one(goal_obj.dict())
    return goal_obj

@api_router.get("/savings-goals/{user_id}")
async def get_savings_goals(user_id: str):
    goals = await db.savings_goals.find({"user_id": user_id}).to_list(1000)
    return goals

@api_router.put("/savings-goals/{goal_id}/add-money")
async def add_money_to_savings_goal(goal_id: str, amount: float):
    goal = await db.savings_goals.find_one({"id": goal_id})
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    new_amount = goal.get("current_amount", 0) + amount
    result = await db.savings_goals.update_one(
        {"id": goal_id}, 
        {"$set": {"current_amount": new_amount}}
    )
    return {"message": "Money added to savings goal", "new_amount": new_amount}

# Budget Analytics routes
@api_router.get("/budget-analytics/{user_id}")
async def get_budget_analytics(user_id: str, period: str = "monthly"):
    """Get comprehensive budget analytics"""
    from datetime import datetime, timedelta
    
    # Calculate date range based on period
    end_date = datetime.now()
    if period == "weekly":
        start_date = end_date - timedelta(weeks=1)
    elif period == "monthly":
        start_date = end_date - timedelta(days=30)
    elif period == "yearly":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)
    
    # Get transactions for the period
    transactions = await db.transactions.find({
        "user_id": user_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(1000)
    
    # Get budget limits
    budget_limits = await db.budget_limits.find({"user_id": user_id}).to_list(1000)
    
    # Get savings goals
    savings_goals = await db.savings_goals.find({"user_id": user_id}).to_list(1000)
    
    # Calculate analytics
    total_income = sum(t.get("amount", 0) for t in transactions if t.get("type") == "income")
    total_expenses = sum(t.get("amount", 0) for t in transactions if t.get("type") == "expense")
    net_balance = total_income - total_expenses
    
    # Category breakdown
    category_breakdown = {}
    for transaction in transactions:
        if transaction.get("type") == "expense":
            category = transaction.get("category", "Sin categoría")
            category_breakdown[category] = category_breakdown.get(category, 0) + transaction.get("amount", 0)
    
    # Budget alerts
    budget_alerts = []
    for limit in budget_limits:
        category = limit.get("category")
        limit_amount = limit.get("limit_amount", 0)
        spent = category_breakdown.get(category, 0)
        percentage = (spent / limit_amount * 100) if limit_amount > 0 else 0
        
        if percentage >= 90:
            budget_alerts.append({
                "category": category,
                "percentage": percentage,
                "spent": spent,
                "limit": limit_amount,
                "severity": "high" if percentage >= 100 else "medium"
            })
    
    # Expense trends (last 6 months)
    expense_trends = []
    for i in range(6):
        month_start = end_date - timedelta(days=30*(i+1))
        month_end = end_date - timedelta(days=30*i)
        month_transactions = await db.transactions.find({
            "user_id": user_id,
            "type": "expense",
            "created_at": {"$gte": month_start, "$lte": month_end}
        }).to_list(1000)
        
        month_total = sum(t.get("amount", 0) for t in month_transactions)
        expense_trends.append({
            "month": month_start.strftime("%Y-%m"),
            "amount": month_total
        })
    
    # Savings progress
    savings_progress = []
    for goal in savings_goals:
        progress_percentage = (goal.get("current_amount", 0) / goal.get("target_amount", 1)) * 100
        savings_progress.append({
            "id": goal.get("id"),
            "title": goal.get("title"),
            "progress": progress_percentage,
            "current_amount": goal.get("current_amount", 0),
            "target_amount": goal.get("target_amount", 0)
        })
    
    # Simple predictions (next month based on current trends)
    avg_monthly_expense = total_expenses  # Simplified
    predicted_next_month = avg_monthly_expense * 1.05  # 5% increase assumption
    
    analytics = BudgetAnalytics(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        category_breakdown=category_breakdown,
        expense_trends=expense_trends,
        budget_alerts=budget_alerts,
        savings_progress=savings_progress,
        predictions={
            "next_month_expenses": predicted_next_month,
            "annual_projection": predicted_next_month * 12
        }
    )
    
    return analytics

@api_router.get("/financial-reports/{user_id}")
async def generate_financial_report(user_id: str, report_type: str = "monthly"):
    """Generate financial reports"""
    from datetime import datetime, timedelta
    
    # Calculate date range
    end_date = datetime.now()
    if report_type == "weekly":
        start_date = end_date - timedelta(weeks=1)
    elif report_type == "monthly":
        start_date = end_date - timedelta(days=30)
    elif report_type == "yearly":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)
    
    # Get transactions
    transactions = await db.transactions.find({
        "user_id": user_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(1000)
    
    # Calculate totals
    total_income = sum(t.get("amount", 0) for t in transactions if t.get("type") == "income")
    total_expenses = sum(t.get("amount", 0) for t in transactions if t.get("type") == "expense")
    net_balance = total_income - total_expenses
    
    # Category breakdown
    category_breakdown = {}
    for transaction in transactions:
        category = transaction.get("category", "Sin categoría")
        category_breakdown[category] = category_breakdown.get(category, 0) + transaction.get("amount", 0)
    
    # Create report
    report = FinancialReport(
        user_id=user_id,
        report_type=report_type,
        period_start=start_date.date(),
        period_end=end_date.date(),
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        category_breakdown=category_breakdown,
        trends={"growth_rate": 0.05}  # Simplified
    )
    
    # Save report
    report_dict = report.dict()
    if isinstance(report_dict.get("period_start"), date):
        report_dict["period_start"] = report_dict["period_start"].isoformat()
    if isinstance(report_dict.get("period_end"), date):
        report_dict["period_end"] = report_dict["period_end"].isoformat()
    
    await db.financial_reports.insert_one(report_dict)
    
    return report

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()