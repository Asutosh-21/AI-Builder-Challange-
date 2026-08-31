"""
IBM Granite AI Service
Root cause explanation + mission response plan generation via Ollama or watsonx.ai.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Ollama Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "granite")

# IBM Watson Configuration (fallback)
WATSONX_API_KEY = os.getenv("WATSONX_API_KEY", "")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
GRANITE_MODEL_ID = os.getenv("GRANITE_MODEL_ID", "ibm/granite-3-1-8b-instruct")

# Use Ollama if available, otherwise fall back to Watson
USE_OLLAMA = os.getenv("USE_OLLAMA", "true").lower() == "true"

# Normal ranges for human-readable prompt context
NORMAL_RANGES_TEXT = {
    "battery_voltage": "24–28 V",
    "solar_panel_temp": "-20–60 °C",
    "attitude_error": "0–0.5 deg",
    "fuel_pressure": "200–220 kPa",
    "cpu_temp": "30–55 °C",
    "comm_signal_strength": "-85 to -65 dBm",
}

ROOT_CAUSE_TEMPLATE = """You are an expert spacecraft systems engineer at a mission operations center.
A telemetry anomaly has been detected on spacecraft APEX-7.

Anomaly data:
- Severity: {severity}
- Affected channels: {affected_channels}
- Current values: {channel_values}
- Normal ranges: {normal_ranges}
- Anomaly score: {anomaly_score}
- Detection time: {detected_at}

In 3-5 sentences, explain: (1) what is most likely happening physically in the spacecraft system, \
(2) what evidence from the telemetry values supports this, and (3) your confidence level \
(high/medium/low) in this root cause. Write for a non-specialist mission operator."""

MISSION_PLAN_TEMPLATE = """You are the Flight Director at a mission operations center.
A {severity} anomaly has been confirmed on spacecraft APEX-7.

Anomaly summary: {root_cause}
Current orbital parameters: Altitude {altitude} km, inclination {inclination} deg
Fuel remaining: {fuel_remaining}%
Mission objective: {mission_objective}

Write a Mission Response Plan that includes:
1. Recommended immediate action
2. Estimated fuel cost of the recommended maneuver (as % of remaining fuel)
3. Risk level if action is NOT taken (low/medium/high/critical)
4. Impact on mission success probability
5. Step-by-step execution checklist (3-5 steps)

Write as a structured narrative paragraph followed by a numbered checklist."""


def _get_llm():
    """Lazy-init LLM - tries Ollama first, falls back to Watsonx."""
    if USE_OLLAMA:
        try:
            from langchain_community.llms import Ollama
            logger.info(f"Using Ollama at {OLLAMA_BASE_URL} with model {OLLAMA_MODEL}")
            return Ollama(
                base_url=OLLAMA_BASE_URL,
                model=OLLAMA_MODEL,
                temperature=0.3,
                num_predict=450,
            )
        except Exception as exc:
            logger.warning("Ollama init failed: %s", exc)
            # Fall through to Watsonx

    # Watsonx fallback
    if not WATSONX_API_KEY or not WATSONX_PROJECT_ID:
        logger.warning("No valid LLM configuration found (Ollama failed, Watsonx credentials missing)")
        return None
    try:
        from langchain_ibm import WatsonxLLM
        logger.info(f"Using Watsonx with model {GRANITE_MODEL_ID}")
        return WatsonxLLM(
            model_id=GRANITE_MODEL_ID,
            url=WATSONX_URL,
            apikey=WATSONX_API_KEY,
            project_id=WATSONX_PROJECT_ID,
            params={
                "temperature": 0.3,
                "max_new_tokens": 450,
                "stop_sequences": [],
            },
        )
    except Exception as exc:
        logger.warning("WatsonxLLM init failed: %s", exc)
        return None


def generate_root_cause(anomaly_event) -> str:
    """Generate plain-English root cause explanation for an anomaly event."""
    llm = _get_llm()
    if llm is None:
        return _fallback_root_cause(anomaly_event)

    normal_ranges_str = "; ".join(
        f"{ch}: {NORMAL_RANGES_TEXT.get(ch, 'N/A')}"
        for ch in anomaly_event.affected_channels
    )
    channel_vals_str = "; ".join(
        f"{ch}={val}" for ch, val in anomaly_event.channel_values.items()
    )

    prompt = ROOT_CAUSE_TEMPLATE.format(
        severity=anomaly_event.severity,
        affected_channels=", ".join(anomaly_event.affected_channels),
        channel_values=channel_vals_str,
        normal_ranges=normal_ranges_str,
        anomaly_score=anomaly_event.anomaly_score,
        detected_at=str(anomaly_event.detected_at),
    )

    try:
        result = llm.invoke(prompt)
        return result.strip()
    except Exception as exc:
        logger.error("Granite root cause call failed: %s", exc)
        return _fallback_root_cause(anomaly_event)


def generate_mission_plan(anomaly_event, orbital_params: dict, mission_objective: str) -> str:
    """Generate a structured mission response plan."""
    llm = _get_llm()
    if llm is None:
        return _fallback_mission_plan(anomaly_event)

    root_cause = anomaly_event.granite_explanation or _fallback_root_cause(anomaly_event)

    prompt = MISSION_PLAN_TEMPLATE.format(
        severity=anomaly_event.severity,
        root_cause=root_cause,
        altitude=orbital_params.get("altitude_km", 550),
        inclination=orbital_params.get("inclination_deg", 51.6),
        fuel_remaining=orbital_params.get("fuel_remaining_pct", 72),
        mission_objective=mission_objective,
    )

    try:
        result = llm.invoke(prompt)
        return result.strip()
    except Exception as exc:
        logger.error("Granite mission plan call failed: %s", exc)
        return _fallback_mission_plan(anomaly_event)


# ---------------------------------------------------------------------------
# Fallback responses (when watsonx is unavailable)
# ---------------------------------------------------------------------------

FALLBACK_EXPLANATIONS = {
    "battery_voltage": (
        "The battery_voltage channel is reading below the nominal 24–28 V operating range, "
        "indicating a possible power subsystem fault. This could result from a failing battery "
        "cell, increased power draw from another subsystem, or a partial solar panel shadowing "
        "event reducing charge input. The gradual decline pattern is consistent with a cell "
        "degradation scenario rather than an instantaneous short circuit. Confidence: medium."
    ),
    "solar_panel_temp": (
        "The solar_panel_temp channel has spiked beyond the 60 °C nominal ceiling, suggesting "
        "the spacecraft has entered an off-nominal attitude that is exposing panel surfaces to "
        "direct solar flux at an elevated angle. A secondary cause could be a failure in the "
        "thermal dissipation coating. The thermal margin above the anomaly threshold indicates "
        "this is not yet a hardware damage scenario, but sustained exposure risks panel "
        "degradation. Confidence: high."
    ),
    "attitude_error": (
        "The attitude_error reading has exceeded 2.0 degrees, well above the ±0.5 deg "
        "operational envelope. This is consistent with a reaction wheel desaturation event or "
        "a thruster firings imbalance. Prolonged attitude deviation will affect antenna pointing "
        "and solar panel efficiency. Immediate attitude recovery maneuver is recommended. "
        "Confidence: high."
    ),
    "fuel_pressure": (
        "The fuel_pressure channel has dropped below the 200 kPa floor, which may indicate a "
        "small propellant leak in the feed lines or a pressure regulator malfunction. This "
        "scenario requires immediate assessment — if the pressure continues to decline, "
        "propulsion system isolation should be considered to preserve remaining fuel. "
        "Confidence: medium."
    ),
    "comm_signal_strength": (
        "The comm_signal_strength has degraded to below -100 dBm, indicating a possible "
        "antenna misalignment, ground station geometry issue, or RF hardware anomaly. The "
        "spacecraft is likely still transmitting nominally but the receive signal quality "
        "at the ground station has deteriorated. A contact window reassessment with backup "
        "antenna configuration is recommended. Confidence: medium."
    ),
    "cpu_temp": (
        "The cpu_temp channel is above 65 °C, suggesting the onboard computer is running "
        "hotter than nominal. This could be caused by an elevated computational load (e.g., "
        "an autonomous fault recovery routine running in background) or degraded thermal "
        "interface contact. If temperature continues rising past 75 °C, processor throttling "
        "will engage automatically. Confidence: high."
    ),
}

FALLBACK_PLAN = """Immediate recommendation: Initiate anomaly isolation protocol for the affected subsystem. Place spacecraft in safe mode to halt non-essential processes while the anomaly is investigated.

Estimated fuel cost: If an attitude correction maneuver is required, estimated fuel expenditure is 0.8–1.2% of remaining propellant — within acceptable margins.

Risk if not acted on: HIGH. Continued nominal operations during an unresolved anomaly risks cascading failure to dependent subsystems.

Mission success impact: Without intervention, probability of meeting primary mission objectives decreases by an estimated 15–25% within the next 12 hours.

Execution Checklist:
1. Alert the flight operations team and convene anomaly review within 30 minutes.
2. Command spacecraft to degraded-safe-mode — maintain attitude hold, suspend payload operations.
3. Downlink full telemetry history for the last 10 orbital passes for ground analysis.
4. Prepare contingency command load for subsystem power-cycling or safe-mode exit.
5. Monitor affected channel every 60 seconds and update anomaly log with trend data.

⚠️ HUMAN APPROVAL REQUIRED before executing any propulsion or mode-change commands."""


def _fallback_root_cause(anomaly_event) -> str:
    for ch in anomaly_event.affected_channels:
        if ch in FALLBACK_EXPLANATIONS:
            return FALLBACK_EXPLANATIONS[ch]
    return (
        f"An anomaly was detected on channels: {', '.join(anomaly_event.affected_channels)}. "
        f"Values are outside nominal operating ranges. Root cause analysis requires "
        f"further telemetry review. Confidence: low."
    )


def _fallback_mission_plan(anomaly_event) -> str:
    return FALLBACK_PLAN
