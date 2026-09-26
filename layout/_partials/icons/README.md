# Social icons

Brand SVG paths are vendored from [Simple Icons 16.32.0](https://www.npmjs.com/package/simple-icons/v/16.32.0) under CC0-1.0; see [license](simple-icons-LICENSE.txt). Upstream SVG paths are unchanged; wrappers use currentColor and hide decorative SVGs from assistive technology.

Included upstream slugs: github, gitlab, x, zhihu, xiaohongshu, bilibili, sinaweibo, telegram, youtube, instagram, mastodon, bluesky. `sinaweibo` maps to `weibo`; the legacy `twitter` type uses the `x` icon. Email, website and RSS are theme-authored generic symbols under the theme's MIT license.

To update, download only these SVGs from a pinned Simple Icons version, preserve path data, and update this version and license. Brand names and marks belong to their owners; upstream guidance is at https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md.

The config normalizer selects icons from an explicit allowlist. Never use arbitrary user input as a template path. Only configured icons are included in generated pages; no browser requests or runtime package dependencies are added.
