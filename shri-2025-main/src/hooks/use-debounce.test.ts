import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('animation type (по умолчанию)', () => {
        test('вызывает функцию через requestAnimationFrame', () => {
            const mockFn = jest.fn();
            const { result } = renderHook(() => useDebounce(mockFn));

            act(() => {
                result.current('test');
            });

            // В animation типе функция вызывается через requestAnimationFrame
            expect(mockFn).not.toHaveBeenCalled();

            // Симулируем requestAnimationFrame
            act(() => {
                jest.runAllTimers();
            });

            expect(mockFn).toHaveBeenCalledWith('test');
        });

        test('дебаунсит множественные вызовы', () => {
            const mockFn = jest.fn();
            const { result } = renderHook(() => useDebounce(mockFn));

            act(() => {
                result.current('first');
                result.current('second');
                result.current('third');
            });

            // Функция еще не вызвана
            expect(mockFn).not.toHaveBeenCalled();

            // Симулируем requestAnimationFrame
            act(() => {
                jest.runAllTimers();
            });

            // В animation типе все вызовы обрабатываются через очередь
            expect(mockFn).toHaveBeenCalledWith('first');
            expect(mockFn).toHaveBeenCalledWith('second');
            expect(mockFn).toHaveBeenCalledWith('third');
            expect(mockFn).toHaveBeenCalledTimes(3);
        });
    });

    describe('timeout type', () => {
        test('вызывает функцию через setTimeout с заданной задержкой', () => {
            const mockFn = jest.fn();
            const delay = 500;
            const { result } = renderHook(() => useDebounce(mockFn, { type: 'timeout', delay }));

            act(() => {
                result.current('test');
            });

            // Функция еще не вызвана
            expect(mockFn).not.toHaveBeenCalled();

            // Симулируем прохождение времени
            act(() => {
                jest.advanceTimersByTime(delay);
            });

            expect(mockFn).toHaveBeenCalledWith('test');
        });

        test('дебаунсит множественные вызовы с timeout', () => {
            const mockFn = jest.fn();
            const delay = 100;
            const { result } = renderHook(() => useDebounce(mockFn, { type: 'timeout', delay }));

            act(() => {
                result.current('first');
                result.current('second');
                result.current('third');
            });

            // Функция еще не вызвана
            expect(mockFn).not.toHaveBeenCalled();

            // Симулируем прохождение времени
            act(() => {
                jest.advanceTimersByTime(delay);
            });

            // В timeout типе обрабатывается только первый вызов из очереди
            expect(mockFn).toHaveBeenCalledWith('first');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });
    });

    describe('общие тесты', () => {
        test('передает правильные аргументы в функцию', () => {
            const mockFn = jest.fn();
            const { result } = renderHook(() => useDebounce(mockFn));

            act(() => {
                result.current('arg1', 'arg2', 123);
            });

            // Симулируем requestAnimationFrame
            act(() => {
                jest.runAllTimers();
            });

            expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
        });

        test('работает с пустой очередью', () => {
            const mockFn = jest.fn();
            const { result } = renderHook(() => useDebounce(mockFn));

            // Не вызываем функцию - очередь должна остаться пустой
            expect(mockFn).not.toHaveBeenCalled();
        });

        test('использует значения по умолчанию', () => {
            const mockFn = jest.fn();
            const { result } = renderHook(() => useDebounce(mockFn));

            act(() => {
                result.current('test');
            });

            // Симулируем requestAnimationFrame
            act(() => {
                jest.runAllTimers();
            });

            expect(mockFn).toHaveBeenCalledWith('test');
        });
    });
}); 