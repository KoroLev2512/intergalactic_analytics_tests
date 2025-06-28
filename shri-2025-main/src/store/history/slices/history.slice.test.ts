import { createHistorySlice } from './history.slice';
import { HistoryState } from '../types';
import { HistoryItemType } from '../../../types/history';

// Mock для getHistory
jest.mock('../../../utils/storage', () => ({
    getHistory: jest.fn(),
}));

import { getHistory } from '../../../utils/storage';

describe('createHistorySlice', () => {
    let mockSet: jest.Mock;
    let slice: ReturnType<typeof createHistorySlice>;
    let mockGetHistory: jest.MockedFunction<typeof getHistory>;

    beforeEach(() => {
        mockSet = jest.fn();
        mockGetHistory = getHistory as jest.MockedFunction<typeof getHistory>;
        mockGetHistory.mockReturnValue([]);
        slice = createHistorySlice(mockSet);
    });

    test('создает slice с начальным состоянием из storage', () => {
        expect(slice.history).toEqual([]);
        expect(slice.selectedItem).toBeNull();
    });

    test('clearHistory очищает историю', () => {
        slice.clearHistory();

        expect(mockSet).toHaveBeenCalledWith(
            { history: [] },
            false,
            'history/clearHistory'
        );
    });

    test('removeFromHistory удаляет элемент по id', () => {
        const mockState = {
            history: [
                { id: '1', fileName: 'test1.csv', date: '2022-01-01' },
                { id: '2', fileName: 'test2.csv', date: '2022-01-02' },
            ],
        };

        mockSet.mockImplementation((updater) => {
            if (typeof updater === 'function') {
                return updater(mockState);
            }
            return updater;
        });

        slice.removeFromHistory('1');

        expect(mockSet).toHaveBeenCalledWith(
            expect.any(Function),
            false,
            'history/removeFromHistory'
        );

        const updater = mockSet.mock.calls[0][0];
        const result = updater(mockState);
        expect(result.history).toEqual([
            { id: '2', fileName: 'test2.csv', date: '2022-01-02' },
        ]);
    });

    test('addToHistory добавляет новый элемент', () => {
        const mockState = {
            history: [
                { id: '1', fileName: 'test1.csv', date: '2022-01-01' },
            ],
        };

        const newItem: HistoryItemType = {
            id: '2',
            fileName: 'test2.csv',
            date: '2022-01-02',
        };

        mockSet.mockImplementation((updater) => {
            if (typeof updater === 'function') {
                return updater(mockState);
            }
            return updater;
        });

        slice.addToHistory(newItem);

        expect(mockSet).toHaveBeenCalledWith(
            expect.any(Function),
            false,
            'history/addToHistory'
        );

        const updater = mockSet.mock.calls[0][0];
        const result = updater(mockState);
        expect(result.history).toEqual([
            { id: '1', fileName: 'test1.csv', date: '2022-01-01' },
            { id: '2', fileName: 'test2.csv', date: '2022-01-02' },
        ]);
    });

    test('setSelectedItem устанавливает выбранный элемент', () => {
        const selectedItem: HistoryItemType = {
            id: '1',
            fileName: 'test.csv',
            date: '2022-01-01',
        };

        slice.setSelectedItem(selectedItem);

        expect(mockSet).toHaveBeenCalledWith(
            { selectedItem },
            false,
            'history/setSelectedItem'
        );
    });

    test('resetSelectedItem сбрасывает выбранный элемент', () => {
        slice.resetSelectedItem();

        expect(mockSet).toHaveBeenCalledWith(
            { selectedItem: null },
            false,
            'history/resetSelectedItem'
        );
    });

    test('updateHistoryFromStorage обновляет историю из storage', () => {
        const mockHistory = [
            { id: '1', fileName: 'test1.csv', date: '2022-01-01' },
            { id: '2', fileName: 'test2.csv', date: '2022-01-02' },
        ];

        mockGetHistory.mockReturnValue(mockHistory);

        slice.updateHistoryFromStorage();

        expect(mockSet).toHaveBeenCalledWith(
            { history: mockHistory },
            false,
            'history/updateHistoryFromStorage'
        );
    });

    test('removeFromHistory не удаляет элемент если id не найден', () => {
        const mockState = {
            history: [
                { id: '1', fileName: 'test1.csv', date: '2022-01-01' },
            ],
        };

        mockSet.mockImplementation((updater) => {
            if (typeof updater === 'function') {
                return updater(mockState);
            }
            return updater;
        });

        slice.removeFromHistory('nonexistent');

        const updater = mockSet.mock.calls[0][0];
        const result = updater(mockState);
        expect(result.history).toEqual([
            { id: '1', fileName: 'test1.csv', date: '2022-01-01' },
        ]);
    });
}); 