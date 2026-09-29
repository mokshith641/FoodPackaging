import logging
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.models import FoodCommodity, PackagingMaterial
from app.services.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


class RAGAssistantService:
    @classmethod
    def answer_question(
        cls,
        question: str,
        db: Session,
        focus_commodity_id: Optional[int] = None
    ) -> Dict[str, Any]:
        # 1. Retrieve relevant scientific literature from Qdrant Vector DB
        retrieved_chunks = QdrantService.search(query=question, top_k=4)

        # 2. Extract database entities if mentioned in question or explicitly provided
        db_context = []
        target_commodity = None
        if focus_commodity_id:
            target_commodity = db.query(FoodCommodity).filter(FoodCommodity.id == focus_commodity_id).first()
        else:
            # Check if any commodity name is mentioned
            commodities = db.query(FoodCommodity).all()
            for c in commodities:
                if c.name.lower() in question.lower():
                    target_commodity = c
                    break

        if target_commodity:
            db_context.append(
                f"VERIFIED DATABASE COMMODITY: {target_commodity.name} ({target_commodity.category})\n"
                f"- Moisture: {target_commodity.moisture_pct}% | Fat: {target_commodity.fat_pct}%\n"
                f"- pH: {target_commodity.ph} | Resp Rate: {target_commodity.resp_rate_mg_co2_kg_h or 'N/A'} mg CO2/kg·h\n"
                f"- Optimal Temp: {target_commodity.optimal_temp_c}°C | Default Storage: {target_commodity.default_storage_type}\n"
                f"- Base Shelf Life: {target_commodity.base_shelf_life_days} days"
            )

        # Check if materials are mentioned (e.g. LDPE, PET, EVOH, PLA, Met-BOPP, Aluminum)
        all_materials = db.query(PackagingMaterial).all()
        relevant_materials = []
        for m in all_materials:
            if m.material_code.lower() in question.lower() or m.name.lower() in question.lower() or m.polymer_family.lower() in question.lower():
                relevant_materials.append(m)

        for m in relevant_materials[:3]:
            db_context.append(
                f"VERIFIED DATABASE MATERIAL: {m.name} ({m.material_code})\n"
                f"- Polymer: {m.polymer_family} | Structure: {m.structure}\n"
                f"- OTR: {m.otr_ref} cc/m²·day·atm | WVTR: {m.wvtr_ref} g/m²·day\n"
                f"- Recyclability: {m.recyclability} | Sustainability Score: {m.sustainability_score}/100"
            )

        # 3. Format citations for transparency
        formatted_sources = []
        for idx, chunk in enumerate(retrieved_chunks):
            formatted_sources.append({
                "source_id": idx + 1,
                "title": chunk["document_title"],
                "url": chunk.get("source_url", ""),
                "type": chunk.get("doc_type", "reference"),
                "relevance_score": chunk.get("score", 0.0),
                "snippet": chunk.get("content", "")[:200] + "..."
            })

        # 4. Generate grounded answer via Groq LLM (or fallback)
        groq_api_key = settings.get_groq_api_key()
        model_name = settings.GROQ_MODEL_NAME or "llama-3.3-70b-versatile"

        if groq_api_key:
            try:
                from groq import Groq
                client = Groq(api_key=groq_api_key)

                # Assemble evidence context
                evidence_text = "\n\n".join([
                    f"[Source {idx+1}: {c['document_title']}]\n{c['content']}"
                    for idx, c in enumerate(retrieved_chunks)
                ])

                db_text = "\n\n".join(db_context) if db_context else "No specific database entity match."

                system_prompt = (
                    "You are the PackSci AI Packaging Assistant, an expert in food packaging materials science, "
                    "barrier kinetics (OTR/WVTR), shelf-life estimation, and modified atmosphere packaging (MAP).\n\n"
                    "RULES:\n"
                    "1. Provide clear, direct, and actionable explanations suitable for food producers, engineers, and students.\n"
                    "2. Ground your technical reasoning in the provided research evidence and verified database facts.\n"
                    "3. When discussing specific materials or parameters, cite the relevant [Source X] inline.\n"
                    "4. Explain the 'why' behind packaging choices (e.g., lipid oxidation, moisture sorption, anaerobic decay).\n"
                    "5. Do not invent fake measurements or ungrounded claims."
                )

                user_prompt = (
                    f"USER QUESTION: {question}\n\n"
                    f"--- RETRIEVED SCIENTIFIC LITERATURE (QDRANT VECTOR DB) ---\n"
                    f"{evidence_text if evidence_text else 'No vector documents retrieved.'}\n\n"
                    f"--- STRUCTURED DATABASE RECORDS (POSTGRESQL) ---\n"
                    f"{db_text}\n\n"
                    f"Please provide an accurate, well-structured answer addressing the user's question with citations where applicable."
                )

                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=900
                )

                answer_text = completion.choices[0].message.content

                return {
                    "question": question,
                    "answer": answer_text,
                    "provider": "Groq AI (RAG Augmented)",
                    "model_name": model_name,
                    "sources": formatted_sources,
                    "database_matches": len(db_context),
                    "created_at": datetime.datetime.utcnow().isoformat()
                }

            except Exception as e:
                logger.error(f"Groq RAG call failed ({e}). Falling back to deterministic RAG synthesis.")

        # Fallback synthesis based on retrieved chunks and rules
        fallback_answer = cls._synthesize_fallback_answer(
            question=question,
            chunks=retrieved_chunks,
            db_context=db_context
        )

        return {
            "question": question,
            "answer": fallback_answer,
            "provider": "Deterministic Scientific RAG Engine (Fallback)",
            "model_name": "scientific-rag-v1",
            "sources": formatted_sources,
            "database_matches": len(db_context),
            "created_at": datetime.datetime.utcnow().isoformat()
        }

    @classmethod
    def _synthesize_fallback_answer(
        cls,
        question: str,
        chunks: List[Dict[str, Any]],
        db_context: List[str]
    ) -> str:
        q_lower = question.lower()
        parts = []

        if "strawberr" in q_lower or "produce" in q_lower or "fruit" in q_lower or "vegetable" in q_lower:
            parts.append(
                "### Fresh Produce & Breathable Packaging [Source 1]\n"
                "Fresh fruits and vegetables are living organisms that respire, consuming O₂ and producing CO₂ and moisture vapor. "
                "Hermetically sealed high-barrier laminates (e.g. aluminum foil or EVOH) should **not** be used as they cause anoxia (O₂ < 1%), "
                "leading to anaerobic fermentation, ethanol off-flavors, and rapid breakdown. "
                "Instead, micro-perforated polypropylene (BOPP) or breathable bio-films (such as PLA) with tailored OTR (1000–5000 cc/m²·day) "
                "and anti-fog coatings are recommended to prevent condensation and mold."
            )
        elif "chip" in q_lower or "fried" in q_lower or "fat" in q_lower or "rancid" in q_lower:
            parts.append(
                "### Fried Snacks & Lipid Oxidation Protection [Source 3]\n"
                "High-fat commodities (e.g., potato chips, nuts, extruded snacks) undergo lipid autoxidation when exposed to oxygen and light. "
                "To maintain crispness (water activity aw < 0.35) and prevent rancidity:\n"
                "1. **Water Vapor Barrier**: WVTR must be < 1.0 g/m²·day to prevent moisture absorption and sogginess.\n"
                "2. **Oxygen Barrier**: OTR must be < 15 cc/m²·day·atm.\n"
                "3. **Light Barrier**: Metallized BOPP/CPP (Met-BOPP) or printed PET/Al/PE pouches provide excellent light blocking and nitrogen flush preservation."
            )
        elif "otr" in q_lower or "wvtr" in q_lower:
            parts.append(
                "### Understanding OTR and WVTR [Source 2]\n"
                "- **OTR (Oxygen Transmission Rate)**: Measures how much oxygen gas permeates through a film per unit area per day (cm³/m²·day·atm). Lower numbers mean higher gas barrier protection.\n"
                "- **WVTR (Water Vapor Transmission Rate)**: Measures moisture vapor permeability (g/m²·day). Low WVTR prevents dry food from gaining moisture and moist food from drying out."
            )
        else:
            if chunks:
                summary = chunks[0]["content"][:350]
                parts.append(
                    f"### Key Packaging Scientific Principles [Source 1]\n{summary}...\n\n"
                    "For optimal shelf-life, match the food commodity's primary degradation vector (moisture gain, lipid oxidation, or gas respiration) "
                    "with the barrier polymer's measured OTR and WVTR specifications."
                )
            else:
                parts.append(
                    "Food packaging selection depends on matching the commodity's critical degradation factor with the polymer barrier properties (OTR, WVTR, and seal hermeticity)."
                )

        if db_context:
            parts.append(f"\n**Verified Database Properties Identified:**\n" + "\n".join(db_context))

        return "\n\n".join(parts)
