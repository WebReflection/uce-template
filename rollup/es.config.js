import {nodeResolve} from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import includePaths from 'rollup-plugin-includepaths';

export default {
  input: './esm/index.js',
  plugins: [
    includePaths({
      include: {
        '@webreflection/lie': 'node_modules/uhooks/esm/promise.js',
        '@ungap/create-content': 'node_modules/@ungap/degap/create-content.js',
        '@ungap/custom-elements': 'node_modules/@ungap/degap/custom-elements.js'
      },
    }),
    nodeResolve(),
    terser()
  ],
  
  output: {
    esModule: false,
    exports: 'named',
    file: './es.js',
    format: 'iife'
  }
};
