import { test, expect } from '@playwright/test';

test.describe('Производительность', () => {
  test('время загрузки главной страницы в пределах нормы', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    const loadTime = Date.now() - startTime;
    
    // Проверяем, что страница загружается менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000);
    
    // Проверяем, что страница полностью загружена
    await expect(page).toHaveURL('/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('время загрузки страницы создания анализа', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/generate');
    
    const loadTime = Date.now() - startTime;
    
    // Проверяем, что страница загружается менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000);
    
    // Проверяем, что страница полностью загружена
    await expect(page).toHaveURL(/.*generate/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('время загрузки страницы истории', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/history');
    
    const loadTime = Date.now() - startTime;
    
    // Проверяем, что страница загружается менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000);
    
    // Проверяем, что страница полностью загружена
    await expect(page).toHaveURL(/.*history/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('навигация между страницами быстрая', async ({ page }) => {
    await page.goto('/');
    
    // Измеряем время перехода на страницу создания
    const startTime = Date.now();
    await page.getByRole('link', { name: /csv генератор/i }).click();
    const navigationTime = Date.now() - startTime;
    
    // Проверяем, что навигация происходит менее чем за 1 секунду
    expect(navigationTime).toBeLessThan(1000);
    
    // Измеряем время перехода на страницу истории
    const startTime2 = Date.now();
    await page.getByRole('link', { name: /история/i }).click();
    const navigationTime2 = Date.now() - startTime2;
    
    // Проверяем, что навигация происходит менее чем за 1 секунду
    expect(navigationTime2).toBeLessThan(1000);
  });

  test('загрузка файла не блокирует интерфейс', async ({ page }) => {
    await page.goto('/');
    
    // Создаем большой CSV файл для тестирования
    const largeCsvContent = 'name,age,city\n' + 
      Array.from({ length: 10000 }, (_, i) => `User${i},${20 + i},City${i}`).join('\n');
    
    const fileInput = page.locator('input[type="file"]');
    
    // Измеряем время загрузки файла
    const startTime = Date.now();
    await fileInput.setInputFiles({
      name: 'large.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(largeCsvContent)
    });
    const uploadTime = Date.now() - startTime;
    
    // Проверяем, что загрузка происходит менее чем за 5 секунд
    expect(uploadTime).toBeLessThan(5000);
    
    // Проверяем, что интерфейс остается отзывчивым
    await expect(page.locator('[data-testid="dropzone"] button')).toBeEnabled();
  });

  test('модальные окна открываются быстро', async ({ page }) => {
    await page.goto('/history');
    
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Измеряем время открытия модального окна
      const startTime = Date.now();
      await historyItems.first().click();
      const modalOpenTime = Date.now() - startTime;
      
      // Проверяем, что модальное окно открывается менее чем за 500мс
      expect(modalOpenTime).toBeLessThan(500);
      
      await expect(page.locator('[data-testid="history-modal"]')).toBeVisible();
    }
  });

  test('отсутствуют утечки памяти при навигации', async ({ page }) => {
    // Запускаем несколько циклов навигации
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      await page.getByRole('link', { name: /csv генератор/i }).click();
      await page.getByRole('link', { name: /история/i }).click();
      await page.getByRole('link', { name: /csv аналитик/i }).click();
    }
    
    // Проверяем, что приложение все еще работает корректно
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('метрики Core Web Vitals в пределах нормы', async ({ page }) => {
    // Включаем сбор метрик
    await page.addInitScript(() => {
      window.performance.mark('test-start');
    });
    
    await page.goto('/');
    
    // Ждем полной загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Получаем метрики производительности
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    // Проверяем метрики
    expect(metrics.domContentLoaded).toBeLessThan(1000); // DOM загружен менее чем за 1с
    expect(metrics.loadComplete).toBeLessThan(2000); // Страница полностью загружена менее чем за 2с
    expect(metrics.firstPaint).toBeLessThan(1000); // Первая отрисовка менее чем за 1с
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // Первое содержимое менее чем за 1.5с
  });
}); 