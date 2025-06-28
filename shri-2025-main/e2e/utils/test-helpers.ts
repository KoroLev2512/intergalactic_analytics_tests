import { Page, expect } from '@playwright/test';

/**
 * Создает тестовый CSV файл с заданными данными
 */
export function createTestCSV(headers: string[], rows: string[][]): string {
  const headerRow = headers.join(',');
  const dataRows = rows.map(row => row.join(','));
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Создает большой тестовый CSV файл для тестирования производительности
 */
export function createLargeTestCSV(rowCount: number = 1000): string {
  const headers = ['id', 'name', 'age', 'city', 'email'];
  const rows = Array.from({ length: rowCount }, (_, i) => [
    i.toString(),
    `User${i}`,
    (20 + i % 50).toString(),
    `City${i % 10}`,
    `user${i}@example.com`
  ]);
  
  return createTestCSV(headers, rows);
}

/**
 * Ждет загрузки файла и проверяет его статус
 */
export async function waitForFileUpload(page: Page, timeout: number = 10000): Promise<void> {
  await expect(page.getByText(/файл загружен/i)).toBeVisible({ timeout });
}

/**
 * Ждет завершения генерации анализа
 */
export async function waitForAnalysisGeneration(page: Page, timeout: number = 30000): Promise<void> {
  // Ждем появления лоадера
  await expect(page.locator('[data-testid="loader"]')).toBeVisible();
  
  // Ждем исчезновения лоадера
  await expect(page.locator('[data-testid="loader"]')).not.toBeVisible({ timeout });
}

/**
 * Загружает файл в dropzone
 */
export async function uploadFile(page: Page, fileName: string, content: string, mimeType: string = 'text/csv'): Promise<void> {
  const dropZone = page.locator('[data-testid="dropzone"]');
  await dropZone.setInputFiles({
    name: fileName,
    mimeType,
    buffer: Buffer.from(content)
  });
}

/**
 * Проверяет, что модальное окно открыто и закрывает его
 */
export async function closeModal(page: Page): Promise<void> {
  const modal = page.locator('[data-testid="history-modal"]');
  if (await modal.isVisible()) {
    const closeButton = page.getByRole('button', { name: /закрыть/i });
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  }
}

/**
 * Очищает историю если она есть
 */
export async function clearHistoryIfExists(page: Page): Promise<void> {
  const clearButton = page.getByRole('button', { name: /очистить историю/i });
  if (await clearButton.isEnabled()) {
    await clearButton.click();
    
    // Подтверждаем очистку если есть модальное окно
    const confirmButton = page.getByRole('button', { name: /подтвердить/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }
}

/**
 * Проверяет, что элемент видим и кликабелен
 */
export async function expectElementToBeClickable(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toBeEnabled();
}

/**
 * Ждет стабилизации страницы
 */
export async function waitForPageStabilization(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Дополнительная задержка для анимаций
}

/**
 * Проверяет метрики производительности
 */
export async function checkPerformanceMetrics(page: Page): Promise<{
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
}> {
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
  
  return metrics;
} 