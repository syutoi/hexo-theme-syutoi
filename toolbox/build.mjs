import { createAssetContext } from './assets.mjs';

const context = await createAssetContext();
try {
  await context.rebuild();
} finally {
  await context.dispose();
}
