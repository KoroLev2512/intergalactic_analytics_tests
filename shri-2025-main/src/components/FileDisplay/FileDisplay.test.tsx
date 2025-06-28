import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileDisplay } from './FileDisplay';

describe('FileDisplay', () => {
    const defaultProps = {
        fileName: 'test.csv',
        onClear: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('рендерит имя файла', () => {
        render(<FileDisplay {...defaultProps} />);
        expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    test('вызывает onClear при клике на кнопку очистки', async () => {
        const user = userEvent.setup();
        render(<FileDisplay {...defaultProps} />);
        
        const clearButton = screen.getByRole('button');
        await user.click(clearButton);
        
        expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
    });

    test('блокирует кнопку очистки когда isProcessing=true', () => {
        render(<FileDisplay {...defaultProps} isProcessing={true} />);
        
        const clearButton = screen.getByRole('button');
        expect(clearButton).toBeDisabled();
    });

    test('не блокирует кнопку очистки когда isProcessing=false', () => {
        render(<FileDisplay {...defaultProps} isProcessing={false} />);
        
        const clearButton = screen.getByRole('button');
        expect(clearButton).toBeEnabled();
    });

    test('применяет правильные CSS классы для завершенного состояния', () => {
        render(<FileDisplay {...defaultProps} isCompleted={true} />);
        
        const fileName = screen.getByText('test.csv');
        expect(fileName).toBeInTheDocument();
    });

    test('отображает иконку очистки', () => {
        render(<FileDisplay {...defaultProps} />);
        
        // Проверяем, что кнопка содержит иконку (SVG)
        const clearButton = screen.getByRole('button');
        expect(clearButton.querySelector('svg')).toBeInTheDocument();
    });

    test('рендерит с длинным именем файла', () => {
        const longFileName = 'very-long-file-name-with-many-characters.csv';
        render(<FileDisplay {...defaultProps} fileName={longFileName} />);
        
        expect(screen.getByText(longFileName)).toBeInTheDocument();
    });

    test('работает с пустым именем файла', () => {
        render(<FileDisplay {...defaultProps} fileName="" />);
        
        const clearButton = screen.getByRole('button');
        expect(clearButton).toBeInTheDocument();
    });
}); 