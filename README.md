# AxorynAI

### Design and Development of an Intelligent Research Assistant using Full-Stack Technologies, Retrieval-Augmented Generation (RAG) and Large Language Models (LLMs)

AxorynAI is an intelligent AI-powered research assistant designed to help researchers, students, and professionals efficiently organize, analyze, retrieve, and interact with knowledge from large collections of documents through natural language conversations.

The system combines modern full-stack technologies with Retrieval-Augmented Generation (RAG) and Large Language Models (LLMs) to provide context-aware, grounded, and citation-supported responses while minimizing hallucinations commonly observed in standalone language models.

This project was developed as part of the **Summer Internship 2026** at **National Institute of Technology Jamshedpur (NIT Jamshedpur)** under the guidance of **Dr. Dilip Kumar**.

---

## Features

### Authentication & Security

* JWT Authentication with Access and Refresh Tokens
* Secure Password Hashing
* Google OAuth 2.0 Login
* Protected API Routes
* Session Management
* Role-Based User Access
* Token Refresh Mechanism

### Workspace Management

* Create and Manage Multiple Research Workspaces
* Workspace Isolation for Independent Research Projects
* Workspace-Specific Context Management
* Persistent User Sessions

### Intelligent Document Processing

* PDF Document Upload and Processing
* DOCX Document Upload and Processing
* Automatic Text Extraction and Cleaning
* Chunking and Semantic Segmentation
* Metadata Preservation

### Retrieval-Augmented Generation (RAG)

* Semantic Vector Search
* Context Retrieval Pipeline
* Similarity-Based Document Ranking
* Citation-Aware Responses
* Multi-Document Knowledge Retrieval
* Hallucination Reduction through Grounded Context

### AI Capabilities

* Natural Language Question Answering
* Research Summarization
* Context-Aware Conversations
* Multi-Turn Dialogue Support
* Research Knowledge Exploration
* Intelligent Information Retrieval

### User Experience

* Modern Responsive Interface
* Workspace Dashboard
* Research Chat Interface
* Real-Time Interaction
* Document Management System
* Profile Management

---

## Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication
* Google OAuth

### Artificial Intelligence

* Retrieval-Augmented Generation (RAG)
* Large Language Models (LLMs)
* Grok API
* Semantic Embeddings
* Vector Similarity Search

### Infrastructure & DevOps

* Docker
* Git
* GitHub
* REST APIs

---

## System Architecture

```text
User Query
    ↓
Frontend (React + Vite)
    ↓
FastAPI Backend
    ↓
Authentication & Workspace Validation
    ↓
RAG Retrieval Pipeline
    ↓
Relevant Context Retrieval
    ↓
LLM Processing (Grok API)
    ↓
Grounded Response Generation
    ↓
Response Returned to User
```

---

## Project Structure

```text
AI-Research-Assistant/
│
├── app/
│   ├── core/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── prompts/
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   └── assets/
│   │
│   └── public/
│
├── uploads/
├── vector_store/
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/ImRAryan/AI-Research-Assistant.git
cd AI-Research-Assistant
```

### Backend Setup

```bash
python -m venv venv
source venv/bin/activate
```

For Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the backend directory.

```env
DATABASE_URL=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GROK_API_KEY=
```

---

## API Documentation

Interactive API documentation is available through Swagger UI.

Backend API:

```text
https://imraryan-research-assistant.hf.space/docs
```

Redoc Documentation:

```text
https://imraryan-research-assistant.hf.space/redoc
```

---

## Deployment

### Frontend

```text
https://ai-research-assistant-three-wine.vercel.app/
```

### Backend

```text
https://imraryan-research-assistant.hf.space
```

### API Documentation

```text
https://imraryan-research-assistant.hf.space/docs
```

---

## Screenshots

### Authentication System


> <img width="1920" height="1200" alt="Screenshot 2026-06-30 181654" src="https://github.com/user-attachments/assets/261cbf1a-641a-467b-b055-0abe1e246083" />

> <img width="1920" height="1200" alt="Screenshot 2026-06-30 181708" src="https://github.com/user-attachments/assets/003330e3-2208-4d23-9240-885f2bd6fa2a" />



### Workspace Management

> <img width="1920" height="1200" alt="Homepage" src="https://github.com/user-attachments/assets/3f6a96a7-6c1e-422a-8a8d-7ba2d9bdf3bc" />


### Research Chat Interface

> <img width="1920" height="1200" alt="Chat1" src="https://github.com/user-attachments/assets/547dd280-09ba-4fbd-abce-73c956d9dbe7" />


### Document Upload and Processing

> <img width="1920" height="1200" alt="Upload" src="https://github.com/user-attachments/assets/e98beb5a-6c40-43a3-aaf6-7c81b432fa62" />


### API Documentation

> <img width="1920" height="1200" alt="Swagger1" src="https://github.com/user-attachments/assets/6b0de324-4317-4cd3-8ee1-b9bca188a4d9" />


---

## Research Objectives

* Develop an intelligent document-centric research assistant.
* Integrate Retrieval-Augmented Generation for grounded responses.
* Reduce hallucinations in LLM-generated outputs.
* Enable efficient knowledge discovery from large document collections.
* Provide scalable and modular research infrastructure.

---

## Future Enhancements

* Streaming AI Responses
* Hybrid Retrieval Mechanisms
* Multi-Modal Document Understanding
* Support for Additional Document Formats
* Collaborative Research Workspaces
* Advanced Citation Generation
* Knowledge Graph Integration
* Local LLM Support
* Real-Time Collaboration Features

---

## Academic Information

**Project Title:**

*Design and Development of an Intelligent Research Assistant using Full-Stack Technologies, Retrieval-Augmented Generation (RAG) and Large Language Models (LLMs).*

**Institution:**

National Institute of Technology Jamshedpur (NIT Jamshedpur)

**Internship:**

Summer Internship 2026

**Academic Guide:**

Dr. Dilip Kumar

---

## Author

**GitHub:**
https://github.com/ImRAryan

---

## Acknowledgements

The author expresses sincere gratitude to **Dr. Dilip Kumar** for his guidance, mentorship, and support throughout the development of this project during the Summer Internship 2026 at **National Institute of Technology Jamshedpur (NIT Jamshedpur)**.

---

## Star the Repository

If you find this project useful, consider giving the repository a star.
