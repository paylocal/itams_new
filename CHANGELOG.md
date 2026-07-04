# Changelog

## 2026-07-03

- Improved login internationalization:
  - Language picker now reflects active languages from admin settings.
  - Username label is locale-specific (vi: Ten dang nhap, en: User) and supports additional locales.
  - Login page strings now use translation keys with safe locale fallbacks.
- Added/updated SQL translation keys for login auth strings in vi/en/fr.
- Reduced lint warnings in priority UI modules:
  - Removed unused imports in admin settings/category/supplier components.
  - Replaced several any usages with explicit types in header and sidebar layout components.
- Verified quality checks:
  - Tests: 17/17 passing.
  - Lint: non-blocking warnings remain in legacy modules; updated priority modules are cleaner.
