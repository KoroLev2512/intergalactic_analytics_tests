import { formatDate } from './formateDate';

describe('formatDate', () => {
    test('форматирует timestamp в миллисекундах', () => {
        const timestamp = 1640995200000; // 01.01.2022
        expect(formatDate(timestamp)).toBe('01.01.2022');
    });

    test('форматирует объект Date', () => {
        const date = new Date('2022-12-31');
        expect(formatDate(date)).toBe('31.12.2022');
    });

    test('добавляет ведущие нули для однозначных чисел', () => {
        const timestamp = 1640995200000; // 01.01.2022
        expect(formatDate(timestamp)).toBe('01.01.2022');
    });

    test('корректно обрабатывает разные месяцы', () => {
        const marchDate = new Date('2022-03-15');
        expect(formatDate(marchDate)).toBe('15.03.2022');

        const decemberDate = new Date('2022-12-05');
        expect(formatDate(decemberDate)).toBe('05.12.2022');
    });

    test('корректно обрабатывает високосный год', () => {
        const leapYearDate = new Date('2024-02-29');
        expect(formatDate(leapYearDate)).toBe('29.02.2024');
    });

    test('обрабатывает начало и конец месяца', () => {
        const startOfMonth = new Date('2022-06-01');
        expect(formatDate(startOfMonth)).toBe('01.06.2022');

        const endOfMonth = new Date('2022-06-30');
        expect(formatDate(endOfMonth)).toBe('30.06.2022');
    });
}); 