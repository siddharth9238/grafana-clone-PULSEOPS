import { test, expect } from '@playwright/test';

test.describe('Enterprise Features E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Username').fill('admin');
		await page.getByLabel('Password').fill('admin');
		await page.getByRole('button', { name: /Log in/i }).click();
	});

	test('system health page loads', async ({ page }) => {
		await page.goto('/system-health');
		await expect(page.locator('h1')).toContainText('System Monitor');
		await expect(page.locator('text=CPU Usage')).toBeVisible();
	});

	test('ai assistant works', async ({ page }) => {
		await page.goto('/ai-assistant');
		await page.getByPlaceholder(/Ask about/i).fill('test');
		await page.getByRole('button', { name: /Send/i }).click();
	});

	test('notification center loads', async ({ page }) => {
		await page.goto('/notifications');
		await expect(page.locator('h1')).toContainText('Notification Center');
	});

	test('api performance page loads', async ({ page }) => {
		await page.goto('/api-performance');
		await expect(page.locator('h1')).toContainText('API Performance Analyzer');
	});
});