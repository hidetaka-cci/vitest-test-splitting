import { defineConfig } from 'vitest/config'

const addFileAttribute =
  process.env.VITEST_JUNIT_ADD_FILE_ATTRIBUTE !== 'false'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    reporters: process.env.CI
      ? [
          ['verbose'],
          [
            'junit',
            {
              outputFile: `test-results/results-${process.env.CIRCLE_NODE_INDEX ?? '0'}.xml`,
              addFileAttribute,
            },
          ],
        ]
      : ['verbose'],
  },
})
