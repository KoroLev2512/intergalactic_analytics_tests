import { 
    isCsvFile, 
    validateServerResponse, 
    convertHighlightsToArray,
    transformAnalysisData,
    InvalidServerResponseError 
} from './analysis';
import { HIGHLIGHT_TITLES } from './consts';

describe('analysis utils', () => {
    describe('isCsvFile', () => {
        test('возвращает true для CSV файлов', () => {
            const csvFile = new File([''], 'test.csv', { type: 'text/csv' });
            expect(isCsvFile(csvFile)).toBe(true);
        });

        test('возвращает false для не-CSV файлов', () => {
            const txtFile = new File([''], 'test.txt', { type: 'text/plain' });
            expect(isCsvFile(txtFile)).toBe(false);
        });

        test('работает с разными регистрами расширения', () => {
            const csvFile1 = new File([''], 'test.CSV', { type: 'text/csv' });
            const csvFile2 = new File([''], 'test.Csv', { type: 'text/csv' });
            expect(isCsvFile(csvFile1)).toBe(true);
            expect(isCsvFile(csvFile2)).toBe(true);
        });
    });

    describe('validateServerResponse', () => {
        test('возвращает true для валидного ответа', () => {
            const validResponse = {
                total_spend_galactic: 1000,
                rows_affected: 100,
                less_spent_at: '2022-01-01'
            };
            expect(validateServerResponse(validResponse)).toBe(true);
        });

        test('возвращает false для невалидного ответа', () => {
            const invalidResponse = {
                unknown_field: 'value',
                another_field: 123
            };
            expect(validateServerResponse(invalidResponse)).toBe(false);
        });

        test('возвращает true если есть хотя бы одно валидное поле', () => {
            const mixedResponse = {
                total_spend_galactic: 1000,
                unknown_field: 'value'
            };
            expect(validateServerResponse(mixedResponse)).toBe(true);
        });
    });

    describe('convertHighlightsToArray', () => {
        test('преобразует объект highlights в массив', () => {
            const highlights = {
                total_spend_galactic: 1000,
                rows_affected: 100
            };
            const result = convertHighlightsToArray(highlights);
            
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                title: '1000',
                description: HIGHLIGHT_TITLES.total_spend_galactic
            });
            expect(result[1]).toEqual({
                title: '100',
                description: HIGHLIGHT_TITLES.rows_affected
            });
        });

        test('округляет числовые значения', () => {
            const highlights = {
                total_spend_galactic: 1000.7
            };
            const result = convertHighlightsToArray(highlights);
            
            expect(result[0].title).toBe('1001');
        });

        test('обрабатывает строковые значения', () => {
            const highlights = {
                less_spent_at: '2022-01-01'
            };
            const result = convertHighlightsToArray(highlights);
            
            expect(result[0].title).toBe('2022-01-01');
        });

        test('использует fallback для неизвестных ключей', () => {
            const highlights = {
                unknown_key: 'value'
            };
            const result = convertHighlightsToArray(highlights);
            
            expect(result[0].description).toBe('Неизвестный параметр');
        });
    });

    describe('transformAnalysisData', () => {
        test('успешно трансформирует валидные данные', () => {
            const mockData = {
                total_spend_galactic: 1000,
                rows_affected: 100
            };
            const uint8Array = new TextEncoder().encode(JSON.stringify(mockData) + '\n');
            
            const result = transformAnalysisData(uint8Array);
            
            expect(result.highlights).toEqual({
                total_spend_galactic: 1000,
            });
            expect(result.highlightsToStore).toHaveLength(1);
        });

        test('выбрасывает ошибку для невалидных данных', () => {
            const invalidData = {
                unknown_field: 'value'
            };
            const uint8Array = new TextEncoder().encode(JSON.stringify(invalidData) + '\n');
            
            expect(() => transformAnalysisData(uint8Array)).toThrow(InvalidServerResponseError);
        });

        test('исключает rows_affected из highlightsToStore', () => {
            const mockData = {
                total_spend_galactic: 1000,
                rows_affected: 100
            };
            const uint8Array = new TextEncoder().encode(JSON.stringify(mockData) + '\n');
            
            const result = transformAnalysisData(uint8Array);
            
            const hasRowsAffected = result.highlightsToStore.some(
                item => item.description === HIGHLIGHT_TITLES.rows_affected
            );
            expect(hasRowsAffected).toBe(false);
        });
    });

    describe('InvalidServerResponseError', () => {
        test('создает экземпляр ошибки с правильным именем', () => {
            const error = new InvalidServerResponseError('Test error');
            expect(error.name).toBe('InvalidServerResponseError');
            expect(error.message).toBe('Test error');
        });
    });
}); 