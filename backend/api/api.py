# api.py
from ninja import NinjaAPI
from learning.api import router as learning_router
from content.api import router as content_router
api = NinjaAPI(title="Learnable AI")

api.add_router("/learning", learning_router, tags=["Learning"])
api.add_router("/content", content_router, tags=["Content"])

