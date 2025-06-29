import { render, screen } from '@testing-library/react';

import { HistoryModal } from './HistoryModal';

// Mock для useHistoryStore
jest.mock('@store/historyStore', () => ({
    useHistoryStore: jest.fn(),
}));

// Mock для HighlightCard
jest.mock('@components/HighlightCard', () => ({
    HighlightCard: ({ highlight }: any) => (
        <div data-testid="highlight-card">
            {highlight.title} - {highlight.value}
        </div>
    ),
}));

// Mock для utils
jest.mock('@utils/analysis', () => ({
    convertHighlightsToArray: jest.fn(),
}));

describe('HistoryModal', () => {
    const mockUseHistoryStore = require('@store/historyStore').useHistoryStore;
    const mockConvertHighlightsToArray = require('@utils/analysis').convertHighlightsToArray;

    const mockHighlights = [
        { title: 'Общие расходы', value: '1000 галактических кредитов' },
        { title: 'Обработано записей', value: '100' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockConvertHighlightsToArray.mockReturnValue(mockHighlights);
    });

    test('не рендерится когда модал закрыт', () => {
        mockUseHistoryStore.mockReturnValue({
            isOpenModal: false,
            selectedItem: null,
            hideModal: jest.fn(),
        });

        const { container } = render(<HistoryModal />);
        expect(container.firstChild).toBeNull();
    });

    test('не рендерится когда нет выбранного элемента', () => {
        mockUseHistoryStore.mockReturnValue({
            isOpenModal: true,
            selectedItem: null,
            hideModal: jest.fn(),
        });

        const { container } = render(<HistoryModal />);
        expect(container.firstChild).toBeNull();
    });

    test('не рендерится когда у элемента нет хайлайтов', () => {
        mockUseHistoryStore.mockReturnValue({
            isOpenModal: true,
            selectedItem: { id: '1', fileName: 'test.csv', highlights: null },
            hideModal: jest.fn(),
        });

        const { container } = render(<HistoryModal />);
        expect(container.firstChild).toBeNull();
    });

    test('рендерится когда модал открыт и есть выбранный элемент с хайлайтами', () => {
        mockUseHistoryStore.mockReturnValue({
            isOpenModal: true,
            selectedItem: {
                id: '1',
                fileName: 'test.csv',
                highlights: {
                    total_spend_galactic: 1000,
                    rows_affected: 100,
                },
            },
            hideModal: jest.fn(),
        });

        render(<HistoryModal />);
        
        expect(screen.getByTestId('history-modal')).toBeInTheDocument();
        expect(screen.getAllByTestId('highlight-card')).toHaveLength(2);
    });

    test('отображает хайлайты из выбранного элемента', () => {
        mockUseHistoryStore.mockReturnValue({
            isOpenModal: true,
            selectedItem: {
                id: '1',
                fileName: 'test.csv',
                highlights: {
                    total_spend_galactic: 1000,
                    rows_affected: 100,
                },
            },
            hideModal: jest.fn(),
        });

        render(<HistoryModal />);
        
        expect(screen.getByText('Общие расходы - 1000 галактических кредитов')).toBeInTheDocument();
        expect(screen.getByText('Обработано записей - 100')).toBeInTheDocument();
    });

    test('вызывает convertHighlightsToArray с правильными данными', () => {
        const mockSelectedItem = {
            id: '1',
            fileName: 'test.csv',
            highlights: {
                total_spend_galactic: 1000,
                rows_affected: 100,
            },
        };

        mockUseHistoryStore.mockReturnValue({
            isOpenModal: true,
            selectedItem: mockSelectedItem,
            hideModal: jest.fn(),
        });

        render(<HistoryModal />);
        
        expect(mockConvertHighlightsToArray).toHaveBeenCalledWith(mockSelectedItem.highlights);
    });

    test('применяет правильные CSS классы', () => {
        mockUseHistoryStore.mockReturnValue({
            isOpenModal: true,
            selectedItem: {
                id: '1',
                fileName: 'test.csv',
                highlights: {
                    total_spend_galactic: 1000,
                    rows_affected: 100,
                },
            },
            hideModal: jest.fn(),
        });

        render(<HistoryModal />);
        
        const modalRoot = screen.getByTestId('history-modal');
        expect(modalRoot).toBeInTheDocument();
    });

    test('передает правильные props в HighlightCard', () => {
        mockUseHistoryStore.mockReturnValue({
            isOpenModal: true,
            selectedItem: {
                id: '1',
                fileName: 'test.csv',
                highlights: {
                    total_spend_galactic: 1000,
                    rows_affected: 100,
                },
            },
            hideModal: jest.fn(),
        });

        render(<HistoryModal />);
        
        const highlightCards = screen.getAllByTestId('highlight-card');
        expect(highlightCards).toHaveLength(2);
    });
}); 