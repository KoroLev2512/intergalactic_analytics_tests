import '@testing-library/jest-dom';

// Полифилл для TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Мок для import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_HOST: 'http://localhost:3000',
      },
    },
  },
});

// Mock для consts.ts
jest.mock('./utils/consts', () => ({
  STORAGE_KEY: 'tableHistory',
  API_HOST: 'http://localhost:3000',
  HIGHLIGHT_TITLES: {
    total_spend_galactic: 'Общие расходы',
    rows_affected: 'Обработано строк',
    less_spent_at: 'День min расходов',
    big_spent_at: 'День max расходов',
    less_spent_value: 'Min расходы в день',
    big_spent_value: 'Max расходы в день',
    average_spend_galactic: 'Средние расходы',
    big_spent_civ: 'Цивилизация max расходов',
    less_spent_civ: 'Цивилизация min расходов',
  },
}));

// Mock для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock для ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})); 