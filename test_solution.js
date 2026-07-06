const createTranslation = require('./createTranslation'); // Adjust the import path as necessary

describe('createTranslation', () => {
    it('should throw an error for empty source text', async () => {
        await expect(createTranslation('', 'en')).rejects.toThrow('Source text is required and must be a non-empty string.');
    });

    it('should throw an error for invalid source text type', async () => {
        await expect(createTranslation(123, 'en')).rejects.toThrow('Source text is required and must be a non-empty string.');
    });

    it('should throw an error for empty target language', async () => {
        await expect(createTranslation('hello', '')).rejects.toThrow('Target language is required and must be a valid ISO 639-1 language code.');
    });

    it('should throw an error for invalid target language type', async () => {
        await expect(createTranslation('hello', 123)).rejects.toThrow('Target language is required and must be a valid ISO 639-1 language code.');
    });

    it('should throw an error for unsupported source text', async () => {
        await expect(createTranslation('unknown', 'en')).rejects.toThrow('Translation not available for the provided source text and target language.');
    });

    it('should throw an error for unsupported target language', async () => {
        await expect(createTranslation('hello', 'pt')).rejects.toThrow('Target language is required and must be a valid ISO 639-1 language code.');
    });

    it('should return the correct translation', async () => {
        const result = await createTranslation('hello', 'es');
        expect(result).toEqual({ translation: 'Hola' });
    });
});