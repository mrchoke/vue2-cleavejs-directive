import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript'

export default {
  input: ['directive/index.ts', 'directive/CleaveDirective.ts', 'directive/Cleave.ts'],
  output: {
    format: 'esm',
    dir: 'lib'
    // file: 'lib/CleaveDirective.js'
  },
  external: ['vue'],
  plugins: [
    typescript({
      tsconfig: false,
      experimentalDecorators: true,
      module: 'es2015'
    }),
    vue()
  ]
}
