from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, Text

class Base(DeclarativeBase):
    pass

class Ping(Base):
    __tablename__ = "ping"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    msg: Mapped[str] = mapped_column(Text, default="pong")
