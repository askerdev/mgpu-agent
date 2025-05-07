import json
from rag.prepare_db import prepare_db
from rag.get_chain import get_chain
from typing import Annotated
from models.db import create_db_and_tables
from fastapi import Body, FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    prepare_db()


@app.post("/chat")
async def root(message: Annotated[str, Body(embed=True)]):
    chain = get_chain()

    async def event_generator():
        async for chunk in chain.astream(message):
            event = "event: chunk"
            data = f"data: {json.dumps({"content": chunk, "role": "bot"})}"
            yield f"{event}\n{data}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream;charset=utf-8")


@app.get("/messages")
async def get_messages():
    return {
        "messages": []
    }


@app.get("/auth/me")
async def me():
    return {
        "user": {
            "avatar": "https://sun1-84.userapi.com/s/v1/ig2/1sPAuSJ4MWU_-…,160x160,240x240,360x360,480x480&ava=1&cs=200x200",
            "email": "a7kerkh@yandex.ru",
            "first_name": "Asker",
            "last_name": "Khuzhokov",
        }
    }


@app.get("/oauth/vk/callback")
async def vk_callback():
    return None


@app.post("/auth/vk")
async def auth_vk():
    return None


@app.delete("/messages/history")
async def delete_messages():
    return None
