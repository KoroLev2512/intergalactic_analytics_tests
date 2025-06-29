import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
    test('рендерит переданный текст', () => {
        render(<Button>Click me</Button>);
        const btn = screen.getByRole('button', { name: /click me/i });
        expect(btn).toBeInTheDocument();
    });

    test('применяет класс для variant и fullWidth', () => {
        render(
            <Button variant="secondary" fullWidth>
                Secondary
            </Button>
        );
        const btn = screen.getByRole('button', { name: /secondary/i });
        expect(btn).toBeInTheDocument();
    });

    test('применяет класс disabled и блокирует клики', async () => {
        const handleClick = jest.fn();
        render(
            <Button disabled onClick={handleClick}>
                Disabled
            </Button>
        );
        const btn = screen.getByRole('button', { name: /disabled/i });
        expect(btn).toBeDisabled();
        await userEvent.click(btn);
        expect(handleClick).not.toHaveBeenCalled();
    });

    test('добавляет дополнительный className', () => {
        render(
            <Button className="my-class">
                ExtraClass
            </Button>
        );
        const btn = screen.getByRole('button', { name: /extraclass/i });
        expect(btn).toHaveClass('my-class');
    });
});