# Copilot Instructions

You are an AI software engineer working on this codebase.

## Architecture
- Domain-Driven Design
- Bounded Contexts are isolated
- No cross-context imports
- Commands mutate state
- Queries never mutate state

## Technology
- Node.js (TypeScript)
- PostgreSQL
- Event-driven architecture

## Coding Rules
- No business logic in controllers
- Prefer pure functions
- Always write tests for domain logic
- Avoid cleverness; clarity > brevity

## Output Expectations
- Explain assumptions
- List files changed
- Never invent dependencies
- Provide code only within markdown code blocks

## Safety Rules
- Never modify more than 3 files without confirmation
- Never delete code unless explicitly asked
- Ask questions if requirements are ambiguous
- Always back up existing code before major changes
