# views

Page-level Vue components corresponding to router routes. Each view is decomposed into small sub-components and helper files within its own directory.

## Views

- `HomeView` -- dashboard landing page with welcome section and stats grid
- `ContentView` -- content list with selection, filtering, and delete actions
- `ContentEditView` -- content editor with frontmatter form, markdown body, and asset management
- `SettingsView` -- application settings (language configuration)
- `AboutView` -- static about page
- `AuthCallbackView` -- OAuth callback handler (processes token from popup)
