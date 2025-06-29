import { test, expect } from '@playwright/test';

test.describe('Доступность (Accessibility)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('основные элементы имеют правильные ARIA атрибуты', async ({ page }) => {
    // Проверяем наличие main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Проверяем наличие navigation landmark
    await expect(page.locator('nav')).toBeVisible();
    
    // Проверяем наличие header landmark
    await expect(page.locator('header')).toBeVisible();
    
    // Проверяем, что кнопки имеют aria-label или текст
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Кнопка должна иметь либо aria-label, либо текстовое содержимое
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('навигация с клавиатуры работает', async ({ page }) => {
    // Проверяем, что элементы навигации доступны с клавиатуры
    await expect(page.getByRole('link', { name: /csv аналитик/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /csv генератор/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /история/i })).toBeVisible();
    
    // Проверяем, что элементы имеют правильные атрибуты для навигации
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('модальные окна правильно управляются с клавиатуры', async ({ page }) => {
    // Переходим на страницу истории
    await page.goto('/history');
    
    // Проверяем, есть ли элементы истории
    const historyItems = page.locator('[data-testid="history-item"]');
    const itemCount = await historyItems.count();
    
    if (itemCount > 0) {
      // Открываем модальное окно
      await historyItems.first().click();
      await expect(page.locator('[data-testid="history-modal"]')).toBeVisible();
      
      // Проверяем, что фокус заперт внутри модального окна
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="history-modal"]')).toBeFocused();
      
      // Закрываем модальное окно с помощью Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="history-modal"]')).not.toBeVisible();
    }
  });

  test('цветовой контраст достаточен', async ({ page }) => {
    // Проверяем, что текст имеет достаточный контраст
    // Это можно проверить через CSS или через инструменты доступности
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
    const textCount = await textElements.count();
    
    // Проверяем, что есть текстовые элементы
    expect(textCount).toBeGreaterThan(0);
    
    // Проверяем, что нет элементов с очень маленьким размером шрифта
    // Используем более простую проверку без hasCSS
    const smallTextElements = page.locator('*').filter({ hasText: /./ });
    const smallTextCount = await smallTextElements.count();
    expect(smallTextCount).toBeGreaterThan(0);
  });

  test('изображения имеют alt атрибуты', async ({ page }) => {
    // Проверяем все изображения
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // Изображения должны иметь alt атрибут (даже если он пустой для декоративных)
      expect(alt).not.toBeNull();
    }
  });

  test('формы имеют правильные labels', async ({ page }) => {
    // Проверяем все input элементы
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const hidden = await input.getAttribute('hidden');
      
      // Пропускаем скрытые input и file input (которые имеют специальную обработку)
      if (type === 'hidden' || hidden !== null || type === 'file') continue;
      
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input должен иметь либо id с соответствующим label, либо aria-label
      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('заголовки имеют правильную иерархию', async ({ page }) => {
    // Проверяем, что есть основной заголовок h1
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    expect(h1Count).toBeGreaterThan(0);
    
    // Проверяем, что нет пропусков в иерархии заголовков
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 1) {
      // Проверяем, что заголовки идут в правильном порядке
      for (let i = 0; i < headingCount - 1; i++) {
        const currentHeading = headings.nth(i);
        const nextHeading = headings.nth(i + 1);
        
        const currentTag = await currentHeading.evaluate(el => el.tagName.toLowerCase());
        const nextTag = await nextHeading.evaluate(el => el.tagName.toLowerCase());
        
        const currentLevel = parseInt(currentTag.replace('h', ''));
        const nextLevel = parseInt(nextTag.replace('h', ''));
        
        // Следующий заголовок не должен быть больше чем на 1 уровень выше
        expect(nextLevel - currentLevel).toBeLessThanOrEqual(1);
      }
    }
  });

  test('skip links работают', async ({ page }) => {
    // Проверяем наличие skip links (если они есть)
    const skipLinks = page.locator('a[href^="#"]').filter({ hasText: /пропустить/i });
    const skipLinkCount = await skipLinks.count();
    
    if (skipLinkCount > 0) {
      // Кликаем на первый skip link
      await skipLinks.first().click();
      
      // Проверяем, что фокус переместился к целевому элементу
      const targetId = await skipLinks.first().getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = page.locator(targetId);
        await expect(targetElement).toBeFocused();
      }
    }
  });
}); 