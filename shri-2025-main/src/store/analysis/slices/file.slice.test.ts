import { createFileSlice } from './file.slice';
import { AnalysisState } from '../types';

describe('createFileSlice', () => {
    let mockSet: jest.Mock;
    let slice: ReturnType<typeof createFileSlice>;

    beforeEach(() => {
        mockSet = jest.fn();
        slice = createFileSlice(mockSet);
    });

    test('создает slice с начальным состоянием', () => {
        expect(slice.file).toBeNull();
        expect(slice.status).toBe('idle');
    });

    test('setFile обновляет file и сбрасывает состояние', () => {
        const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });

        slice.setFile(mockFile);

        expect(mockSet).toHaveBeenCalledWith(
            { 
                file: mockFile, 
                status: 'idle', 
                highlights: [], 
                error: null 
            },
            false,
            'file/setFile'
        );
    });

    test('setFile с null очищает состояние', () => {
        slice.setFile(null);

        expect(mockSet).toHaveBeenCalledWith(
            { 
                file: null, 
                status: 'idle', 
                highlights: [], 
                error: null 
            },
            false,
            'file/setFile'
        );
    });

    test('setStatus обновляет только status', () => {
        slice.setStatus('processing');

        expect(mockSet).toHaveBeenCalledWith(
            { status: 'processing' },
            false,
            'file/setStatus'
        );
    });

    test('setStatus может установить completed', () => {
        slice.setStatus('completed');

        expect(mockSet).toHaveBeenCalledWith(
            { status: 'completed' },
            false,
            'file/setStatus'
        );
    });

    test('setStatus может установить error', () => {
        slice.setStatus('error');

        expect(mockSet).toHaveBeenCalledWith(
            { status: 'error' },
            false,
            'file/setStatus'
        );
    });
}); 