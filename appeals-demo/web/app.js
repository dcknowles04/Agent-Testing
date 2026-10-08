// Appeals prototype frontend - plain JS, hash routing, no build step.
// Talks to the FastAPI server, or to an in-page engine (window.APPEALS_BACKEND) in the
// browser-only build produced by static-demo/build.py.
"use strict";

const $app = document.getElementById("app");
const BACKEND = window.APPEALS_BACKEND || null;

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => n == null ? "-" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

async function api(path, opts = {}) {
  if (BACKEND) return BACKEND.request(opts.method || "GET", path, opts.body);
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

// Live pipeline updates: server-sent events, or the in-page engine's subscription.
function openStream(caseId, on) {
  if (BACKEND) return { close: BACKEND.subscribe(caseId, (type, data) => on[type] && on[type](data)) };
  const es = new EventSource(`/cases/${caseId}/stream`);
  ["step", "case", "done"].forEach((t) => es.addEventListener(t, (ev) => on[t] && on[t](JSON.parse(ev.data))));
  if (on.done) es.addEventListener("done", () => es.close());
  return es;
}

// In-page confirmation (browser dialogs are unavailable in some embedded viewers).
function confirmBox(message, okLabel = "Continue") {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><p>${esc(message).replace(/\n/g, "<br>")}</p>
      <div class="actions"><button class="btn" id="modal-ok">${esc(okLabel)}</button><button class="btn btn-ghost" id="modal-cancel">Cancel</button></div></div>`;
    document.body.appendChild(wrap);
    const done = (v) => { wrap.remove(); resolve(v); };
    wrap.querySelector("#modal-ok").onclick = () => done(true);
    wrap.querySelector("#modal-cancel").onclick = () => done(false);
    wrap.onclick = (e) => { if (e.target === wrap) done(false); };
    wrap.querySelector("#modal-ok").focus();
  });
}

async function copyText(text, fallbackEl) {
  try { await navigator.clipboard.writeText(text); toast("Copied to clipboard."); }
  catch { if (fallbackEl) { fallbackEl.focus(); fallbackEl.select(); } toast("Press Cmd+C / Ctrl+C to copy the selected text."); }
}

function toast(msg, ms = 3200) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add("hidden"), ms);
}

const TYPE_LABEL = {
  prior_authorization: "Prior auth",
  medical_necessity: "Medical necessity",
  coding_billing: "Coding / billing",
  timely_filing_admin: "Timely filing / admin",
};
const typeBadge = (t) => t ? `<span class="badge b-blue">${esc(TYPE_LABEL[t] || t)}</span>` : `<span class="badge">Not triaged</span>`;
const strengthBadge = (s) => {
  const cls = { strong: "b-green", borderline: "b-yellow", weak: "b-red" }[s];
  return s ? `<span class="badge ${cls}">${esc(s)}</span>` : `<span class="muted">-</span>`;
};
const statusBadge = (s, outcome) => {
  if (s === "Closed") return outcome === "Overturned"
    ? `<span class="badge b-green">Overturned</span>` : `<span class="badge b-red">${esc(outcome || "Closed")}</span>`;
  const cls = { New: "", Running: "b-blue", "Ready for Review": "b-purple", Submitted: "b-yellow" }[s] || "";
  return `<span class="badge ${cls}">${esc(s === "Submitted" ? "Submitted · Pending" : s)}</span>`;
};
const modeBadge = (m) => {
  if (!m) return "";
  const cls = { live: "b-green", demo: "b-yellow", mixed: "b-yellow", seeded: "" }[m] || "";
  const label = { live: "LIVE AI", demo: "DEMO", mixed: "MIXED", seeded: "PRE-RUN SAMPLE" }[m] || m;
  return `<span class="badge ${cls}">${label}</span>`;
};
const deadlineCell = (c) => {
  if (!c.deadline) return `<span class="muted">-</span>`;
  if (c.urgency === "none") return `<span class="muted">${fmtDate(c.deadline)}</span>`;
  const d = c.days_remaining;
  const txt = d < 0 ? `${-d}d overdue` : `${d}d left`;
  return `<span class="dot ${c.urgency}"></span>${fmtDate(c.deadline)} <span class="muted small">(${txt})</span>`;
};
const statusLabel = { met: ["Met", "b-green"], not_met: ["Not met", "b-red"], missing_documentation: ["Missing docs", "b-yellow"] };
const critBadge = (s) => `<span class="badge ${(statusLabel[s] || ["", ""])[1]}">${esc((statusLabel[s] || [s])[0])}</span>`;
const sevBadge = (s) => `<span class="badge ${{ high: "b-red", medium: "b-yellow", low: "" }[s] || ""}">${esc(s)}</span>`;

// ---------------------------------------------------------------- mode badge
let MODE = null;
async function refreshMode() {
  MODE = await api("/status");
  const b = document.getElementById("mode-badge");
  b.className = "mode-badge " + MODE.mode;
  b.textContent = MODE.mode === "live" ? `● LIVE · ${MODE.model}`
    : MODE.browser_only ? "● DEMO · browser version"
    : (MODE.has_key ? "● DEMO MODE (forced)" : "● DEMO MODE · no API key");
}
document.getElementById("mode-badge").onclick = async () => {
  if (MODE.browser_only) return toast("This browser version uses pre-written agent responses. Live AI runs in the full local app.", 5000);
  if (!MODE.has_key) return toast("No ANTHROPIC_API_KEY in .env - running on canned demo responses.");
  await api("/settings/mode", { method: "POST", body: { force_demo: MODE.mode === "live" } });
  await refreshMode();
  toast(MODE.mode === "live" ? "Live mode: agents call the Claude API." : "Demo mode: agents use canned responses.");
};
document.getElementById("reset-btn").onclick = async () => {
  if (!(await confirmBox("Reset the demo? This restores the 5 sample cases and deletes any cases you created.", "Reset demo"))) return;
  await api("/demo/reset", { method: "POST" });
  toast("Demo data restored.");
  if (currentPath() === "#/dashboard") route(); else navigate("#/dashboard");
};

// ---------------------------------------------------------------- router
// Routing: URL hash with the server; an in-memory path in the browser-only build.
let activeStream = null;
let memoryPath = "#/dashboard";
const currentPath = () => (BACKEND ? memoryPath : location.hash);
function navigate(path) {
  if (BACKEND) { memoryPath = path; route(); } else location.hash = path;
}
if (BACKEND) {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (a) { e.preventDefault(); navigate(a.getAttribute("href")); }
  });
}
function route() {
  if (activeStream) { activeStream.close(); activeStream = null; }
  const parts = (currentPath().replace(/^#\/?/, "") || "dashboard").split("/");
  document.querySelectorAll("nav a").forEach((a) =>
    a.classList.toggle("active", a.dataset.nav === parts[0] || (parts[0] === "case" && a.dataset.nav === "queue")));
  const views = { dashboard: viewDashboard, queue: viewQueue, new: viewNew, case: viewCase, review: viewReview, business: viewBusiness };
  const fn = views[parts[0]] || viewDashboard;
  Promise.resolve(fn(...parts.slice(1))).catch((e) => {
    $app.innerHTML = `<div class="card"><h2>Something went wrong</h2><p>${esc(e.message)}</p></div>`;
  });
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

// ---------------------------------------------------------------- 1. dashboard
async function viewDashboard() {
  const [m, cases] = await Promise.all([api("/metrics"), api("/cases")]);
  const d = m.dashboard;
  const plan = d.plan;
  const pct = plan.limit ? Math.min(100, (100 * plan.used) / plan.limit) : 100;
  const review = cases.filter((c) => c.status === "Ready for Review");
  const fresh = cases.filter((c) => c.status === "New");
  const typeMax = Math.max(1, ...Object.values(d.by_type));
  $app.innerHTML = `
    <div class="page-head">
      <div><h1>Practice dashboard</h1><div class="muted">${esc(m.practice.name)} · ${m.practice.surgeons} surgeons (fictional)</div></div>
      <a class="btn" href="#/new">+ New denial</a>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="label">Open denials</div><div class="value">${d.open_denials}</div><div class="sub">${d.awaiting_review} awaiting staff review · ${d.pending_outcome} pending payer</div></div>
      <div class="kpi"><div class="label">Dollars at stake</div><div class="value">${money(d.dollars_at_stake)}</div><div class="sub">across open denials</div></div>
      <div class="kpi ${d.deadlines_next_14_days ? "alert" : ""}"><div class="label">Deadlines ≤ 14 days</div><div class="value">${d.deadlines_next_14_days}</div><div class="sub">appeals not yet submitted</div></div>
      <div class="kpi"><div class="label">Overturn rate</div><div class="value">${d.overturn_rate}%</div><div class="sub">last 90 days · ${money(d.dollars_recovered)} recovered</div></div>
      <div class="kpi"><div class="label">Staff hours saved</div><div class="value">${Math.round(d.staff_hours_saved)}</div><div class="sub">est., last 90 days</div></div>
      <div class="kpi"><div class="label">Plan usage (${esc(plan.tier)})</div>
        <div class="value">${plan.used}<span class="muted" style="font-size:15px"> of ${plan.limit ?? "∞"}</span></div>
        <div class="sub">appeals used this month</div><div class="bar"><span style="width:${pct}%"></span></div></div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <h2>Due in the next 14 days</h2>
        ${d.due_soon.length ? `<table><tbody>${d.due_soon.map((c) => `
          <tr class="clickable" data-href="#/case/${c.id}"><td><span class="dot red"></span><b>${esc(c.patient_name || "")}</b><div class="muted small">${esc(c.title)}</div></td>
          <td>${statusBadge(c.status)}</td><td class="num"><b>${c.days_remaining}d</b><div class="muted small">${fmtDate(c.deadline)}</div></td></tr>`).join("")}</tbody></table>`
          : `<p class="muted">Nothing due in the next 14 days.</p>`}
      </div>
      <div class="card">
        <h2>Work queue</h2>
        ${[...fresh, ...review].length ? `<table><tbody>${[...fresh, ...review].map((c) => `
          <tr class="clickable" data-href="#/case/${c.id}"><td><b>${esc(c.patient_name || "-")}</b><div class="muted small">${esc(c.title)}</div></td>
          <td>${statusBadge(c.status)}</td><td class="num">${money(c.amount_at_stake)}</td></tr>`).join("")}</tbody></table>`
          : `<p class="muted">Queue is clear.</p>`}
        <h3>Open denials by type</h3>
        ${Object.entries(d.by_type).map(([t, n]) => `
          <div class="hbar"><div class="lbl">${TYPE_LABEL[t]}</div><div class="track"><div class="fill" style="width:${(100 * n) / typeMax}%"></div></div><div class="val">${n}</div></div>`).join("")}
        <p class="muted small">Untriaged (new) cases are not counted by type until the pipeline runs.</p>
      </div>
    </div>`;
  bindRowLinks();
}

function bindRowLinks() {
  $app.querySelectorAll("[data-href]").forEach((el) => (el.onclick = () => navigate(el.dataset.href)));
}

// ---------------------------------------------------------------- 2. queue
const queueFilters = { type: "", status: "open", urgency: "" };
async function viewQueue() {
  const cases = await api("/cases");
  const render = () => {
    const rows = cases.filter((c) => {
      if (queueFilters.type && c.denial_type !== queueFilters.type) return false;
      if (queueFilters.status === "open" && c.status === "Closed") return false;
      if (queueFilters.status && queueFilters.status !== "open" && c.status !== queueFilters.status) return false;
      if (queueFilters.urgency && c.urgency !== queueFilters.urgency) return false;
      return true;
    });
    $app.innerHTML = `
      <div class="page-head"><div><h1>Case queue</h1><div class="muted">${rows.length} of ${cases.length} cases</div></div>
        <a class="btn" href="#/new">+ New denial</a></div>
      <div class="filters">
        <select id="f-type"><option value="">All denial types</option>${Object.entries(TYPE_LABEL).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
        <select id="f-status">
          <option value="open">Open (not closed)</option><option value="">All statuses</option>
          ${["New", "Running", "Ready for Review", "Submitted", "Closed"].map((s) => `<option>${s}</option>`).join("")}
        </select>
        <select id="f-urg"><option value="">Any deadline</option><option value="red">🔴 ≤ 14 days</option><option value="yellow">🟡 15-30 days</option><option value="green">🟢 &gt; 30 days</option></select>
      </div>
      <div class="card" style="padding:0">
        <table>
          <thead><tr><th>#</th><th>Patient / case</th><th>Payer</th><th>Denial type</th><th>Strength</th><th class="num">At stake</th><th>Appeal deadline</th><th>Status</th></tr></thead>
          <tbody>${rows.map((c) => `
            <tr class="clickable" data-href="#/case/${c.id}">
              <td class="muted">${c.id}</td>
              <td><b>${esc(c.patient_name || "-")}</b><div class="muted small">${esc(c.title)}</div></td>
              <td>${esc(c.payer || "-")}</td>
              <td>${typeBadge(c.denial_type)}</td>
              <td>${strengthBadge(c.strength)}</td>
              <td class="num">${money(c.amount_at_stake)}</td>
              <td>${deadlineCell(c)}</td>
              <td>${statusBadge(c.status, c.outcome)}</td>
            </tr>`).join("") || `<tr><td colspan="8" class="muted">No cases match these filters.</td></tr>`}
          </tbody>
        </table>
      </div>`;
    document.getElementById("f-type").value = queueFilters.type;
    document.getElementById("f-status").value = queueFilters.status;
    document.getElementById("f-urg").value = queueFilters.urgency;
    document.getElementById("f-type").onchange = (e) => { queueFilters.type = e.target.value; render(); };
    document.getElementById("f-status").onchange = (e) => { queueFilters.status = e.target.value; render(); };
    document.getElementById("f-urg").onchange = (e) => { queueFilters.urgency = e.target.value; render(); };
    bindRowLinks();
  };
  render();
}

// ---------------------------------------------------------------- 3. new case
const DOCS = [
  ["denial_letter", "Denial letter / EOB", "Required"],
  ["clinical_notes", "Clinical notes", "Op notes, imaging reports, PT / conservative treatment history"],
  ["claim_data", "Claim data", "CPT / ICD codes, dates of service, billed amount"],
  ["payer_policy", "Payer coverage policy", "The payer's policy for this procedure"],
];
const DOC_LABEL = Object.fromEntries(DOCS.map(([k, label]) => [k, label]));

// Guess a document's type from its file name, then its content. Staff can change it.
function guessDocType(name, text) {
  const n = (name || "").toLowerCase();
  if (/denial|eob|remit|adverse|notice|determination/.test(n)) return "denial_letter";
  if (/polic|coverage|guideline|manual|criteria/.test(n)) return "payer_policy";
  if (/claim|cms|1500|837|billing|charges|ub04/.test(n)) return "claim_data";
  if (/note|clinic|op[-_ ]?report|operative|imaging|mri|x-?ray|radiolog|therapy|pt[-_ ]|consult|patholog/.test(n)) return "clinical_notes";
  const t = (text || "").slice(0, 4000).toLowerCase();
  if (/medical policy|reimbursement policy|clinical guideline|provider manual|considered medically necessary when|criterion 1/.test(t)) return "payer_policy";
  if (/appeal rights|right to appeal|adverse determination|explanation of benefits|remittance|carc|denied|not approved/.test(t)) return "denial_letter";
  if (/cms-1500|claim summary|request summary|est\. charge|total billed|icd-10 pointers/.test(t)) return "claim_data";
  return "clinical_notes";
}

async function viewNew() {
  const samples = await api("/samples");
  let sample = null; // {key, date_ctx} when loaded from a sample and unedited
  let files = [];    // {id, name, type, text, typeSetByUser, open}
  let nextId = 1;

  $app.innerHTML = `
    <div class="page-head"><div><h1>New denial</h1><div class="muted">Add the denial letter / EOB, clinical notes, claim data and payer policy, or load a sample case.</div></div></div>
    <div class="card" style="margin-bottom:16px">
      <div class="filters" style="margin:0">
        <b>Load sample case:</b>
        <select id="sample-select">${samples.map((s) => `<option value="${s.key}">${esc(s.label)}</option>`).join("")}</select>
        <button class="btn btn-ghost" id="load-sample">Load sample case</button>
        <span id="sample-note" class="muted small"></span>
      </div>
    </div>
    <div class="card">
      <div class="doc-box"><label class="field" for="title">Case title</label>
        <input type="text" id="title" style="width:100%" placeholder="e.g. Total knee arthroplasty - prior auth denied"></div>
      <label class="field">Case documents</label>
      <div class="dropzone" id="dropzone">
        <div><b>Drag files here</b> <span class="muted">or</span>
          <label class="btn btn-ghost btn-sm" for="file-input">Choose files</label>
          <input type="file" id="file-input" multiple accept=".txt,.md,.text,text/plain" class="visually-hidden">
          <span class="muted">or</span> <button class="btn btn-ghost btn-sm" id="paste-btn" type="button">Paste text</button></div>
        <div class="muted small">Add as many files as you need. Each one is sorted by type automatically; change the type if it's wrong. Plain-text files only in this prototype.</div>
      </div>
      <div id="coverage" class="coverage"></div>
      <div id="file-list" class="file-list"></div>
      <div class="actions">
        <button class="btn btn-lg" id="create-run">Create case &amp; run agents →</button>
        <button class="btn btn-ghost" id="create-only">Create case only</button>
      </div>
    </div>`;

  const markEdited = () => {
    if (sample) { sample = null; document.getElementById("sample-note").textContent = "Edited - demo mode will use generic template output for this case."; }
  };

  const renderFiles = () => {
    const have = new Set(files.filter((f) => f.text.trim()).map((f) => f.type));
    document.getElementById("coverage").innerHTML = DOCS.map(([k, label]) =>
      `<span class="badge ${have.has(k) ? "b-green" : k === "denial_letter" ? "b-red" : ""}">${have.has(k) ? "✓" : "○"} ${esc(label)}${k === "denial_letter" && !have.has(k) ? " (required)" : ""}</span>`).join(" ");
    document.getElementById("file-list").innerHTML = files.map((f) => `
      <div class="file-row" data-id="${f.id}">
        <div class="file-main">
          <span class="file-name">📄 ${esc(f.name)}</span>
          <span class="muted small">${f.text.split("\n").length} lines</span>
          <select class="file-type" aria-label="Document type for ${esc(f.name)}">
            ${DOCS.map(([k, label]) => `<option value="${k}" ${k === f.type ? "selected" : ""}>${esc(label)}</option>`).join("")}
          </select>
          <button class="btn btn-ghost btn-sm file-toggle" type="button">${f.open ? "Hide text" : "View / edit"}</button>
          <button class="btn btn-ghost btn-sm file-remove" type="button" aria-label="Remove ${esc(f.name)}">Remove</button>
        </div>
        ${f.open ? `<textarea class="file-text" rows="10" placeholder="Paste document text here">${esc(f.text)}</textarea>` : ""}
      </div>`).join("") || `<p class="muted small" style="margin:8px 0 0">No documents added yet.</p>`;

    $app.querySelectorAll(".file-row").forEach((row) => {
      const f = files.find((x) => x.id === Number(row.dataset.id));
      row.querySelector(".file-type").onchange = (e) => { f.type = e.target.value; f.typeSetByUser = true; markEdited(); renderFiles(); };
      row.querySelector(".file-toggle").onclick = () => { f.open = !f.open; renderFiles(); };
      row.querySelector(".file-remove").onclick = () => { files = files.filter((x) => x !== f); markEdited(); renderFiles(); };
      const ta = row.querySelector(".file-text");
      if (ta) {
        ta.oninput = () => { f.text = ta.value; markEdited(); };
        ta.onchange = () => { if (!f.typeSetByUser) f.type = guessDocType(f.name, f.text); renderFiles(); };
      }
    });
  };

  const addFiles = (list) => {
    const rejected = [];
    const reads = [...list].map((file) => new Promise((resolve) => {
      if (!/\.(txt|md|text)$/i.test(file.name) && file.type !== "text/plain") { rejected.push(file.name); return resolve(); }
      const r = new FileReader();
      r.onload = () => {
        files.push({ id: nextId++, name: file.name, type: guessDocType(file.name, r.result), text: String(r.result), typeSetByUser: false, open: false });
        resolve();
      };
      r.onerror = () => { rejected.push(file.name); resolve(); };
      r.readAsText(file);
    }));
    Promise.all(reads).then(() => {
      markEdited();
      renderFiles();
      if (rejected.length) toast(`Skipped ${rejected.join(", ")}: this prototype reads plain-text (.txt) files only. Paste the text instead.`, 5000);
    });
  };

  const input = document.getElementById("file-input");
  input.onchange = () => { addFiles(input.files); input.value = ""; };
  const dz = document.getElementById("dropzone");
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("dragging"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("dragging"));
  dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("dragging"); addFiles(e.dataTransfer.files); });
  document.getElementById("paste-btn").onclick = () => {
    files.push({ id: nextId++, name: `Pasted text ${files.filter((f) => f.name.startsWith("Pasted")).length + 1}`, type: "clinical_notes", text: "", typeSetByUser: false, open: true });
    markEdited();
    renderFiles();
    const tas = $app.querySelectorAll(".file-text");
    tas[tas.length - 1].focus();
  };

  document.getElementById("load-sample").onclick = async () => {
    const key = document.getElementById("sample-select").value;
    const s = await api("/samples/" + key);
    files = DOCS.map(([k]) => ({ id: nextId++, name: `${k}.txt`, type: k, text: s.documents[k], typeSetByUser: true, open: false }));
    document.getElementById("title").value = s.title;
    sample = { key: s.key, date_ctx: s.date_ctx };
    renderFiles();
    document.getElementById("sample-note").textContent = "Sample loaded (fictional). You can add, remove or edit files before creating the case.";
  };

  const create = async (run) => {
    // Combine files of the same type; label each one when there are several.
    const documents = Object.fromEntries(DOCS.map(([k]) => {
      const group = files.filter((f) => f.type === k && f.text.trim());
      const text = group.length === 1 ? group[0].text
        : group.map((f) => `----- ${f.name} -----\n${f.text.trim()}`).join("\n\n");
      return [k, text];
    }));
    if (!documents.denial_letter.trim()) return toast("Add the denial letter / EOB (or mark one of your files as the denial letter).");
    const body = { title: document.getElementById("title").value, documents };
    if (sample) Object.assign(body, { sample_key: sample.key, date_ctx: sample.date_ctx });
    const c = await api("/cases", { method: "POST", body });
    if (run) await api(`/cases/${c.id}/run`, { method: "POST" });
    navigate(`#/case/${c.id}`);
  };
  document.getElementById("create-run").onclick = () => create(true).catch((e) => toast(e.message));
  document.getElementById("create-only").onclick = () => create(false).catch((e) => toast(e.message));
  renderFiles();
}

// ---------------------------------------------------------------- 4. case detail
const AGENT_ORDER = ["intake", "triage", "evidence", "coding", "drafting", "qa"];
const AGENT_ICON = { intake: "📥", triage: "🧭", evidence: "📋", coding: "🔢", drafting: "✍️", qa: "🔍" };

function pipelineHTML(c) {
  const runs = Object.fromEntries((c.runs || []).map((r) => [r.agent, r]));
  const st = (cls, icon, name, meta = "", agent = false) =>
    `<div class="stage ${cls} ${agent ? "agent" : ""}"><div class="node">${icon}</div><div class="name">${name}</div><div class="meta">${meta}</div></div>`;
  const after = {
    review: c.status === "Ready for Review" ? "running" : ["Submitted", "Closed"].includes(c.status) ? "done" : "",
    submitted: ["Submitted", "Closed"].includes(c.status) ? "done" : "",
    outcome: c.status === "Closed" ? (c.outcome === "Overturned" ? "done" : "error") : c.status === "Submitted" ? "running" : "",
  };
  return `<div class="pipeline">
    ${st("done", "⬆", "Upload", '<span class="muted">4 docs</span>')}
    ${AGENT_ORDER.map((a) => {
      const r = runs[a];
      const s = r ? r.status : "";
      const cls = s === "done" ? "done" : s === "running" ? "running" : s === "skipped" ? "skipped" : s === "error" ? "error" : "";
      const meta = s === "running" ? '<span class="badge b-blue">working…</span>'
        : s === "skipped" ? '<span class="muted">skipped</span>' : r && r.mode ? modeBadge(r.mode) : "";
      return st(cls, AGENT_ICON[a], r ? r.label : a, meta, true);
    }).join("")}
    ${st(after.review, "👤", "Staff Review", c.approved_by ? `<span class="muted">${esc(c.approved_by.replace(/\s*\(.*\)$/, ""))}</span>` : "")}
    ${st(after.submitted, "📨", "Submitted", c.submitted_at ? `<span class="muted">${fmtDate(c.submitted_at)}</span>` : "")}
    ${st(after.outcome, c.status === "Closed" ? (c.outcome === "Overturned" ? "✔" : "✖") : "⏳", "Outcome",
      c.outcome ? `<span class="badge ${c.outcome === "Overturned" ? "b-green" : c.outcome === "Upheld" ? "b-red" : "b-yellow"}">${esc(c.outcome)}</span>` : "")}
  </div>`;
}

const R = {}; // panel renderers per agent
R.intake = (o) => `
  <dl class="kv">
    <dt>Patient</dt><dd>${esc(o.patient_name)} · DOB ${esc(o.patient_dob || "-")} · Member ID ${esc(o.member_id)}</dd>
    <dt>Payer</dt><dd>${esc(o.payer_name)}</dd>
    <dt>Claim / reference #</dt><dd>${esc(o.claim_or_reference_number)}</dd>
    <dt>Provider</dt><dd>${esc(o.rendering_provider)}</dd>
    <dt>Procedure</dt><dd>${esc(o.procedure_description)}</dd>
    <dt>Date of service</dt><dd>${fmtDate(o.date_of_service)}</dd>
    <dt>Denial date</dt><dd>${fmtDate(o.denial_date)}</dd>
    <dt>Billed / at stake</dt><dd>${money(o.billed_amount)} / <b>${money(o.amount_at_stake)}</b></dd>
    <dt>Stated denial reason</dt><dd>${esc(o.stated_denial_reason)}</dd>
    <dt>Denial codes</dt><dd>${(o.denial_codes || []).map((d) => `<span class="badge">${esc(d.code)}</span> ${esc(d.description)}`).join("<br>") || "-"}</dd>
    <dt>Appeal window</dt><dd>${o.appeal_window_days ? o.appeal_window_days + " days" : "Not stated"}</dd>
    <dt>Submit appeal to</dt><dd>${esc(o.appeal_submission_method || "-")}</dd>
  </dl>
  <h3>Codes</h3>
  <table><thead><tr><th>CPT</th><th>Modifiers</th><th>Description</th></tr></thead><tbody>
    ${(o.cpt_codes || []).map((c) => `<tr><td><b>${esc(c.code)}</b></td><td>${esc((c.modifiers || []).join(", ") || "-")}</td><td>${esc(c.description)}</td></tr>`).join("")}
  </tbody></table>
  <table style="margin-top:8px"><thead><tr><th>ICD-10</th><th>Description</th></tr></thead><tbody>
    ${(o.icd10_codes || []).map((c) => `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.description)}</td></tr>`).join("")}
  </tbody></table>
  <p class="muted">${esc(o.summary)}</p>`;
R.triage = (o) => `
  <div class="grid grid-3">
    <div><div class="muted small">Denial type</div>${typeBadge(o.denial_type)}<div class="small" style="margin-top:4px">${esc(o.denial_type_rationale)}</div></div>
    <div><div class="muted small">Winnability</div>${strengthBadge(o.winnability)} <b>${o.winnability_score}/100</b></div>
    <div><div class="muted small">Appeal deadline (computed)</div><b>${fmtDate(o.deadline)}</b> · ${o.days_remaining} days left<div class="muted small">${esc(o.deadline_basis)}</div></div>
  </div>
  <div class="grid grid-2" style="margin-top:12px">
    <div><h3>Reasons for</h3><ul class="tight">${(o.reasons_for || []).map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
    <div><h3>Reasons against</h3><ul class="tight">${(o.reasons_against || []).map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
  </div>
  <h3>Recommended strategy</h3><p>${esc(o.recommended_strategy)}</p>
  <p class="muted small">Routing: ${o.denial_type === "coding_billing" || o.route_to_coding_check ? "→ Coding Check will run" : "→ Coding Check skipped"}</p>`;
R.evidence = (o) => {
  const counts = { met: 0, not_met: 0, missing_documentation: 0 };
  (o.criteria || []).forEach((c) => (counts[c.status] = (counts[c.status] || 0) + 1));
  return `
  <div class="note info">Policy: <b>${esc(o.policy_name)}</b> · <i>illustrative policy, fictional payer</i></div>
  <p>${critBadge("met")} ${counts.met} &nbsp; ${critBadge("missing_documentation")} ${counts.missing_documentation} &nbsp; ${critBadge("not_met")} ${counts.not_met}</p>
  <table><thead><tr><th style="width:30%">Criterion</th><th>Status</th><th>Evidence &amp; citation</th><th style="width:22%">Action needed</th></tr></thead><tbody>
    ${(o.criteria || []).map((c) => `<tr>
      <td>${esc(c.criterion)}</td><td>${critBadge(c.status)}</td>
      <td>${esc(c.evidence)}${c.citation && c.citation.excerpt ? `<blockquote class="cite">"${esc(c.citation.excerpt)}"<br><span class="small">— ${esc(c.citation.document)}${c.citation.section ? ", " + esc(c.citation.section) : ""}</span></blockquote>` : ""}</td>
      <td class="small">${esc(c.action_needed)}</td></tr>`).join("")}
  </tbody></table>
  <p><b>Assessment:</b> ${esc(o.overall_assessment)}</p>
  ${o.gaps && o.gaps.length ? `<h3>Gaps</h3><ul class="tight">${o.gaps.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
  <h3>Documents to attach</h3><ul class="tight">${(o.documents_to_attach || []).map((g) => `<li>${esc(g)}</li>`).join("")}</ul>`;
};
R.coding = (o) => {
  const lines = (ls) => `<table><thead><tr><th>CPT</th><th>Modifiers</th><th>ICD-10</th><th class="num">Billed</th></tr></thead><tbody>
    ${(ls || []).map((l) => `<tr><td><b>${esc(l.cpt)}</b></td><td>${esc((l.modifiers || []).join(", ") || "-")}</td><td>${esc((l.icd10 || []).join(", "))}</td><td class="num">${money(l.billed)}</td></tr>`).join("")}</tbody></table>`;
  return `
  ${(o.findings || []).map((f) => `<div class="flag ${f.severity}">${sevBadge(f.severity)} <b>${esc(f.issue)}</b><div class="small">${esc(f.explanation)}</div></div>`).join("")}
  <div class="grid grid-2" style="margin-top:8px"><div><h3>As billed</h3>${lines(o.original_lines)}</div><div><h3>Corrected</h3>${lines(o.corrected_lines)}</div></div>
  <p><b>Recommendation:</b> <span class="badge b-blue">${esc((o.recommendation || "").replace(/_/g, " "))}</span></p>
  <h3>Appeal argument</h3><p>${esc(o.appeal_argument)}</p>
  <h3>Documentation support</h3><p class="small">${esc(o.documentation_support)}</p>`;
};
R.drafting = (o) => `
  <p><b>Subject:</b> ${esc(o.subject_line)}</p>
  <h3>Key arguments</h3><ul class="tight">${(o.key_arguments || []).map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
  <h3>Draft letter (as generated)</h3><pre class="letter">${esc(o.letter_text)}</pre>`;
R.qa = (o) => `
  <p><span class="badge ${{ ready: "b-green", ready_with_edits: "b-yellow", needs_attention: "b-red" }[o.overall] || ""}">${esc((o.overall || "").replace(/_/g, " "))}</span> &nbsp; Quality score <b>${o.score}/100</b></p>
  <p>${esc(o.summary)}</p>
  <h3>Flags</h3>${(o.flags || []).map((f) => `<div class="flag ${f.severity}">${sevBadge(f.severity)} <b>${esc(f.issue)}</b><div class="small muted">Where: ${esc(f.location)}</div><div class="small">Fix: ${esc(f.suggested_fix)}</div></div>`).join("") || '<p class="muted">No flags.</p>'}
  ${o.unsupported_claims && o.unsupported_claims.length ? `<h3>Unsupported claims</h3><ul class="tight">${o.unsupported_claims.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>` : ""}
  <h3>Attachments checklist</h3>
  <table><tbody>${(o.attachments_checklist || []).map((a) => `<tr><td>${esc(a.item)}${a.required ? ' <span class="badge b-red">required</span>' : ""}</td><td class="small muted">${esc(a.source)}</td><td>${attStatus(a.status)}</td></tr>`).join("")}</tbody></table>`;
const attStatus = (s) => `<span class="badge ${{ in_file: "b-green", needs_upload: "b-red", verify: "b-yellow" }[s] || ""}">${esc((s || "").replace(/_/g, " "))}</span>`;

function panelsHTML(c, openAgent) {
  return (c.runs || []).map((r) => {
    if (r.status === "queued") return "";
    const head = `${AGENT_ICON[r.agent]} ${esc(r.label)} ${r.status === "running" ? '<span class="badge b-blue">working…</span>' : r.status === "skipped" ? '<span class="badge">skipped</span>' : modeBadge(r.mode)}`;
    let body;
    if (r.status === "skipped") body = `<p class="muted">${esc(r.note)}</p>`;
    else if (r.status === "running") body = `<p class="muted">Agent is working…</p>`;
    else {
      try { body = R[r.agent](r.output); } catch (e) { body = `<p class="muted">Could not render this output.</p>`; }
      body += r.note ? `<div class="note">${esc(r.note)}</div>` : "";
      body += `<details style="margin-top:10px"><summary class="small muted" style="cursor:pointer">Show raw JSON</summary><pre class="json">${esc(JSON.stringify(r.output, null, 2))}</pre></details>`;
    }
    return `<details class="panel" data-agent="${r.agent}" ${openAgent === r.agent ? "open" : ""}><summary>${head}</summary><div class="body">${body}</div></details>`;
  }).join("");
}

async function viewCase(id) {
  let c = await api(`/cases/${id}`);
  const openPanels = new Set();
  const render = (focusAgent) => {
    // While the pipeline runs, keep only the step that just finished expanded.
    if (focusAgent) { openPanels.clear(); openPanels.add(focusAgent); }
    else $app.querySelectorAll("details.panel[open]").forEach((d) => openPanels.add(d.dataset.agent));
    const canRun = ["New", "Ready for Review"].includes(c.status) && !c.running;
    $app.innerHTML = `
      <div class="page-head">
        <div>
          <div class="muted small"><a href="#/queue">← Case queue</a> · Case #${c.id}</div>
          <h1>${esc(c.title)}</h1>
          <div>${esc(c.patient_name || "")} ${c.payer ? "· " + esc(c.payer) : ""} ${c.amount_at_stake ? "· <b>" + money(c.amount_at_stake) + "</b> at stake" : ""}</div>
          <div style="margin-top:6px">${statusBadge(c.status, c.outcome)} ${typeBadge(c.denial_type)} ${strengthBadge(c.strength)} ${c.deadline ? `<span class="badge">${deadlineCell(c).replace(/<[^>]+>/g, "")}</span>` : ""} ${modeBadge(c.run_mode)}</div>
        </div>
        <div class="actions">
          ${canRun ? `<button class="btn ${c.status === "New" ? "btn-lg" : "btn-ghost"}" id="run-btn">${c.status === "New" ? "▶ Run agent pipeline" : "↻ Re-run agents"}</button>` : ""}
          ${c.status === "Ready for Review" ? `<a class="btn btn-lg btn-green" href="#/review/${c.id}">Staff review →</a>` : ""}
        </div>
      </div>
      <div class="card">${pipelineHTML(c)}</div>
      ${c.status === "New" ? `<div class="note info">Documents uploaded. Click <b>Run agent pipeline</b> to start the agent team.</div>` : ""}
      ${["Submitted", "Closed"].includes(c.status) ? outcomeCardHTML(c) : ""}
      <div id="panels">${panelsHTML(c, focusAgent)}</div>
      <details class="panel"><summary>📄 Uploaded documents</summary><div class="body">
        ${DOCS.map(([k, label]) => `<h3>${label}</h3><pre class="json" style="max-height:220px">${esc((c.documents || {})[k] || "(not provided)")}</pre>`).join("")}
      </div></details>`;
    openPanels.forEach((a) => { const d = $app.querySelector(`details.panel[data-agent="${a}"]`); if (d) d.open = true; });
    const rb = document.getElementById("run-btn");
    if (rb) rb.onclick = async () => {
      rb.disabled = true;
      try { await api(`/cases/${c.id}/run`, { method: "POST" }); c.running = true; c.status = "Running"; listen(); }
      catch (e) { toast(e.message); rb.disabled = false; }
    };
    bindOutcome(c, async () => { c = await api(`/cases/${id}`); render(); });
  };

  const listen = () => {
    if (activeStream) activeStream.close();
    activeStream = openStream(c.id, {
      step: (r) => {
        c.runs = AGENT_ORDER.map((a) => (a === r.agent ? r : (c.runs || []).find((x) => x.agent === a) || { agent: a, status: "queued", label: a }));
        render(r.status === "done" ? r.agent : undefined);
      },
      case: (d) => Object.assign(c, d),
      done: async () => {
        if (activeStream) { activeStream.close(); activeStream = null; }
        c = await api(`/cases/${c.id}`);
        render("qa");
        toast(`Pipeline finished (${c.run_mode === "live" ? "live AI" : c.run_mode === "mixed" ? "partly demo - see step notes" : "demo mode"}). Ready for staff review.`, 5000);
        refreshMode();
      },
    });
  };

  render();
  if (c.running || c.status === "Running") listen();
}

function outcomeCardHTML(c) {
  return `<div class="card" style="margin-top:12px">
    <h2>Payer outcome</h2>
    <p class="muted small">Submitted ${fmtDate(c.submitted_at)} by ${esc(c.approved_by || "staff")} (mock submission). Record the payer's decision when it arrives.</p>
    <div class="actions">
      <label>Amount recovered / approved $ <input type="number" id="rec-amt" value="${c.outcome === "Overturned" ? c.amount_recovered ?? c.amount_at_stake : c.amount_at_stake ?? 0}" style="width:130px"></label>
      <button class="btn btn-green" data-outcome="Overturned">Overturned ✔</button>
      <button class="btn btn-red" data-outcome="Upheld">Upheld ✖</button>
      <button class="btn btn-ghost" data-outcome="Pending">Pending ⏳</button>
      <span>Current: <b>${esc(c.outcome || "Pending")}</b>${c.outcome === "Overturned" ? ` · ${money(c.amount_recovered)} recovered` : ""}</span>
    </div></div>`;
}
function bindOutcome(c, after) {
  $app.querySelectorAll("[data-outcome]").forEach((b) => (b.onclick = async () => {
    const amt = document.getElementById("rec-amt");
    const body = { outcome: b.dataset.outcome };
    if (b.dataset.outcome === "Overturned" && amt && amt.value !== "") body.amount_recovered = Number(amt.value);
    try {
      await api(`/cases/${c.id}/outcome`, { method: "PATCH", body });
      toast(b.dataset.outcome === "Overturned" ? "Overturned! Recovery added to the practice and business totals." : `Outcome set to ${b.dataset.outcome}.`);
      after();
    } catch (e) { toast(e.message); }
  }));
}

// ---------------------------------------------------------------- 5. staff review
async function viewReview(id) {
  const c = await api(`/cases/${id}`);
  const out = Object.fromEntries((c.runs || []).filter((r) => r.output).map((r) => [r.agent, r.output]));
  const qa = out.qa || {};
  const ev = out.evidence || {};
  const atts = c.attachments || (qa.attachments_checklist || []).map((a) => ({ ...a, checked: a.status === "in_file" }));
  const locked = c.status !== "Ready for Review";
  const counts = { met: 0, not_met: 0, missing_documentation: 0 };
  (ev.criteria || []).forEach((x) => (counts[x.status] = (counts[x.status] || 0) + 1));
  $app.innerHTML = `
    <div class="page-head">
      <div><div class="muted small"><a href="#/case/${c.id}">← Case #${c.id}</a></div>
        <h1>Staff review: ${esc(c.patient_name || c.title)}</h1>
        <div>${esc(c.title)} · ${esc(c.payer || "")} · ${money(c.amount_at_stake)} · deadline ${deadlineCell(c)}</div></div>
      <div>${statusBadge(c.status, c.outcome)}</div>
    </div>
    ${locked ? `<div class="note">This case is ${esc(c.status)}; the letter is locked.</div>` : ""}
    <div class="grid" style="grid-template-columns: 1.6fr 1fr">
      <div class="card">
        <div class="page-head" style="margin:0 0 8px"><h2 style="margin:0">Appeal letter ${c.draft_edited ? '<span class="badge b-purple">edited by staff</span>' : ""}</h2>
          <span class="actions" style="margin:0"><button class="btn btn-ghost btn-sm" id="copy-letter">Copy letter</button>
          ${BACKEND ? "" : `<a class="btn btn-ghost btn-sm" href="/cases/${c.id}/letter.txt">Download .txt</a>`}</span></div>
        <textarea id="letter" rows="34" ${locked ? "readonly" : ""} style="font-family: var(--font-letter); font-size: 13.5px">${esc(c.draft_letter || "")}</textarea>
        ${locked ? "" : `<div class="actions"><button class="btn btn-ghost" id="save-draft">Save edits</button><span id="save-state" class="muted small"></span></div>`}
      </div>
      <div>
        <div class="card">
          <h2>QA review ${qa.score != null ? `<span class="muted" style="font-weight:400">· ${qa.score}/100</span>` : ""}</h2>
          <p class="small">${esc(qa.summary || "")}</p>
          ${(qa.flags || []).map((f) => `<div class="flag ${f.severity}">${sevBadge(f.severity)} <b class="small">${esc(f.issue)}</b><div class="small">Fix: ${esc(f.suggested_fix)}</div></div>`).join("")}
          ${qa.unsupported_claims && qa.unsupported_claims.length ? `<h3>Unsupported claims</h3><ul class="tight small">${qa.unsupported_claims.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="card" style="margin-top:12px">
          <h2>Attachments checklist</h2>
          <div class="checklist">${atts.map((a, i) => `
            <label><input type="checkbox" data-att="${i}" ${a.checked ? "checked" : ""} ${locked ? "disabled" : ""}>
            <span>${esc(a.item)} ${a.required ? '<span class="badge b-red">required</span>' : ""} ${attStatus(a.status)}<br><span class="muted small">${esc(a.source)}</span></span></label>`).join("") || '<p class="muted">No attachments listed.</p>'}
          </div>
        </div>
        <div class="card" style="margin-top:12px">
          <h2>Criteria checklist</h2>
          <p>${critBadge("met")} ${counts.met} &nbsp; ${critBadge("missing_documentation")} ${counts.missing_documentation} &nbsp; ${critBadge("not_met")} ${counts.not_met}</p>
          <ul class="tight small">${(ev.criteria || []).map((x) => `<li>${critBadge(x.status)} ${esc(x.criterion)}</li>`).join("")}</ul>
          <a class="small" href="#/case/${c.id}">See full evidence with citations →</a>
        </div>
        ${locked ? "" : `<div class="card" style="margin-top:12px">
          <label class="field" for="approver">Approved by</label>
          <input type="text" id="approver" value="M. Alvarez (Billing Lead)" style="width:100%">
          <div class="actions"><button class="btn btn-lg btn-green" id="approve" style="width:100%">✔ Approve &amp; Mark Submitted</button></div>
          <p class="muted small">Prototype: submission is mocked. Staff send the appeal through the payer's portal, fax or mail.</p>
        </div>`}
      </div>
    </div>`;
  document.getElementById("copy-letter").onclick = () => copyText(document.getElementById("letter").value, document.getElementById("letter"));
  if (locked) return;
  const save = async () => {
    await api(`/cases/${c.id}/draft`, { method: "PATCH", body: { draft_letter: document.getElementById("letter").value } });
    document.getElementById("save-state").textContent = "Saved " + new Date().toLocaleTimeString();
  };
  document.getElementById("save-draft").onclick = () => save().catch((e) => toast(e.message));
  document.getElementById("approve").onclick = async () => {
    $app.querySelectorAll("[data-att]").forEach((cb) => (atts[cb.dataset.att].checked = cb.checked));
    const missing = atts.filter((a) => a.required && !a.checked);
    if (missing.length && !(await confirmBox(`${missing.length} required attachment(s) not checked:\n\n- ${missing.map((m) => m.item).join("\n- ")}\n\nApprove anyway?`, "Approve anyway"))) return;
    try {
      if (document.getElementById("letter").value !== (c.draft_letter || "")) await save();
      await api(`/cases/${c.id}/approve`, { method: "POST", body: { approved_by: document.getElementById("approver").value || "Office staff", attachments: atts } });
      toast("Approved and marked Submitted.");
      navigate(`#/case/${c.id}`);
    } catch (e) { toast(e.message); }
  };
}

// ---------------------------------------------------------------- 6. outcomes & business
async function viewBusiness() {
  const [m, cases] = await Promise.all([api("/metrics"), api("/cases")]);
  const b = m.business;
  const pending = cases.filter((c) => c.status === "Submitted");
  const closed = cases.filter((c) => c.status === "Closed");
  const maxRec = Math.max(1, ...b.practices.map((p) => p.dollars_recovered));
  $app.innerHTML = `
    <div class="page-head"><div><h1>Outcomes &amp; business view</h1><div class="muted">How case outcomes roll up into practice value and our subscription revenue (hypothetical practices, fictional data).</div></div></div>

    <div class="card">
      <h2>Record outcomes</h2>
      ${pending.length ? `<table><thead><tr><th>Patient / case</th><th>Payer</th><th class="num">At stake</th><th>Submitted</th><th>Mark result</th></tr></thead><tbody>
        ${pending.map((c) => `<tr><td><a href="#/case/${c.id}"><b>${esc(c.patient_name || "")}</b></a><div class="muted small">${esc(c.title)}</div></td>
          <td>${esc(c.payer || "")}</td><td class="num">${money(c.amount_at_stake)}</td><td>${fmtDate(c.submitted_at)}</td>
          <td><button class="btn btn-green btn-sm" data-q="${c.id}" data-o="Overturned">Overturned</button>
              <button class="btn btn-red btn-sm" data-q="${c.id}" data-o="Upheld">Upheld</button></td></tr>`).join("")}
      </tbody></table>` : `<p class="muted">No submitted appeals are awaiting a payer decision.</p>`}
      ${closed.length ? `<h3>Closed in the app</h3><ul class="tight">${closed.map((c) => `<li><a href="#/case/${c.id}">${esc(c.patient_name || "")}</a>, ${esc(c.title)}: ${statusBadge(c.status, c.outcome)} ${c.outcome === "Overturned" ? money(c.amount_recovered) + " recovered" : ""}</li>`).join("")}</ul>` : ""}
    </div>

    <div class="kpis">
      <div class="kpi"><div class="label">Our MRR</div><div class="value">${money(b.mrr)}</div><div class="sub">${b.practices.length} practices</div></div>
      <div class="kpi"><div class="label">Our ARR (run-rate)</div><div class="value">${money(b.arr)}</div><div class="sub">MRR × 12</div></div>
      <div class="kpi"><div class="label">Recovered for practices</div><div class="value">${money(b.total_recovered)}</div><div class="sub">last 90 days, all practices</div></div>
      <div class="kpi"><div class="label">Staff hours saved</div><div class="value">${Math.round(b.total_hours_saved).toLocaleString()}</div><div class="sub">last 90 days, all practices</div></div>
    </div>

    <div class="card">
      <h2>Practice value (last 90 days)</h2>
      <table><thead><tr><th>Practice</th><th>Plan</th><th class="num">Fee / mo</th><th class="num">Appeals used (mo)</th><th class="num">Overturn rate</th>
        <th class="num">$ recovered</th><th class="num">Staff hours saved</th><th class="num">Value ÷ cost</th></tr></thead><tbody>
        ${b.practices.map((p) => `<tr><td><b>${esc(p.name)}</b> ${p.live ? '<span class="badge b-blue">this demo</span>' : ""}<div class="muted small">${p.surgeons} surgeons</div></td>
          <td>${esc(p.tier)}</td><td class="num">${money(p.price_per_month)}</td><td class="num">${p.appeals_used} / ${p.appeals_limit ?? "∞"}</td>
          <td class="num">${p.overturn_rate}%</td><td class="num"><b>${money(p.dollars_recovered)}</b></td>
          <td class="num">${p.staff_hours_saved} <span class="muted small">(${money(p.staff_cost_saved)})</span></td><td class="num"><b>${p.roi_multiple}×</b></td></tr>`).join("")}
      </tbody></table>
      <p class="muted small">Value ÷ cost = (dollars recovered + staff time saved at ${money(b.pricing.staff_cost_per_hour)}/hr) ÷ 3 months of subscription.
        Staff time assumes ${b.pricing.manual_minutes_per_appeal} min per appeal manually vs ${b.pricing.assisted_minutes_per_appeal} min with the agent team. Riverbend's numbers update live as you record outcomes.</p>
      <h3>Dollars recovered vs. subscription cost (90 days)</h3>
      ${b.practices.map((p) => `
        <div class="hbar"><div class="lbl">${esc(p.name)}</div><div class="track"><div class="fill" style="width:${(100 * p.dollars_recovered) / maxRec}%"></div></div><div class="val">${money(p.dollars_recovered)}</div></div>
        <div class="hbar"><div class="lbl muted small">subscription (3 mo)</div><div class="track"><div class="fill" style="width:${(100 * p.price_per_month * 3) / maxRec}%; background:var(--red)"></div></div><div class="val muted">${money(p.price_per_month * 3)}</div></div>`).join("")}
    </div>

    <div class="card" style="margin-top:16px">
      <h2>Subscription tiers <span class="muted small" style="font-weight:400">(placeholders: edit config/pricing.json)</span></h2>
      <table><thead><tr><th>Tier</th><th class="num">Appeals / month</th><th class="num">Price / month</th><th class="num">Practices on tier</th><th class="num">MRR</th></tr></thead><tbody>
        ${b.pricing.tiers.map((t) => { const n = b.practices.filter((p) => p.tier === t.name).length; return `<tr><td><b>${esc(t.name)}</b></td><td class="num">${t.appeals_per_month ?? "Unlimited"}</td><td class="num">${money(t.price_per_month)}</td><td class="num">${n}</td><td class="num">${money(n * t.price_per_month)}</td></tr>`; }).join("")}
      </tbody></table>
    </div>`;
  $app.querySelectorAll("[data-q]").forEach((btn) => (btn.onclick = async () => {
    await api(`/cases/${btn.dataset.q}/outcome`, { method: "PATCH", body: { outcome: btn.dataset.o } });
    toast(`Marked ${btn.dataset.o}.`);
    viewBusiness();
  }));
}

// ---------------------------------------------------------------- boot
refreshMode().catch(() => {});
route();
