def build_grounded_prompt(context: str, question: str) -> str:
    """
    Builds a strict grounded prompt that forces the LLM to answer
    ONLY from the supplied context, refusing to use outside knowledge.

    Per Track 2.8 spec.
    """
    prompt = f"""
        You are a helpful assistant specialized in question answering over documents.

        Rules:
        - Use only the provided document context to answer questions.
        - Never use prior knowledge or fabricate information.
        - If no document context is provided, reply exactly:

        First Upload Document!!!

        - If the answer is not present in the document, reply exactly:

        The Question is out of scope from the documents provided!!!

        Relevant questions you can ask based on the document:
        - <relevant question 1>
        - <relevant question 2>
        - <relevant question 3>

        - Refer to the context as "the document".
        - When answering, be accurate, concise, and cite only information found in the document.
        - If the document contains partial information, answer only with the available details and do not infer missing information.

Context:
{context}

Question:
{question}"""

    return prompt