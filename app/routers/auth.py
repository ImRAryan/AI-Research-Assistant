from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import httpx
import random

from app.database import get_db
from app.core.config import settings
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.core.dependencies import get_current_user
from app.core.email import send_otp_email
from app.models.user import User, AuthProvider
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import Token, RefreshTokenRequest
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()

    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    hashed = hash_password(user_data.password)

    # ===== TEMPORARY: OTP EMAIL DISABLED (SMTP blocked on current host) =====
    # To re-enable: set is_verified=False below and uncomment the
    # `await send_otp_email(...)` lines.
    OTP_ENABLED = False
    # ==========================================================================

    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists"
            )

        existing_user.name = user_data.name.strip()
        existing_user.password_hash = hashed
        existing_user.otp = otp
        existing_user.otp_expiry = otp_expiry

        if not OTP_ENABLED:
            existing_user.is_verified = True

        db.commit()
        db.refresh(existing_user)

        if OTP_ENABLED:
            await send_otp_email(existing_user.email, otp)

        return existing_user

    new_user = User(
        name=user_data.name.strip(),
        email=user_data.email.lower().strip(),
        password_hash=hashed,
        is_verified=not OTP_ENABLED,
        otp=otp,
        otp_expiry=otp_expiry,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if OTP_ENABLED:
        await send_otp_email(new_user.email, otp)

    return new_user



class OTPVerifyRequest(BaseModel):
    email: str
    otp: str

@router.post("/verify-otp", summary="Verify OTP and activate account")
def verify_otp(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    if user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.now(timezone.utc) > user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP has expired")

    user.is_verified = True
    user.otp = None
    user.otp_expiry = None
    db.commit()

    return {"message": "Email verified successfully! You can now login."}



@router.post(
    "/login",
    response_model=Token,
    summary="Login and receive JWT access token"
)
def login(user_data: UserLogin, response: Response, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == user_data.email.lower()
    ).first()

    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not user:
        raise auth_error

    if not verify_password(user_data.password, user.password_hash):
        raise auth_error

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )

    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )



@router.post(
    "/refresh",
    response_model=Token,
    summary="Get a new access token using the refresh token"
)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token found")

    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": str(user.id)}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return Token(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )



@router.post("/logout", summary="Logout and clear session")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="refresh_token")
    return {"message": f"Goodbye, {current_user.name}! You have been logged out."}



@router.get("/google", summary="Start Google OAuth login flow")
def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid email profile"
        "&access_type=offline"
    )
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback", summary="Handle Google OAuth callback")
async def google_callback(code: str, response: Response, db: Session = Depends(get_db)):
    print("CALLBACK HIT, code:", code[:20])

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )
        token_data = token_response.json()

        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        user_info = user_info_response.json()

    google_id = user_info.get("id")
    email = user_info.get("email", "").lower()
    name = user_info.get("name", "")
    avatar_url = user_info.get("picture")

    user = db.query(User).filter(
        (User.email == email) | (User.oauth_provider_id == google_id)
    ).first()

    if not user:
        user = User(
            name=name,
            email=email,
            auth_provider=AuthProvider.google,
            oauth_provider_id=google_id,
            avatar_url=avatar_url,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token_val = create_refresh_token(token_data)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token_val,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    frontend_url = f"http://localhost:5173/auth/callback?access_token={access_token}"
    return RedirectResponse(url=frontend_url, status_code=302)