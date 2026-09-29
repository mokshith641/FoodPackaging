import math


def otr_to_si(otr_cc_m2_day_atm: float) -> float:
    """
    Convert cc / (m² · day · atm) to SI units: m³ / (m² · s · Pa)
    1 cc = 10^-6 m³
    1 day = 86400 s
    1 atm = 101325 Pa
    """
    if otr_cc_m2_day_atm <= 0:
        return 0.0
    return (otr_cc_m2_day_atm * 1e-6) / (86400.0 * 101325.0)


def otr_cc_m2_day_to_cc_100in2_day(otr_m2: float) -> float:
    """
    Convert cc / (m² · day) to cc / (100 in² · day)
    1 m² = 1550.0031 in² = 15.500031 (100 in²)
    """
    return otr_m2 / 15.500031


def otr_cc_100in2_day_to_cc_m2_day(otr_100in2: float) -> float:
    """
    Convert cc / (100 in² · day) to cc / (m² · day)
    """
    return otr_100in2 * 15.500031


def wvtr_g_m2_day_to_g_100in2_day(wvtr_m2: float) -> float:
    """
    Convert g / (m² · day) to g / (100 in² · day)
    """
    return wvtr_m2 / 15.500031


def wvtr_g_100in2_day_to_g_m2_day(wvtr_100in2: float) -> float:
    """
    Convert g / (100 in² · day) to g / (m² · day)
    """
    return wvtr_100in2 * 15.500031


def resp_rate_mg_co2_to_ml_o2(mg_co2_kg_h: float, rq: float = 1.0) -> float:
    """
    Convert Respiration Rate from mg CO2 / (kg · h) to mL O2 / (kg · h) at STP.
    Molecular weight of CO2 = 44.01 g/mol
    Molar volume of ideal gas at STP = 22.414 L/mol = 22414 mL/mol
    1 mg CO2 = 0.001 g / 44.01 g/mol = 2.272e-5 mol CO2 = 0.5093 mL CO2
    With RQ = mL CO2 produced / mL O2 consumed -> mL O2 = mL CO2 / RQ
    """
    if mg_co2_kg_h is None or mg_co2_kg_h <= 0:
        return 0.0
    ml_co2 = mg_co2_kg_h * (22.414 / 44.01)
    return ml_co2 / max(rq, 0.1)


def celsius_to_fahrenheit(c: float) -> float:
    return (c * 9.0 / 5.0) + 32.0


def fahrenheit_to_celsius(f: float) -> float:
    return (f - 32.0) * 5.0 / 9.0
