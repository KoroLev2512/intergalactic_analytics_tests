import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
    test('рендерит текст с базовыми пропсами', () => {
        render(<Typography>Test text</Typography>);
        const element = screen.getByText('Test text');
        expect(element).toBeInTheDocument();
        expect(element.tagName).toBe('P');
    });

    test('рендерит как указанный HTML элемент', () => {
        render(<Typography as="h1">Heading</Typography>);
        const element = screen.getByText('Heading');
        expect(element.tagName).toBe('H1');
    });

    test('применяет дополнительный className', () => {
        render(<Typography className="custom-class">Custom text</Typography>);
        const element = screen.getByText('Custom text');
        expect(element).toHaveClass('custom-class');
    });

    test('комбинирует все пропсы корректно', () => {
        render(
            <Typography
                as="h2"
                size="l"
                weight="medium"
                color="light"
                style="italic"
                className="test-class"
                maxRowsNumber={2}
            >
                Complex text
            </Typography>
        );
        const element = screen.getByText('Complex text');
        expect(element.tagName).toBe('H2');
        expect(element).toHaveClass('test-class');
    });
}); 