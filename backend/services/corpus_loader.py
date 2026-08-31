"""
Corpus Loader
Loads synthetic anomaly case studies and NASA anomaly summaries into LangChain Documents.
"""
from __future__ import annotations

import json
import logging
import os
from typing import List

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def load_anomaly_corpus() -> List:
    """Load all corpus documents and return as LangChain Document objects."""
    try:
        from langchain_core.documents import Document
    except ImportError:
        from langchain.schema import Document  # type: ignore[no-redef]

    documents: List[Document] = []

    # --- Synthetic anomaly case studies ---
    cases_path = os.path.join(DATA_DIR, "synthetic_anomaly_cases.json")
    if os.path.exists(cases_path):
        with open(cases_path, "r", encoding="utf-8") as f:
            cases = json.load(f)
        for case in cases:
            text = (
                f"Title: {case.get('title', '')}\n"
                f"Spacecraft: {case.get('spacecraft', '')}\n"
                f"Year: {case.get('year', '')}\n"
                f"Anomaly Type: {case.get('anomaly_type', '')}\n"
                f"Affected Channels: {', '.join(case.get('affected_channels', []))}\n"
                f"Root Cause: {case.get('root_cause', '')}\n"
                f"Resolution: {case.get('resolution', '')}\n"
                f"Lessons Learned: {case.get('lessons_learned', '')}\n"
                f"Outcome: {case.get('outcome', '')}"
            )
            doc = Document(
                page_content=text,
                metadata={
                    "source": "synthetic_case_studies",
                    "title": case.get("title", ""),
                    "spacecraft": case.get("spacecraft", ""),
                    "anomaly_type": case.get("anomaly_type", ""),
                    "severity": case.get("severity", "WARNING"),
                    "year": str(case.get("year", "")),
                },
            )
            documents.append(doc)
        logger.info("Loaded %d synthetic anomaly case studies", len(cases))
    else:
        logger.warning("synthetic_anomaly_cases.json not found at %s", cases_path)

    # --- NASA anomaly summaries ---
    nasa_path = os.path.join(DATA_DIR, "nasa_anomaly_summaries.txt")
    if os.path.exists(nasa_path):
        with open(nasa_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Split on double-newline blocks
        blocks = [b.strip() for b in content.split("\n\n---\n\n") if b.strip()]
        for i, block in enumerate(blocks):
            # Extract title from first line if it starts with "##"
            lines = block.split("\n")
            title = lines[0].lstrip("#").strip() if lines[0].startswith("#") else f"NASA Incident {i+1}"
            doc = Document(
                page_content=block,
                metadata={
                    "source": "nasa_anomaly_corpus",
                    "title": title,
                    "spacecraft": "various",
                    "anomaly_type": "mixed",
                    "severity": "WARNING",
                },
            )
            documents.append(doc)
        logger.info("Loaded %d NASA anomaly summary blocks", len(blocks))
    else:
        logger.warning("nasa_anomaly_summaries.txt not found at %s", nasa_path)

    logger.info("Total corpus documents: %d", len(documents))
    return documents
