import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Modal } from './Modal';

jest.mock('../Portal', () => ({
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Modal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('рендерит содержимое когда открыт', () => {
        render(
            <Modal {...defaultProps}>
                <div>Modal Content</div>
            </Modal>
        );
        
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    test('не применяет backdropShown класс когда закрыт', () => {
        render(
            <Modal {...defaultProps} isOpen={false}>
                <div>Modal Content</div>
            </Modal>
        );
        
        const backdrop = screen.getByTestId('backdrop');
        expect(backdrop).not.toHaveClass('backdropShown');
    });

    test('вызывает onClose при клике на backdrop', async () => {
        const user = userEvent.setup();
        render(
            <Modal {...defaultProps}>
                <div>Modal Content</div>
            </Modal>
        );
        
        const backdrop = screen.getByTestId('backdrop');
        await user.click(backdrop);
        
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('не вызывает onClose при клике на содержимое модала', async () => {
        const user = userEvent.setup();
        render(
            <Modal {...defaultProps}>
                <div>Modal Content</div>
            </Modal>
        );
        
        const content = screen.getByText('Modal Content');
        await user.click(content);
        
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    test('вызывает onClose при клике на кнопку закрытия', async () => {
        const user = userEvent.setup();
        render(
            <Modal {...defaultProps}>
                <div>Modal Content</div>
            </Modal>
        );
        
        const closeButton = screen.getByRole('button');
        await user.click(closeButton);
        
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('не отображает кнопку закрытия когда onClose не передан', () => {
        render(
            <Modal isOpen={true}>
                <div>Modal Content</div>
            </Modal>
        );
        
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('отображает иконку закрытия', () => {
        render(
            <Modal {...defaultProps}>
                <div>Modal Content</div>
            </Modal>
        );
        
        const closeButton = screen.getByRole('button');
        expect(closeButton.querySelector('svg')).toBeInTheDocument();
    });

    test('применяет правильные CSS классы когда открыт', () => {
        render(
            <Modal {...defaultProps}>
                <div>Modal Content</div>
            </Modal>
        );
        
        const backdrop = screen.getByTestId('backdrop');
        expect(backdrop).toHaveClass('backdropShown');
    });

    test('рендерит сложное содержимое', () => {
        render(
            <Modal {...defaultProps}>
                <div>
                    <h2>Заголовок</h2>
                    <p>Текст параграфа</p>
                    <button>Кнопка</button>
                </div>
            </Modal>
        );
        
        expect(screen.getByText('Заголовок')).toBeInTheDocument();
        expect(screen.getByText('Текст параграфа')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Кнопка' })).toBeInTheDocument();
    });

    test('работает без onClose функции', () => {
        render(
            <Modal isOpen={true}>
                <div>Modal Content</div>
            </Modal>
        );
        
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    test('всегда рендерится в DOM через Portal', () => {
        render(
            <Modal {...defaultProps} isOpen={false}>
                <div>Modal Content</div>
            </Modal>
        );
        
        // Modal всегда рендерится, но может быть скрыт CSS
        expect(screen.getByTestId('backdrop')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });
});