# Company X Frontend Style Guide (Next.js + TypeScript)

## Introduction

This style guide outlines the frontend code conventions for Company X projects built with Next.js and TypeScript. All code reviews and team collaboration should follow these guidelines to ensure consistency and maintainability.

## Key Principles

### Line Length

- Limit each line to **a maximum of 110 characters**.
- Break long lines to improve readability where appropriate.

### Indentation

- Use **2 spaces** for indentation (no tabs).
- Maintain consistent indentation for nested structures such as blocks, conditions, and functions.

---

### Imports Sorting

- Use the `simple-import-sort` plugin to automatically sort imports.
- Import order should follow these groups:
  1. External libraries (`react`, `next`, etc.)
  2. Internal modules/alias paths
  3. Relative paths (`./`, `../`)

### Unused Imports

- Unused `import` statements are automatically removed using `eslint-plugin-unused-imports`.
- If a variable or parameter is intentionally unused, prefix it with `_` to indicate that.

---

## Naming Conventions

- **Components, classes, types**: `PascalCase`
- **Variables, functions, instances**: `camelCase`
- **Constants (non-changing values)**: `UPPER_SNAKE_CASE`