import babel from 'rollup-plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'dist/filter-multi-select.js',
  output: {
    file: 'dist/filter-multi-select-bundle.js',
    format: 'iife',
    name: "FilterMultiSelectBundle",
    globals: {
      jquery: '$'
    },
    sourcemap: true
  },
  external: [
    'jquery'
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    sourcemaps()
  ]
};
