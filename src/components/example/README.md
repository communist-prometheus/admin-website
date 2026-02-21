# Example Component Structure

This folder demonstrates the **correct architectural pattern** for this project.

## Structure

```
UserCard/                      # Component folder (PascalCase)
├── UserCard.vue              # Main component (≤50 lines)
├── UserCard.spec.ts          # Unit tests (REQUIRED)
├── userCard.types.ts         # Type definitions
└── components/               # Child components
    ├── UserAvatar/
    │   ├── UserAvatar.vue    # Child component
    │   └── UserAvatar.spec.ts
    └── UserInfo/
        ├── UserInfo.vue
        └── UserInfo.spec.ts
```

## Key Points

1. **50 Line Limit**: Each file ≤50 lines (enforced by `sonarjs/max-lines`)
2. **No Nested Divs**: Each `<div>` level = separate component
3. **Tests Required**: Every `.vue` has a `.spec.ts`
4. **Tree Structure**: Components in their own folders with child components in `components/`
5. **Theme Classes**: Use CSS variables, not hardcoded values

## Running Tests

```bash
npm run test:unit           # Run all tests
npm run test:unit:ui        # Interactive UI
npm run test:unit:coverage  # Coverage report
```

## Verification

This example passes all linting rules:
- ✅ Max 50 lines per file
- ✅ Max 30 lines per function
- ✅ Max 15 cognitive complexity
- ✅ All components have tests
