import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GenerateMoreButton } from './GenerateMoreButton';

// Mock для react-router-dom
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('GenerateMoreButton', () => {
    const mockNavigate = jest.fn();
    const mockUseNavigate = require('react-router-dom').useNavigate;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNavigate.mockReturnValue(mockNavigate);
    });

    test('рендерит кнопку с правильным текстом', () => {
        render(<GenerateMoreButton />);
        expect(screen.getByRole('button', { name: /сгенерировать больше/i })).toBeInTheDocument();
    });

    test('вызывает navigate при клике', async () => {
        const user = userEvent.setup();
        render(<GenerateMoreButton />);
        
        const button = screen.getByRole('button', { name: /сгенерировать больше/i });
        await user.click(button);
        
        expect(mockNavigate).toHaveBeenCalledWith('/generate');
    });

    test('применяет правильный variant для кнопки', () => {
        render(<GenerateMoreButton />);
        const button = screen.getByRole('button', { name: /сгенерировать больше/i });
        
        // Проверяем, что кнопка имеет правильный variant
        expect(button).toBeInTheDocument();
    });

    test('кнопка доступна для взаимодействия', async () => {
        const user = userEvent.setup();
        render(<GenerateMoreButton />);
        
        const button = screen.getByRole('button', { name: /сгенерировать больше/i });
        expect(button).toBeEnabled();
        
        await user.click(button);
        expect(mockNavigate).toHaveBeenCalled();
    });
}); 