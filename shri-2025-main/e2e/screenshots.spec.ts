import { test, expect } from '@playwright/test';

test.describe('Скриншоты', () => {
  test('главная страница', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /межгалактическая аналитика/i })).toBeVisible();
    await expect(page).toHaveScreenshot('home-page.png');
  });

  test('страница генерации', async ({ page }) => {
    await page.goto('/generate');
    await expect(page.getByRole('heading', { name: /сгенерируйте готовый csv/i })).toBeVisible();
    await expect(page).toHaveScreenshot('generate-page.png');
  });

  test('страница истории', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByRole('heading', { name: /межгалактическая аналитика/i })).toBeVisible();
    await expect(page).toHaveScreenshot('history-page.png');
  });

  test('dropzone с файлом', async ({ page }) => {
    await page.goto('/');
    
    // Создаем тестовый файл
    const csvContent = 'name,age,city\nJohn,25,New York\nJane,30,London';
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Ждем загрузки файла
    await expect(page.getByText(/файл загружен/i)).toBeVisible();
    await expect(page).toHaveScreenshot('dropzone-with-file.png');
  });

  test('модальное окно истории', async ({ page }) => {
    await page.goto('/history');
    
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Открываем модальное окно
      await historyItems.first().click();
      await expect(page.locator('[data-testid="history-modal"]')).toBeVisible();
      
      // Делаем скриншот модального окна
      await expect(page).toHaveScreenshot('history-modal.png');
    }
  });
}); 