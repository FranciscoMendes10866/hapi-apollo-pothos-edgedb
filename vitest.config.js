import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    browser: false,
    globals: true,
    exclude: [...configDefaults.exclude, 'node_modules/**/*'],
    include: ['./src/vitest/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 2000
  }
})
