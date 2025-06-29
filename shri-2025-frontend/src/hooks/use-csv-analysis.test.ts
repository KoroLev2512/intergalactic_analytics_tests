import { renderHook } from '@testing-library/react';
import { useCsvAnalysis } from './use-csv-analysis';
import { InvalidServerResponseError } from '../utils/analysis';

// Mock для fetch
global.fetch = jest.fn();

// Mock для ReadableStream
const mockReadableStream = {
    getReader: jest.fn(),
};

const mockReader = {
    read: jest.fn(),
};

describe('useCsvAnalysis', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
        mockReadableStream.getReader.mockReturnValue(mockReader);
    });

    test('успешно анализирует CSV файл', async () => {
        const mockOnData = jest.fn();
        const mockOnError = jest.fn();
        const mockOnComplete = jest.fn();

        const mockResponse = {
            ok: true,
            body: mockReadableStream,
        };

        const mockData = {
            total_spend_galactic: 1000,
            rows_affected: 100,
        };

        const encodedData = new TextEncoder().encode(JSON.stringify(mockData) + '\n');

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        mockReader.read
            .mockResolvedValueOnce({ done: false, value: encodedData })
            .mockResolvedValueOnce({ done: true, value: undefined });

        const { result } = renderHook(() =>
            useCsvAnalysis({
                onData: mockOnData,
                onError: mockOnError,
                onComplete: mockOnComplete,
            })
        );

        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        await result.current.analyzeCsv(csvFile);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/aggregate?rows=10000'),
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            })
        );

        expect(mockOnData).toHaveBeenCalled();
        expect(mockOnComplete).toHaveBeenCalled();
        expect(mockOnError).not.toHaveBeenCalled();
    });

    test('обрабатывает ошибку сервера', async () => {
        const mockOnData = jest.fn();
        const mockOnError = jest.fn();
        const mockOnComplete = jest.fn();

        const mockResponse = {
            ok: false,
            body: mockReadableStream,
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() =>
            useCsvAnalysis({
                onData: mockOnData,
                onError: mockOnError,
                onComplete: mockOnComplete,
            })
        );

        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        await result.current.analyzeCsv(csvFile);

        expect(mockOnError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Неизвестная ошибка парсинга :(',
            })
        );
        expect(mockOnData).not.toHaveBeenCalled();
        expect(mockOnComplete).not.toHaveBeenCalled();
    });

    test('обрабатывает пустой ответ от сервера', async () => {
        const mockOnData = jest.fn();
        const mockOnError = jest.fn();
        const mockOnComplete = jest.fn();

        const mockResponse = {
            ok: true,
            body: null,
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() =>
            useCsvAnalysis({
                onData: mockOnData,
                onError: mockOnError,
                onComplete: mockOnComplete,
            })
        );

        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        await result.current.analyzeCsv(csvFile);

        expect(mockOnError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Неизвестная ошибка парсинга :(',
            })
        );
    });

    test('обрабатывает InvalidServerResponseError', async () => {
        const mockOnData = jest.fn();
        const mockOnError = jest.fn();
        const mockOnComplete = jest.fn();

        const mockResponse = {
            ok: true,
            body: mockReadableStream,
        };

        const invalidData = {
            unknown_field: 'value',
        };

        const encodedData = new TextEncoder().encode(JSON.stringify(invalidData) + '\n');

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        mockReader.read
            .mockResolvedValueOnce({ done: false, value: encodedData })
            .mockResolvedValueOnce({ done: true, value: undefined });

        const { result } = renderHook(() =>
            useCsvAnalysis({
                onData: mockOnData,
                onError: mockOnError,
                onComplete: mockOnComplete,
            })
        );

        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        await result.current.analyzeCsv(csvFile);

        expect(mockOnError).toHaveBeenCalledWith(
            expect.any(InvalidServerResponseError)
        );
        expect(mockOnData).not.toHaveBeenCalled();
        expect(mockOnComplete).not.toHaveBeenCalled();
    });

    test('обрабатывает сетевые ошибки', async () => {
        const mockOnData = jest.fn();
        const mockOnError = jest.fn();
        const mockOnComplete = jest.fn();

        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() =>
            useCsvAnalysis({
                onData: mockOnData,
                onError: mockOnError,
                onComplete: mockOnComplete,
            })
        );

        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        await result.current.analyzeCsv(csvFile);

        expect(mockOnError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Неизвестная ошибка парсинга :(',
            })
        );
        expect(mockOnData).not.toHaveBeenCalled();
        expect(mockOnComplete).not.toHaveBeenCalled();
    });

    test('правильно формирует FormData', async () => {
        const mockOnData = jest.fn();
        const mockOnError = jest.fn();
        const mockOnComplete = jest.fn();

        const mockResponse = {
            ok: true,
            body: mockReadableStream,
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        mockReader.read.mockResolvedValue({ done: true, value: undefined });

        const { result } = renderHook(() =>
            useCsvAnalysis({
                onData: mockOnData,
                onError: mockOnError,
                onComplete: mockOnComplete,
            })
        );

        const csvFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
        await result.current.analyzeCsv(csvFile);

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const formData = fetchCall[1].body;

        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get('file')).toBe(csvFile);
    });
}); 