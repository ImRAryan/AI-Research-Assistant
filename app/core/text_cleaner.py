import re
import unicodedata


def clean_text(text: str) -> str:
    """
    Clean raw extracted text from PDF/DOCX files.
    Removes noise like page numbers, extra spaces, special characters,
    and normalizes unicode for better AI processing and retrieval quality.
    """
    if not text:
        return ""

    text = unicodedata.normalize("NFKD", text)

    text = re.sub(r'Page\s+\d+', '', text, flags=re.IGNORECASE)

    text = text.replace("\n", " ")

    text = re.sub(r'http\S+|www\.\S+', '', text)

    text = re.sub(r'\S+@\S+', '', text)

    boilerplate_phrases = [
        "All Rights Reserved",
        "Copyright ©",
    ]
    for phrase in boilerplate_phrases:
        text = text.replace(phrase, "")

    text = re.sub(r'[^a-zA-Z0-9\s.,!?;:()\-\'"]', '', text)

    text = re.sub(r'\s+', ' ', text)

    return text.strip()


def remove_repeated_lines(text: str, min_repeats: int = 3) -> str:
    """
    Detects and removes lines that repeat too often across the document —
    usually headers/footers like 'XYZ University Research Report' on every page.
    """
    from collections import Counter

    lines = text.split('\n')
    line_counts = Counter(line.strip() for line in lines if line.strip())

    repeated_lines = {line for line, count in line_counts.items() if count >= min_repeats}

    cleaned_lines = [line for line in lines if line.strip() not in repeated_lines]
    return '\n'.join(cleaned_lines)