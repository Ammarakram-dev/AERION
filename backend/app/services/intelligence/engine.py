from __future__ import annotations

from math import isfinite
from statistics import mean, pstdev
from typing import Any


def _number(value: Any) -> float | None:
    try:
        number = float(value)
        return number if isfinite(number) else None
    except (TypeError, ValueError):
        return None


def _extract_features(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []

    candidates = [
        payload.get("result", {}).get("map_data", {}).get("features", []),
        payload.get("data", {}).get("result", {}).get("map_data", {}).get("features", []),
        payload.get("map_data", {}).get("features", []),
        payload.get("features", []),
    ]

    for features in candidates:
        if isinstance(features, list):
            return [item for item in features if isinstance(item, dict)]

    return []


def _temperature_values(features: list[dict[str, Any]]) -> list[float]:
    values = []

    for feature in features:
        properties = feature.get("properties", {})
        if not isinstance(properties, dict):
            continue

        value = _number(properties.get("average_temperature"))

        if value is not None:
            values.append(value)

    return values


def _classify_temperature(temperature: float) -> str:
    if temperature >= 40:
        return "EXTREME"
    if temperature >= 35:
        return "CRITICAL"
    if temperature >= 30:
        return "HIGH"
    if temperature >= 25:
        return "ELEVATED"
    if temperature >= 18:
        return "MODERATE"
    return "STABLE"


def _risk_score(
    temperature: float,
    minimum: float,
    maximum: float,
    variability: float,
) -> int:
    """
    Produces a transparent 0–100 thermal-pressure score.

    The score combines:
    - absolute temperature
    - local thermal range
    - spatial variability
    """

    if temperature <= 18:
        base = 12
    elif temperature <= 25:
        base = 28
    elif temperature <= 30:
        base = 48
    elif temperature <= 35:
        base = 68
    elif temperature <= 40:
        base = 84
    else:
        base = 96

    spread = max(0.0, maximum - minimum)

    spread_factor = min(spread * 1.4, 12)
    variability_factor = min(variability * 2.0, 10)

    score = round(base + spread_factor + variability_factor)

    return max(0, min(100, score))


def _risk_level(score: int) -> str:
    if score >= 85:
        return "CRITICAL"
    if score >= 70:
        return "HIGH"
    if score >= 50:
        return "ELEVATED"
    if score >= 30:
        return "MODERATE"
    return "STABLE"


def _confidence(
    sample_count: int,
    variability: float,
    minimum: float,
    maximum: float,
) -> int:
    """
    Confidence is an analytical quality indicator, not a probability
    that the prediction is correct.
    """

    if sample_count == 0:
        return 0

    sample_component = min(sample_count / 100, 1.0) * 55

    range_value = max(0.0, maximum - minimum)

    if range_value == 0:
        consistency_component = 35
    elif range_value <= 5:
        consistency_component = 30
    elif range_value <= 10:
        consistency_component = 22
    else:
        consistency_component = 14

    variability_component = max(0.0, 10 - variability)

    confidence = round(
        sample_component + consistency_component + variability_component
    )

    return max(0, min(100, confidence))


def _detect_anomaly(
    values: list[float],
    average: float,
) -> dict[str, Any]:
    if len(values) < 3:
        return {
            "detected": False,
            "severity": "LOW",
            "message": "Insufficient spatial samples for robust anomaly detection.",
        }

    deviation = pstdev(values)

    if deviation == 0:
        return {
            "detected": False,
            "severity": "LOW",
            "message": "Thermal field is highly uniform across available samples.",
        }

    extreme_values = [
        value
        for value in values
        if abs(value - average) > (2 * deviation)
    ]

    ratio = len(extreme_values) / len(values)

    if ratio >= 0.10:
        return {
            "detected": True,
            "severity": "HIGH",
            "message": "Localized thermal anomalies detected across the field.",
        }

    if extreme_values:
        return {
            "detected": True,
            "severity": "MEDIUM",
            "message": "Small localized thermal deviations detected.",
        }

    return {
        "detected": False,
        "severity": "LOW",
        "message": "No statistically significant thermal anomaly detected.",
    }


def _recommendation(risk: str, anomaly: bool) -> dict[str, Any]:
    if risk == "CRITICAL":
        return {
            "priority": "IMMEDIATE",
            "action": "Prioritize heat mitigation and reduce exposure in affected areas.",
            "reason": "The thermal field indicates extreme environmental pressure.",
        }

    if risk == "HIGH":
        return {
            "priority": "HIGH",
            "action": "Activate targeted heat mitigation and increase monitoring frequency.",
            "reason": "Elevated temperatures may create significant localized heat exposure.",
        }

    if risk == "ELEVATED":
        return {
            "priority": "MEDIUM",
            "action": "Monitor the field and prepare targeted cooling or shading measures.",
            "reason": "Thermal pressure is above a stable baseline.",
        }

    if anomaly:
        return {
            "priority": "MEDIUM",
            "action": "Investigate localized thermal anomalies before making broader interventions.",
            "reason": "The average field is stable, but spatial deviations require attention.",
        }

    return {
        "priority": "LOW",
        "action": "Continue environmental monitoring.",
        "reason": "Current thermal conditions do not indicate significant immediate pressure.",
    }


def analyze_heat_data(payload: Any) -> dict[str, Any]:
    """
    AERION Thermal Intelligence Engine.

    Converts FortyGuard heatmap telemetry into:
    - thermal statistics
    - risk score
    - risk classification
    - confidence indicator
    - anomaly detection
    - recommended decision
    - machine-readable intelligence metadata
    """

    features = _extract_features(payload)
    values = _temperature_values(features)

    if not values:
        return {
            "engine": "AERION Thermal Intelligence Engine",
            "version": "1.0.0",
            "status": "insufficient_data",
            "message": "No valid temperature observations were found.",
            "thermal": {
                "samples": 0,
                "average_celsius": None,
                "minimum_celsius": None,
                "maximum_celsius": None,
                "range_celsius": None,
                "variability_celsius": None,
            },
            "risk": {
                "score": 0,
                "level": "UNKNOWN",
            },
            "confidence": {
                "score": 0,
                "interpretation": "Insufficient data",
            },
            "anomaly": {
                "detected": False,
                "severity": "UNKNOWN",
                "message": "No temperature observations available.",
            },
            "decision": {
                "priority": "WAIT",
                "action": "Collect additional thermal observations.",
                "reason": "A reliable assessment cannot be produced without temperature data.",
            },
        }

    average = mean(values)
    minimum = min(values)
    maximum = max(values)
    variability = pstdev(values) if len(values) > 1 else 0.0
    range_celsius = maximum - minimum

    score = _risk_score(
        temperature=average,
        minimum=minimum,
        maximum=maximum,
        variability=variability,
    )

    risk = _risk_level(score)
    temperature_class = _classify_temperature(average)

    confidence = _confidence(
        sample_count=len(values),
        variability=variability,
        minimum=minimum,
        maximum=maximum,
    )

    anomaly = _detect_anomaly(
        values=values,
        average=average,
    )

    decision = _recommendation(
        risk=risk,
        anomaly=anomaly["detected"],
    )

    return {
        "engine": "AERION Thermal Intelligence Engine",
        "version": "1.0.0",
        "status": "analyzed",
        "thermal": {
            "samples": len(values),
            "average_celsius": round(average, 2),
            "minimum_celsius": round(minimum, 2),
            "maximum_celsius": round(maximum, 2),
            "range_celsius": round(range_celsius, 2),
            "variability_celsius": round(variability, 2),
            "classification": temperature_class,
        },
        "risk": {
            "score": score,
            "level": risk,
            "scale": "0-100",
        },
        "confidence": {
            "score": confidence,
            "interpretation": (
                "High analytical consistency"
                if confidence >= 80
                else "Moderate analytical consistency"
                if confidence >= 55
                else "Limited analytical consistency"
            ),
        },
        "anomaly": anomaly,
        "decision": decision,
        "spatial_intelligence": {
            "observations_processed": len(values),
            "thermal_field_range": round(range_celsius, 2),
            "field_uniformity": (
                "HIGH"
                if variability < 1
                else "MODERATE"
                if variability < 3
                else "LOW"
            ),
        },
    }