from rag.prepare_db import prepare_db
from rag.get_chain import get_chain
from typing import Annotated
from models.db import create_db_and_tables
from fastapi import Body, FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    prepare_db()


@app.post("/chat")
async def root(message: Annotated[str, Body(embed=True)]):
    chain = get_chain()

    async def event_generator():
        async for chunk in chain.astream(message):
            yield f"{chunk}"

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
