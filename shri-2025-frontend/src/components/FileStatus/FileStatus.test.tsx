import { render, screen } from '@testing-library/react';

import { FileStatus } from './FileStatus';

describe('FileStatus', () => {
    test('отображает успешное состояние', () => {
        render(<FileStatus type="success" isActive={true} />);
        
        expect(screen.getByText('Обработан успешно')).toBeInTheDocument();
        expect(screen.getByText('Обработан успешно')).toBeInTheDocument();
    });

    test('отображает состояние ошибки', () => {
        render(<FileStatus type="error" isActive={true} />);
        
        expect(screen.getByText('Не удалось обработать')).toBeInTheDocument();
    });

    test('отображает иконку Smile для успешного состояния', () => {
        render(<FileStatus type="success" isActive={true} />);
        
        // Проверяем наличие SVG иконки
        const smileIcon = document.querySelector('svg');
        expect(smileIcon).toBeInTheDocument();
    });

    test('отображает иконку SmileSad для состояния ошибки', () => {
        render(<FileStatus type="error" isActive={true} />);
        
        // Проверяем наличие SVG иконки
        const sadIcon = document.querySelector('svg');
        expect(sadIcon).toBeInTheDocument();
    });

    test('применяет активный класс когда isActive=true', () => {
        render(<FileStatus type="success" isActive={true} />);
        
        const statusElement = screen.getByText('Обработан успешно').closest('span');
        expect(statusElement).toBeInTheDocument();
    });

    test('не применяет активный класс когда isActive=false', () => {
        render(<FileStatus type="success" isActive={false} />);
        
        const statusElement = screen.getByText('Обработан успешно').closest('span');
        expect(statusElement).toBeInTheDocument();
    });

    test('рендерит с правильной структурой для успешного состояния', () => {
        const { container } = render(<FileStatus type="success" isActive={true} />);
        
        expect(screen.getByText('Обработан успешно')).toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('рендерит с правильной структурой для состояния ошибки', () => {
        const { container } = render(<FileStatus type="error" isActive={true} />);
        
        expect(screen.getByText('Не удалось обработать')).toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
    });
}); 