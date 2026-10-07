"""Start the app: python run.py  (start.sh / start.bat set up the virtualenv first)."""
import os
import threading
import webbrowser

import uvicorn

from app import settings  # noqa: F401  (loads .env)

port = int(os.getenv("PORT", "8000"))
url = f"http://localhost:{port}"
mode = "LIVE (Claude API)" if settings.live_available() else "DEMO (canned responses - no API key)"
print(f"\n  Appeals prototype -> {url}\n  Mode: {mode} | model: {settings.MODEL}\n  Ctrl+C to stop.\n")
if os.getenv("NO_BROWSER") != "1":
    threading.Timer(1.5, lambda: webbrowser.open(url)).start()
uvicorn.run("app.main:app", host="127.0.0.1", port=port, log_level="warning")
