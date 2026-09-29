import math
from typing import Dict, Any, Optional, Tuple


def estimate_experimental_shelf_life(
    base_shelf_life_days: Optional[float],
    optimal_temp_c: Optional[float],
    storage_temp_c: float,
    shelf_life_q10: Optional[float],
    is_respiring: bool,
    moisture_sensitivity: int,
    o2_sensitivity: int,
    material_wvtr: float,
    material_otr: float,
    target_shelf_life_days: float
) -> Dict[str, Any]:
    """
    Experimental shelf life estimator based on Q10 kinetic temperature scaling and
    packaging barrier modulation.
    
    IMPORTANT SCIENTIFIC DISCLAIMER:
    This function computes an theoretical engineering range based on ideal barrier and
    temperature kinetics. It DOES NOT replace real-time shelf life testing, accelerated
    isothermal storage trials (ASLT), or challenge testing for pathogenic microorganisms.
    """
    if base_shelf_life_days is None or base_shelf_life_days <= 0:
        return {
            "min_days": None,
            "max_days": None,
            "sufficient_evidence": False,
            "calculation_basis": "Insufficient baseline shelf-life data in registry for quantitative modeling.",
            "variables_required": [
                "Initial microbiological quality (total viable count, yeast/mould)",
                "Specific critical water activity threshold / moisture sorption isotherm",
                "Peroxide value / lipid oxidation kinetic rate constant",
                "Package surface area to volume ratio and seal integrity verification"
            ],
            "disclaimer": "Numeric shelf life estimate withheld. Physical storage trials and microbial validation are required."
        }

    q10 = shelf_life_q10 if shelf_life_q10 and shelf_life_q10 > 1.0 else 2.5
    ref_temp = optimal_temp_c if optimal_temp_c is not None else 20.0

    # Temperature kinetic factor: Shelf life decreases as temperature rises above optimal
    delta_t = storage_temp_c - ref_temp
    temp_factor = 1.0 / (q10 ** (delta_t / 10.0))
    temp_adjusted_base = base_shelf_life_days * temp_factor

    # Barrier impact factor
    barrier_factor = 1.0

    if is_respiring:
        # Fresh produce under proper modified atmosphere (EMAP) typically gains 1.2x to 1.8x shelf-life extension
        # If barrier is too tight (<100 OTR and unperforated), life drops drastically due to anaerobic breakdown
        if material_otr < 200:
            barrier_factor = 0.4  # rapid spoilage
        elif material_otr > 1000:
            barrier_factor = 1.35
        else:
            barrier_factor = 1.15
    else:
        # Dry / lipid foods: high barrier prevents moisture gain / rancidity
        if moisture_sensitivity >= 2 or o2_sensitivity >= 2:
            if material_wvtr <= 2.0 and material_otr <= 50.0:
                barrier_factor = 1.4  # superior barrier protection
            elif material_wvtr <= 10.0 and material_otr <= 1000.0:
                barrier_factor = 1.0  # baseline protection
            else:
                barrier_factor = 0.65  # permeability causes earlier moisture/oxidation failure

    estimated_nominal = temp_adjusted_base * barrier_factor
    
    # Range reflects ±20% uncertainty due to initial commodity quality variation
    min_days = max(1.0, round(estimated_nominal * 0.8, 1))
    max_days = max(min_days + 1.0, round(estimated_nominal * 1.2, 1))

    # Determine feasibility vs user target
    meets_target = min_days >= target_shelf_life_days

    return {
        "min_days": min_days,
        "max_days": max_days,
        "sufficient_evidence": True,
        "meets_target": meets_target,
        "calculation_basis": f"Q10 kinetic model (Q10={q10}, T_ref={ref_temp}°C, T_storage={storage_temp_c}°C) + barrier attenuation.",
        "variables_required": [
            "Verification of microbial load at day 0",
            "Accelerated shelf life testing (ASLT) at elevated RH/temperature",
            "Sensory and nutritional retention assays"
        ],
        "disclaimer": "EXPERIMENTAL ESTIMATE ONLY. Not a guaranteed expiration period. Actual longevity depends on initial microbial load, hygiene, cold-chain consistency, headspace gas, and package seal integrity."
    }
