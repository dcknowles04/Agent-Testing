"""SQLite storage. Plain sqlite3, one short-lived connection per operation."""
import json
import sqlite3
import threading
import time
from datetime import datetime

from . import settings

_lock = threading.RLock()

AGENTS = ["intake", "triage", "evidence", "coding", "drafting", "qa"]

SCHEMA = """
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practice_id INTEGER NOT NULL DEFAULT 1,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    sample_key TEXT,
    date_ctx TEXT,
    documents TEXT NOT NULL,
    patient_name TEXT,
    payer TEXT,
    procedure TEXT,
    denial_type TEXT,
    strength TEXT,
    amount_at_stake REAL,
    deadline TEXT,
    draft_letter TEXT,
    draft_edited INTEGER DEFAULT 0,
    attachments TEXT,
    approved_by TEXT,
    approved_at TEXT,
    submitted_at TEXT,
    outcome TEXT,
    amount_recovered REAL,
    outcome_at TEXT,
    run_mode TEXT,
    run_count INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
);
CREATE TABLE IF NOT EXISTS agent_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    agent TEXT NOT NULL,
    seq INTEGER NOT NULL,
    status TEXT NOT NULL,
    mode TEXT,
    output TEXT,
    note TEXT,
    started_at TEXT,
    finished_at TEXT,
    updated_at REAL
);
"""

JSON_COLS = {"date_ctx", "documents", "attachments"}


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    settings.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init() -> None:
    with _lock, connect() as conn:
        conn.executescript(SCHEMA)


def wipe() -> None:
    with _lock, connect() as conn:
        conn.executescript("DROP TABLE IF EXISTS cases; DROP TABLE IF EXISTS agent_runs;")
        conn.executescript(SCHEMA)


def _case_row(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None
    d = dict(row)
    for col in JSON_COLS:
        d[col] = json.loads(d[col]) if d.get(col) else None
    return d


def create_case(**fields) -> int:
    fields.setdefault("created_at", now_iso())
    fields["updated_at"] = now_iso()
    for col in JSON_COLS & fields.keys():
        fields[col] = json.dumps(fields[col])
    cols = ", ".join(fields)
    marks = ", ".join("?" for _ in fields)
    with _lock, connect() as conn:
        cur = conn.execute(f"INSERT INTO cases ({cols}) VALUES ({marks})", list(fields.values()))
        return cur.lastrowid


def update_case(case_id: int, **fields) -> None:
    fields["updated_at"] = now_iso()
    for col in JSON_COLS & fields.keys():
        fields[col] = json.dumps(fields[col])
    sets = ", ".join(f"{k} = ?" for k in fields)
    with _lock, connect() as conn:
        conn.execute(f"UPDATE cases SET {sets} WHERE id = ?", [*fields.values(), case_id])


def get_case(case_id: int) -> dict | None:
    with _lock, connect() as conn:
        return _case_row(conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone())


def list_cases() -> list[dict]:
    with _lock, connect() as conn:
        rows = conn.execute("SELECT * FROM cases ORDER BY id").fetchall()
    return [_case_row(r) for r in rows]


def reset_runs(case_id: int) -> None:
    """Replace a case's agent runs with a fresh 'queued' row per agent."""
    with _lock, connect() as conn:
        conn.execute("DELETE FROM agent_runs WHERE case_id = ?", (case_id,))
        for seq, agent in enumerate(AGENTS):
            conn.execute(
                "INSERT INTO agent_runs (case_id, agent, seq, status, updated_at) VALUES (?, ?, ?, 'queued', ?)",
                (case_id, agent, seq, time.time()),
            )


def update_run(case_id: int, agent: str, **fields) -> None:
    if "output" in fields and fields["output"] is not None:
        fields["output"] = json.dumps(fields["output"])
    fields["updated_at"] = time.time()
    sets = ", ".join(f"{k} = ?" for k in fields)
    with _lock, connect() as conn:
        conn.execute(
            f"UPDATE agent_runs SET {sets} WHERE case_id = ? AND agent = ?",
            [*fields.values(), case_id, agent],
        )


def get_runs(case_id: int) -> list[dict]:
    with _lock, connect() as conn:
        rows = conn.execute(
            "SELECT * FROM agent_runs WHERE case_id = ? ORDER BY seq", (case_id,)
        ).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["output"] = json.loads(d["output"]) if d["output"] else None
        out.append(d)
    return out


def outputs(case_id: int) -> dict:
    """{agent: output} for finished agents."""
    return {r["agent"]: r["output"] for r in get_runs(case_id) if r["status"] == "done"}
