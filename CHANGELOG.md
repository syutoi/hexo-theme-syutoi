# Changelog

## Unreleased

- Add a sticky desktop table of contents, native mobile disclosure and progressive scroll tracking for posts and standalone pages. Preserve no-JavaScript links and existing TOC switches; transfer keyboard focus when changing responsive layouts.

## 0.1.0 — 2026-09-20

First Syutoi MVP after the fork from hexo-theme-shoka. The previous package version, 0.2.5, was inherited from upstream; Syutoi starts a separate version sequence at 0.1.0. This entry records repository changes, not an npm publication or deployed release. The package remains private.

### Added

- Hexo 8 workspace with TypeScript, esbuild, PostCSS, Nunjucks and a local preview workflow.
- Home, post, standalone page, archive, category, tag and 404 pages; optional covers and summaries, article navigation and native table of contents.
- Light/dark/system preference, keyboard navigation, reduced-motion support and readable pages without JavaScript.
- Markdown typography, footnotes, tables, native details, code labels/copy feedback and responsive body images with captions.
- Core zh-CN, zh-TW and English UI, configurable navigation/social links, canonical URLs and basic sharing metadata.
- Example hub, boundary fixtures, automated checks, CI configuration, browser acceptance reports and repeatable performance measurements.
- Configuration, writing, migration and development documentation with an explicit MVP acceptance checklist.

### Changed

- Preserved the image masthead, decorative waves, cards and sidebar while replacing the old browser runtime and Stylus pipeline.
- Adopted the standard hexo-renderer-markdown-it renderer and compact structured theme configuration. See docs/migration-from-shoka.md for compatibility details.
- Optimized example masthead/cover images using smaller WebP copies, retaining the original JPEGs and historical content links.

### Removed from the default runtime

- PJAX, music, fireworks, search, comments, rewards, analytics, remote fonts and icon-font dependencies. Old configuration keys do not reactivate these features.
- The custom Markdown renderer and its Puppeteer/Chromium installation requirement. Browser acceptance tools remain optional and separate.

### Validation and remaining scope

- Local build, type checks, lint, 41 tests, generated-page checks and gzip budgets pass on Node 20.19.2. CI is configured for Node 20.19.0 and 24; remote execution is not claimed here.
- Linux Chrome viewport and no-JavaScript checks pass. D8a measured mobile LCP medians of 1.883 s (home) and 1.658 s (article); this is laboratory evidence, not field performance.
- Real INP, physical devices, Safari/Firefox, screen readers, full WCAG coverage, publishing and deployment remain outside this acceptance. See docs/validation/mvp.md.

## Before 0.1.0

Upstream history and the intermediate modernization work remain in Git and docs/TODO.md. Original attribution and the MIT license are retained.
