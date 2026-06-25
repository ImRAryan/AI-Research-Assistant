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

    # 1. Normalize unicode characters (fixes weird quotes, accents, etc.)
    text = unicodedata.normalize("NFKD", text)

    # 2. Remove page number patterns like "Page 1", "Page 12"
    text = re.sub(r'Page\s+\d+', '', text, flags=re.IGNORECASE)

    # 3. Fix broken sentences — join lines that were split mid-sentence
    text = text.replace("\n", " ")

    # 4. Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)

    # 5. Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)

    # 6. Remove common boilerplate phrases
    boilerplate_phrases = [
        "All Rights Reserved",
        "Copyright ©",
    ]
    for phrase in boilerplate_phrases:
        text = text.replace(phrase, "")

    # 7. Remove excessive special characters (keep basic punctuation)
    text = re.sub(r'[^a-zA-Z0-9\s.,!?;:()\-\'"]', '', text)

    # 8. Normalize multiple spaces into one
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