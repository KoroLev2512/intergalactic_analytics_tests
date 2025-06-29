import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader', () => {
    test('рендерит лоадер с базовым размером', () => {
        render(<Loader data-testid="loader" />);
        const loader = screen.getByTestId('loader');
        expect(loader).toBeInTheDocument();
        expect(loader).toHaveStyle({ width: '60px', height: '60px' });
    });

    test('применяет кастомный размер', () => {
        render(<Loader size={100} data-testid="loader" />);
        const loader = screen.getByTestId('loader');
        expect(loader).toHaveStyle({ width: '100px', height: '100px' });
    });

    test('работает с нулевым размером', () => {
        render(<Loader size={0} data-testid="loader" />);
        const loader = screen.getByTestId('loader');
        expect(loader).toHaveStyle({ width: '0px', height: '0px' });
    });

    test('работает с отрицательным размером', () => {
        render(<Loader size={-10} data-testid="loader" />);
        const loader = screen.getByTestId('loader');
        expect(loader).toHaveStyle({ width: '-10px', height: '-10px' });
    });
}); 