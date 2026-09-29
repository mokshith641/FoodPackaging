from typing import List, Dict, Any, Optional, Tuple
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    CandidateMaterialResult,
    ScoreBreakdown,
    RejectedCandidate,
)
from app.models.models import FoodCommodity, PackagingMaterial
from app.engine.produce_model import (
    calculate_temperature_adjusted_respiration,
    classify_respiration_intensity,
    evaluate_produce_film_compatibility,
)
from app.engine.shelf_life import estimate_experimental_shelf_life
from app.engine.units import otr_cc_m2_day_to_cc_100in2_day, wvtr_g_m2_day_to_g_100in2_day


class PackagingRecommendationEngine:
    """
    Deterministic rule-and-scoring recommendation engine for food packaging materials.
    Implements multi-criteria decision analysis (MCDA) with constraint satisfaction.
    """

    @staticmethod
    def evaluate_recommendation(
        request: RecommendationRequest,
        commodity: Optional[FoodCommodity],
        all_materials: List[PackagingMaterial]
    ) -> RecommendationResponse:
        missing_inputs: List[str] = []
        uncertainties: List[str] = []

        # Identify missing or uncertain fields
        if request.moisture_content_pct is None:
            missing_inputs.append("Moisture content %")
            uncertainties.append("Moisture sensitivity evaluated using category defaults.")
        if request.fat_content_pct is None:
            missing_inputs.append("Fat content %")
            uncertainties.append("Oxidation risk estimated from baseline commodity category.")
        if request.ph is None:
            missing_inputs.append("pH")
        
        is_respiring = (commodity and commodity.is_respiring) or (
            request.commodity_category in ["fresh_produce_fruit", "fresh_produce_veg", "fresh_produce_leafy", "fresh_produce_root_bulb"]
        )
        
        resp_rate = request.respiration_rate
        if resp_rate is None and commodity and commodity.resp_rate_mg_co2_kg_h:
            resp_rate = calculate_temperature_adjusted_respiration(
                base_rate_mg_co2=commodity.resp_rate_mg_co2_kg_h,
                base_temp_c=commodity.optimal_temp_c or 5.0,
                target_temp_c=request.storage_temp_c,
                q10=commodity.resp_q10 or 2.5
            )
        elif resp_rate is None and is_respiring:
            missing_inputs.append("Respiration rate")
            uncertainties.append("Produce respiration rate unknown; assumed moderate default for gas flux safety.")
            resp_rate = 20.0

        # Weights configuration based on product properties and user priority
        weights = PackagingRecommendationEngine._calculate_dynamic_weights(
            request=request,
            commodity=commodity,
            is_respiring=is_respiring
        )

        ranked_candidates: List[CandidateMaterialResult] = []
        rejected_candidates: List[RejectedCandidate] = []

        for mat in all_materials:
            # Step 1: Constraint Verification (Hard Filters)
            constraint_check = PackagingRecommendationEngine._check_hard_constraints(
                mat=mat,
                request=request,
                is_respiring=is_respiring,
                resp_rate=resp_rate
            )

            if not constraint_check["is_valid"]:
                rejected_candidates.append(RejectedCandidate(
                    material_id=mat.id,
                    material_code=mat.material_code,
                    material_name=mat.name,
                    rejection_reason=constraint_check["rejection_reason"],
                    violated_constraints=constraint_check["violated_constraints"]
                ))
                continue

            # Step 2: Scoring Sub-dimensions (0 - 100)
            moisture_score = PackagingRecommendationEngine._score_moisture_barrier(
                mat=mat,
                request=request,
                commodity=commodity,
                is_respiring=is_respiring
            )
            oxygen_score = PackagingRecommendationEngine._score_oxygen_barrier(
                mat=mat,
                request=request,
                commodity=commodity,
                is_respiring=is_respiring,
                resp_rate=resp_rate
            )
            temp_score = PackagingRecommendationEngine._score_temperature_suitability(
                mat=mat,
                request=request
            )
            mechanical_score = PackagingRecommendationEngine._score_mechanical_and_sealing(
                mat=mat,
                request=request
            )
            cost_score = PackagingRecommendationEngine._score_cost_tier(
                mat=mat,
                request=request
            )
            sustainability_score = PackagingRecommendationEngine._score_sustainability(
                mat=mat,
                request=request
            )

            total_score = (
                moisture_score * weights["moisture"]
                + oxygen_score * weights["oxygen"]
                + temp_score * weights["temperature"]
                + mechanical_score * weights["mechanical"]
                + cost_score * weights["cost"]
                + sustainability_score * weights["sustainability"]
            )
            total_score = round(total_score, 1)

            # Step 3: Specific Reasons, Warnings, and Trade-offs
            reasons = PackagingRecommendationEngine._generate_reasons(
                mat=mat,
                moisture_score=moisture_score,
                oxygen_score=oxygen_score,
                cost_score=cost_score,
                sustainability_score=sustainability_score
            )
            warnings = PackagingRecommendationEngine._generate_warnings(
                mat=mat,
                request=request,
                commodity=commodity,
                is_respiring=is_respiring
            )
            trade_offs = PackagingRecommendationEngine._generate_trade_offs(
                mat=mat,
                request=request
            )

            # Step 4: Experimental Shelf Life Estimation
            shelf_life_res = estimate_experimental_shelf_life(
                base_shelf_life_days=commodity.base_shelf_life_days if commodity else None,
                optimal_temp_c=commodity.optimal_temp_c if commodity else None,
                storage_temp_c=request.storage_temp_c,
                shelf_life_q10=commodity.shelf_life_q10 if commodity else None,
                is_respiring=is_respiring,
                moisture_sensitivity=commodity.moisture_sensitivity if commodity else 1,
                o2_sensitivity=commodity.o2_sensitivity if commodity else 1,
                material_wvtr=mat.wvtr_ref,
                material_otr=mat.otr_ref,
                target_shelf_life_days=request.target_shelf_life_days
            )

            verdict = "Highly Recommended" if total_score >= 82 else ("Recommended" if total_score >= 70 else "Acceptable with Trade-offs")

            tech_specs = {
                "ref_thickness_um": mat.ref_thickness_um,
                "otr_cc_m2_day_atm": mat.otr_ref,
                "otr_cc_100in2_day": round(otr_cc_m2_day_to_cc_100in2_day(mat.otr_ref), 3),
                "wvtr_g_m2_day": mat.wvtr_ref,
                "wvtr_g_100in2_day": round(wvtr_g_m2_day_to_g_100in2_day(mat.wvtr_ref), 3),
                "density_g_cc": mat.density_g_cc,
                "tensile_strength_mpa": mat.tensile_strength_mpa,
                "heat_seal_temp_c": mat.heat_seal_temp_c,
                "sealability": mat.sealability,
                "recyclability": mat.recyclability,
                "biodegradable": mat.is_biodegradable,
                "co2e_kg_per_kg": mat.co2e_kg_per_kg,
                "cost_inr_per_kg": mat.cost_inr_per_kg
            }

            score_breakdown = ScoreBreakdown(
                moisture_score=round(moisture_score, 1),
                oxygen_score=round(oxygen_score, 1),
                temp_score=round(temp_score, 1),
                mechanical_score=round(mechanical_score, 1),
                cost_score=round(cost_score, 1),
                sustainability_score=round(sustainability_score, 1),
                weights_applied={k: round(v, 3) for k, v in weights.items()}
            )

            candidate_res = CandidateMaterialResult(
                material_id=mat.id,
                material_code=mat.material_code,
                material_name=mat.name,
                structure=mat.structure,
                polymer_family=mat.polymer_family,
                rank=0,  # assigned after sorting
                total_score=total_score,
                score_breakdown=score_breakdown,
                compatibility_verdict=verdict,
                reasons_for_ranking=reasons,
                warnings=warnings,
                trade_offs=trade_offs,
                technical_specifications=tech_specs,
                source_url=mat.source_url,
                verification_status=mat.verification_status,
                experimental_shelf_life_min_days=shelf_life_res.get("min_days"),
                experimental_shelf_life_max_days=shelf_life_res.get("max_days"),
                shelf_life_estimation_notes=shelf_life_res.get("disclaimer")
            )
            ranked_candidates.append(candidate_res)

        # Sort candidates descending by total_score
        ranked_candidates.sort(key=lambda c: c.total_score, reverse=True)
        for idx, c in enumerate(ranked_candidates):
            c.rank = idx + 1

        import datetime
        return RecommendationResponse(
            commodity_name=request.commodity_name,
            commodity_category=request.commodity_category,
            timestamp=datetime.datetime.utcnow(),
            inputs=request,
            ranked_candidates=ranked_candidates[:6],  # Top 5-6 candidates
            rejected_candidates=rejected_candidates,
            missing_critical_inputs=missing_inputs,
            uncertainties=uncertainties,
            engineering_disclaimer=(
                "DISCLAIMER & REGULATORY NOTICE: This recommendation is an engineering candidate screening tool "
                "based on verified polymer barrier properties and standard food science degradation models. "
                "It does NOT guarantee shelf-life or food safety compliance. Mandatory steps prior to industrial deployment: "
                "(1) Verify regulatory food-contact compliance (US FDA 21 CFR / EU 10/2011 / FSSAI) with the resin/film supplier; "
                "(2) Perform migration testing and overall seal-integrity assays; "
                "(3) Conduct real-time storage and microbial challenge trials across expected supply chain temperature abuse regimes."
            )
        )

    @staticmethod
    def _calculate_dynamic_weights(
        request: RecommendationRequest,
        commodity: Optional[FoodCommodity],
        is_respiring: bool
    ) -> Dict[str, float]:
        """
        Dynamically adjusts multi-criteria evaluation weights based on product sensitivities.
        """
        w = {
            "moisture": 0.25,
            "oxygen": 0.25,
            "temperature": 0.15,
            "mechanical": 0.15,
            "cost": 0.10,
            "sustainability": 0.10
        }

        # Fresh respiring produce prioritizes gas exchange/equilibrium and mechanical protection
        if is_respiring:
            w["oxygen"] = 0.35  # gas transmission is critical to prevent anaerobic fermentation
            w["moisture"] = 0.20
            w["mechanical"] = 0.15
            w["temperature"] = 0.10
            w["cost"] = 0.10
            w["sustainability"] = 0.10

        # High fat content (e.g. oils, roasted nuts, whole milk powder) prioritizes oxygen barrier
        elif (request.fat_content_pct and request.fat_content_pct > 20.0) or (commodity and commodity.o2_sensitivity >= 2):
            w["oxygen"] = 0.35
            w["moisture"] = 0.25
            w["temperature"] = 0.10
            w["mechanical"] = 0.10
            w["cost"] = 0.10
            w["sustainability"] = 0.10

        # High moisture sensitivity (e.g. sugar, crisps, biscuits)
        elif (commodity and commodity.moisture_sensitivity >= 2) or (request.moisture_content_pct and request.moisture_content_pct < 5.0):
            w["moisture"] = 0.35
            w["oxygen"] = 0.25
            w["temperature"] = 0.10
            w["mechanical"] = 0.10
            w["cost"] = 0.10
            w["sustainability"] = 0.10

        # Frozen products
        if request.storage_type == "frozen" or request.storage_temp_c < 0.0:
            w["temperature"] = 0.25
            w["mechanical"] = 0.20
            w["moisture"] = 0.25
            w["oxygen"] = 0.15
            w["cost"] = 0.075
            w["sustainability"] = 0.075

        # Adjust for user sustainability priority
        if request.sustainability_priority == "high":
            w["sustainability"] = 0.22
            w["cost"] = 0.08
        elif request.sustainability_priority == "low":
            w["sustainability"] = 0.05
            w["cost"] = 0.15

        # Adjust for user cost tier
        if request.cost_tier == "budget":
            w["cost"] = max(w["cost"], 0.20)
        elif request.cost_tier == "premium":
            w["cost"] = 0.05

        # Normalize weights so sum == 1.0
        total_w = sum(w.values())
        return {k: v / total_w for k, v in w.items()}

    @staticmethod
    def _check_hard_constraints(
        mat: PackagingMaterial,
        request: RecommendationRequest,
        is_respiring: bool,
        resp_rate: Optional[float]
    ) -> Dict[str, Any]:
        """
        Hard constraint satisfaction filter.
        """
        violated: List[str] = []
        reason = ""

        # Constraint 1: Sub-zero temperature embrittlement
        if request.storage_temp_c < 0.0 and not mat.low_temp_ok:
            violated.append(f"Sub-zero embrittlement failure at {request.storage_temp_c}°C")
            reason = f"{mat.name} loses impact strength and becomes dangerously brittle below 0°C."

        # Constraint 2: Standalone format requirement vs non-sealable monolayer
        if request.package_format in ["pouch", "bag", "vacuum_skin"] and not mat.standalone_pack_ok:
            violated.append("Lacks integrated heat-sealable layer")
            reason = f"{mat.name} is a plain substrate (sealability: {mat.sealability}) and cannot form a standalone hermetic pouch without a sealant web (e.g. PE/CPP)."

        # Constraint 3: Fresh Produce Anaerobic Hazard
        # Ultra high barrier (OTR < 50 cc/m2-day) without micro-perforation on respiring commodities
        if is_respiring and resp_rate and resp_rate > 10.0:
            if mat.otr_ref < 100.0 and not mat.is_breathable:
                violated.append("Severe Anaerobic Fermentation Risk")
                reason = f"{mat.name} has extremely high gas barrier (OTR={mat.otr_ref} cc/m²·day). Packaging respiring produce ({request.commodity_name}) in this unventilated film causes oxygen depletion (<0.5% O2) within hours, leading to anaerobic decay, off-odors, and potential microbial hazards."

        return {
            "is_valid": len(violated) == 0,
            "violated_constraints": violated,
            "rejection_reason": reason
        }

    @staticmethod
    def _score_moisture_barrier(
        mat: PackagingMaterial,
        request: RecommendationRequest,
        commodity: Optional[FoodCommodity],
        is_respiring: bool
    ) -> float:
        """
        Scores moisture barrier effectiveness (0 - 100).
        """
        wvtr = mat.wvtr_ref
        moisture_sens = commodity.moisture_sensitivity if commodity else 1

        if is_respiring:
            # For fresh produce: extremely low WVTR causes severe inside condensation / droplet formation -> fungal rot!
            # Moderate WVTR (5 to 30 g/m2-day) is optimal.
            if 5.0 <= wvtr <= 35.0:
                return 95.0
            elif wvtr < 5.0:
                return 70.0  # condensation risk
            elif wvtr <= 60.0:
                return 80.0
            else:
                return 60.0  # dehydration risk
        else:
            # For dry, hygroscopic, or moisture-sensitive goods (sugar, crisps, tea, biscuits):
            # Lower WVTR is much better.
            if moisture_sens >= 2 or (request.moisture_content_pct and request.moisture_content_pct < 8.0):
                if wvtr <= 1.0:
                    return 100.0
                elif wvtr <= 3.0:
                    return 92.0
                elif wvtr <= 6.0:
                    return 80.0
                elif wvtr <= 15.0:
                    return 55.0
                elif wvtr <= 50.0:
                    return 30.0
                else:
                    return 15.0
            else:
                # Moderate moisture sensitivity (e.g. bread, dairy)
                if wvtr <= 8.0:
                    return 90.0
                elif wvtr <= 25.0:
                    return 78.0
                else:
                    return 50.0

    @staticmethod
    def _score_oxygen_barrier(
        mat: PackagingMaterial,
        request: RecommendationRequest,
        commodity: Optional[FoodCommodity],
        is_respiring: bool,
        resp_rate: Optional[float]
    ) -> float:
        """
        Scores oxygen barrier / gas exchange suitability (0 - 100).
        """
        otr = mat.otr_ref
        fat_pct = request.fat_content_pct or (commodity.fat_pct if commodity else 0.0) or 0.0
        o2_sens = commodity.o2_sensitivity if commodity else (2 if fat_pct > 15.0 else 1)

        if is_respiring:
            # Fresh produce needs gas transmission matched to respiration rate
            comp = evaluate_produce_film_compatibility(
                respiration_rate_mg_co2_kg_h=resp_rate or 20.0,
                material_otr=otr,
                is_breathable=mat.is_breathable,
                material_name=mat.name,
                optimal_o2_min_pct=commodity.optimal_o2_min if commodity else 2.0
            )
            if comp["risk"] == "optimal_or_tolerable":
                return 95.0 if mat.is_breathable else 85.0
            elif comp["risk"] == "moderate_hypoxia_risk":
                return 70.0
            else:
                return 25.0
        else:
            # High fat or high O2 sensitivity requires low OTR
            if o2_sens >= 2 or fat_pct > 10.0:
                if otr <= 2.0:
                    return 100.0
                elif otr <= 15.0:
                    return 90.0
                elif otr <= 60.0:
                    return 75.0
                elif otr <= 200.0:
                    return 55.0
                elif otr <= 1000.0:
                    return 35.0
                else:
                    return 10.0
            else:
                # Low O2 sensitivity (e.g. sugar, milled rice, salt)
                if otr <= 200.0:
                    return 90.0
                elif otr <= 1500.0:
                    return 80.0
                else:
                    return 70.0

    @staticmethod
    def _score_temperature_suitability(
        mat: PackagingMaterial,
        request: RecommendationRequest
    ) -> float:
        """
        Scores material thermal compatibility (0 - 100).
        """
        storage_t = request.storage_temp_c
        if storage_t < 0.0:
            return 95.0 if mat.low_temp_ok else 20.0
        elif storage_t > 35.0:
            # High ambient temp storage
            if mat.heat_seal_temp_c and mat.heat_seal_temp_c < 90.0:
                return 60.0
            return 90.0
        else:
            # Normal ambient/chilled
            return 95.0

    @staticmethod
    def _score_mechanical_and_sealing(
        mat: PackagingMaterial,
        request: RecommendationRequest
    ) -> float:
        """
        Scores tensile strength, sealability, and transport resilience (0 - 100).
        """
        score = 80.0
        tensile = mat.tensile_strength_mpa or 40.0
        
        # Sealability score contribution
        if mat.sealability == "good":
            score += 10.0
        elif mat.sealability == "fair":
            score += 0.0
        elif mat.sealability == "poor_alone":
            score -= 20.0

        # Transportation severity
        if request.transport_condition in ["long_distance", "high_humidity"]:
            if tensile >= 100.0:
                score += 10.0  # high puncture/tensile resistance
            elif tensile < 30.0:
                score -= 15.0  # thin or low strength film risk

        return max(10.0, min(100.0, score))

    @staticmethod
    def _score_cost_tier(
        mat: PackagingMaterial,
        request: RecommendationRequest
    ) -> float:
        """
        Scores cost alignment with requested cost tier (0 - 100).
        """
        cost = mat.cost_inr_per_kg or 200.0
        tier = request.cost_tier

        if tier == "budget":
            if cost <= 150.0:
                return 98.0
            elif cost <= 230.0:
                return 80.0
            elif cost <= 320.0:
                return 55.0
            else:
                return 30.0
        elif tier == "premium":
            # Premium tier values performance and barrier properties over lowest unit cost
            if cost >= 300.0:
                return 95.0
            elif cost >= 200.0:
                return 88.0
            else:
                return 80.0
        else:
            # Balanced
            if 120.0 <= cost <= 280.0:
                return 95.0
            elif cost < 120.0:
                return 90.0
            else:
                return 70.0

    @staticmethod
    def _score_sustainability(
        mat: PackagingMaterial,
        request: RecommendationRequest
    ) -> float:
        """
        Scores environmental sustainability (0 - 100).
        """
        # Baseline sustainability score from material database (0-100)
        base = mat.sustainability_score or 50.0
        
        # Recyclability bonus
        if mat.recyclability == "recyclable":
            base = max(base, 75.0)
        elif mat.is_biodegradable or mat.recyclability == "compostable":
            base = max(base, 80.0)
        elif mat.recyclability == "non_recyclable":
            base = min(base, 35.0)

        # Carbon footprint penalty for heavy co2e materials (e.g. Al foil laminates, PA)
        if mat.co2e_kg_per_kg and mat.co2e_kg_per_kg > 4.5:
            base = max(10.0, base - 10.0)

        return max(10.0, min(100.0, base))

    @staticmethod
    def _generate_reasons(
        mat: PackagingMaterial,
        moisture_score: float,
        oxygen_score: float,
        cost_score: float,
        sustainability_score: float
    ) -> List[str]:
        reasons = []
        if moisture_score >= 88.0:
            reasons.append(f"Superior moisture barrier (WVTR: {mat.wvtr_ref} g/m²·day) protects product texture.")
        if oxygen_score >= 88.0:
            reasons.append(f"Targeted gas barrier (OTR: {mat.otr_ref} cc/m²·day) prevents oxidative degradation.")
        if sustainability_score >= 75.0:
            reasons.append(f"Strong circularity profile: {mat.recyclability.replace('_', ' ').title()}.")
        if cost_score >= 85.0:
            reasons.append(f"Economically efficient raw material cost (₹{mat.cost_inr_per_kg or 'N/A'}/kg).")
        if mat.is_breathable:
            reasons.append("Equilibrium gas exchange supports living produce respiration.")
        return reasons if reasons else ["Balanced general performance across evaluation criteria."]

    @staticmethod
    def _generate_warnings(
        mat: PackagingMaterial,
        request: RecommendationRequest,
        commodity: Optional[FoodCommodity],
        is_respiring: bool
    ) -> List[str]:
        warnings = []
        if mat.recyclability == "non_recyclable":
            warnings.append("Multi-material laminate structure poses municipal mechanical recycling challenges.")
        if (commodity and commodity.light_sensitive) and mat.transparency == "high" and not mat.light_barrier:
            warnings.append("Transparent film provides no photo-oxidation barrier; requires secondary light-opaque carton or UV absorbers.")
        if mat.polymer_family == "bio_based" and mat.wvtr_ref > 50.0:
            warnings.append("Bio-based structure has elevated water vapor permeability; monitor moisture gain in humid ambient storage.")
        if "EVOH" in mat.structure and request.relative_humidity_pct > 80.0:
            warnings.append("EVOH barrier layer is hydrophilic; ensure outer polyolefin skin layers remain pinhole-free at high RH.")
        return warnings

    @staticmethod
    def _generate_trade_offs(mat: PackagingMaterial, request: RecommendationRequest) -> List[str]:
        trade_offs = []
        if mat.recyclability == "non_recyclable" and mat.otr_ref < 5.0:
            trade_offs.append("Ultra-high barrier achieved through multi-layer lamination at the expense of circular recyclability.")
        if mat.polymer_family == "bio_based":
            trade_offs.append("Enhanced biodegradability with higher raw material cost and reduced moisture barrier.")
        if mat.otr_ref > 1000.0 and mat.recyclability == "recyclable":
            trade_offs.append("High recyclability and low cost, but minimal oxygen barrier.")
        return trade_offs
