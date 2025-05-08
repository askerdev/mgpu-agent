import json
from settings.settings import Settings
from rag.query import query_rag
from typing import Annotated
from models.db import create_db_and_tables, SessionDep, Session, engine
from oauth.vk import get_user_info
from models.user import User
from models.chat import Chat
from models.message import Message
from fastapi import Body, FastAPI, Header, Depends
from fastapi.responses import StreamingResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_login import LoginManager
from sqlmodel import select, delete

app = FastAPI()

origins = [
    "https://khuzhokov.ru",
    "https://dev.khuzhokov.ru",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = LoginManager(Settings.auth.secret, "/auth/vk",
                       use_cookie=True, use_header=False)
UserDep = Annotated[User, Depends(manager)]


@manager.user_loader()
def query_user(vk_id: str):
    with Session(engine) as session:
        statement = select(User).where(User.vk_id == int(vk_id))
        result = session.exec(statement).first()
        return result
    return None


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.post("/chat")
async def root(user: UserDep, session: SessionDep, message: Annotated[str, Body(embed=True)]):
    statement = select(Chat).where(Chat.user_id == user.id)
    chat = session.exec(statement).first()

    async def event_generator():
        answer = ""
        query, sources = query_rag(message)
        async for chunk in query:
            answer += chunk.content
            event = "event: chunk"
            data = f"data: {json.dumps(
                {"content": chunk.content, "role": "assistant"})}"
            yield f"{event}\n{data}\n\n"
        answer += f"\n\nИсточники: {sources}"
        db_msg = Message(content=message, role="user", chat_id=chat.id)
        session.add(db_msg)
        session.commit()
        session.refresh(db_msg)
        db_msg = Message(content=answer, role="assistant", chat_id=chat.id)
        session.add(db_msg)
        session.commit()
        session.refresh(db_msg)

    return StreamingResponse(event_generator(),
                             media_type="text/event-stream;charset=utf-8")


@app.get("/messages")
async def get_messages(session: SessionDep, user: UserDep):
    statement = select(Chat).where(Chat.user_id == user.id)
    chat = session.exec(statement).first()

    if chat is None:
        db_chat = Chat(user_id=user.id)
        session.add(db_chat)
        session.commit()
        session.refresh(db_chat)
        chat = db_chat

    statement = select(Message).where(Message.chat_id == chat.id)
    messages = session.exec(statement).all()

    return {
        "messages": messages
    }


@app.get("/auth/me")
async def me(user: UserDep):
    return {"user": user}


@app.get("/oauth/vk/callback")
async def vk_callback():
    return RedirectResponse("https://khuzhokov.ru")


@app.post("/auth/vk")
async def auth_vk(session: SessionDep,
                  Authorization: Annotated[str, Header()]):
    token = Authorization[7:]
    info = get_user_info(token)

    vk_id = int(info["user"]["user_id"])

    statement = select(User).where(User.vk_id == vk_id)
    result = session.exec(statement).first()

    if result is None:
        user = User(
            email=info["user"]["user_id"],
            vk_id=vk_id,
            first_name=info["user"]["first_name"],
            last_name=info["user"]["last_name"],
            avatar=info["user"]["avatar"],
        )
        db_user = User.model_validate(user)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

    access_token = manager.create_access_token(
        data=dict(sub=info["user"]["user_id"]),
    )
    resp = JSONResponse(info)
    manager.set_cookie(resp, access_token)
    return resp


@app.delete("/messages/history")
async def delete_messages(session: SessionDep, user: UserDep):
    statement = select(Chat).where(Chat.user_id == user.id)
    chat = session.exec(statement).first()

    if chat is None:
        return {"success": False}

    statement = delete(Message).where(Message.chat_id == chat.id)
    session.exec(statement)
    session.commit()

    return {"succes": True}
