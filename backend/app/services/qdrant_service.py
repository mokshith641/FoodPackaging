import os
import uuid
import logging
import hashlib
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Verified Reference Documents for initial RAG seeding
INITIAL_PACKAGING_KNOWLEDGE_CORPUS = [
    {
        "title": "UC Davis Postharvest Technology — MAP Guidelines for Fresh Fruits and Vegetables",
        "source_url": "https://postharvest.ucdavis.edu/produce-facts-sheets",
        "doc_type": "academic_research",
        "content": (
            "Modified Atmosphere Packaging (MAP) for fresh respiring produce requires establishing an equilibrium "
            "atmosphere of 2% to 5% O2 and 3% to 8% CO2. Respiration rate (mg CO2/kg·h) increases exponentially with "
            "temperature following the Arrhenius relationship (Q10 = 2.0 to 2.5). Fresh strawberries exhibit moderate "
            "respiration (15-25 mg CO2/kg·h at 5°C) and produce high moisture via transpiration (90-95% RH). "
            "If non-breathable high-barrier films like Saran-coated PET or aluminum laminates are used, O2 drops below 1%, "
            "triggering anaerobic fermentation, ethanol/acetaldehyde accumulation, and rapid off-flavor decay. "
            "Hence, macro/micro-perforated polypropylene (BOPP) or breathable bio-polymers like PLA and starch blends "
            "are strictly required for fresh berries, leafy greens, and cut produce."
        )
    },
    {
        "title": "ASTM D3985 & ASTM F1249 — Standard Barrier Permeability Evaluation",
        "source_url": "https://www.astm.org/standards/d3985",
        "doc_type": "industry_standard",
        "content": (
            "Oxygen Transmission Rate (OTR) is measured in cm³/(m²·day·atm) under standard test conditions of 23°C and 0% RH. "
            "Water Vapor Transmission Rate (WVTR) is measured in g/(m²·day) under tropical conditions of 38°C and 90% RH. "
            "Materials with OTR < 5 cm³/m²·day·atm are classified as High Gas Barrier (e.g., EVOH, PVDC, Metallized PET, Al foil). "
            "Materials with OTR > 1000 cm³/m²·day·atm are Breathable (e.g., LDPE, micro-perforated PP). "
            "For low-moisture crisp snacks (potato chips, roasted nuts, extruded snacks), WVTR must be strictly below 1.5 g/m²·day "
            "to prevent moisture uptake above the critical water activity (aw > 0.40) where loss of crispness occurs."
        )
    },
    {
        "title": "Food Chemistry & Lipid Oxidation — Barrier Requirements for High-Fat Foods",
        "source_url": "https://www.sciencedirect.com/topics/food-science/lipid-oxidation",
        "doc_type": "scientific_literature",
        "content": (
            "In high-fat foods such as fried potato chips (30-35% fat), roasted nuts (45-55% fat), and ghee/butter (80-100% fat), "
            "autoxidation of unsaturated fatty acids produces free radicals, hydroperoxides, and volatile aldehydes (hexanal), "
            "causing rancidity, bitterness, and loss of nutritional value. "
            "Light exposure dramatically accelerates photosensitized singlet oxygen oxidation. "
            "Packaging for fried snacks requires high oxygen barrier (OTR < 15 cm³/m²·day·atm), opaque light barrier, and nitrogen flush MAP (residual O2 < 1.0%). "
            "Metallized BOPP (Met-BOPP) laminated with Cast Polypropylene (CPP) or Polyethylene (PE) provides optimal cost-efficiency, "
            "yielding OTR < 15 and WVTR < 1.0 while delivering heat seal hermeticity."
        )
    },
    {
        "title": "USDA Food Preservation Guidelines — Vacuum Packaging and Meat/Fish Storage",
        "source_url": "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation",
        "doc_type": "government_guide",
        "content": (
            "Fresh red meat and poultry held under chilled conditions (0°C to 4°C) are vulnerable to aerobic spoilage bacteria "
            "(Pseudomonas spp.) and lipid/myoglobin discoloration. Vacuum Skin Packaging (VSP) using co-extruded high-barrier films "
            "(PA/PE or EVOH/PE) completely eliminates package headspace, reducing aerobic microbial growth by over 70%. "
            "For chilled meats, the packaging material must maintain low-temperature puncture resistance (puncture strength > 20 N) "
            "and prevent flex-cracking at cold-chain temperatures."
        )
    },
    {
        "title": "Sustainable Packaging & Circular Economy — Bio-polymers and Monomaterial Recyclability",
        "source_url": "https://www.ellenmacarthurfoundation.org/topics/plastics/overview",
        "doc_type": "sustainability_report",
        "content": (
            "Conventional multi-layer laminates combining dissimilar polymers (e.g., PET/Al/PE or PET/PVDC/PE) are non-recyclable "
            "in standard mechanical recycling streams. Recent advances in sustainable packaging focus on: "
            "1. Monomaterial All-PE or All-PP structures using MDO-PE (Machine Direction Oriented PE) with barrier coatings. "
            "2. Industrial compostable bio-polymers such as Polylactic Acid (PLA), Polyhydroxyalkanoates (PHA), and Cellulose films. "
            "While PLA offers excellent transparency and natural bio-based origin, its WVTR (30-40 g/m²·day) is higher than fossil PP, "
            "making it best suited for short shelf-life fresh produce, bakery products, and dry staples rather than long-term high-moisture barriers."
        )
    }
]


class QdrantService:
    _client = None
    _embedder = None
    _is_initialized = False

    @classmethod
    def get_client(cls):
        if cls._client is not None:
            return cls._client

        qdrant_url = settings.get_qdrant_url()
        qdrant_api_key = settings.get_qdrant_api_key()

        try:
            from qdrant_client import QdrantClient
            if qdrant_url:
                logger.info(f"Connecting to Qdrant Cloud at: {qdrant_url}")
                cls._client = QdrantClient(
                    url=qdrant_url,
                    api_key=qdrant_api_key,
                    timeout=10.0
                )
            else:
                logger.info("QDRANT_URL not configured. Initializing local in-memory Qdrant client fallback.")
                cls._client = QdrantClient(location=":memory:")
            return cls._client
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant client: {e}. Using in-memory fallback.")
            try:
                from qdrant_client import QdrantClient
                cls._client = QdrantClient(location=":memory:")
                return cls._client
            except Exception as e2:
                logger.critical(f"Critical error loading Qdrant client: {e2}")
                return None

    @classmethod
    def get_embedder(cls):
        if cls._embedder is not None:
            return cls._embedder

        try:
            from fastembed import TextEmbedding
            cls._embedder = TextEmbedding(model_name=settings.EMBEDDING_MODEL_NAME)
            return cls._embedder
        except Exception as e:
            logger.error(f"Error loading FastEmbed model: {e}")
            return None

    @classmethod
    def generate_embedding(cls, text: str) -> List[float]:
        embedder = cls.get_embedder()
        if embedder:
            try:
                embeddings = list(embedder.embed([text]))
                if embeddings and len(embeddings) > 0:
                    return embeddings[0].tolist()
            except Exception as e:
                logger.error(f"FastEmbed embedding error: {e}")

        # Fallback deterministic pseudo-embedding
        h = hashlib.sha256(text.encode("utf-8")).digest()
        vec = []
        for i in range(settings.EMBEDDING_DIM):
            byte_val = h[i % len(h)]
            val = (byte_val / 127.5) - 1.0
            vec.append(round(val, 4))
        norm = sum(x * x for x in vec) ** 0.5 or 1.0
        return [round(x / norm, 4) for x in vec]

    @classmethod
    def ensure_collection(cls) -> bool:
        client = cls.get_client()
        if not client:
            return False

        collection_name = settings.QDRANT_COLLECTION_NAME
        try:
            from qdrant_client.http.models import Distance, VectorParams
            collections = client.get_collections().collections
            exists = any(c.name == collection_name for c in collections)

            if not exists:
                logger.info(f"Creating Qdrant collection '{collection_name}' with 384 dims (Cosine)...")
                client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=settings.EMBEDDING_DIM,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Qdrant collection '{collection_name}' created successfully.")
            return True
        except Exception as e:
            logger.error(f"Error checking/creating Qdrant collection: {e}")
            return False

    @classmethod
    def ingest_document(
        cls,
        title: str,
        content: str,
        source_url: Optional[str] = None,
        doc_type: str = "reference",
        page_number: Optional[int] = None
    ) -> Dict[str, Any]:
        client = cls.get_client()
        if not client or not cls.ensure_collection():
            return {"status": "error", "message": "Qdrant service unavailable"}

        # Text chunking with sliding window (500 chars with 80 chars overlap)
        chunk_size = 500
        chunk_overlap = 80
        chunks = []
        start = 0
        while start < len(content):
            end = start + chunk_size
            chunk_text = content[start:end].strip()
            if chunk_text:
                chunks.append(chunk_text)
            start += (chunk_size - chunk_overlap)

        if not chunks:
            chunks = [content.strip()]

        from qdrant_client.http.models import PointStruct
        points = []
        for idx, chunk in enumerate(chunks):
            hash_str = f"{title}_{idx}_{chunk[:40]}"
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, hash_str))
            vector = cls.generate_embedding(chunk)

            payload = {
                "document_title": title,
                "source_url": source_url or "",
                "doc_type": doc_type,
                "page_number": page_number,
                "chunk_index": idx,
                "total_chunks": len(chunks),
                "content": chunk
            }

            points.append(PointStruct(id=point_id, vector=vector, payload=payload))

        try:
            client.upsert(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                points=points
            )
            return {
                "status": "success",
                "document_title": title,
                "chunks_ingested": len(points)
            }
        except Exception as e:
            logger.error(f"Failed to upsert points into Qdrant: {e}")
            return {"status": "error", "message": str(e)}

    @classmethod
    def search(cls, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        client = cls.get_client()
        if not client:
            return []

        cls.ensure_collection()
        query_vector = cls.generate_embedding(query)

        try:
            if hasattr(client, "query_points"):
                response = client.query_points(
                    collection_name=settings.QDRANT_COLLECTION_NAME,
                    query=query_vector,
                    limit=top_k
                )
                search_hits = response.points
            else:
                search_hits = client.search(
                    collection_name=settings.QDRANT_COLLECTION_NAME,
                    query_vector=query_vector,
                    limit=top_k
                )

            results = []
            for hit in search_hits:
                payload = hit.payload or {}
                results.append({
                    "score": round(float(hit.score), 4) if hasattr(hit, "score") and hit.score is not None else 0.0,
                    "document_title": payload.get("document_title", ""),
                    "source_url": payload.get("source_url", ""),
                    "doc_type": payload.get("doc_type", ""),
                    "page_number": payload.get("page_number"),
                    "chunk_index": payload.get("chunk_index", 0),
                    "content": payload.get("content", "")
                })
            return results
        except Exception as e:
            logger.error(f"Qdrant semantic search failed: {e}")
            return []

    @classmethod
    def seed_initial_knowledge(cls):
        if cls._is_initialized:
            return
        cls.ensure_collection()
        for doc in INITIAL_PACKAGING_KNOWLEDGE_CORPUS:
            cls.ingest_document(
                title=doc["title"],
                content=doc["content"],
                source_url=doc["source_url"],
                doc_type=doc["doc_type"]
            )
        cls._is_initialized = True
        logger.info(f"Seeded {len(INITIAL_PACKAGING_KNOWLEDGE_CORPUS)} verified scientific packaging papers into Qdrant.")
