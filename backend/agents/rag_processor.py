from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Optional
import os
import io
from pypdf import PdfReader

class RagProcessor:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        # In-memory storage for session-based vector stores and raw docs
        self.sessions = {}
        self.session_docs = {} # session_id -> List[Document]

    def _rebuild_index(self, session_id: str):
        """Rebuild the FAISS index from the current list of session documents."""
        docs = self.session_docs.get(session_id, [])
        if not docs:
            if session_id in self.sessions:
                del self.sessions[session_id]
            return
        
        self.sessions[session_id] = FAISS.from_documents(docs, self.embeddings)

    def process_text(self, text: str, session_id: str) -> str:
        """Process raw text and update the persistent session document list."""
        chunks = self.text_splitter.split_text(text)
        new_docs = [Document(page_content=chunk, metadata={"source": "manual_input"}) for chunk in chunks]
        
        if session_id not in self.session_docs:
            self.session_docs[session_id] = []
        
        # Replace existing manual input
        self.session_docs[session_id] = [d for d in self.session_docs[session_id] if d.metadata.get("source") != "manual_input"]
        self.session_docs[session_id].extend(new_docs)
        
        self._rebuild_index(session_id)
        return f"Processed {len(chunks)} chunks of manual text."

    def process_file(self, file_content: bytes, filename: str, session_id: str) -> str:
        """Process a file and update the session's document pool."""
        text = ""
        if filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        else:
            text = file_content.decode("utf-8", errors="ignore")

        if not text.strip():
            return "No text extracted from file."

        chunks = self.text_splitter.split_text(text)
        new_docs = [Document(page_content=chunk, metadata={"source": filename}) for chunk in chunks]
        
        if session_id not in self.session_docs:
            self.session_docs[session_id] = []
            
        # Overwrite if file already exists
        self.session_docs[session_id] = [d for d in self.session_docs[session_id] if d.metadata.get("source") != filename]
        self.session_docs[session_id].extend(new_docs)
        
        self._rebuild_index(session_id)
        return f"Added {len(chunks)} chunks from {filename}."

    def delete_document(self, session_id: str, filename: str) -> bool:
        """Remove a document and its chunks from the session."""
        if session_id not in self.session_docs:
            return False
            
        original_count = len(self.session_docs[session_id])
        self.session_docs[session_id] = [d for d in self.session_docs[session_id] if d.metadata.get("source") != filename]
        
        if len(self.session_docs[session_id]) < original_count:
            self._rebuild_index(session_id)
            return True
        return False

    def get_session_filenames(self, session_id: str) -> List[str]:
        """Return unique filenames associated with a session."""
        docs = self.session_docs.get(session_id, [])
        return list(set(d.metadata.get("source") for d in docs))

    def get_document_content(self, session_id: str, filename: str) -> str:
        """Retrieve the full text of a document for viewing."""
        docs = self.session_docs.get(session_id, [])
        content = "\n".join([d.page_content for d in docs if d.metadata.get("source") == filename])
        return content

    def get_context(self, query: str, session_id: str, k: int = 3) -> str:
        """Query the session-specific FAISS index."""
        vectorstore = self.sessions.get(session_id)
        if not vectorstore:
            return ""
        
        docs = vectorstore.similarity_search(query, k=k)
        return "\n".join([doc.page_content for doc in docs])

# Global processor instance
rag_processor = RagProcessor()
