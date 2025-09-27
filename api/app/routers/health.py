from fastapi import APIRouter
from ..db import db_health

router = APIRouter()

@router.get("")
def health():
    return {"status": "ok", "db": db_health()}
