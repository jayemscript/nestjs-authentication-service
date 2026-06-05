# nestjs-authentication-worker

## What is this?

`nestjs-authentication-worker` is a standalone authentication service designed to act as a centralized identity and access system for multiple applications.

It is not tied to a single project or domain. Instead, it provides reusable authentication capabilities that can be shared across different systems such as:

- Web applications
- Mobile applications
- Internal enterprise systems
- SaaS products
- Microservices-based architectures

---

## What problem does it solve?

In typical backend systems, authentication is often implemented separately per project, which leads to:

- duplicated login logic across applications
- inconsistent authentication rules
- difficulty maintaining security standards
- fragmented user identity across systems
- repeated implementation of OAuth providers and password auth

This service solves those issues by centralizing authentication into one reusable system.

---

## Core idea

Instead of each application managing its own authentication logic, all applications delegate authentication to this service.

It acts as a shared identity layer where:

- Users exist as a single identity
- Multiple login methods can be attached to one user (local, Google, etc.)
- Multiple applications can share the same user base while maintaining access separation
- Authentication behavior can vary per application context

---

## What it is responsible for

This service handles:

- User authentication (login and validation)
- Identity management across multiple authentication providers
- Access control per application context
- Session and token management
- Secure login flows for web and mobile clients

---

## Key concept: App-based authentication context

Each request is associated with an application context (via `appId`), allowing:

- different authentication rules per application
- different session policies for web vs mobile
- controlled access to specific applications
- shared identity across multiple systems

---

## What it is NOT

This service is NOT:

- a business logic backend (e.g. inventory, HRIS, accounting logic)
- a frontend application
- a full user management CRM system
- tightly coupled to any single application domain

It is purely an authentication and identity layer.

---

## Why it exists

The goal is to:

- centralize authentication logic
- reduce duplication across multiple backend systems
- standardize security and login flows
- enable scalable multi-application architecture
- support both monolithic and distributed deployment setups

---

## Outcome

With this service, all applications in the ecosystem can rely on a single, consistent authentication system while still maintaining flexibility in deployment and authentication behavior per application.