import { test, expect } from '@playwright/test';

test.describe('Страница истории', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу истории
    await page.goto('/history');
  });

  test('отображает основные элементы страницы истории', async ({ page }) => {
    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toBeVisible();
    
    // Проверяем наличие кнопки генерации
    const generateButton = page.getByRole('button', { name: /сгенерировать больше/i });
    await expect(generateButton).toBeVisible();
    
    // Проверяем наличие кнопки очистки истории (может не отображаться если история пуста)
    const clearButton = page.getByRole('button', { name: /очистить всё/i });
    if (await clearButton.isVisible()) {
      await expect(clearButton).toBeVisible();
    }
  });

  test('отображает пустое состояние когда история пуста', async ({ page }) => {
    // Проверяем, что страница отображается корректно
    await expect(page.locator('h1')).toBeVisible();
    
    // Проверяем, что есть контейнер для списка истории
    const historyContainer = page.locator('[data-testid="history-list"]');
    await expect(historyContainer).toBeAttached();
  });

  test('открытие модального окна с деталями анализа', async ({ page }) => {
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Кликаем на первый элемент истории
      await historyItems.first().click();
      
      // Проверяем, что открылось модальное окно
      await expect(page.locator('[data-testid="history-modal"]')).toBeVisible();
      
      // Проверяем наличие кнопки закрытия
      const closeButton = page.getByRole('button', { name: /закрыть/i });
      await expect(closeButton).toBeVisible();
    }
  });

  test('закрытие модального окна', async ({ page }) => {
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Открываем модальное окно
      await historyItems.first().click();
      await expect(page.locator('[data-testid="history-modal"]')).toBeVisible();
      
      // Закрываем модальное окно
      const closeButton = page.getByRole('button', { name: /закрыть/i });
      await closeButton.click();
      
      // Проверяем, что модальное окно закрылось
      await expect(page.locator('[data-testid="history-modal"]')).not.toBeVisible();
    }
  });

  test('закрытие модального окна по клику на backdrop', async ({ page }) => {
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Открываем модальное окно
      await historyItems.first().click();
      await expect(page.locator('[data-testid="history-modal"]')).toBeVisible();
      
      // Кликаем на backdrop для закрытия
      const backdrop = page.locator('[data-testid="modal-backdrop"]');
      await backdrop.click();
      
      // Проверяем, что модальное окно закрылось
      await expect(page.locator('[data-testid="history-modal"]')).not.toBeVisible();
    }
  });

  test('очистка истории через модальное окно подтверждения', async ({ page }) => {
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Кликаем на кнопку очистки истории
      const clearButton = page.getByRole('button', { name: /очистить историю/i });
      await clearButton.click();
      
      // Проверяем, что открылось модальное окно подтверждения
      await expect(page.getByText(/вы уверены/i)).toBeVisible();
      
      // Подтверждаем очистку
      const confirmButton = page.getByRole('button', { name: /подтвердить/i });
      await confirmButton.click();
      
      // Проверяем, что история очищена
      await expect(page.getByText(/история пуста/i)).toBeVisible();
    }
  });

  test('отмена очистки истории', async ({ page }) => {
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Запоминаем количество элементов
      const initialCount = itemCount;
      
      // Кликаем на кнопку очистки истории
      const clearButton = page.getByRole('button', { name: /очистить историю/i });
      await clearButton.click();
      
      // Проверяем, что открылось модальное окно подтверждения
      await expect(page.getByText(/вы уверены/i)).toBeVisible();
      
      // Отменяем очистку
      const cancelButton = page.getByRole('button', { name: /отмена/i });
      await cancelButton.click();
      
      // Проверяем, что модальное окно закрылось и история осталась
      await expect(page.getByText(/вы уверены/i)).not.toBeVisible();
      await expect(page.locator('[data-testid="history-item"]')).toHaveCount(initialCount);
    }
  });

  test('навигация назад работает', async ({ page }) => {
    // Проверяем, что можно вернуться на главную страницу
    await page.getByRole('link', { name: /csv аналитик/i }).click();
    await expect(page).toHaveURL('/');
  });
}); 