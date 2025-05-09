from functools import lru_cache
from settings.settings import Settings
from rag.get_embedding_function import get_embedding_function
from langchain_chroma.vectorstores import Chroma


@lru_cache()
def get_vector_db():
    db = Chroma(
        persist_directory=Settings.chroma.path,
        embedding_function=get_embedding_function(),
    )

    return db
