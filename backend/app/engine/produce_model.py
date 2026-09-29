import math
from typing import Dict, Any, Tuple, Optional
from app.engine.units import resp_rate_mg_co2_to_ml_o2


def calculate_temperature_adjusted_respiration(
    base_rate_mg_co2: float,
    base_temp_c: float,
    target_temp_c: float,
    q10: float = 2.5
) -> float:
    """
    Compute temperature-adjusted respiration rate using standard biological Q10 model:
    R(T) = R(T0) * (Q10 ^ ((T - T0) / 10))
    """
    if base_rate_mg_co2 is None or base_rate_mg_co2 <= 0:
        return 0.0
    q10_eff = q10 if q10 and q10 > 1.0 else 2.5
    delta_t = target_temp_c - base_temp_c
    return base_rate_mg_co2 * (q10_eff ** (delta_t / 10.0))


def classify_respiration_intensity(rate_mg_co2_kg_h: float) -> str:
    """
    Standard Postharvest classification (Kader et al., UC Davis) at 5°C:
    < 5: Very Low (e.g. nuts, dried fruit, dates)
    5 - 10: Low (e.g. apple, citrus, potato, onion)
    10 - 20: Moderate (e.g. banana, mango, tomato, cucumber)
    20 - 40: High (e.g. strawberry, avocado, cauliflower)
    40 - 60: Very High (e.g. broccoli, spinach, sweetcorn)
    > 60: Extremely High (e.g. mushroom, asparagus)
    """
    if rate_mg_co2_kg_h is None or rate_mg_co2_kg_h < 5:
        return "Very Low"
    elif rate_mg_co2_kg_h < 10:
        return "Low"
    elif rate_mg_co2_kg_h < 20:
        return "Moderate"
    elif rate_mg_co2_kg_h < 40:
        return "High"
    elif rate_mg_co2_kg_h < 60:
        return "Very High"
    else:
        return "Extremely High"


def evaluate_produce_film_compatibility(
    respiration_rate_mg_co2_kg_h: float,
    material_otr: float,
    is_breathable: bool,
    material_name: str,
    optimal_o2_min_pct: float = 2.0,
    package_weight_kg: float = 0.5,
    package_area_m2: float = 0.08
) -> Dict[str, Any]:
    """
    Evaluate equilibrium modified atmosphere packaging (EMAP) compatibility for fresh produce.
    Calculates target film permeance needed to prevent anaerobic fermentation.
    Target OTR ~ (R_O2 * W) / (A * (0.209 - [O2]_opt)) * 24 h
    """
    if not respiration_rate_mg_co2_kg_h or respiration_rate_mg_co2_kg_h <= 0:
        return {
            "compatible": True,
            "target_otr_estimate": None,
            "risk": "none",
            "warning": None,
            "recommendation": "Non-respiring or minimal respiration produce."
        }

    # Convert mg CO2/kg-h to mL O2/kg-day
    ml_o2_kg_h = resp_rate_mg_co2_to_ml_o2(respiration_rate_mg_co2_kg_h)
    daily_o2_demand_cc = ml_o2_kg_h * package_weight_kg * 24.0

    # Driving force delta pO2 (e.g. 0.209 ambient - 0.03 target in package = 0.179 atm)
    target_o2_fraction = max(0.01, min(0.10, optimal_o2_min_pct / 100.0 if optimal_o2_min_pct else 0.03))
    delta_po2 = 0.209 - target_o2_fraction

    target_otr = daily_o2_demand_cc / (package_area_m2 * delta_po2)

    if material_otr < 200 and not is_breathable:
        return {
            "compatible": False,
            "target_otr_estimate": round(target_otr, 1),
            "risk": "severe_anaerobic_risk",
            "warning": f"CRITICAL: {material_name} provides excessive gas barrier (OTR={material_otr} cc/m²·day). "
                       f"Living produce will consume residual O2 within hours and enter anaerobic fermentation, "
                       f"causing off-flavours, tissue softening, and microbial safety hazards. Use micro-perforated or macro-ventilated film.",
            "recommendation": f"Requires breathable/micro-perforated film with effective OTR around {round(target_otr, 0):,} cc/m²·day·atm."
        }
    elif material_otr < target_otr * 0.3 and not is_breathable:
        return {
            "compatible": True,
            "target_otr_estimate": round(target_otr, 1),
            "risk": "moderate_hypoxia_risk",
            "warning": f"OTR ({material_otr}) is on the lower side for this produce's respiration rate. Laser micro-perforation recommended.",
            "recommendation": "Micro-perforation or anti-fog additive advised."
        }
    else:
        return {
            "compatible": True,
            "target_otr_estimate": round(target_otr, 1),
            "risk": "optimal_or_tolerable",
            "warning": None,
            "recommendation": "Gas transmission suitable for equilibrium modified atmosphere."
        }
