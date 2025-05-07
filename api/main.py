import json
import datetime
import asyncio
from typing import Annotated
from models.db import create_db_and_tables
from fastapi import Body, FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


class MessageCreate():
    test: str


@app.post("/chat")
async def root(body: Annotated[MessageCreate, Body(embed=True)]):
    async def event_generator():
        for i in range(10):
            await asyncio.sleep(1)
            data = json.dumps({
                "current_time": datetime.datetime.now().isoformat(),
            })
            yield f"data: {data}\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/messages")
async def get_messages():
    return None


@app.get("/auth/me")
async def users():
    return None


@app.get("/auth/vk/callback")
async def vk_callback():
    return None


@app.post("/auth/vk")
async def auth_vk():
    return None


@app.delete("/messages/history")
async def delete_messages():
    return None
