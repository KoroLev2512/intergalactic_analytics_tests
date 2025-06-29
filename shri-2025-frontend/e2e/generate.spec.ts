import { test, expect } from '@playwright/test';

test.describe('Страница создания анализа', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу создания анализа
    await page.goto('/generate');
  });

  test('отображает основные элементы страницы создания', async ({ page }) => {
    // Проверяем наличие заголовка
    await expect(page.getByRole('heading', { name: /сгенерируйте готовый csv-файл/i })).toBeVisible();
    
    // Проверяем наличие кнопки генерации
    const generateButton = page.getByRole('button', { name: /начать генерацию/i });
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeEnabled();
  });

  test('кнопка генерации работает', async ({ page }) => {
    // Кликаем на кнопку генерации
    const generateButton = page.getByRole('button', { name: /начать генерацию/i });
    await generateButton.click();
    
    // Проверяем, что отображается лоадер
    await expect(page.locator('[data-testid="loader"]')).toBeVisible();
  });

  test('отображение успешного сообщения', async ({ page }) => {
    // Мокаем успешный ответ от API
    await page.route('**/report?size=0.01', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Disposition': 'attachment; filename="test-report.csv"'
        },
        body: 'name,age\nJohn,25\nJane,30'
      });
    });
    
    // Кликаем на кнопку генерации
    const generateButton = page.getByRole('button', { name: /начать генерацию/i });
    await generateButton.click();
    
    // Ждем завершения генерации
    await expect(page.locator('[data-testid="loader"]')).not.toBeVisible({ timeout: 10000 });
    
    // Проверяем, что отображается сообщение об успехе
    await expect(page.getByText(/отчёт успешно сгенерирован/i)).toBeVisible();
  });

  test('отображение ошибки при генерации', async ({ page }) => {
    // Мокаем ошибку от API
    await page.route('**/report?size=0.01', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
      });
    });
    
    // Кликаем на кнопку генерации
    const generateButton = page.getByRole('button', { name: /начать генерацию/i });
    await generateButton.click();
    
    // Ждем завершения генерации
    await expect(page.locator('[data-testid="loader"]')).not.toBeVisible({ timeout: 10000 });
    
    // Проверяем, что отображается ошибка
    await expect(page.getByText(/произошла ошибка/i)).toBeVisible();
  });

  test('навигация назад работает', async ({ page }) => {
    // Проверяем, что можно вернуться на главную страницу
    await page.getByRole('link', { name: /csv аналитик/i }).click();
    await expect(page).toHaveURL('/');
  });
}); 