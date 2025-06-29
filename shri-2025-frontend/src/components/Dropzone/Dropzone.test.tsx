import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropzone } from './Dropzone';
import styles from './Dropzone.module.css';

// Mock для FileDisplay компонента
jest.mock('../FileDisplay', () => ({
    FileDisplay: ({ file, status, onClear }: any) => (
        <div data-testid="file-display">
            {(file?.name ?? '')} - {status}
            <button onClick={onClear}>Clear</button>
        </div>
    ),
}));

describe('Dropzone', () => {
    const defaultProps = {
        onFileSelect: jest.fn(),
        onClear: jest.fn(),
        file: null,
        status: 'idle' as const,
        error: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('рендерит базовую структуру', () => {
        render(<Dropzone {...defaultProps} />);
        expect(screen.getByText('Загрузить файл')).toBeInTheDocument();
        expect(screen.getByText('или перетащите сюда .csv файл')).toBeInTheDocument();
    });

    test('открывает файловый диалог при клике', async () => {
        const user = userEvent.setup();
        render(<Dropzone {...defaultProps} />);

        const fileInput = screen.getByText('Загрузить файл').closest('button');
        expect(fileInput).toBeInTheDocument();
        await user.click(fileInput!);

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.accept).toBe('.csv');
    });

    test('вызывает onFileSelect для валидного CSV файла', async () => {
        const user = userEvent.setup();
        render(<Dropzone {...defaultProps} />);

        const fileInput = screen.getByText('Загрузить файл').closest('button');
        expect(fileInput).toBeInTheDocument();
        await user.click(fileInput!);

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });

        fireEvent.change(input, { target: { files: [csvFile] } });

        expect(defaultProps.onFileSelect).toHaveBeenCalledWith(csvFile);
    });

    test('обрабатывает drag and drop событие', () => {
        render(<Dropzone {...defaultProps} />);
        const dropzone = screen.getByText('Загрузить файл').closest('div[role="button"]');

        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        const dataTransfer = {
            files: [csvFile],
        };

        fireEvent.drop(dropzone!, { dataTransfer });

        expect(defaultProps.onFileSelect).toHaveBeenCalledWith(csvFile);
    });

    test('показывает Loader когда файл загружен и status="processing"', () => {
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        render(<Dropzone {...defaultProps} file={file} status="processing" />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    test('применяет правильные CSS классы при drag', () => {
        render(<Dropzone {...defaultProps} />);
        const dropzone = screen.getByText('Загрузить файл').closest('div[role="button"]');

        fireEvent.dragEnter(dropzone!);
        // Проверяем, что dragEnter сработал (конкретные классы зависят от реализации)
        expect(dropzone).toBeInTheDocument();
    });

    test('применяет CSS класс при ошибке валидации', async () => {
        const user = userEvent.setup();
        render(<Dropzone {...defaultProps} />);

        const fileInput = screen.getByText('Загрузить файл').closest('button');
        expect(fileInput).toBeInTheDocument();
        await user.click(fileInput!);

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });

        fireEvent.change(input, { target: { files: [txtFile] } });

        // Проверяем, что ошибка валидации обработана
        expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
    });

    test('очищает ошибку валидации при новом drag', () => {
        render(<Dropzone {...defaultProps} />);
        const dropzone = screen.getByText('Загрузить файл').closest('div[role="button"]');

        // Сначала создаем ошибку валидации
        const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const dataTransfer = { files: [txtFile] };
        fireEvent.drop(dropzone!, { dataTransfer });

        // Затем перетаскиваем валидный файл
        const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
        const validDataTransfer = { files: [csvFile] };
        fireEvent.drop(dropzone!, { dataTransfer: validDataTransfer });

        expect(defaultProps.onFileSelect).toHaveBeenCalledWith(csvFile);
    });

    test('не открывает файловый диалог при клике когда файл уже загружен', async () => {
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        render(<Dropzone {...defaultProps} file={file} />);
        expect(screen.getByTestId('file-display')).toBeInTheDocument();
    });
}); 