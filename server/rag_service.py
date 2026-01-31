import os
import time
import gc
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.chat_models import ChatOllama
# Add back Google imports for Hybrid support
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.docstore.document import Document
from langchain.prompts import PromptTemplate # Fixed: Added missing import
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RAGService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        # Determine Provider
        self.provider = os.getenv("AI_PROVIDER", "ollama").lower()
        print(f"-------- RAG SERVICE INITIALIZING --------")
        print(f"Active Provider: {self.provider.upper()}")
        
        self.vector_store = None
        self.qa_chain = None

        if self.provider == "gemini":
            # --- GOOGLE GEMINI CONFIGURATION ---
            self.api_key = os.getenv("GOOGLE_API_KEY")
            if not self.api_key:
                print("CRITICAL WARNING: GOOGLE_API_KEY not found. Gemini will fail.")
            
            # Using original Gemini settings
            self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=self.api_key)
            self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=self.api_key, temperature=0.3)
            # Separate index path to avoid compatibility crash
            self.index_path = "faiss_index_gemini"
            
        else:
            # --- OLLAMA LOCAL CONFIGURATION (Default) ---
            self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
            print(f"Connecting to Ollama at {self.ollama_base_url}")
            
            self.embedding_model = "nomic-embed-text" 
            self.llm_model = "llama3.2:1b"

            self.embeddings = OllamaEmbeddings(
                base_url=self.ollama_base_url,
                model=self.embedding_model
            )
            
            self.llm = ChatOllama(
                base_url=self.ollama_base_url,
                model=self.llm_model,
                temperature=0.3
            )
            # Separate index path for Ollama
            self.index_path = "faiss_index_ollama"
            
        print(f"Vector Store Path: {self.index_path}")
        print(f"------------------------------------------")

    def ingest_pdfs(self, directory_path: str):
        """Loads all PDFs from the directory and creates a vector store incrementally."""
        print(f"Checking for existing vector store at {self.index_path}...")
        if os.path.exists(self.index_path):
            try:
                self.vector_store = FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)
                print("Loaded existing vector store from disk.")
            except Exception as e:
                print(f"Error loading existing index: {e}. Starting fresh.")
                self.vector_store = None
        else:
             print("No existing vector store found. Starting fresh.")
             self.vector_store = None

        if not os.path.exists(directory_path):
             print(f"Directory {directory_path} does not exist.")
             self._setup_qa_chain()
             return

        # Load processed files tracking - Save in DATA directory so it persists!
        # Use separate checklist per provider so we don't mix them up
        processed_files_path = os.path.join(directory_path, f"processed_files_{self.provider}.txt")
        processed_files = set()
        if os.path.exists(processed_files_path):
            with open(processed_files_path, 'r') as f:
                processed_files = set(f.read().splitlines())
            print(f"Found {len(processed_files)} previously processed files.")

        files = [f for f in os.listdir(directory_path) if f.endswith(".pdf")]
        total_files = len(files)
        print(f"Found {total_files} PDF files to process in total.")

        for index, filename in enumerate(files):
            if filename in processed_files:
                print(f"Skipping {filename} (already processed).")
                continue

            file_path = os.path.join(directory_path, filename)
            print(f"Processing file {index + 1}/{total_files}: {filename}...")
            
            # Retry loop for this specific file
            max_retries = 3
            success = False
            
            for attempt in range(max_retries):
                try:
                    loader = PyPDFLoader(file_path)
                    docs = loader.load_and_split()
                    
                    if not docs:
                        print(f"Warning: No text found in {filename}")
                        success = True # Treat as success to skip next time
                        break

                    # Add to Vector Store
                    if self.vector_store is None:
                        self.vector_store = FAISS.from_documents(docs, self.embeddings)
                    else:
                        self.vector_store.add_documents(docs)
                    
                    # Save progress immediately
                    self.vector_store.save_local(self.index_path)
                    
                    # Mark as processed
                    with open(processed_files_path, 'a') as f:
                        f.write(filename + "\n")
                    
                    print(f"Successfully embedded and saved {filename}.")
                    success = True
                    
                    # Cleanup
                    del docs
                    del loader
                    gc.collect()
                    
                    # Friendly pause to avoid rate limits
                    time.sleep(10)
                    break 

                except Exception as e:
                    error_str = str(e)
                    print(f"Error processing {filename} (Attempt {attempt+1}): {error_str}")
                    
                    # Check for Rate Limit (429)
                    if "429" in error_str or "ResourceExhausted" in error_str:
                        wait_time = 70 # Wait slightly longer than the requested 60s
                        print(f"Rate limit hit. Sleeping for {wait_time} seconds before retrying...")
                        time.sleep(wait_time)
                    else:
                        # General error, wait short time
                        time.sleep(5)
            
            if not success:
               print(f"Failed to process {filename} after all retries. Skipping for now.")

        # Final setup logic
        if self.vector_store is None:
             print("Vectors store is empty after processing. Creating dummy store to prevent crash.")
             self.vector_store = FAISS.from_documents([Document(page_content="No context available.", metadata={"source": "none"})], self.embeddings)
        
        self._setup_qa_chain()

    def _setup_qa_chain(self):
        # Custom Prompt Template
        template = """Sos un experto Asistente Pedagógico especializado en el uso de Pantallas Táctiles Interactivas en el aula. 
        Tu misión es ayudar a los docentes a integrar esta tecnología en sus clases.
        
        Usa el siguiente contexto para responder la pregunta. Si la respuesta no está en el contexto, usa tu conocimiento general 
        sobre pedagogía y tecnología educativa para dar una respuesta útil y motivadora. SIEMPRE respondé en español.

        Contexto: {context}

        Pregunta: {question}

        Respuesta:"""
        QA_CHAIN_PROMPT = PromptTemplate.from_template(template)

        if self.vector_store:
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(),
                chain_type_kwargs={"prompt": QA_CHAIN_PROMPT}
            )
            print("PDF Ingestion Complete. Vector Store Ready.")
        else:
            print("Vector Store not available. QA Chain skipped.")

    def get_answer(self, query: str) -> str:
        """Retrieves answer from RAG chain."""
        if not self.qa_chain:
            return "I am not initialized with any documents yet. Please add PDF files to the data folder."
        
        try:
            result = self.qa_chain.invoke({"query": query})
            return result["result"]
        except Exception as e:
            return f"Error generating answer: {str(e)}"

# Singleton usage
rag_service = RAGService()
