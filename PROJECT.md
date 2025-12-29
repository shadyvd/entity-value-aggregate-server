# Project Mental Model

This is a backend SaaS system.

## Architecture

- DDD with Bounded Contexts
- CQRS
- Event-driven integration

## Non-Negotiables

- No business logic in controllers
- Cross-context communication via events only
- Favour clarity over cleverness

## How to Change Things

- Propose changes before implementing
- Prefer small, reversible commits
