// In-browser stand-in for the FastAPI backend, used by the browser-only build.
// It mirrors app/seed.py, app/demo.py, app/orchestrator.py and app/metrics.py in demo mode:
// the same seed cases, canned agent responses, routing, deadline math and dashboard numbers.
// Data (seed documents, canned responses, config) is injected by build.py as window.APPEALS_DATA.
"use strict";

(function () {
  const DATA = window.APPEALS_DATA;
  const AGENTS = ["intake", "triage", "evidence", "coding", "drafting", "qa"];
  const LABELS = { intake: "Intake", triage: "Triage", evidence: "Evidence & Policy Match", coding: "Coding Check", drafting: "Draft Appeal", qa: "QA Review" };
  const DEFAULT_WINDOW = { prior_authorization: 60, medical_necessity: 60, coding_billing: 90, timely_filing_admin: 60 };
  const STEP_DELAY_MS = 1600;
  const STORE_KEY = "appeals-demo-state-v1";

  // ------------------------------------------------------------ dates & templating
  const pad = (n) => String(n).padStart(2, "0");
  const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);
  const nowIso = () => new Date().toISOString().slice(0, 19);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function dateContext(offsets) {
    const t = today();
    const ctx = {};
    for (const [k, v] of Object.entries(offsets)) ctx[k] = isoOf(addDays(t, v));
    ctx.TODAY = isoOf(t);
    return ctx;
  }
  function fmt(iso, style) {
    const d = parseIso(iso);
    if (style === "iso") return iso;
    if (style === "long") return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
  }
  function render(text, ctx) {
    return text.replace(/\{\{([A-Z0-9_]+)(?:\|(iso|long))?\}\}/g, (m, key, style) => {
      if (key === "TODAY" && !ctx.TODAY) return fmt(isoOf(today()), style);
      return ctx[key] ? fmt(ctx[key], style) : m;
    });
  }
  const sampleDocs = (key, ctx) => Object.fromEntries(Object.entries(DATA.samples[key].docs).map(([k, v]) => [k, render(v, ctx)]));

  function canned(key, agent, ctx) {
    const raw = DATA.samples[key].canned[agent];
    if (!raw) return null;
    const data = JSON.parse(render(raw, ctx));
    if (typeof data.letter_text === "string" && data.letter_text.startsWith("@")) data.letter_text = render(DATA.samples[key].letter, ctx).trim();
    return data;
  }

  // ------------------------------------------------------------ generic template output (pasted docs)
  const NOTE = "Demo-mode template output (pattern matching, not AI). The full app with an API key gives a case-specific analysis.";
  const field = (text, ...labels) => {
    for (const l of labels) {
      const m = new RegExp(l.replace(/[#]/g, "\\#") + "\\s*[:#]\\s*([^\\n|]+?)(?:\\s{2,}|\\n|\\||$)", "i").exec(text || "");
      if (m) return m[1].trim();
    }
    return "";
  };
  const firstDate = (t) => {
    const m = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b|\b(\d{4})-(\d{2})-(\d{2})\b/.exec(t || "");
    if (!m) return "";
    return m[3] ? `${m[3]}-${pad(m[1])}-${pad(m[2])}` : `${m[4]}-${m[5]}-${m[6]}`;
  };
  const sentences = (t) => (t || "").split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 25);
  const STOP = new Set(["with", "that", "least", "documented", "within", "following", "criterion", "past", "must"]);
  const words = (s) => new Set((s.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !STOP.has(w)));
  function bestMatch(crit, sents) {
    const w = words(crit); let best = "", score = 0;
    for (const s of sents) { const hits = [...words(s)].filter((x) => w.has(x)).length; if (hits > score) { best = s; score = hits; } }
    return [best.slice(0, 220), score];
  }
  function classify(t) {
    t = t.toLowerCase();
    if (["timely filing", "time limit for filing", "co-29", "filing limit", "eligib"].some((k) => t.includes(k))) return "timely_filing_admin";
    if (["bundl", "ncci", "modifier", "co-97", "included in the payment"].some((k) => t.includes(k))) return "coding_billing";
    if (["prior authorization", "prior auth", "pre-service", "precertification"].some((k) => t.includes(k))) return "prior_authorization";
    return "medical_necessity";
  }

  function generic(agent, cs, prior) {
    const d = cs.documents || {};
    const denial = d.denial_letter || "", notes = d.clinical_notes || "", claim = d.claim_data || "", policy = d.payer_policy || "";
    const all = denial + "\n" + claim;
    if (agent === "intake") {
      const seen = new Set(), cpts = [];
      for (const m of all.matchAll(/\b(\d{5})(?:-([A-Z0-9]{2}))?\b/g)) {
        if (!seen.has(m[1]) && !m[1].startsWith("0")) { seen.add(m[1]); cpts.push({ code: m[1], description: "", modifiers: m[2] ? [m[2]] : [] }); }
      }
      const icds = [...new Set(all.match(/\b[A-TV-Z]\d{2}\.[0-9A-Z]{1,4}\b/g) || [])].map((c) => ({ code: c, description: "" }));
      const amounts = [...all.matchAll(/\$\s?([\d,]+(?:\.\d{2})?)/g)].map((m) => Number(m[1].replace(/,/g, "")));
      const win = /within\s+(\d{2,3})\s+(?:calendar\s+)?days/i.exec(denial);
      let payer = denial.split("\n").map((l) => l.trim()).find((l) => /health|plan|mutual|insurance|care/i.test(l) && l.length < 60 && !l.startsWith("*")) || "";
      if (payer && payer === payer.toUpperCase()) payer = payer.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      const reason = field(denial, "Reason for denial", "Reason", "Rationale", "Reviewer comment") ||
        sentences(denial).find((s) => /denied|not medically|not met|expired|included/i.test(s)) || "";
      const max = amounts.length ? Math.max(...amounts) : 0;
      return {
        patient_name: field(all, "Patient", "Member"), patient_dob: "", member_id: field(all, "Member ID"), payer_name: payer,
        claim_or_reference_number: field(all, "Claim #", "Claim", "Reference #", "Authorization reference #"),
        rendering_provider: field(all, "Rendering", "Provider", "Requesting provider"),
        procedure_description: cpts[0] ? cpts[0].code : "", cpt_codes: cpts.slice(0, 6), icd10_codes: icds.slice(0, 6),
        date_of_service: firstDate(field(all, "Date of service", "DOS")), denial_date: firstDate(denial),
        billed_amount: max, amount_at_stake: max, stated_denial_reason: reason.slice(0, 400),
        denial_codes: [...new Set(denial.match(/\b(?:CO|PR|OA)-\d{1,3}\b/g) || [])].map((c) => ({ code: c, description: "" })),
        appeal_window_days: win ? Number(win[1]) : 0, appeal_submission_method: "", summary: NOTE,
      };
    }
    if (agent === "triage") {
      const t = classify(denial + " " + claim);
      return { denial_type: t, denial_type_rationale: "Keyword-based classification of the denial letter (demo mode).", winnability: "borderline",
        winnability_score: 50, reasons_for: ["Clinical documentation was provided for review."], reasons_against: ["Not yet assessed in detail (demo-mode template)."],
        recommended_strategy: "Review the criteria checklist and attach the supporting records before submitting.", route_to_coding_check: t === "coding_billing" };
    }
    if (agent === "evidence") {
      const lines = policy.split("\n").map((l) => l.trim().replace(/^[-*\s]+/, ""));
      let crit = lines.filter((l) => /^(criterion|indication|\d+(\.\d+)?[.)]?|[a-e]\))\s/i.test(l) && l.length > 20);
      if (!crit.length) crit = sentences(policy).slice(0, 5);
      const sents = sentences(notes);
      return {
        policy_name: (policy.trim().split("\n")[0] || "Payer policy").slice(0, 120),
        criteria: crit.slice(0, 7).map((c) => {
          const [ex, score] = bestMatch(c, sents);
          return { criterion: c.slice(0, 200), status: score >= 3 ? "met" : "missing_documentation",
            evidence: ex ? "Closest matching statement in the clinical notes (demo-mode keyword match)." : "No matching statement found.",
            citation: { document: ex ? "clinical_notes" : "none", section: "", excerpt: ex },
            action_needed: score >= 3 ? "Verify against the record." : "Locate supporting documentation." };
        }),
        overall_assessment: NOTE, documents_to_attach: ["Relevant clinical notes", "Copy of the denial letter"], gaps: [],
      };
    }
    if (agent === "coding") {
      const i = prior.intake || {};
      const ls = (i.cpt_codes || []).map((c) => ({ cpt: c.code, modifiers: c.modifiers, icd10: (i.icd10_codes || []).slice(0, 2).map((x) => x.code), billed: 0 }));
      return { findings: [{ issue: "Review modifiers and bundling edits", severity: "medium", explanation: "Check NCCI PTP edits and whether a distinct-procedure modifier (59/XS) is supported by the op note." }],
        original_lines: ls, corrected_lines: ls, recommendation: "appeal_with_argument", appeal_argument: NOTE, documentation_support: "" };
    }
    if (agent === "drafting") {
      const i = prior.intake || {}, ev = prior.evidence || {};
      const met = (ev.criteria || []).filter((c) => c.status === "met");
      const bullets = met.map((c) => `- ${c.criterion}: "${c.citation.excerpt}"`).join("\n") || "- [Summarize the supporting clinical evidence]";
      const codes = (i.cpt_codes || []).map((c) => c.code).join(", ") || "[CPT]";
      const letter = `Riverbend Orthopedic Associates
1200 Riverbend Parkway, Suite 300
Fairhaven, ST 00000

${fmt(isoOf(today()), "long")}

${i.payer_name || "[Payer]"} - Appeals Department

RE: Request for reconsideration
Patient: ${i.patient_name || "[Patient]"}    Member ID: ${i.member_id || "[Member ID]"}
Claim / reference #: ${i.claim_or_reference_number || "[Claim #]"}
Service: ${codes}    Date of service: ${i.date_of_service || "[DOS]"}

Dear Appeals Reviewer:

We request reconsideration and reversal of the denial for the service above. The payer
stated: "${i.stated_denial_reason || "[denial reason]"}"

The enclosed records show that the applicable policy criteria are met:
${bullets}

We respectfully request that the denial be overturned and the service approved for payment.

Sincerely,

[Physician signature]
Riverbend Orthopedic Associates

Enclosures:
1. Clinical notes
2. Copy of the denial letter`;
      return { subject_line: "Request for reconsideration", letter_text: letter,
        key_arguments: met.map((c) => c.criterion).slice(0, 5).concat(met.length ? [] : ["Policy criteria are met"]),
        enclosures: ["Clinical notes", "Copy of the denial letter"] };
    }
    return { overall: "ready_with_edits", score: 60,
      flags: [{ severity: "medium", issue: "Template letter generated in demo mode.", location: "Entire letter", suggested_fix: "Review and tailor the arguments." }],
      unsupported_claims: [],
      attachments_checklist: [
        { item: "Clinical notes", source: "clinical_notes", required: true, status: "in_file" },
        { item: "Copy of the denial letter", source: "denial_letter", required: false, status: "in_file" }],
      summary: NOTE };
  }

  function responseFor(agent, cs, prior) {
    if (cs.sample_key) { const d = canned(cs.sample_key, agent, cs.date_ctx || {}); if (d) return d; }
    return generic(agent, cs, prior);
  }

  // ------------------------------------------------------------ state
  let state = { nextId: 1, cases: [], runs: {} };
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const getCase = (id) => state.cases.find((c) => c.id === Number(id));
  const update = (cs, fields) => Object.assign(cs, fields, { updated_at: nowIso() });

  function createCase(documents, title, sampleKey, ctx) {
    const p = generic("intake", { documents }, {});
    const cs = { id: state.nextId++, practice_id: 1, title, status: "New", sample_key: sampleKey || null, date_ctx: ctx || null,
      documents, patient_name: p.patient_name || null, payer: p.payer_name || null, procedure: null, denial_type: null, strength: null,
      amount_at_stake: p.amount_at_stake || null, deadline: null, draft_letter: null, draft_edited: 0, attachments: null,
      approved_by: null, approved_at: null, submitted_at: null, outcome: null, amount_recovered: null, outcome_at: null,
      run_mode: null, run_count: 0, created_at: nowIso(), updated_at: nowIso() };
    state.cases.push(cs);
    state.runs[cs.id] = [];
    return cs;
  }
  function newFromSample(key) {
    const meta = DATA.samples[key].meta;
    const ctx = dateContext(meta.dates);
    return createCase(sampleDocs(key, ctx), meta.title, key, ctx);
  }
  function resetRuns(cs) {
    state.runs[cs.id] = AGENTS.map((a, i) => ({ case_id: cs.id, agent: a, seq: i, status: "queued", mode: null, output: null, note: null,
      started_at: null, finished_at: null, updated_at: Date.now(), label: LABELS[a] }));
  }
  const runOf = (cs, agent) => state.runs[cs.id].find((r) => r.agent === agent);
  function setRun(cs, agent, fields) { Object.assign(runOf(cs, agent), fields, { updated_at: Date.now() }); emit(cs.id, "step", clone(runOf(cs, agent))); }

  function computeDeadline(intake, type) {
    let win = Number(intake.appeal_window_days || 0), basis = "stated in denial letter";
    if (win <= 0) { win = DEFAULT_WINDOW[type] || 60; basis = "default window for this denial type (not stated in letter)"; }
    let denial = /^\d{4}-\d{2}-\d{2}$/.test(intake.denial_date || "") ? parseIso(intake.denial_date) : null;
    if (!denial) { denial = today(); basis += "; denial date not found, counted from today"; }
    const dl = addDays(denial, win);
    return { deadline: isoOf(dl), days_remaining: daysBetween(today(), dl), appeal_window_days: win, deadline_basis: `${isoOf(denial)} + ${win} days (${basis})` };
  }
  function shouldRunCoding(prior) {
    const t = prior.triage || {};
    if (t.denial_type === "coding_billing") return [true, ""];
    if (t.route_to_coding_check) return [true, ""];
    return [false, `Skipped - not a coding/billing denial (${t.denial_type || "unknown"})`];
  }
  function applyToCase(cs, agent, o) {
    if (agent === "intake") update(cs, { patient_name: o.patient_name || null, payer: o.payer_name || null, procedure: o.procedure_description || null, amount_at_stake: o.amount_at_stake || o.billed_amount || 0 });
    else if (agent === "triage") update(cs, { denial_type: o.denial_type, strength: o.winnability, deadline: o.deadline });
    else if (agent === "drafting") update(cs, { draft_letter: o.letter_text, draft_edited: 0 });
    else if (agent === "qa") update(cs, { attachments: (o.attachments_checklist || []).map((a) => ({ ...a, checked: a.status === "in_file" })) });
  }

  // Run synchronously (seeding) or step by step with delays (live demo).
  async function runPipeline(cs, { mode = "demo", delay = STEP_DELAY_MS } = {}) {
    resetRuns(cs);
    if (delay) { update(cs, { status: "Running", run_mode: null }); emit(cs.id, "case", { status: cs.status, run_mode: null }); }
    const prior = {};
    for (const agent of AGENTS) {
      if (agent === "coding") {
        const [need, reason] = shouldRunCoding(prior);
        if (!need) { setRun(cs, agent, { status: "skipped", note: reason, finished_at: nowIso() }); continue; }
      }
      setRun(cs, agent, { status: "running", started_at: nowIso() });
      if (delay) await new Promise((r) => setTimeout(r, delay));
      const out = responseFor(agent, cs, prior);
      if (agent === "triage") Object.assign(out, computeDeadline(prior.intake || {}, out.denial_type));
      prior[agent] = out;
      setRun(cs, agent, { status: "done", mode, output: out, finished_at: nowIso() });
      applyToCase(cs, agent, out);
      if (delay) save();
    }
    update(cs, { run_mode: mode, run_count: (cs.run_count || 0) + 1, status: delay ? "Ready for Review" : cs.status });
    save();
    emit(cs.id, "case", { status: cs.status, run_mode: cs.run_mode });
    emit(cs.id, "done", { status: cs.status });
  }

  function reset() {
    state = { nextId: 1, cases: [], runs: {} };
    for (const key of DATA.seed_order) {
      const meta = DATA.samples[key].meta, st = meta.seed_state || {};
      const cs = newFromSample(key);
      if ((st.status || "New") === "New") continue;
      runPipeline(cs, { mode: "seeded", delay: 0 });
      const f = { status: st.status };
      if (st.approved_by) { const sub = cs.date_ctx[st.submitted_offset]; Object.assign(f, { approved_by: st.approved_by, approved_at: sub, submitted_at: sub }); }
      if (st.outcome) f.outcome = st.outcome;
      if (st.outcome_offset) f.outcome_at = cs.date_ctx[st.outcome_offset];
      if ("amount_recovered" in st) f.amount_recovered = st.amount_recovered;
      update(cs, f);
    }
    save();
  }

  // ------------------------------------------------------------ metrics (mirrors app/metrics.py)
  const daysRemaining = (c) => (c.deadline ? daysBetween(today(), parseIso(c.deadline)) : null);
  function urgency(c) {
    if (c.status === "Submitted" || c.status === "Closed") return "none";
    const d = daysRemaining(c);
    if (d == null) return "unknown";
    return d <= 14 ? "red" : d <= 30 ? "yellow" : "green";
  }
  const decorate = (c) => ({ ...clone(c), days_remaining: daysRemaining(c), urgency: urgency(c) });
  const tierOf = (name) => DATA.pricing.tiers.find((t) => t.name === name);

  function practiceNumbers(p, cases) {
    const pr = DATA.pricing, tier = tierOf(p.tier), base = p.baseline;
    const mine = p.live ? cases.filter((c) => c.practice_id === p.id) : [];
    const decided = mine.filter((c) => c.outcome === "Overturned" || c.outcome === "Upheld");
    const over = decided.filter((c) => c.outcome === "Overturned");
    const processed = mine.filter((c) => (c.run_count || 0) > 0).length;
    const nD = base.decided_appeals + decided.length, nO = base.overturned_appeals + over.length;
    const recovered = base.dollars_recovered + over.reduce((s, c) => s + (c.amount_recovered || 0), 0);
    const apps = base.appeals_processed_to_date + processed;
    const hours = (apps * (pr.manual_minutes_per_appeal - pr.assisted_minutes_per_appeal)) / 60;
    const staff = hours * pr.staff_cost_per_hour, fee90 = tier.price_per_month * 3;
    return { id: p.id, name: p.name, surgeons: p.surgeons, live: !!p.live, tier: tier.name, price_per_month: tier.price_per_month,
      appeals_limit: tier.appeals_per_month, appeals_used: base.appeals_used_this_month + processed, decided: nD, overturned: nO,
      overturn_rate: nD ? Math.round((1000 * nO) / nD) / 10 : 0, dollars_recovered: recovered, appeals_processed: apps,
      staff_hours_saved: Math.round(hours * 10) / 10, staff_cost_saved: Math.round(staff),
      roi_multiple: fee90 ? Math.round(((recovered + staff) / fee90) * 10) / 10 : null };
  }
  function metrics() {
    const cases = state.cases.map(decorate);
    const per = DATA.practices.map((p) => practiceNumbers(p, cases));
    const me = per.find((p) => p.live);
    const live = cases.filter((c) => c.practice_id === me.id);
    const open = live.filter((c) => c.status !== "Closed");
    const due = open.filter((c) => c.status !== "Submitted" && c.days_remaining != null && c.days_remaining <= 14).sort((a, b) => a.days_remaining - b.days_remaining);
    const pending = live.filter((c) => c.status === "Submitted");
    const sum = (xs) => xs.reduce((s, c) => s + (c.amount_at_stake || 0), 0);
    const mrr = per.reduce((s, p) => s + p.price_per_month, 0);
    const byType = {};
    ["prior_authorization", "medical_necessity", "coding_billing", "timely_filing_admin"].forEach((t) => (byType[t] = open.filter((c) => c.denial_type === t).length));
    return {
      practice: me,
      dashboard: { open_denials: open.length, dollars_at_stake: sum(open), awaiting_review: live.filter((c) => c.status === "Ready for Review").length,
        pending_outcome: pending.length, pending_dollars: sum(pending), deadlines_next_14_days: due.length,
        due_soon: due.map((c) => ({ id: c.id, title: c.title, patient_name: c.patient_name, deadline: c.deadline, days_remaining: c.days_remaining, status: c.status })),
        overturn_rate: me.overturn_rate, dollars_recovered: me.dollars_recovered, staff_hours_saved: me.staff_hours_saved,
        plan: { tier: me.tier, used: me.appeals_used, limit: me.appeals_limit }, by_type: byType },
      business: { practices: per, mrr, arr: mrr * 12, total_recovered: per.reduce((s, p) => s + p.dollars_recovered, 0),
        total_hours_saved: Math.round(per.reduce((s, p) => s + p.staff_hours_saved, 0) * 10) / 10, pricing: DATA.pricing },
    };
  }

  // ------------------------------------------------------------ subscriptions (stand-in for SSE)
  const subs = {};
  function emit(id, type, data) { (subs[id] || new Set()).forEach((fn) => fn(type, data)); }
  function subscribe(id, fn) {
    id = Number(id);
    (subs[id] = subs[id] || new Set()).add(fn);
    const cs = getCase(id);
    // Replay current state, like the server stream does on connect.
    setTimeout(() => {
      (state.runs[id] || []).forEach((r) => fn("step", clone(r)));
      if (cs && cs.status !== "Running") fn("done", { status: cs.status });
    }, 0);
    return () => subs[id] && subs[id].delete(fn);
  }

  // ------------------------------------------------------------ request router (mirrors app/main.py)
  const fail = (msg) => { throw new Error(msg); };
  const full = (cs) => ({ ...decorate(cs), runs: clone(state.runs[cs.id] || []), running: cs.status === "Running" });

  async function request(method, path, body) {
    await new Promise((r) => setTimeout(r, 30));
    let m;
    if (method === "GET" && path === "/status") return { mode: "demo", browser_only: true, has_key: false, force_demo: false, model: "-", effort: "-" };
    if (method === "GET" && path === "/metrics") return metrics();
    if (method === "GET" && path === "/samples") return DATA.seed_order.map((k) => ({ key: k, label: DATA.samples[k].meta.label, title: DATA.samples[k].meta.title }));
    if (method === "GET" && (m = path.match(/^\/samples\/(\w+)$/))) {
      const s = DATA.samples[m[1]] || fail("Unknown sample");
      const ctx = dateContext(s.meta.dates);
      return { key: m[1], title: s.meta.title, date_ctx: ctx, documents: sampleDocs(m[1], ctx) };
    }
    if (method === "POST" && path === "/demo/reset") { reset(); return { reset: true, cases: state.cases.length }; }
    if (method === "GET" && path === "/cases") return state.cases.map((c) => { const d = decorate(c); delete d.documents; delete d.draft_letter; return d; });
    if (method === "POST" && path === "/cases") {
      if (body.sample_key && !DATA.samples[body.sample_key]) fail("Unknown sample_key");
      const docs = Object.assign({ denial_letter: "", clinical_notes: "", claim_data: "", payer_policy: "" }, body.documents || {});
      if (!docs.denial_letter.trim()) fail("A denial letter / EOB is required");
      const cs = createCase(docs, (body.title || "").trim() || "New denial", body.sample_key, body.sample_key ? body.date_ctx : null);
      save();
      return full(cs);
    }
    if (!(m = path.match(/^\/cases\/(\d+)(\/\w+)?$/))) fail("Not found");
    const cs = getCase(m[1]) || fail("Case not found");
    const action = m[2] || "";
    if (method === "GET" && !action) return full(cs);
    if (method === "POST" && action === "/run") {
      if (cs.status === "Submitted" || cs.status === "Closed") fail(`Case is already ${cs.status}`);
      if (cs.status === "Running") fail("Pipeline already running");
      update(cs, { status: "Running" });
      resetRuns(cs);
      runPipeline(cs);
      return { started: true, case_id: cs.id };
    }
    if (method === "PATCH" && action === "/draft") {
      if (cs.status === "Submitted" || cs.status === "Closed") fail("Draft is locked after submission");
      update(cs, { draft_letter: body.draft_letter, draft_edited: 1 }); save(); return full(cs);
    }
    if (method === "POST" && action === "/approve") {
      if (cs.status !== "Ready for Review") fail(`Only cases in 'Ready for Review' can be approved (status: ${cs.status})`);
      const f = { status: "Submitted", outcome: "Pending", approved_by: body.approved_by || "Office staff", approved_at: nowIso(), submitted_at: nowIso() };
      if (body.attachments) f.attachments = body.attachments;
      update(cs, f); save(); return full(cs);
    }
    if (method === "PATCH" && action === "/outcome") {
      if (!["Overturned", "Upheld", "Pending"].includes(body.outcome)) fail("outcome must be Overturned, Upheld or Pending");
      if (cs.status !== "Submitted" && cs.status !== "Closed") fail("Approve and submit the appeal before recording an outcome");
      if (body.outcome === "Pending") update(cs, { outcome: "Pending", status: "Submitted", outcome_at: null, amount_recovered: null });
      else {
        let rec = body.amount_recovered;
        if (rec == null) rec = body.outcome === "Overturned" ? cs.amount_at_stake || 0 : 0;
        update(cs, { outcome: body.outcome, status: "Closed", outcome_at: nowIso(), amount_recovered: body.outcome === "Overturned" ? rec : 0 });
      }
      save(); return full(cs);
    }
    fail("Not found");
  }

  // ------------------------------------------------------------ boot
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved && saved.cases && saved.cases.length) {
      state = saved;
      // A run interrupted by a page reload can't resume; mark it finished on canned data.
      state.cases.filter((c) => c.status === "Running").forEach((c) => runPipeline(c, { delay: 0 }) && update(c, { status: "Ready for Review" }));
    } else reset();
  } catch (e) { reset(); }

  window.APPEALS_BACKEND = { request, subscribe };
})();
