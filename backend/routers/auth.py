from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from database import get_db
from models import Parent
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, ChangePasswordRequest
from dependencies import get_current_parent
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Parent).filter(Parent.username == req.username).first()
    if existing:
        raise HTTPException(400, "用户名已存在")
    parent = Parent(
        username=req.username,
        password_hash=pwd_context.hash(req.password),
        name=req.name,
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)
    token = create_token({"sub": str(parent.id)})
    return TokenResponse(access_token=token, parent_name=parent.name)


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    parent = db.query(Parent).filter(Parent.username == req.username).first()
    if not parent or not pwd_context.verify(req.password, parent.password_hash):
        raise HTTPException(401, "用户名或密码错误")
    token = create_token({"sub": str(parent.id)})
    return TokenResponse(access_token=token, parent_name=parent.name)


@router.put("/change-password")
def change_password(
    req: ChangePasswordRequest,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    if not pwd_context.verify(req.old_password, parent.password_hash):
        raise HTTPException(400, "原密码错误")
    if len(req.new_password) < 6:
        raise HTTPException(400, "新密码至少6位")
    parent.password_hash = pwd_context.hash(req.new_password)
    db.commit()
    return {"message": "密码已修改"}
