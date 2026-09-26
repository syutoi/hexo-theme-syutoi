# Changelog

## Unreleased

- Organize the demo documentation into a 12-guide user manual, with dedicated social, analytics, image sizing and Markdown extension guides.

- Add local SVG social icons for common platforms, accessible labels and text fallback for custom links.

- Add opt-in Baidu Analytics through `analytics.baidu`, with tracking ID validation and asynchronous HTTPS loading.

## 0.5.0 — 2026-09-26

Warm visual styling, a demo documentation center and optional writing extensions. Distributed through Git; npm publication and 1.0 preparation remain pending.

- Replace demo imagery with coordinated pastoral illustrations, retain source PNGs and provide reproducible WebP encoding.
- Add repeatable standalone Git installation and deployed-site checks, with recorded results for production dependencies, documentation links, assets, feeds and HTTP 404 behavior.
- Establish a new performance baseline: all bundle budgets and measured CLS/interaction targets pass, but mobile homepage LCP remains above the 2.5s target (3.013s median). Image optimization is tracked as G5d1; this release does not claim all performance targets are met.

- Add optional Markdown image dimensions and GitHub-style alerts with theme-aware styling, examples and configuration guidance; avoid duplicate image root prefixes under subdirectory deployments.

- Publish a documentation hub and eight categorized guides from the repository documentation, with development synchronization and verified local links.

- Curate the example site into three dated articles in two categories, move boundary samples to standalone pages, and retain historical migration coverage in isolated test fixtures.

- Introduce a wood-inspired light/dark palette with paper surfaces, walnut accents, moss details, warm code styling and matching browser theme colors while preserving the existing layout.

## 0.4.0 — 2026-09-22

SEO, syndication, migration documentation, accessibility and performance validation through G4a. Demo/package distribution and stable-release preparation remain pending.

- Complete installation, customization, deployment and Shoka migration guides with configuration and content compatibility checklists.

- Ship a right-sized default logo while retaining the original image, reduce the example cover transfer cost, and record repeatable Lighthouse and scripted INP measurements, including the mobile homepage LCP follow-up.

- Improve accessibility with a unified header landmark, keyboard-focusable content tables, stronger image/banner and category contrast, and a repeatable core-page accessibility audit.

- Validate optional feed and sitemap plugins, add a sitemap to the example site, correct RSS HTML encoding and feed update timestamps, and suppress subscription links when feed generators are unavailable.

- Add configurable Open Graph and Twitter metadata, per-page SEO overrides, default sharing images and alt text, locale and article taxonomy tags, noindex controls, and typed social links with legacy compatibility.

## 0.3.0 — 2026-09-22

Optional search and comments after the 0.2.0 reading experience release. Both remain disabled by default.

- Add a default-off comments slot and local Waline adapter with click-loaded resources, per-page opt-outs, theme-aware styles, localized fallbacks and reload support.

- Add optional local Pagefind search with Hexo-managed index routes, a dedicated search page, deferred engine loading, content opt-outs, localized status messages and retry handling.

## 0.2.0 — 2026-09-21

Reading experience improvements after the 0.1.0 MVP. Actual release numbering follows the completed development milestones rather than the original PRD phase numbers. The package remains private; a Git tag does not imply npm publication or deployment.

- Add an opt-in local PhotoSwipe image viewer with click-loaded assets, native image-link fallbacks, keyboard focus containment, localized controls and reduced-motion support. Keep the default core bundles unchanged.

- Add optional build-time reading estimates with per-post control and localized labels, group publication/update dates in the article header, and support descriptive cover alt text on posts and pages.

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
