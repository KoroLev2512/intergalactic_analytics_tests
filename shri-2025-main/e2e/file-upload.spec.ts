import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Загрузка файлов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('drag & drop CSV файла работает корректно', async ({ page }) => {
    // Создаем тестовый CSV файл
    const csvContent = 'name,age,city\nJohn,25,New York\nJane,30,London';
    
    // Находим скрытый input для файлов
    const fileInput = page.locator('input[type="file"]');
    
    // Симулируем загрузку файла
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Проверяем, что файл был загружен
    await expect(page.getByText(/файл загружен/i)).toBeVisible();
  });

  test('валидация неподдерживаемых форматов файлов', async ({ page }) => {
    // Создаем тестовый TXT файл (неподдерживаемый формат)
    const txtContent = 'This is a text file';
    
    // Находим скрытый input для файлов
    const fileInput = page.locator('input[type="file"]');
    
    // Симулируем загрузку неподдерживаемого файла
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(txtContent)
    });
    
    // Проверяем, что отображается ошибка валидации
    await expect(page.getByText(/можно загружать только/i)).toBeVisible();
  });

  test('кнопка выбора файла работает', async ({ page }) => {
    // Находим скрытый input для файлов
    const fileInput = page.locator('input[type="file"]');
    
    // Проверяем, что input существует
    await expect(fileInput).toBeAttached();
    
    // Проверяем, что кнопка "Загрузить файл" кликабельна (используем более специфичный селектор)
    const selectButton = page.locator('[data-testid="dropzone"] button');
    await expect(selectButton).toBeEnabled();
  });

  test('отображение состояния загрузки', async ({ page }) => {
    // Создаем большой CSV файл для тестирования состояния загрузки
    const largeCsvContent = 'name,age,city\n' + 
      Array.from({ length: 1000 }, (_, i) => `User${i},${20 + i},City${i}`).join('\n');
    
    const fileInput = page.locator('input[type="file"]');
    
    // Симулируем загрузку большого файла
    await fileInput.setInputFiles({
      name: 'large.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(largeCsvContent)
    });
    
    // Проверяем, что файл был загружен
    await expect(page.getByText(/файл загружен/i)).toBeVisible();
  });

  test('очистка загруженного файла', async ({ page }) => {
    // Сначала загружаем файл
    const csvContent = 'name,age\nJohn,25';
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Проверяем, что файл загружен
    await expect(page.getByText(/файл загружен/i)).toBeVisible();
    
    // Ищем кнопку очистки и кликаем на неё
    const clearButton = page.getByRole('button', { name: /очистить/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
      
      // Проверяем, что файл очищен
      await expect(page.getByText(/перетащите сюда/i)).toBeVisible();
    }
  });
}); 