import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from './HomePage';

// Mock для store
jest.mock('../../store/analysisStore', () => ({
    useAnalysisStore: jest.fn(),
}));

// Mock для хука
jest.mock('../../hooks/use-csv-analysis', () => ({
    useCsvAnalysis: jest.fn(),
}));

// Mock для компонентов
jest.mock('../../components/FileUploadSection', () => ({
    FileUploadSection: ({ file, status, error, onFileSelect, onSend, onClear }: any) => (
        <div data-testid="file-upload-section">
            <button onClick={() => onFileSelect(new File(['test'], 'test.csv'))}>Select File</button>
            <button onClick={onSend} disabled={!file || status === 'processing'}>Send</button>
            <button onClick={onClear}>Clear</button>
            {file && <span>File: {file.name}</span>}
            {status && <span>Status: {status}</span>}
            {error && <span>Error: {error}</span>}
        </div>
    ),
}));

jest.mock('../../components/HighlightsSection', () => ({
    HighlightsSection: ({ highlights }: any) => (
        <div data-testid="highlights-section">
            {highlights?.length ? `${highlights.length} highlights` : 'No highlights'}
        </div>
    ),
}));

// Mock для storage
jest.mock('../../utils/storage', () => ({
    addToHistory: jest.fn(),
}));

import { useAnalysisStore } from '../../store/analysisStore';
import { useCsvAnalysis } from '../../hooks/use-csv-analysis';
import { addToHistory } from '../../utils/storage';

describe('HomePage', () => {
    const mockUseAnalysisStore = useAnalysisStore as jest.MockedFunction<typeof useAnalysisStore>;
    const mockUseCsvAnalysis = useCsvAnalysis as jest.MockedFunction<typeof useCsvAnalysis>;
    const mockAddToHistory = addToHistory as jest.MockedFunction<typeof addToHistory>;

    const mockStore = {
        file: null,
        status: 'idle' as const,
        highlights: [],
        error: null,
        setFile: jest.fn(),
        setStatus: jest.fn(),
        setHighlights: jest.fn(),
        reset: jest.fn(),
        setError: jest.fn(),
    };

    const mockAnalyzeCsv = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAnalysisStore.mockReturnValue(mockStore);
        mockUseCsvAnalysis.mockReturnValue({ analyzeCsv: mockAnalyzeCsv });
    });

    test('рендерит заголовок страницы', () => {
        render(<HomePage />);
        expect(screen.getByRole('heading', { name: /Загрузите.*csv.*файл/i })).toBeInTheDocument();
    });

    test('рендерит FileUploadSection с правильными пропсами', () => {
        render(<HomePage />);
        expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    });

    test('рендерит HighlightsSection с правильными пропсами', () => {
        render(<HomePage />);
        expect(screen.getByTestId('highlights-section')).toBeInTheDocument();
        expect(screen.getByText('No highlights')).toBeInTheDocument();
    });

    test('показывает highlights когда они есть', () => {
        const mockHighlights = [
            { title: '1000', description: 'Общие расходы' },
        ];
        mockUseAnalysisStore.mockReturnValue({
            ...mockStore,
            highlights: mockHighlights,
        });

        render(<HomePage />);
        expect(screen.getByText('1 highlights')).toBeInTheDocument();
    });

    test('обрабатывает выбор файла', async () => {
        const user = userEvent.setup();
        render(<HomePage />);

        const selectButton = screen.getByText('Select File');
        await user.click(selectButton);

        expect(mockStore.setFile).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'test.csv' })
        );
    });

    test('обрабатывает отправку файла', async () => {
        const user = userEvent.setup();
        const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({
            ...mockStore,
            file: mockFile,
        });

        render(<HomePage />);

        const sendButton = screen.getByText('Send');
        await user.click(sendButton);

        expect(mockStore.setStatus).toHaveBeenCalledWith('processing');
        expect(mockAnalyzeCsv).toHaveBeenCalledWith(mockFile);
    });

    test('не отправляет файл если он не выбран', async () => {
        const user = userEvent.setup();
        render(<HomePage />);

        const sendButton = screen.getByText('Send');
        expect(sendButton).toBeDisabled();
    });

    test('не отправляет файл во время обработки', async () => {
        const user = userEvent.setup();
        const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({
            ...mockStore,
            file: mockFile,
            status: 'processing',
        });

        render(<HomePage />);

        const sendButton = screen.getByText('Send');
        expect(sendButton).toBeDisabled();
    });

    test('обрабатывает очистку', async () => {
        const user = userEvent.setup();
        render(<HomePage />);

        const clearButton = screen.getByText('Clear');
        await user.click(clearButton);

        expect(mockStore.reset).toHaveBeenCalled();
    });

    test('показывает статус файла', () => {
        const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({
            ...mockStore,
            file: mockFile,
            status: 'processing',
        });

        render(<HomePage />);
        expect(screen.getByText('File: test.csv')).toBeInTheDocument();
        expect(screen.getByText('Status: processing')).toBeInTheDocument();
    });

    test('показывает ошибку', () => {
        mockUseAnalysisStore.mockReturnValue({
            ...mockStore,
            error: 'Test error message',
        });

        render(<HomePage />);
        expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
    });

    test('вызывает addToHistory при успешном завершении', async () => {
        const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({
            ...mockStore,
            file: mockFile,
        });

        render(<HomePage />);

        // Симулируем успешное завершение анализа
        const onComplete = mockUseCsvAnalysis.mock.calls[0][0].onComplete;
        onComplete({ total_spend_galactic: 1000 });

        expect(mockStore.setStatus).toHaveBeenCalledWith('completed');
        expect(mockAddToHistory).toHaveBeenCalledWith({
            fileName: 'test.csv',
            highlights: { total_spend_galactic: 1000 },
        });
    });

    test('вызывает addToHistory при ошибке', async () => {
        const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({
            ...mockStore,
            file: mockFile,
        });

        render(<HomePage />);

        // Симулируем ошибку
        const onError = mockUseCsvAnalysis.mock.calls[0][0].onError;
        onError(new Error('Test error'));

        expect(mockStore.setError).toHaveBeenCalledWith('Test error');
        expect(mockAddToHistory).toHaveBeenCalledWith({
            fileName: 'test.csv',
        });
    });
}); 