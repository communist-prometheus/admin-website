# Architectural Principles

## Core Principles

### 1. Minimal Component Size
- **Maximum 50 non-blank lines per file** -- hard linter limit
- If a component exceeds the limit, decompose immediately
- Each component solves **one task**

### 2. Decomposition
- **Every conditional branch (v-if) = a separate component**
- No components with multiple v-if for different states
- Example: LoadingOverlay and ErrorMessage are two separate components, not one with two v-if

### 3. Code Organization
- **Feature-based structure**, not layout-based
- Components are grouped by feature: `/views/ContentView/ContentViewHeader.vue`
- Shared components in `/components/common/`

### 4. Separation of Concerns
- **Logic in services** (composables, helpers)
- **Components are maximally declarative**
- Minimal business logic in components

### 5. DDD Approach
- Clear layer separation:
  - **Input/Output ports** (UI components)
  - **Business logic** (composables, domain models)
  - **Services** (API clients, external integrations)
  - **Helpers** (stateless utilities)

### 6. Pure Functional Approach
- Functions over classes
- Immutable data (readonly, ref)
- Declarative above all
- Closures and strategies over branching

## Component Requirements

### Template
- **No `<div>`** -- use semantic tags or child components
- **Maximum nesting depth: 2**
- Container styles via `:host {}`

### Script
- **Composition API** required
- `inject()` instead of constructor injection
- TypeScript only, strict typing
- No `any`, no `as`, no type casting

### Styles
- **Scoped styles** always
- CSS variables from `_variables.scss`
- Responsive via `clamp()`
- No inline styles

## Linter Rules

### Limits
- `sonarjs/max-lines: 50` -- maximum lines per file
- `sonarjs/max-lines-per-function: 25` -- maximum lines per function
- `sonarjs/cognitive-complexity: 15` -- cognitive complexity
- `vue/no-restricted-html-elements: div` -- no div elements

### Exceptions
- Only for SW code (`src/sw/`, `src/api/`) and tests
- UI code has **no exceptions**

## Testing

### Testing Pyramid
1. **Unit tests** (80%) -- helpers, composables, utils
2. **Integration tests** (15%) -- API endpoints, services
3. **E2E tests** (5%) -- critical user flows

### TDD Required
- Test first (failing)
- Then code
- Then refactor

## Prohibited

- Components over 50 lines
- Functions over 25 lines
- Using `<div>`
- Multiple v-if in one component
- Business logic in components
- Type casting (`as`)
- `any` types
- Mutable data without ref
- Classes instead of functions
- Inline styles

## Required

- Decompose when exceeding limits
- One component = one responsibility
- Logic in composables/services
- Strict typing
- Functional approach
- Feature-based structure
- TDD
- Minimal components
