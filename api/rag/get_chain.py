from functools import lru_cache
from settings.settings import Settings
from langchain_ollama import ChatOllama
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever
from rag.get_vector_db import get_vector_db


@lru_cache()
def get_prompt():
    QUERY_PROMPT = PromptTemplate(
        input_variables=["question"],
        template="""Вы - ассистент по языковой модели искусственного интеллекта. Ваша задача - сгенерировать пять
        различных версий заданного пользователем вопроса для извлечения соответствующих документов из
        векторной базы данных. Генерируя несколько точек зрения на вопрос пользователя, вы
        цель состоит в том, чтобы помочь пользователю преодолеть некоторые ограничения, связанные с дистанционным управлением.
        поиск сходства. Укажите эти альтернативные вопросы, разделенные новыми строками.
        Первоначальный вопрос: {question}""",
    )

    template = """Ответь на вопрос основывая ТОЛЬКО на данном контексте:
    {context}
    Вопрос: {question}

    Если тебе не хватает этой информации для того чтобы ответить на вопрос, ответь: "К сожалению, я не могу ответить на данный вопрос."
    """

    prompt = ChatPromptTemplate.from_template(template)

    return QUERY_PROMPT, prompt


@lru_cache()
def get_llm():
    # Initialize the language model with the specified model name
    llm = ChatOllama(model=Settings.ollama.chat_model)
    return llm


@lru_cache()
def get_chain():
    llm = get_llm()
    # Get the vector database instance
    db = get_vector_db()
    # Get the prompt templates
    QUERY_PROMPT, prompt = get_prompt()

    # Set up the retriever to generate multiple queries using the language model and the query prompt
    retriever = MultiQueryRetriever.from_llm(
        db.as_retriever(),
        llm,
        prompt=QUERY_PROMPT
    )

    # Define the processing chain to retrieve context, generate the answer, and parse the output
    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain
