# Package-Level Agent Rules: servers/

This directory contains **application and infrastructure code**.

All rules from the root `AGENTS.md` and `PROJECT.md` apply.
This file adds **local clarifications**.

---

## Default Role

When working under `servers/`, the default role is:

**infra-engineer**

For request handling or orchestration logic, the role must be stated explicitly.

---

## Responsibilities

Code in this directory may:
- Wire domain logic to transport layers (HTTP, messaging)
- Handle I/O, serialization, and deserialization
- Manage configuration and runtime concerns

Code in this directory must NOT:
- Contain business rules
- Re-implement domain invariants
- Bypass domain APIs

---

## Controllers / Handlers

- Must be thin
- Must delegate immediately to application or domain services
- Must not contain conditional business logic

---

## Tests in servers/

- Prefer integration tests over unit tests
- Mock external systems only when unavoidable
- Focus on behavior, not implementation details

---

## Change Safety

- Assume servers are running in production
- Prefer backward-compatible changes
- Always consider rollout and rollback paths
