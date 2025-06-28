import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Запускаем тесты в файлах параллельно */
  fullyParallel: true,
  /* Запускаем тесты в браузерах параллельно */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter для результатов тестов */
  reporter: 'html',
  /* Общие настройки для всех проектов */
  use: {
    /* Базовый URL для тестов */
    baseURL: 'http://localhost:5173',
    /* Создаем скриншоты при ошибках */
    screenshot: 'only-on-failure',
    /* Записываем видео при ошибках */
    video: 'retain-on-failure',
    /* Трассировка для отладки */
    trace: 'on-first-retry',
  },

  /* Настройки для скриншотов */
  expect: {
    /* Порог различия для скриншотов (0-1) */
    toHaveScreenshot: { threshold: 0.2 },
    /* Порог различия для сравнения изображений */
    toMatchSnapshot: { threshold: 0.2 },
  },

  /* Настройки для разных браузеров */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Можно добавить другие браузеры позже
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],

  /* Веб-сервер для запуска приложения */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
}); 