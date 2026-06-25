from sqlalchemy.orm import Session
import ollama

from app.core.retriever import retrieve_relevant_chunks
from app.core.prompt_builder import build_grounded_prompt
from app.models.document import Document

OLLAMA_MODEL = "llama3.2"

NOT_FOUND_PHRASES = [
    "information not found",
    "out of scope",
    "not available in the document",
    "cannot find this information",
    "no information",
]


def run_rag_pipeline(project_id: int, question: str, db: Session) -> dict:
    """
    Full RAG pipeline — searches across all documents in the project.

    Question -> Retriever (project-wide) -> Top Chunks -> Prompt Builder -> Local LLM -> Answer + Citations
    """
    retrieved_chunks = retrieve_relevant_chunks(project_id, question, db)

    if not retrieved_chunks:
        return {
            "answer": "Information not found in uploaded documents.",
            "chunks_used": [],
            "citations": [],
        }

    context = "\n\n".join([c["chunk_text"] for c in retrieved_chunks])
    prompt = build_grounded_prompt(context, question)

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response["message"]["content"]

    except Exception as e:
        print("Ollama error:", e)
        answer = "Sorry, I could not generate a response. Make sure Ollama is running."

    # ✅ Check if the model actually said it couldn't find an answer
    answer_lower = answer.lower()
    answer_was_grounded = not any(phrase in answer_lower for phrase in NOT_FOUND_PHRASES)

    citations = []
    if answer_was_grounded:
        seen = set()
        for c in retrieved_chunks:
            doc = db.query(Document).filter(Document.id == c["document_id"]).first()
            doc_name = doc.original_name if doc else "Unknown document"
            page = c.get("page_number")
            key = (doc_name, page)
            if key not in seen:
                seen.add(key)
                citations.append({
                    "document": doc_name,
                    "page": page,
                    "chunk_id": c["chunk_id"],
                })

    if citations:
        sources_text = "\n\n**Sources:**\n" + "\n".join(
            [f"- {c['document']}" + (f" (Page {c['page']})" if c['page'] else "") for c in citations]
        )
        answer_with_citations = answer + sources_text
    else:
        answer_with_citations = answer

    return {
        "answer": answer_with_citations,
        "chunks_used": retrieved_chunks,
        "citations": citations,
    }