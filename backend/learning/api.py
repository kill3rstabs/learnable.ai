# learning/api.py
from ninja import NinjaAPI
from ninja.router import Router

router = Router()


@router.get("/hello")
def hello(request):
    return {"message": "Hello from Learnable AI!"}
