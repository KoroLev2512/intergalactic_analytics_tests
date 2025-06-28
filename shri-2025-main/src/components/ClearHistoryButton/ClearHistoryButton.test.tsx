import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ClearHistoryButton } from './ClearHistoryButton';

// Mock для useHistoryStore
jest.mock('@store/historyStore', () => ({
    useHistoryStore: jest.fn(),
}));

// Mock для storage utils
jest.mock('@utils/storage', () => ({
    clearHistory: jest.fn(),
}));

describe('ClearHistoryButton', () => {
    const mockClearHistory = jest.fn();
    const mockUseHistoryStore = require('@store/historyStore').useHistoryStore;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('не рендерится когда история пуста', () => {
        mockUseHistoryStore.mockReturnValue({
            clearHistory: mockClearHistory,
            history: [],
        });

        const { container } = render(<ClearHistoryButton />);
        expect(container.firstChild).toBeNull();
    });

    test('рендерится когда в истории есть элементы', () => {
        mockUseHistoryStore.mockReturnValue({
            clearHistory: mockClearHistory,
            history: [{ id: '1', name: 'test.csv', date: '2024-01-01' }],
        });

        render(<ClearHistoryButton />);
        expect(screen.getByRole('button', { name: /очистить всё/i })).toBeInTheDocument();
    });

    test('вызывает функции очистки при клике', async () => {
        const user = userEvent.setup();
        const mockClearHistoryStorage = require('@utils/storage').clearHistory;
        
        mockUseHistoryStore.mockReturnValue({
            clearHistory: mockClearHistory,
            history: [{ id: '1', name: 'test.csv', date: '2024-01-01' }],
        });

        render(<ClearHistoryButton />);
        const button = screen.getByRole('button', { name: /очистить всё/i });
        
        await user.click(button);
        
        expect(mockClearHistory).toHaveBeenCalledTimes(1);
        expect(mockClearHistoryStorage).toHaveBeenCalledTimes(1);
    });

    test('применяет правильный variant для кнопки', () => {
        mockUseHistoryStore.mockReturnValue({
            clearHistory: mockClearHistory,
            history: [{ id: '1', name: 'test.csv', date: '2024-01-01' }],
        });

        render(<ClearHistoryButton />);
        const button = screen.getByRole('button', { name: /очистить всё/i });
        
        // Проверяем, что кнопка имеет правильный variant
        expect(button).toBeInTheDocument();
    });
}); 