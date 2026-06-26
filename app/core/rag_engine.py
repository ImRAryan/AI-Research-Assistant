from sqlalchemy.orm import Session
from groq import Groq

from app.core.retriever import retrieve_relevant_chunks
from app.core.prompt_builder import build_grounded_prompt
from app.models.document import Document
from app.core.config import settings

GROQ_MODEL = "llama-3.3-70b-versatile"

client = Groq(api_key=settings.GROQ_API_KEY)


def run_rag_pipeline(project_id: int, question: str, db: Session) -> dict:
    """
    Full RAG pipeline — searches across all documents in the project.

    Question -> Retriever (project-wide) -> Top Chunks -> Prompt Builder -> Groq -> Answer
    The LLM itself generates citations per the grounded prompt's rules — no need to append our own.
    """
    retrieved_chunks = retrieve_relevant_chunks(project_id, question, db)

    context = "\n\n".join([c["chunk_text"] for c in retrieved_chunks]) if retrieved_chunks else ""
    prompt = build_grounded_prompt(context, question)

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response.choices[0].message.content

    except Exception as e:
        print("Groq error:", e)
        answer = "Sorry, I could not generate a response. Please check the API configuration."

    return {
        "answer": answer,
        "chunks_used": retrieved_chunks,
    }