# Company X TypeScript Backend Style Guide

## Introduction
This style guide defines the coding conventions for backend development using **Node.js + Express + TypeScript** at Company X. It emphasizes readability, maintainability, consistency, and type safety.

It is based on commonly accepted community practices such as [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and [TypeScript ESLint Recommended Rules](https://typescript-eslint.io/).

>  **NOTE: All code reviews and comments should be written in Korean for clarity and team communication.**  
>  **리뷰는 반드시 한국어로 작성해주세요.**

---

## Key Principles

- **Readability:** Code should be easy to read and understand.
- **Maintainability:** Code should be easy to modify and extend.
- **Consistency:** Use a unified style across all projects.
- **Type Safety:** Leverage TypeScript to prevent runtime errors.

---

## Deviations from Standard Guidelines

### Line Length
- **Max line length:** 100 characters

### Indentation
- Use **2 spaces** per indentation level.

### Semicolons
- Always **use semicolons (`;`)** at the end of statements.

### Quotes
- Prefer **single quotes (`'`)** for strings. Use backticks (`` ` ``) for template literals.

---

## Import Rules

### Import Order

1. **Node.js built-in modules**
2. **External libraries** (e.g., `express`, `dotenv`)
3. **Internal absolute imports** (e.g., `@src`, `@utils`)
4. **Relative imports**

### Other Guidelines

- Use **ES module syntax** (`import ... from`) instead of `require`.
- Remove **unused imports** to keep code clean.

```ts
import fs from 'fs';
import express from 'express';
import userService from '@src/services/user.service';
import { hashPassword } from '../utils/crypto';
```

---

## Naming Conventions

| Type             | Style             | Example                        |
|------------------|-------------------|--------------------------------|
| Variable         | `camelCase`       | `userName`, `totalCount`       |
| Constant         | `UPPER_SNAKE_CASE`| `MAX_RETRY`, `JWT_SECRET`      |
| Function         | `camelCase`       | `handleLogin()`, `fetchData()` |
| Class            | `PascalCase`      | `UserService`, `AuthController`|
| File/Module      | `kebab-case`      | `user-service.ts`              |
| Interface/Type   | `PascalCase`      | `User`, `LoginRequest`         |
| Enum             | `PascalCase` with `UPPER_SNAKE_CASE` members | `Role.ADMIN` |

---

## Comments & Docblocks

- Use **JSDoc-style** comments above all public functions.
- Focus on the **"why"** more than the "what".
- Use **full sentences** with proper punctuation.

```ts
/**
 * Hashes the provided password using SHA-256 with a salt.
 *
 * @param password - The plain text password.
 * @returns A salted and hashed password string.
 */
function hashPassword(password: string): string {
  // Implementation here
}
```

---

## TypeScript Conventions

- **Always annotate types** for function parameters and return types.
- **Avoid `any`**; if necessary, document its usage clearly.
- Use:
  - `interface` for object-like structures
  - `type` for unions, tuples, etc.

---

## Error Handling

- Use `try...catch` blocks for handling asynchronous errors.
- **Avoid catching broad `Error` types** unless necessary.
- Log and rethrow or respond with proper status codes and messages.

```ts
try {
  const user = await userService.findByEmail(email);
  if (!user) {
    logger.warn(`User not found: ${email}`);
    return res.status(404).json({ message: 'User not found.' });
  }
} catch (error) {
  logger.error(`Failed to retrieve user: ${error}`);
  res.status(500).json({ message: 'Internal server error.' });
}
```

---

## Logging

- Use a logging library like **winston** or **pino**.
- Use log levels appropriately: `debug`, `info`, `warn`, `error`, `fatal`.
- Include contextual details: user ID, request ID, error messages, etc.

---

## Tooling

| Tool              | Purpose                                       |
|-------------------|-----------------------------------------------|
| **ESLint**        | Enforce code quality and style rules          |
| **Prettier**      | Auto-format code on save                      |
| **Husky + lint-staged** | Run linters before committing          |
| **Jest**          | Run unit and integration tests                |
| **Swagger / Postman** | Document and test API endpoints          |

---

## Example

```ts
/**
 * Handles user login requests.
 */

import { Request, Response } from 'express';
import { AuthService } from '@src/services/auth.service';
import logger from '@src/lib/logger';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const token = await this.authService.authenticate(email, password);

      if (!token) {
        logger.warn(`Authentication failed for user: ${email}`);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      logger.info(`User logged in successfully: ${email}`);
      res.status(200).json({ token });
    } catch (error) {
      logger.error(`Login error: ${error}`);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
}
```

---

## Appendix

- **Git Commit Convention:** Follow [Conventional Commits](https://www.conventionalcommits.org/)
- **Recommended file structure:** Use feature-based or domain-based organization
- **API Specification:** Use Swagger or Postman for auto-generated documentation