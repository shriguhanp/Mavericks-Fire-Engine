from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
import os
from dotenv import load_dotenv

load_dotenv()

# We can initialize some dummy documents for FIRE rules in India
FIRE_DOCUMENTS = [
    Document(
        page_content="The 4% rule assumes a 50/50 stock and bond portfolio and safe withdrawal rate.",
        metadata={"source": "FIRE_Basics"}
    ),
    Document(
        page_content="In India, equity return expectations are usually around 10-12% while debt returns are 6-7%.",
        metadata={"source": "Indian_Context"}
    ),
    Document(
        page_content="For health insurance in India, a base cover of 10L with a super top-up of 90L is recommended for comprehensive coverage.",
        metadata={"source": "Insurance"}
    ),
]

def initialize_vector_db():
    if not os.environ.get("GOOGLE_API_KEY"):
        return None
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        vectorstore = FAISS.from_documents(FIRE_DOCUMENTS, embeddings)
        return vectorstore
    except Exception as e:
        print(f"RAG init failed: {e}")
        return None

vector_db = initialize_vector_db()

def get_rag_context(query: str) -> str:
    if not vector_db:
        return ""
    docs = vector_db.similarity_search(query, k=2)
    return "\n".join([doc.page_content for doc in docs])
