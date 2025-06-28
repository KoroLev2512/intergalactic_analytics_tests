import { createAnalysisSlice } from './analysis.slice';
import { AnalysisState } from '../types';

describe('createAnalysisSlice', () => {
    let mockSet: jest.Mock;
    let slice: ReturnType<typeof createAnalysisSlice>;

    beforeEach(() => {
        mockSet = jest.fn();
        slice = createAnalysisSlice(mockSet);
    });

    test('создает slice с начальным состоянием', () => {
        expect(slice.highlights).toEqual([]);
        expect(slice.error).toBeNull();
    });

    test('setHighlights обновляет highlights', () => {
        const mockHighlights = [
            { title: '1000', description: 'Общие расходы' },
            { title: '100', description: 'Обработано строк' },
        ];

        slice.setHighlights(mockHighlights);

        expect(mockSet).toHaveBeenCalledWith(
            { highlights: mockHighlights },
            false,
            'analysis/setHighlights'
        );
    });

    test('setError обновляет error и status', () => {
        const errorMessage = 'Test error message';

        slice.setError(errorMessage);

        expect(mockSet).toHaveBeenCalledWith(
            { error: errorMessage, status: 'error' },
            false,
            'analysis/setError'
        );
    });

    test('setError может установить null', () => {
        slice.setError(null);

        expect(mockSet).toHaveBeenCalledWith(
            { error: null, status: 'error' },
            false,
            'analysis/setError'
        );
    });

    test('setHighlights с пустым массивом', () => {
        slice.setHighlights([]);

        expect(mockSet).toHaveBeenCalledWith(
            { highlights: [] },
            false,
            'analysis/setHighlights'
        );
    });
}); 