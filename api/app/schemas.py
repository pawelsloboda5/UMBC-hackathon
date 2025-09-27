from pydantic import BaseModel

class PingOut(BaseModel):
    id: int
    msg: str
