import json
import os
import time
from typing import Dict, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# Configuration
SECRET_KEY = "tu_clave_secreta_super_segura" # En produccion usar .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

class User(BaseModel):
    username: str
    password_hash: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AuthService:
    def __init__(self):
        self.users = self._load_users()

    def _load_users(self) -> Dict[str, dict]:
        if not os.path.exists(USERS_FILE):
            return {}
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_users(self):
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.users, f)

    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return pwd_context.hash(password)

    def get_user(self, username: str):
        user_data = self.users.get(username)
        if user_data:
            return user_data
        return None

    def create_user(self, username, password):
        if self.users.get(username):
            return None
        
        hashed_pw = self.get_password_hash(password)
        new_user = {
            "username": username,
            "password_hash": hashed_pw
        }
        self.users[username] = new_user
        self._save_users()
        return new_user

    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = time.time() + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

auth_service = AuthService()

async def get_current_user(token: str = Depends(oauth2_scheme)):
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
    
    user = auth_service.get_user(username)
    if user is None:
        raise credentials_exception
    return user
