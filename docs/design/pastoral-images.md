# 温暖田园图片（2026-09-22）

使用内置 image_gen 工具生成，非照片；三张原图及 WebP 显示副本保存在 `example/source/assets/`。宽长图 SVG 是尺寸测试夹具，继续保留。原始生成文件另保留于 Codex generated_images 目录。

## 提示词

### pastoral-evening.png

Create one landscape website hero illustration, aspect ratio 3:1, no text, no lettering, no logos or watermarks. Warm healing pastoral mood for a wooden writing-desk themed personal blog. Hand-painted soft gouache illustration, restrained fine texture, refined rather than childish. A quiet countryside at late golden afternoon, rolling sage green fields, a small cream cottage beneath trees near one side, distant honey-colored sunlight, a footpath and delicate meadow flowers. Muted cream, warm walnut brown, honey ochre, sage green. Wide tranquil composition with a simple low-detail central region suitable for white website title overlay, visual interest towards the sides and bottom, no glaring bright sun in the center. Full bleed artwork only.

### sunlit-desk.png

One portrait 2:3 full-bleed soft hand-painted gouache illustration for a warm healing blog article cover. An inviting honey oak writing desk beside a cottage window, open cream notebook with no readable writing, a ceramic tea cup, a small vase with meadow flowers, outside the window a peaceful sage green garden. Golden afternoon light, quiet intimate composition, refined painterly texture, muted cream honey ochre walnut and sage palette, gentle countryside mood. No text, letters, logos, watermarks or frame.

### cottage-garden.png

One landscape 3:2 full-bleed soft hand-painted gouache illustration for a warm healing pastoral blog body image. A winding footpath through a cottage garden of soft cream daisies, small peach flowers, sage green grass, a rustic wooden fence and distant rolling countryside, warm late afternoon light, quiet restorative atmosphere. Refined painterly texture, muted cream honey ochre walnut and sage palette, coherent gentle storybook artwork, no text, letters, logos, watermarks or frame.

## 使用

- pastoral-evening.webp：页头、长文封面。
- sunlit-desk.webp：欢迎文章封面。
- cottage-garden.webp：阅读与图片示例。

通过 `node toolbox/optimize-example-images.mjs` 从 PNG 重新生成 WebP。配图的替代文字与说明同步更新；头像与 Logo 保持原有资源。
