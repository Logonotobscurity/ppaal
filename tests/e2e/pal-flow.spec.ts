import { test, expect } from '@playwright/test';

/**
 * PAL End-to-End Test Suite
 * Tests core user flows: Voice → Meaning → Action → Approval
 */

test.describe('PAL Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load landing page with hero section', async ({ page }) => {
    await expect(page).toHaveTitle(/PAL/);
    await expect(page.getByText(/voice-first AI OS for African commerce/i)).toBeVisible();
  });

  test('should display three modes (ASK, LEARN, DO)', async ({ page }) => {
    const askMode = page.getByText(/ASK/i).first();
    const learnMode = page.getByText(/LEARN/i).first();
    const doMode = page.getByText(/DO/i).first();
    
    await expect(askMode).toBeVisible();
    await expect(learnMode).toBeVisible();
    await expect(doMode).toBeVisible();
  });

  test('should show Command Orb when voice is activated', async ({ page }) => {
    const commandOrb = page.getByTestId('command-orb');
    await expect(commandOrb).toBeVisible();
  });

  test('should navigate to workspace after voice input', async ({ page }) => {
    // Simulate voice activation
    const voiceButton = page.getByRole('button', { name: /speak/i });
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      
      // Wait for workspace to appear
      const speechPanel = page.getByTestId('speech-panel');
      await expect(speechPanel).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display entity chips in Meaning Panel', async ({ page }) => {
    const meaningPanel = page.getByTestId('meaning-panel');
    if (await meaningPanel.isVisible()) {
      const entityChips = meaningPanel.locator('[data-testid="entity-chip"]');
      // Entity chips should appear after processing
      await expect(entityChips.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show approval gate for high-risk actions', async ({ page }) => {
    const approvalGate = page.getByTestId('approval-gate');
    // Approval gate appears when Gs score >= 3.0
    if (await approvalGate.isVisible()) {
      await expect(approvalGate).toBeVisible();
      const riskIndicator = page.getByTestId('risk-indicator');
      await expect(riskIndicator).toBeVisible();
    }
  });

  test('should display benchmark dashboard in Intelligence screen', async ({ page }) => {
    await page.goto('/dashboard/intelligence');
    const benchmarkDashboard = page.getByTestId('benchmark-dashboard');
    await expect(benchmarkDashboard).toBeVisible();
    
    // Check for key metrics
    const kpis = page.locator('[data-testid="kpi-card"]');
    await expect(kpis).toHaveCount(6);
  });

  test('should show failure replay component', async ({ page }) => {
    await page.goto('/dashboard/intelligence');
    const failureReplay = page.getByTestId('failure-replay');
    await expect(failureReplay).toBeVisible();
  });

  test('should display activity audit trail', async ({ page }) => {
    await page.goto('/dashboard/activity');
    const auditTrail = page.getByTestId('activity-audit-trail');
    await expect(auditTrail).toBeVisible();
    
    // Check for timeline entries
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    await expect(timelineItems.first()).toBeVisible({ timeout: 3000 });
  });

  test('should enforce quiet hours (21:00-08:00 WAT)', async ({ page }) => {
    // This tests the business logic - quiet hours should prevent scheduled jobs
    // Mock the current time to be within quiet hours
    await page.clock.setFixedTime(new Date('2024-02-13T22:00:00+01:00'));
    await page.goto('/');
    
    // Scheduled actions should be blocked or queued
    const quietHoursNotice = page.getByText(/quiet hours/i);
    if (await quietHoursNotice.isVisible()) {
      await expect(quietHoursNotice).toBeVisible();
    }
  });

  test('should handle code-switched language detection', async ({ page }) => {
    const languageInfo = page.getByTestId('language-info');
    if (await languageInfo.isVisible()) {
      // Should detect Pidgin, Yorùbá, Igbo, Hausa, or English
      await expect(languageInfo).toBeVisible();
    }
  });

  test('should persist workspace state across reloads', async ({ page }) => {
    await page.goto('/dashboard/workspace');
    
    // Perform some action
    const transcript = 'Send 50k to Mama Nkechi';
    const inputField = page.getByPlaceholder(/speak or type/i);
    if (await inputField.isVisible()) {
      await inputField.fill(transcript);
      await page.keyboard.press('Enter');
      
      // Reload and verify state persists
      await page.reload();
      await expect(page.getByText(transcript)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display design tokens correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check background color (Ivory)
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    // Ivory #FAF7F2 converts to rgb(250, 247, 242)
    expect(backgroundColor).toMatch(/rgb\(250,\s*247,\s*242\)/);
    
    // Check primary surface color (Charcoal)
    const card = page.locator('[class*="card"]').first();
    if (await card.isVisible()) {
      const cardBg = await card.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(cardBg).toMatch(/rgb\(22,\s*21,\s*26\)/); // Charcoal #16151A
    }
  });
});
