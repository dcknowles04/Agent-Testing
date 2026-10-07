"""Thin wrapper around the Anthropic SDK that returns validated JSON or raises LiveCallFailed.

The orchestrator catches LiveCallFailed and substitutes a canned demo response, so a missing
key, network drop, timeout, refusal or malformed output never breaks the demo.
"""
import json
import logging

import anthropic

from . import settings

log = logging.getLogger("appeals.llm")

FALLBACK_BETA = "server-side-fallback-2026-07-01"


class LiveCallFailed(Exception):
    pass


_client: anthropic.Anthropic | None = None
_fallbacks_ok = settings.SERVER_FALLBACKS


def client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(
            api_key=settings.API_KEY,
            timeout=settings.AGENT_TIMEOUT_S,
            max_retries=1,
        )
    return _client


def load_prompt(agent: str) -> str:
    # Read on every call so edits to /prompts take effect without a restart.
    return (settings.PROMPTS_DIR / f"{agent}.md").read_text()


def _create(**kwargs):
    """Call the Messages API, with server-side refusal fallbacks when enabled."""
    global _fallbacks_ok
    if _fallbacks_ok:
        try:
            return client().beta.messages.create(
                betas=[FALLBACK_BETA], fallbacks="default", **kwargs
            )
        except anthropic.BadRequestError as e:
            # If this account/model doesn't accept the fallbacks beta, stop sending it.
            log.warning("Server-side fallbacks rejected (%s); retrying without them.", e.message)
            _fallbacks_ok = False
    return client().messages.create(**kwargs)


def run_json(agent: str, user_content: str, schema: dict) -> dict:
    if not settings.live_available():
        raise LiveCallFailed("Demo mode (no API key or demo mode forced)")
    try:
        response = _create(
            model=settings.MODEL,
            max_tokens=16000,
            system=load_prompt(agent),
            messages=[{"role": "user", "content": user_content}],
            output_config={
                "effort": settings.EFFORT,
                "format": {"type": "json_schema", "schema": schema},
            },
        )
    except anthropic.APITimeoutError:
        raise LiveCallFailed(f"Timed out after {settings.AGENT_TIMEOUT_S:.0f}s")
    except anthropic.AuthenticationError:
        raise LiveCallFailed("API key rejected (401)")
    except anthropic.NotFoundError:
        raise LiveCallFailed(f"Model '{settings.MODEL}' not found - check CLAUDE_MODEL")
    except anthropic.RateLimitError:
        raise LiveCallFailed("Rate limited (429)")
    except anthropic.APIStatusError as e:
        raise LiveCallFailed(f"API error {e.status_code}: {e.message}")
    except anthropic.APIConnectionError:
        raise LiveCallFailed("Could not reach the Claude API (network)")

    if response.stop_reason == "refusal":
        raise LiveCallFailed("Model declined the request")
    if response.stop_reason == "max_tokens":
        raise LiveCallFailed("Output hit max_tokens before finishing")
    text = next((b.text for b in response.content if b.type == "text"), None)
    if not text:
        raise LiveCallFailed("Empty response")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise LiveCallFailed("Response was not valid JSON")
