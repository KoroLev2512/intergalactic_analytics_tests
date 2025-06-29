import { test, expect } from '@playwright/test';

test.describe('Главная страница', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу перед каждым тестом
    await page.goto('/');
  });

  test('отображает основные элементы интерфейса', async ({ page }) => {
    // Проверяем наличие заголовка
    await expect(page.getByRole('heading', { name: /межгалактическая аналитика/i })).toBeVisible();
    
    // Проверяем наличие навигации
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Проверяем наличие кнопок навигации
    await expect(page.getByRole('link', { name: /csv аналитик/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /csv генератор/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /история/i })).toBeVisible();
    
    // Проверяем наличие зоны загрузки файлов
    await expect(page.getByText(/перетащите сюда/i)).toBeVisible();
    
    // Проверяем наличие кнопки выбора файла (используем более специфичный селектор)
    await expect(page.locator('[data-testid="dropzone"] button')).toBeVisible();
  });

  test('навигация работает корректно', async ({ page }) => {
    // Кликаем на кнопку "CSV Генератор"
    await page.getByRole('link', { name: /csv генератор/i }).click();
    
    // Проверяем, что перешли на страницу создания
    await expect(page).toHaveURL(/.*generate/);
    
    // Возвращаемся на главную
    await page.getByRole('link', { name: /csv аналитик/i }).click();
    await expect(page).toHaveURL('/');
    
    // Переходим в историю
    await page.getByRole('link', { name: /история/i }).click();
    await expect(page).toHaveURL(/.*history/);
  });

  test('отображает правильный заголовок страницы', async ({ page }) => {
    await expect(page).toHaveTitle(/сервис межгалактической аналитики/i);
  });

  test('имеет правильную структуру HTML', async ({ page }) => {
    // Проверяем наличие основных семантических элементов
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });
}); 