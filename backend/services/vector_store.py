"""
Vector Store Service
ChromaDB-backed vector store with IBM Granite Embeddings.
"""
from __future__ import annotations

import logging
import os
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

WATSONX_API_KEY = os.getenv("WATSONX_API_KEY", "")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
GRANITE_EMBEDDING_MODEL = os.getenv("GRANITE_EMBEDDING_MODEL", "ibm/granite-embedding-30m-english")

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
COLLECTION_NAME = "anomaly_knowledge_base"

_chroma_client = None
_vectorstore = None


def _get_embeddings():
    if not WATSONX_API_KEY or not WATSONX_PROJECT_ID:
        logger.warning("watsonx credentials not set — using fake embeddings")
        return _FakeEmbeddings()
    try:
        from langchain_ibm import WatsonxEmbeddings
        from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames as EmbedParams

        embed_params = {
            EmbedParams.TRUNCATE_INPUT_TOKENS: 512,
            EmbedParams.RETURN_OPTIONS: {"input_text": False},
        }
        return WatsonxEmbeddings(
            model_id=GRANITE_EMBEDDING_MODEL,
            url=WATSONX_URL,
            apikey=WATSONX_API_KEY,
            project_id=WATSONX_PROJECT_ID,
            params=embed_params,
        )
    except Exception as exc:
        logger.warning("WatsonxEmbeddings init failed: %s — using fake embeddings", exc)
        return _FakeEmbeddings()


class _FakeEmbeddings:
    """Zero-vector embeddings for when watsonx is unavailable (dev/offline)."""

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        import hashlib
        vecs = []
        for text in texts:
            # Deterministic pseudo-embedding from text hash
            h = int(hashlib.md5(text.encode()).hexdigest(), 16)
            vec = [(((h >> (i * 4)) & 0xF) - 7.5) / 10.0 for i in range(384)]
            vecs.append(vec)
        return vecs

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]


def build_index(documents: List) -> None:
    """Embed all corpus documents and store in ChromaDB."""
    global _chroma_client, _vectorstore

    if not documents:
        logger.warning("No documents to index — skipping vector store build")
        return

    try:
        import chromadb
        from langchain_chroma import Chroma

        embeddings = _get_embeddings()
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

        # Check if already populated
        try:
            col = _chroma_client.get_collection(COLLECTION_NAME)
            existing_count = col.count()
            if existing_count >= len(documents):
                logger.info(
                    "ChromaDB collection already has %d docs — skipping re-index", existing_count
                )
                _vectorstore = Chroma(
                    collection_name=COLLECTION_NAME,
                    embedding_function=embeddings,
                    client=_chroma_client,
                )
                return
        except Exception:
            pass  # collection doesn't exist yet

        logger.info("Building ChromaDB index for %d documents...", len(documents))
        _vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=embeddings,
            client=_chroma_client,
            collection_name=COLLECTION_NAME,
        )
        logger.info("ChromaDB index built successfully")

    except Exception as exc:
        logger.error("Vector store build failed: %s", exc)


def similarity_search(query: str, k: int = 5) -> List:
    """Return top-K relevant documents for a query."""
    if _vectorstore is None:
        logger.warning("Vector store not initialised — returning empty results")
        return []
    try:
        return _vectorstore.similarity_search(query, k=k)
    except Exception as exc:
        logger.error("Similarity search failed: %s", exc)
        return []


def get_retriever(k: int = 5):
    """Return a LangChain retriever interface."""
    if _vectorstore is None:
        return None
    return _vectorstore.as_retriever(search_kwargs={"k": k})
