from fastapi import APIRouter
from ..schemas import EmailIn, ScanOut
from ..pipeline.classify import classify_email

router = APIRouter()


@router.post("", response_model=ScanOut)
def scan(payload: EmailIn) -> ScanOut:
    return classify_email(payload.model_dump())


