from typing import Annotated
from settings.settings import Settings
from fastapi import Depends
from sqlmodel import SQLModel, Session, create_engine


connect_args = {"check_same_thread": False}
engine = create_engine(Settings.db_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
