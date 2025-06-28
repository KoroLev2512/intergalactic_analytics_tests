import { getHistory, addToHistory, removeFromHistory, clearHistory } from './storage';
import { STORAGE_KEY } from './consts';

// Mock для localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock для crypto.randomUUID
const mockUUID = 'test-uuid-123';
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: jest.fn(() => mockUUID),
    },
});

describe('storage utils', () => {
    let originalConsoleError: typeof console.error;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2022-01-01T00:00:00Z'));
        
        // Подавляем console.error для всех тестов
        originalConsoleError = console.error;
        console.error = jest.fn();
        
        // Сбрасываем моки localStorage к поведению по умолчанию
        localStorageMock.setItem.mockImplementation(() => {});
        localStorageMock.removeItem.mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        
        // Восстанавливаем console.error
        console.error = originalConsoleError;
    });

    describe('getHistory', () => {
        test('возвращает пустой массив если localStorage пустой', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const result = getHistory();

            expect(result).toEqual([]);
            expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
        });

        test('возвращает парсированный массив из localStorage', () => {
            const mockHistory = [
                { id: '1', fileName: 'test1.csv', date: '2022-01-01' },
                { id: '2', fileName: 'test2.csv', date: '2022-01-02' },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

            const result = getHistory();

            expect(result).toEqual(mockHistory);
        });

        test('возвращает пустой массив при ошибке парсинга', () => {
            localStorageMock.getItem.mockReturnValue('invalid json');

            const result = getHistory();

            expect(result).toEqual([]);
        });
    });

    describe('addToHistory', () => {
        test('добавляет новый элемент в начало истории', () => {
            const existingHistory = [
                { id: '1', fileName: 'test1.csv', date: '2022-01-01', timestamp: 1640995200000 },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

            const newItem = {
                fileName: 'test2.csv',
                date: '2022-01-02',
            };

            const result = addToHistory(newItem);

            expect(result).toEqual({
                ...newItem,
                id: mockUUID,
                timestamp: Date.now(),
            });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                JSON.stringify([result, ...existingHistory])
            );
        });

        test('создает новый массив если история пустая', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const newItem = {
                fileName: 'test.csv',
                date: '2022-01-01',
            };

            const result = addToHistory(newItem);

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                JSON.stringify([result])
            );
        });

        test('выбрасывает ошибку при проблемах с localStorage', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const newItem = {
                fileName: 'test.csv',
                date: '2022-01-01',
            };

            expect(() => addToHistory(newItem)).toThrow('Storage error');
        });
    });

    describe('removeFromHistory', () => {
        test('удаляет элемент по id', () => {
            const history = [
                { id: '1', fileName: 'test1.csv', date: '2023-01-01', highlights: {} },
                { id: '2', fileName: 'test2.csv', date: '2023-01-02', highlights: {} },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(history));

            removeFromHistory('1');

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                JSON.stringify([{ id: '2', fileName: 'test2.csv', date: '2023-01-02', highlights: {} }])
            );
        });

        test('не изменяет историю если id не найден', () => {
            const history = [
                { id: '1', fileName: 'test1.csv', date: '2023-01-01', highlights: {} },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(history));

            removeFromHistory('999');

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                JSON.stringify(history)
            );
        });

        test('выбрасывает ошибку при проблемах с localStorage', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const history = [
                { id: '1', fileName: 'test1.csv', date: '2023-01-01', highlights: {} },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(history));

            expect(() => removeFromHistory('1')).toThrow('Storage error');
        });
    });

    describe('clearHistory', () => {
        test('удаляет ключ из localStorage', () => {
            clearHistory();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
        });

        test('выбрасывает ошибку при проблемах с localStorage', () => {
            localStorageMock.removeItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            expect(() => clearHistory()).toThrow('Storage error');
        });
    });
}); 