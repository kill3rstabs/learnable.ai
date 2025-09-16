from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from ninja.router import Router

from .schemas import RegisterIn, LoginIn, TokenOut, UserOut, CreditChangeIn, ErrorOut
from .auth import create_tokens, decode_token
from .security import jwt_auth
from .services import add_credits, deduct_credits, get_profile

# Router that will be mounted under /api/users
router = Router()


@router.post("/auth/register", response={200: TokenOut, 409: ErrorOut})
def register(request, payload: RegisterIn):
    """
    Register a new user account.
    - Creates Django user
    - Signals auto-provision a UserProfile
    - Returns access and refresh tokens
    """
    try:
        user = User.objects.create_user(
            username=payload.username,
            email=payload.email,
            password=payload.password,
        )
    except IntegrityError:
        # Username already exists
        return 409, {"detail": "Username already exists"}

    access, refresh = create_tokens(user.id, user.username)
    return {"access": access, "refresh": refresh}


@router.post("/auth/login", response={200: TokenOut, 401: ErrorOut})
def login(request, payload: LoginIn):
    """
    Authenticate with username and password.
    Returns a fresh token pair on success.
    """
    user = authenticate(username=payload.username, password=payload.password)
    if not user:
        return 401, {"detail": "Invalid credentials"}

    access, refresh = create_tokens(user.id, user.username)
    return {"access": access, "refresh": refresh}


@router.post("/auth/refresh", response={200: TokenOut, 401: ErrorOut})
def refresh(request, refresh: str):
    """
    Exchange a valid refresh token for a new pair of tokens.
    """
    try:
        payload = decode_token(refresh)
        if payload.get("type") != "refresh":
            return 401, {"detail": "Invalid token type"}

        user_id = int(payload.get("sub"))
        user = User.objects.filter(id=user_id).first()
        if not user:
            return 401, {"detail": "User not found"}

        access, new_refresh = create_tokens(user.id, user.username)
        return {"access": access, "refresh": new_refresh}
    except Exception:
        return 401, {"detail": "Invalid or expired refresh token"}


@router.get("/auth/me", auth=jwt_auth, response=UserOut)
def me(request):
    """
    Return the authenticated user's profile with current credit balance.
    """
    user = request.auth
    profile = get_profile(user)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "credits": profile.credits,
    }


@router.post("/credits/add", auth=jwt_auth)
def credits_add(request, payload: CreditChangeIn):
    """
    Add credits to the current user (for testing or via payment webhook).
    """
    if payload.amount <= 0:
        return 400, {"detail": "Amount must be positive"}

    new_balance = add_credits(request.auth, payload.amount)
    return {"credits": new_balance}


@router.post("/credits/deduct", auth=jwt_auth)
def credits_deduct(request, payload: CreditChangeIn):
    """
    Deduct credits from the current user (manual operation).
    """
    if payload.amount <= 0:
        return 400, {"detail": "Amount must be positive"}

    try:
        result = deduct_credits(request.auth, payload.amount)
        return {"debited": result.debited, "remaining": result.remaining}
    except ValueError as e:
        return 400, {"detail": str(e)} 