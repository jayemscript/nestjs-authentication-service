# NestJS Authentication Worker - MVP File Structure

```
nestjs-authentication-worker/
│
├── src/
│   ├── common/
│   │   ├── constants/
│   │   │   ├── auth.constants.ts          # Token expiry, cookie names, etc.
│   │   │   ├── messages.constants.ts      # Error/success messages
│   │   │   └── regex.constants.ts         # Validation patterns
│   │   │
│   │   ├── enums/
│   │   │   ├── user-status.enum.ts        # active, deactivated, locked
│   │   │   ├── session-status.enum.ts     # active, revoked
│   │   │   └── device-type.enum.ts        # web, mobile
│   │   │
│   │   ├── dtos/
│   │   │   ├── auth-response.dto.ts       # Standard auth response format
│   │   │   ├── error-response.dto.ts      # Standard error format
│   │   │   ├── pagination.dto.ts          # Shared pagination
│   │   │   └── session-device.dto.ts      # Device info structure
│   │   │
│   │   ├── utils/
│   │   │   ├── hash.util.ts               # Password hashing (bcrypt)
│   │   │   ├── jwt.util.ts                # JWT generation/validation
│   │   │   ├── validators.util.ts         # Email, username, password validators
│   │   │   ├── device-fingerprint.util.ts # Device detection from request
│   │   │   └── cookie.util.ts             # Cookie generation helpers
│   │   │
│   │   ├── guards/
│   │   │   ├── auth.guard.ts              # Verify access token
│   │   │   ├── refresh.guard.ts           # Verify refresh token
│   │   │   ├── app-id.guard.ts            # Verify appId context
│   │   │   └── optional-auth.guard.ts     # Optional authentication
│   │   │
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts     # Request/response logging
│   │   │   ├── error.interceptor.ts       # Global error handling
│   │   │   └── transform.interceptor.ts   # Response transformation
│   │   │
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # Global exception handling
│   │   │
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts  # Extract user from request
│   │   │   ├── current-session.decorator.ts # Extract session from request
│   │   │   ├── app-id.decorator.ts        # Extract appId from request
│   │   │   └── public.decorator.ts        # Mark routes as public
│   │   │
│   │   └── types/
│   │       ├── request.types.ts           # Extended Express Request types
│   │       └── jwt-payload.types.ts       # JWT payload structure
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts         # Login, register, refresh, logout
│   │   │   ├── auth.service.ts            # Core auth logic
│   │   │   ├── dtos/
│   │   │   │   ├── login.dto.ts           # Email/username + password
│   │   │   │   ├── register.dto.ts        # Registration input
│   │   │   │   ├── refresh-token.dto.ts   # Refresh token request
│   │   │   │   └── logout.dto.ts          # Logout request
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.controller.ts        # Get profile, deactivate, etc.
│   │   │   ├── users.service.ts           # User management logic
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts         # User database model
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.ts     # Data access layer
│   │   │   ├── dtos/
│   │   │   │   ├── user-profile.dto.ts    # User response
│   │   │   │   ├── update-user.dto.ts     # Update user
│   │   │   │   └── deactivate-user.dto.ts # Deactivation request
│   │   │   └── users.module.ts
│   │   │
│   │   ├── sessions/
│   │   │   ├── sessions.controller.ts     # Get sessions, revoke session
│   │   │   ├── sessions.service.ts        # Session management logic
│   │   │   ├── entities/
│   │   │   │   └── session.entity.ts      # Session database model
│   │   │   ├── repositories/
│   │   │   │   └── session.repository.ts  # Data access layer
│   │   │   ├── dtos/
│   │   │   │   ├── session.dto.ts         # Session response
│   │   │   │   └── revoke-session.dto.ts  # Revocation request
│   │   │   └── sessions.module.ts
│   │   │
│   │   └── password-reset/
│   │       ├── password-reset.controller.ts    # Request reset, confirm reset
│   │       ├── password-reset.service.ts       # Password reset logic
│   │       ├── entities/
│   │       │   └── password-reset.entity.ts    # Reset token storage
│   │       ├── repositories/
│   │       │   └── password-reset.repository.ts
│   │       ├── dtos/
│   │       │   ├── request-reset.dto.ts        # Email/username input
│   │       │   └── confirm-reset.dto.ts        # Token + new password
│   │       └── password-reset.module.ts
│   │
│   ├── database/
│   │   ├── config/
│   │   │   └── typeorm.config.ts          # Database connection config
│   │   ├── migrations/
│   │   │   ├── 1_create_users_table.ts
│   │   │   ├── 2_create_sessions_table.ts
│   │   │   ├── 3_create_password_resets_table.ts
│   │   │   └── .gitkeep
│   │   └── seeds/
│   │       └── .gitkeep                   # Seed data (optional)
│   │
│   ├── config/
│   │   ├── env.config.ts                  # Environment variables validation
│   │   ├── app.config.ts                  # App-level settings
│   │   └── database.config.ts             # Database settings
│   │
│   ├── app.module.ts                      # Root module
│   ├── app.controller.ts                  # Health check endpoint
│   ├── app.service.ts
│   └── main.ts                            # Application bootstrap
│
├── test/                                  # E2E tests (optional for MVP)
│   └── .gitkeep
│
├── .env.example                           # Environment template
├── .env                                   # Local env (git ignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── README.md
└── FILE_STRUCTURE.md                      # This file
```

---

## Folder Breakdown

### `/src/common`
Shared resources used across all modules. Never module-specific logic here.
- **constants**: Token times, cookie names, error codes
- **enums**: User status, session status, device types
- **dtos**: Shared response formats (not request DTOs)
- **utils**: Helpers (hashing, JWT, validators, fingerprinting)
- **guards**: Route protection (auth required, refresh token, appId validation)
- **interceptors**: Logging, error handling, response transformation
- **filters**: Global exception catching
- **decorators**: Extract data from requests (@CurrentUser, @AppId)
- **types**: TypeScript types for reusability

### `/src/modules`
Each module is self-contained: controller → service → repository → entity.

**auth**: Login, register, refresh tokens, logout
**users**: Profile, deactivation, user info
**sessions**: View active sessions, revoke sessions
**password-reset**: Request reset, confirm with token

Each module has its own:
- Controller (HTTP endpoints)
- Service (business logic)
- DTO (request/response validation)
- Entity (database model)
- Repository (data access)
- Module (dependency injection)

### `/src/database`
Database setup and migrations.
- **config**: TypeORM/database connection settings
- **migrations**: Schema changes (auto-generated)
- **seeds**: Initial data (admin user, etc.)

### `/src/config`
Application-wide configuration (environment variables, app settings).

---

## Key Points

1. **DTOs live in modules** (auth.dto, user.dto, etc.)
2. **Common DTOs live in /common/dtos** (error responses, pagination, etc.)
3. **Each module is independent** - can be tested/deployed separately
4. **Guards in /common** - used across modules
5. **Repositories optional for MVP** - can add if needed, or use service directly
6. **No business logic in controllers** - only in services
7. **Migrations folder** - auto-generated, but tracked in git

---

## Next Steps

1. Create all folders and `.gitkeep` files
2. Install dependencies (we'll create a list after this)
3. Generate modules: `nest g mo modules/auth`, etc.
4. Start with database config and entities
5. Build auth service first (foundation for everything else)