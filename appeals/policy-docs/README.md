# Payer policy documents

Drop payer-specific medical policy documents, plan SPDs, or regulatory text here, one
subfolder per payer:

```
policy-docs/
└── <payer-name>/
    └── <document>.pdf
```

`appeals-case-builder` reads these when building the argument for a case involving that
payer, and must cite them directly (e.g. `[Policy: DGA SPD p.114-115]`) rather than
paraphrasing without a citation. These documents are not case-specific PHI, so this
folder is safe to commit — but check that any document you add doesn't itself contain a
real patient's information (a generic plan SPD or medical policy typically won't).
