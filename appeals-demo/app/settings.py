"""Paths, environment settings and editable config files."""
import json
import os
from pathlib import Path

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parent.parent
# Non-empty values in .env win over variables already set in the shell
# (so a blank ANTHROPIC_API_KEY= line doesn't erase a key exported in the shell).
for _k, _v in dotenv_values(ROOT / ".env").items():
    if _v:
        os.environ[_k] = _v

PROMPTS_DIR = ROOT / "prompts"
SEED_DIR = ROOT / "seed"
DEMO_DIR = ROOT / "demo_responses"
WEB_DIR = ROOT / "web"
CONFIG_DIR = ROOT / "config"
DB_PATH = Path(os.getenv("APPEALS_DB", ROOT / "data" / "appeals.db"))


def _bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
MODEL = os.getenv("CLAUDE_MODEL", "claude-opus-5-5").strip() or "claude-opus-5-5"
EFFORT = os.getenv("AGENT_EFFORT", "low").strip() or "low"
AGENT_TIMEOUT_S = float(os.getenv("AGENT_TIMEOUT_S", "90"))
SERVER_FALLBACKS = _bool("CLAUDE_SERVER_FALLBACKS", True)
DEMO_STEP_DELAY_S = float(os.getenv("DEMO_STEP_DELAY_S", "1.6"))

# Mutable at runtime from the UI toggle.
runtime = {"force_demo": _bool("FORCE_DEMO_MODE", False)}


def live_available() -> bool:
    return bool(API_KEY) and not runtime["force_demo"]


def load_json(name: str) -> dict:
    return json.loads((CONFIG_DIR / name).read_text())


def pricing() -> dict:
    return load_json("pricing.json")


def practices() -> list[dict]:
    return load_json("practices.json")["practices"]


def tier(name: str) -> dict:
    return next(t for t in pricing()["tiers"] if t["name"] == name)
