from typing import Optional

from ninja.security import HttpBearer
from django.contrib.auth.models import User

from .auth import decode_token


class JWTAuth(HttpBearer):
    """
    Ninja HTTP Bearer security scheme that authenticates requests using JWTs.
    - Reads Authorization: Bearer <token>
    - Verifies token signature and expiry
    - Ensures it's an 'access' token
    - Returns the Django User instance as request.auth
    """

    def authenticate(self, request, token: str) -> Optional[User]:
        try:
            payload = decode_token(token)
            if payload.get("type") != "access":
                return None
            user_id = payload.get("sub")
            return User.objects.get(id=int(user_id))
        except Exception:
            # Any exception (invalid signature, expired, user missing) => unauthenticated
            return None


# Reusable singleton instance for route decorators
jwt_auth = JWTAuth() 