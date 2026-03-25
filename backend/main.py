from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from agents.orchestrator import run_fire_agents
from models import UserInput, AdvisorRequest, AdvisorResponse
from agents.rag_kb import get_rag_context
from agents.rag_processor import rag_processor
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

app = FastAPI(title="FIRE AI Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.7)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/chat")
async def generate_plan(user_input: UserInput):
    try:
        # Run the langgraph multi-agent orchestrator
        result_state = await run_fire_agents(user_input)
        if result_state.get("errors"):
            raise HTTPException(status_code=400, detail=", ".join(result_state["errors"]))
        
        return result_state["final_output"].dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_document(session_id: str, file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = rag_processor.process_file(content, file.filename, session_id)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def list_documents(session_id: str):
    try:
        files = rag_processor.get_session_filenames(session_id)
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents/{filename}")
async def view_document(session_id: str, filename: str):
    try:
        content = rag_processor.get_document_content(session_id, filename)
        if not content:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"filename": filename, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/documents/{filename}")
async def delete_document(session_id: str, filename: str):
    try:
        success = rag_processor.delete_document(session_id, filename)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"status": "success", "message": f"Deleted {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/advisor", response_model=AdvisorResponse)
async def advisor_query(req: AdvisorRequest):
    try:
        # 1. Determine Context
        session_id = req.session_id or "default"
        
        if req.mode == "rag":
            # 1a. Check if we have dynamic text input
            if req.kb_content and req.kb_content.strip():
                rag_processor.process_text(req.kb_content, session_id)
            
            # 1b. Get context from FAISS (includes uploaded files and text)
            context = rag_processor.get_context(req.query, session_id)
            
            # 1c. Fallback to default RAG if session context is empty
            if not context.strip():
                context = get_rag_context(req.query)
                
            system_role = "STRICT RAG ADVISOR"
            constraint = "CRITICAL: ONLY use the provided context to answer. If the answer is not in the context, say 'Information not available in current knowledge base.' DO NOT use external knowledge."
        else:
            context = get_rag_context(req.query) # Internal KB
            system_role = "WEB-INFORMED FINANCIAL AI"
            constraint = "Use the provided context AND your own up-to-date knowledge to provide the most accurate answer."

        # 2. Build Prompt
        prompt = f"""
        System: You are {system_role}.
        Constraint: {constraint}
        
        Style Guide:
        - Give a CONCISE and SHORT answer (maximum 2-3 sentences).
        - Use PROFESSIONAL MARKDOWN formatting.
        - Use **bold** for key financial terms.
        - Keep the tone expert yet accessible.
        - If tables or lists are used, keep them extremely brief.
        
        Context Data:
        {context}
        
        User Query: {req.query}
        
        Always include a disclaimer that you are an AI and not a licensed SEBI RIA.
        """
        
        # 3. Get Response
        response = llm.invoke(prompt)
        
        # Extract plain text content
        answer_text = response.content
        if isinstance(answer_text, list):
            answer_text = "".join(
                part.get("text", "") if isinstance(part, dict) else str(part) 
                for part in answer_text
            )
        
        return AdvisorResponse(
            answer=str(answer_text).strip(),
            sources=[f"Mode: {req.mode}", "FAISS Index" if context else "General Knowledge"]
        )
    except Exception as e:
        import traceback
        print(f"Advisor Query Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history():
    # Placeholder for database history retrieval
    return {"history": []}
