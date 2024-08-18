from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import base64
from openai import OpenAI
import config

client = OpenAI(
    api_key=config.OpenAi_Key,
)

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    surname = Column(String)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    profile_picture = Column(String, default=None)
    points = Column(Integer, default=0)

class SATVerbalTask(Base):
    __tablename__ = "sat_verbal_tasks"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(String)

class SATMathTask(Base):
    __tablename__ = "sat_math_tasks"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(String)

class MokTestsRes(Base):
    __tablename__ = "MokTests_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    test_name = Column(String)
    correct_percentage = Column(Integer)
    total_questions = Column(Integer)

Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    name: str
    surname: str
    username: str
    password: str

class UserInDB(BaseModel):
    name: str
    surname: str
    username: str
    hashed_password: str
    profile_picture: Optional[str]
    points: int

    class Config:
        orm_mode = True

class UserAnswer(BaseModel):
    question: str
    answer: str

class PointsUpdate(BaseModel):
    amount: int

class SATVerbalTaskCreate(BaseModel):
    question: str
    answer: str

class SATMathTaskCreate(BaseModel):
    question: str
    answer: str

class TestResultCreate(BaseModel):
    test_name: str
    correct_percentage: int
    total_questions: int

class TestResultInDB(TestResultCreate):
    user_id: int

    class Config:
        orm_mode = True

class UserOut(BaseModel):
    id: int
    name: str
    points: int

    class Config:
        orm_mode = True

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://134.122.22.165:3000",
    "http://134.122.22.165:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/register", response_model=UserInDB)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(name=user.name, surname=user.surname, username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserInDB(
        name=db_user.name,
        surname=db_user.surname,
        username=db_user.username,
        hashed_password=db_user.hashed_password,
        profile_picture=db_user.profile_picture,
        points=db_user.points
    )

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username or password")
    if not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    
    response = {"access_token": access_token, "token_type": "bearer"}
    
    return response

def get_current_user(db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/login"))):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me", response_model=UserInDB)
def read_users_me(current_user: User = Depends(get_current_user)):
    return UserInDB(
        name=current_user.name,
        surname=current_user.surname,
        username=current_user.username,
        hashed_password=current_user.hashed_password,
        profile_picture=current_user.profile_picture,
        points=current_user.points
    )

@app.post("/users/me/profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/login"))):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    contents = await file.read()
    encoded_string = base64.b64encode(contents).decode('utf-8')
    
    user.profile_picture = encoded_string
    db.commit()
    
    return {"filename": file.filename}

@app.get("/users/me/profile-picture")
def get_profile_picture(db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/login"))):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    if user.profile_picture:
        return {"profilePicture": user.profile_picture}
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile picture not found")

@app.post("/users/me/add-points")
async def add_points(points_update: PointsUpdate, db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/login"))):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception

    user.points += points_update.amount
    db.commit()

    return {"points": user.points}

def generate_sat_verbal_task():
    prompt = "Generate a SAT verbal question with one correct answer and provide a brief explanation."
    messages = [
            {"role": "system", "content": "It is necessary to write a problem on SAT Verbal, 4 answers and only one of them is correct, and the correct answer must be written in the format Answer: (Correct answer). Without further ado, examples Question or Sat Test or Read the following passage and answer the following question: ```."},
            {"role": "user", "content":[{"type": "text", "text": prompt}]}
        ]
    response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=2000,
        )
    task_text = response.choices[0].message.content
    parts = task_text.split("Answer:")
    question = parts[0].strip()
    answer = parts[1].strip() if len(parts) > 1 else ""
    return {"question": question, "answer": answer}

@app.get("/generate_sat_verbal_task")
async def generate_sat_verbal_task_route():
    task = generate_sat_verbal_task()
    return task


@app.get("/get_sat_verbal_tasks")
def get_sat_verbal_tasks(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    tasks = db.query(SATVerbalTask).offset(skip).limit(limit).all()
    return tasks

@app.post("/save_sat_verbal_task")
def save_sat_verbal_task(task: SATVerbalTaskCreate, db: Session = Depends(get_db)):
    db_task = SATVerbalTask(question=task.question, answer=task.answer)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return task

@app.post("/check_sat_verbal_answer")
def check_sat_verbal_answer(task: SATVerbalTaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(SATVerbalTask).filter(SATVerbalTask.question == task.question).first()
    if db_task:
        is_correct = db_task.answer.strip()[0].lower() == task.answer.strip()[0].lower()
        return {
            "is_correct": is_correct,
            "correct_answer": db_task.answer if not is_correct else ""
        }
    else:
        raise HTTPException(status_code=404, detail="Task not found")
    
@app.post("/sat_verbal_results/", response_model=TestResultInDB)
def save_result(result: TestResultCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):


    user = current_user
    total_questions = result.total_questions
    correct_percentage = result.correct_percentage
    db_result = MokTestsRes(
        user_id=user.id,
        test_name=result.test_name,
        correct_percentage=correct_percentage,
        total_questions=total_questions
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

@app.get("/sat_verbal_results/", response_model=List[TestResultInDB])
def get_results(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/login"))):
    user = get_current_user(db, token)
    results = db.query(MokTestsRes).filter(MokTestsRes.user_id == user.id).offset(skip).limit(limit).all()
    return results

def generate_sat_math_task():
    prompt = "Generate an SAT math question with one correct answer and provide a brief explanation. Without solution,without **"
    messages = [
        {"role": "system", "content": "It is necessary to write a math problem for the SAT, with 4 answers and only one of them is correct. The correct answer must be written in the format Answer: (Correct answer)."},
        {"role": "user", "content": prompt}
    ]
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=2000,
    )
    task_text = response.choices[0].message.content
    parts = task_text.split("Answer:")
    question = parts[0].strip()
    answer = parts[1].strip() if len(parts) > 1 else ""
    return {"question": question, "answer": answer}

@app.get("/generate_sat_math_task")
async def generate_sat_math_task_route():
    task = generate_sat_math_task()
    return task

@app.get("/get_sat_math_tasks")
def get_sat_math_tasks(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    tasks = db.query(SATMathTask).offset(skip).limit(limit).all()
    return tasks

@app.post("/save_sat_math_task")
def save_sat_math_task(task: SATMathTaskCreate, db: Session = Depends(get_db)):
    db_task = SATMathTask(question=task.question, answer=task.answer)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return task

@app.post("/check_sat_math_answer")
def check_sat_math_answer(task: SATMathTaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(SATMathTask).filter(SATMathTask.question == task.question).first()
    if db_task:
        if db_task.answer.strip() and task.answer.strip():
            is_correct = db_task.answer.strip().lower() == task.answer.strip().lower()
        else:
            is_correct = False
        return {
            "is_correct": is_correct,
            "correct_answer": db_task.answer if not is_correct else ""
        }
    else:
        raise HTTPException(status_code=404, detail="Task not found")


@app.get("/top_users", response_model=List[UserOut])
def get_top_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    top_users = db.query(User).order_by(User.points.desc()).offset(skip).limit(limit).all()
    return top_users

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
