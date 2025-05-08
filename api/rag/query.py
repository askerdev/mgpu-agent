from functools import lru_cache
from langchain.prompts import ChatPromptTemplate
from rag.get_vector_db import get_vector_db
from langchain_ollama.chat_models import ChatOllama

QUERY_PROMPT_TEMPLATE = """
Ответь на вопрос основываясь ТОЛЬКО на данном контексе и только на русском языке:

{context}

---

Ответь на вопрос основываясь ТОЛЬКО на данном выше контексте: {question}
"""


@lru_cache()
def get_model():
    model = ChatOllama(model="gemma3:1b")
    return model


def query_rag(query_text: str):
    db = get_vector_db()

    results = db.similarity_search_with_score(query_text, k=5)

    context_text = "\n\n---\n\n".join(
        [doc.page_content for doc, _score in results])

    prompt_template = ChatPromptTemplate.from_template(QUERY_PROMPT_TEMPLATE)

    prompt = prompt_template.format(context=context_text, question=query_text)

    sources = [doc.metadata.get("id", None) for doc, _score in results]

    model = get_model()

    return model.astream(prompt), sources
