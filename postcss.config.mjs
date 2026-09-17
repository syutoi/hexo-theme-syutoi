import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    postcssImport(),
    autoprefixer({ overrideBrowserslist: ['Chrome >= 90', 'Firefox >= 90', 'Safari >= 14', 'Edge >= 90'] })
  ]
};
