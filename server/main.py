from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import os
import time
from rag_service import rag_service

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://localhost:80",
    "http://127.0.0.1",
    "http://127.0.0.1:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    subject: str | None = None

class ChatResponse(BaseModel):
    response: str
    sentiment: str = "neutral"

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Tomi Chatbot API is running"}

@app.on_event("startup")
async def startup_event():
    # Ingest PDFs on startup
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    rag_service.ingest_pdfs(data_dir)

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # Simulate processing delay related to AI
    # time.sleep(1) # Removed artificial delay as RAG takes time
    
    user_msg = request.message
    subject = request.subject
    
    # Use RAG Service to get answer
    response_text = rag_service.get_answer(user_msg)

    return ChatResponse(response=response_text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
