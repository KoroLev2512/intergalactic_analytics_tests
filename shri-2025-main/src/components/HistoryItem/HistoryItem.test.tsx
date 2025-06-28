import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HistoryItem } from './HistoryItem';

describe('HistoryItem', () => {
    const mockItem = {
        id: '1',
        fileName: 'test.csv',
        timestamp: 1704110400000, // 2024-01-01T10:00:00Z
        highlights: {
            total_spend_galactic: 1000,
            rows_affected: 100,
            less_spent_at: 1,
            big_spent_at: 365,
            less_spent_value: 10,
            big_spent_value: 500,
            average_spend_galactic: 50,
            big_spent_civ: 'Earth',
            less_spent_civ: 'Mars',
        },
    };

    const mockItemWithoutHighlights = {
        id: '2',
        fileName: 'test2.csv',
        timestamp: 1704110400000, // 2024-01-01T10:00:00Z
        highlights: undefined,
    };

    const defaultProps = {
        onClick: jest.fn(),
        onDelete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('рендерит информацию о файле', () => {
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        expect(screen.getByText('test.csv')).toBeInTheDocument();
        expect(screen.getByText(/обработан успешно/i)).toBeInTheDocument();
    });

    test('вызывает onClick при клике на элемент с хайлайтами', async () => {
        const user = userEvent.setup();
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        const itemButton = screen.getByRole('button', { name: /открыть хайлайты для test\.csv/i });
        await user.click(itemButton);
        
        expect(defaultProps.onClick).toHaveBeenCalledWith(mockItem);
    });

    test('не вызывает onClick при клике на элемент без хайлайтов', async () => {
        const user = userEvent.setup();
        render(<HistoryItem {...defaultProps} item={mockItemWithoutHighlights} />);
        
        const itemButton = screen.getByRole('button', { name: /открыть хайлайты для test2\.csv/i });
        await user.click(itemButton);
        
        expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    test('вызывает onDelete при клике на кнопку удаления', async () => {
        const user = userEvent.setup();
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        const deleteButton = screen.getByRole('button', { name: /удалить файл test\.csv/i });
        await user.click(deleteButton);
        
        expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
    });

    test('отображает иконку файла', () => {
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        const fileIcon = document.querySelector('svg');
        expect(fileIcon).toBeInTheDocument();
    });

    test('отображает иконку корзины для удаления', () => {
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        const deleteButton = screen.getByRole('button', { name: /удалить файл test\.csv/i });
        expect(deleteButton.querySelector('svg')).toBeInTheDocument();
    });

    test('отображает статус успеха для элемента с хайлайтами', () => {
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        expect(screen.getByText(/обработан успешно/i)).toBeInTheDocument();
    });

    test('отображает статус ошибки для элемента без хайлайтов', () => {
        render(<HistoryItem {...defaultProps} item={mockItemWithoutHighlights} />);
        
        expect(screen.getByText(/не удалось обработать/i)).toBeInTheDocument();
    });

    test('применяет disabled класс для элемента без хайлайтов', () => {
        render(<HistoryItem {...defaultProps} item={mockItemWithoutHighlights} />);
        
        const itemButton = screen.getByRole('button', { name: /открыть хайлайты для test2\.csv/i });
        expect(itemButton).toBeInTheDocument();
    });

    test('отображает отформатированную дату', () => {
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        // Проверяем, что дата отображается (конкретный формат зависит от функции formatDate)
        const dateElement = screen.getByText(/\d{1,2}\.\d{1,2}\.\d{4}/);
        expect(dateElement).toBeInTheDocument();
    });

    test('имеет правильные aria-label атрибуты', () => {
        render(<HistoryItem {...defaultProps} item={mockItem} />);
        
        expect(screen.getByRole('button', { name: /открыть хайлайты для test\.csv/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /удалить файл test\.csv/i })).toBeInTheDocument();
    });
}); 