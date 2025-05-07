from sqlmodel import Field, SQLModel


class Chat(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id")
