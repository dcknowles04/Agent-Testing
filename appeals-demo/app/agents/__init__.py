from . import coding, drafting, evidence, intake, qa, triage

PIPELINE = [intake, triage, evidence, coding, drafting, qa]
BY_NAME = {m.NAME: m for m in PIPELINE}
