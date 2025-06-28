import { render, screen } from '@testing-library/react';
import { Upload } from './Upload';

// Mock для SvgBase
jest.mock('../../SvgBase', () => ({
    SvgBase: ({ children, size, ...props }: any) => (
        <svg data-testid="svg-base" data-size={size} {...props}>
            {children}
        </svg>
    ),
}));

describe('Upload', () => {
    test('рендерит SVG с базовыми пропсами', () => {
        render(<Upload size={24} />);
        const svg = screen.getByTestId('svg-base');
        expect(svg).toBeInTheDocument();
    });

    test('передает размер в SvgBase', () => {
        render(<Upload size={24} />);
        const svg = screen.getByTestId('svg-base');
        expect(svg).toHaveAttribute('data-size', '24');
    });

    test('передает дополнительные пропсы в SvgBase', () => {
        render(<Upload size={24} className="custom-class" data-testid="upload-icon" />);
        const svg = screen.getByTestId('upload-icon');
        expect(svg).toHaveClass('custom-class');
    });

    test('содержит path элементы', () => {
        render(<Upload size={24} />);
        const paths = document.querySelectorAll('path');
        expect(paths).toHaveLength(2);
    });

    test('первый path имеет правильные атрибуты', () => {
        render(<Upload size={24} />);
        const firstPath = document.querySelector('path');
        expect(firstPath).toHaveAttribute('d', 'M17.4999 5.31085V22.8488');
        expect(firstPath).toHaveAttribute('stroke', 'currentColor');
        expect(firstPath).toHaveAttribute('stroke-width', '2.5');
    });

    test('второй path имеет правильные атрибуты', () => {
        render(<Upload size={24} />);
        const paths = document.querySelectorAll('path');
        const secondPath = paths[1];
        expect(secondPath).toHaveAttribute('stroke', 'currentColor');
        expect(secondPath).toHaveAttribute('stroke-width', '2.5');
        expect(secondPath).toHaveAttribute('stroke-linecap', 'round');
        expect(secondPath).toHaveAttribute('stroke-linejoin', 'round');
    });
}); 