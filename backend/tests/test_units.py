import pytest
from app.engine.units import (
    otr_to_si,
    otr_cc_m2_day_to_cc_100in2_day,
    otr_cc_100in2_day_to_cc_m2_day,
    wvtr_g_m2_day_to_g_100in2_day,
    wvtr_g_100in2_day_to_g_m2_day,
    resp_rate_mg_co2_to_ml_o2,
    celsius_to_fahrenheit,
    fahrenheit_to_celsius,
)


def test_otr_si_conversion():
    otr_cc = 1000.0
    si_val = otr_to_si(otr_cc)
    assert si_val > 0.0
    assert abs(otr_to_si(0.0)) < 1e-12


def test_otr_wvtr_area_unit_conversions():
    otr_m2 = 155.00031
    otr_100in2 = otr_cc_m2_day_to_cc_100in2_day(otr_m2)
    assert round(otr_100in2, 2) == 10.0
    assert round(otr_cc_100in2_day_to_cc_m2_day(10.0), 2) == round(otr_m2, 2)

    wvtr_m2 = 15.500031
    wvtr_100in2 = wvtr_g_m2_day_to_g_100in2_day(wvtr_m2)
    assert round(wvtr_100in2, 2) == 1.0
    assert round(wvtr_g_100in2_day_to_g_m2_day(1.0), 2) == round(wvtr_m2, 2)


def test_resp_rate_gas_conversion():
    # 44.01 mg of CO2 is approx 22.414 mL of CO2 at STP
    ml_o2 = resp_rate_mg_co2_to_ml_o2(44.01, rq=1.0)
    assert round(ml_o2, 2) == 22.41


def test_temperature_conversions():
    assert celsius_to_fahrenheit(0.0) == 32.0
    assert celsius_to_fahrenheit(100.0) == 212.0
    assert fahrenheit_to_celsius(32.0) == 0.0
    assert fahrenheit_to_celsius(212.0) == 100.0
