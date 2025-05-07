from sqlmodel import Field, SQLModel


class MessageBase(SQLModel):
    content: str
    role: str


class Message(MessageBase, table=True):
    id: int = Field(primary_key=True)
    chat_id: int = Field(foreign_key="chat.id")


class MessagePublic(MessageBase):
    id: int
