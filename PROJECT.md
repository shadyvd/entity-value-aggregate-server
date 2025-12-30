# Project Mental Model

This is a backend SaaS system built for long-term evolution and correctness.

## Architecture

- Domain-Driven Design (DDD) with explicit Bounded Contexts
- CQRS:
  - Commands mutate state
  - Queries never mutate state
- Event-driven integration between bounded contexts

### Layering Rules
- **Domain**: pure business logic and invariants
- **Application**: orchestration, command/query handling
- **Infrastructure**: databases, messaging, frameworks
- **Controllers / APIs**: I/O only, no business logic

Business rules must live in the **domain layer only**.

---

## Bounded Context Rules

- Each bounded context owns:
  - its domain model
  - its commands and events
- Cross-context interaction happens **only via events**
- No direct imports across bounded contexts

If data from another context is needed:
- consume events
- or maintain a local read model

---

## Non-Negotiables

- No business logic in controllers or infrastructure
- No cross-context imports
- No shared mutable state between contexts
- Favour clarity over cleverness
- Prefer explicit code over implicit framework magic

---

## Safety & Change Rules

- Propose changes **before** implementing
- Default to touching **no more than 2–3 files**
- Never delete code unless explicitly instructed
- Never add dependencies, schemas, or infra without approval
- If requirements are ambiguous, ask questions before coding

---

## Events & Compatibility

- Events are **public contracts**
- Do not break existing event schemas
- Prefer additive changes over breaking changes
- Version events explicitly if semantics change

---

## How to Change Things

1. Explain current understanding
2. State assumptions
3. Propose a small, incremental plan
4. Wait for confirmation
5. Implement
6. Explain how to verify the change

---

## Verification Expectations

Every change must include:
- How correctness is verified (tests, checks, or reasoning)
- What was intentionally **not** changed

If verification is not possible, say so explicitly.

---

## Guiding Principle

Optimize for:
- correctness first
- clarity second
- speed last

This system is expected to evolve for years.

## Agent Role Selection Checklist

Before starting any task, select **exactly one** agent role:

- **domain-engineer**
  - Changing business rules, invariants, or domain models
  - Adding or refining domain behavior

- **infra-engineer**
  - Databases, migrations, messaging, configuration, deployment
  - Performance, scalability, reliability concerns

- **test-engineer**
  - Writing or improving tests
  - Validating domain or infrastructure behavior

- **reviewer**
  - Evaluating existing code
  - Identifying risks, smells, or design issues

If a task appears to require multiple roles:
- Stop
- Split the work into separate steps
- Execute each step with a single role

Agents must not proceed without an explicit role declaration.
