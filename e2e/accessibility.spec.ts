import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

const publicRoutes = [
  { name: 'homepage', path: '/' },
  { name: 'servicii', path: '/servicii' },
  { name: 'proprietăți', path: '/proprietati' },
  { name: 'autentificare', path: '/auth/login' },
]

function violationReport(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => `  - ${node.target.join(' ')}: ${node.failureSummary}`).join('\n')
      return `[${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n${nodes}`
    })
    .join('\n\n')
}

test.describe('accesibilitate WCAG 2.1 A/AA', () => {
  for (const route of publicRoutes) {
    test(`${route.name} nu are încălcări detectabile automat`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(route.path, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('body')).toBeVisible()

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(results.violations, violationReport(results.violations)).toEqual([])
    })
  }
})
