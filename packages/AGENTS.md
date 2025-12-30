# Package-Level Agent Rules: packages/

This directory contains **domain-centric packages**.

All rules from the root `AGENTS.md` and `PROJECT.md` apply.
This file adds **stricter local constraints**.

---

## Default Role

When working under `packages/`, the default role is:

**domain-engineer**

If another role is intended, it must be stated explicitly.

---

## Additional Local Rules

- Domain code must be:
  - deterministic
  - framework-agnostic
  - side-effect free
- No direct dependency on:
  - HTTP frameworks
  - databases
  - message brokers
- Time, randomness, and I/O must be abstracted

---

## Tests in packages/

- Prefer unit and property-based tests
- Avoid integration tests that require external services
- Test domain invariants directly

---

## Common Mistakes to Avoid

- Introducing application workflows into domain code
- Leaking infrastructure concerns into entities or services
- Over-abstracting simple domain rules

If unsure whether logic belongs here, it probably does **not**.
