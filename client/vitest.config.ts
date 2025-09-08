import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./src/tests/setup.ts'],
      dangerouslyIgnoreUnhandledErrors: true,
      coverage: {
        exclude: [
          ...(configDefaults.coverage.exclude as string[]),
          '**.config.{ts,js}', // config files
          'src/components/ui/**', // shadcui components
          'src/services/**', // OpenAPI generator
        ],
      },
    },
  }),
)
