# E2E Testing Guidelines

## Core Principles

### 1. No Timeouts - Use Network-Aware Helpers

**Never use direct timeouts** like `waitForTimeout()`. Instead, use helpers that intelligently wait for network activity:

- **Initial timeout**: 15 seconds if no network activity detected
- **Maximum timeout**: 45 seconds total
- **Smart waiting**: Timer resets when network activity is detected
- **Auto-fail**: Test fails if no progress within timeout periods

Example:
```typescript
// ❌ BAD
await page.waitForTimeout(2000)
await expect(page.locator('.content')).toBeVisible()

// ✅ GOOD
await waitForNetworkIdle(page)
await content.expectToBeVisible()
```

### 2. Declarative Tests - Use Helpers and Page Objects

**Never call Playwright API directly** in test files. Tests must be declarative and use:

- **Helpers**: Reusable functions for common operations
- **Page Objects**: Facade objects representing pages/components
- **Semantic methods**: Self-documenting method names

Example:
```typescript
// ❌ BAD
await page.goto('/content/blog')
await page.locator('button:has-text("Create")').click()
await page.locator('#slug').fill('test-post')

// ✅ GOOD
await contentPage.navigate('blog')
await contentPage.openCreateDialog()
await createDialog.fillSlug('test-post')
```

### 3. Network-Based Assertions - No Direct State Checks

**Never use retries or direct state polling**. Instead, use helpers that:

- Monitor network requests/responses
- Wait for specific API calls to complete
- Verify data through network layer
- Auto-fail on network errors

Example:
```typescript
// ❌ BAD
await page.waitForSelector('.content-item', { timeout: 5000 })
await expect(page.locator('.content-item')).toHaveCount(3)

// ✅ GOOD
await waitForContentLoad(page, 'blog')
await contentList.expectItemCount(3)
```

## Project Structure

```
e2e/
├── README.md                 # This file
├── helpers/
│   ├── network.ts           # Network-aware waiting helpers
│   ├── navigation.ts        # Navigation helpers
│   └── assertions.ts        # Custom assertion helpers
├── pages/
│   ├── ContentPage.ts       # Content management page object
│   ├── CreateDialog.ts      # Create dialog component object
│   └── AuthPage.ts          # Authentication page object
└── tests/
    ├── content/             # Content management tests
    └── auth/                # Authentication tests
```

## Helper Categories

### Network Helpers (`helpers/network.ts`)
- `waitForNetworkIdle()` - Wait for all network activity to complete
- `waitForApiCall()` - Wait for specific API endpoint
- `waitForContentLoad()` - Wait for content type to load
- `trackNetworkActivity()` - Monitor ongoing requests

### Page Objects (`pages/`)
- Encapsulate page/component interactions
- Provide semantic method names
- Hide Playwright API complexity
- Return chainable objects where appropriate

### Assertion Helpers (`helpers/assertions.ts`)
- Network-based state verification
- Semantic expectation methods
- Auto-retry with network awareness

## Writing Tests

### Good Test Example

```typescript
import { test } from '@playwright/test'
import { ContentPage } from '../pages/ContentPage'
import { CreateDialog } from '../pages/CreateDialog'
import { waitForNetworkIdle } from '../helpers/network'

test('should create new blog post', async ({ page }) => {
  const contentPage = new ContentPage(page)
  const createDialog = new CreateDialog(page)
  
  await contentPage.navigate('blog')
  await waitForNetworkIdle(page)
  
  await contentPage.clickCreateButton()
  await createDialog.expectToBeVisible()
  
  await createDialog.fillForm({
    slug: 'test-post',
    title: 'Test Post',
    lang: 'en',
    category: 'Tech'
  })
  
  await createDialog.submit()
  await waitForNetworkIdle(page)
  
  await contentPage.expectItemWithTitle('Test Post')
})
```

## Common Mistakes to Avoid

1. **Using `page.waitForTimeout()`** - Always use network-aware helpers
2. **Direct Playwright calls in tests** - Always use Page Objects
3. **Hardcoded waits** - Use dynamic network-based waiting
4. **Retry logic in tests** - Built into helpers, not tests
5. **Checking DOM state directly** - Use semantic expectations

## Best Practices

1. **One assertion per test** - Keep tests focused
2. **Use descriptive names** - Test name = documentation
3. **Setup in helpers** - Keep tests clean and readable
4. **Clean up state** - Use beforeEach/afterEach hooks
5. **Test user flows** - Not implementation details
