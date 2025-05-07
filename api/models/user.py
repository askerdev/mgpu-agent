from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    first_name: str
    last_name: str
    avatar: str
    email: str


class User(UserBase, table=True):
    id: int = Field(primary_key=True)
    vk_id: int = Field(unique=True)


class UserPublic(UserBase):
    id: int
