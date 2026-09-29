#!/usr/bin/env python
"""
PackSci AI — Scientific Reference Document Ingestion Script
Usage:
    python ingest_docs.py --file path/to/paper.txt --title "Study Title" --source "https://..." --type "academic_research"
    python ingest_docs.py --seed-defaults
"""
import sys
import argparse
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services.qdrant_service import QdrantService, INITIAL_PACKAGING_KNOWLEDGE_CORPUS


def main():
    parser = argparse.ArgumentParser(description="Ingest packaging reference documents into Qdrant Vector DB")
    parser.add_argument("--file", type=str, help="Path to text document to ingest")
    parser.add_argument("--title", type=str, help="Document title")
    parser.add_argument("--source", type=str, default="", help="Source URL or DOI citation")
    parser.add_argument("--type", type=str, default="technical_reference", help="Document type")
    parser.add_argument("--page", type=int, default=None, help="Page number if applicable")
    parser.add_argument("--seed-defaults", action="store_true", help="Seed default verified knowledge corpus")

    args = parser.parse_args()

    if args.seed_defaults:
        print("🌱 Seeding default verified food packaging research corpus...")
        QdrantService.seed_initial_knowledge()
        print(f"✅ Successfully seeded {len(INITIAL_PACKAGING_KNOWLEDGE_CORPUS)} reference papers into Qdrant.")
        return

    if args.file and args.title:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"❌ Error: File '{file_path}' does not exist.")
            sys.exit(1)

        content = file_path.read_text(encoding="utf-8")
        print(f"📄 Ingesting '{args.title}' ({len(content)} characters)...")
        res = QdrantService.ingest_document(
            title=args.title,
            content=content,
            source_url=args.source,
            doc_type=args.type,
            page_number=args.page
        )
        print(f"✅ Ingestion Result: {res}")
    else:
        print("💡 Use --seed-defaults to index standard packaging corpus or provide --file and --title.")
        parser.print_help()


if __name__ == "__main__":
    main()
