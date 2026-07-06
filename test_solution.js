const fixEnv = require('./fixEnv'); // Adjust the import path as necessary

describe('fixEnv function', () => {
    it('should throw an error if env is not an object', () => {
        expect(() => fixEnv(null)).toThrowError('Invalid input: env must be an object');
        expect(() => fixEnv('not an object')).toThrowError('Invalid input: env must be an object');
        expect(() => fixEnv(123)).toThrowError('Invalid input: env must be an object');
    });

    it('should return the original object if no changes are needed', () => {
        const env = { key1: 'value1', key2: 456 };
        expect(fixEnv(env)).toEqual({ key1: 'value1', key2: 456 });
    });

    it('should fix typos in string values', () => {
        const env = { key1: 'typo', key2: 'typo_value' };
        expect(fixEnv(env)).toEqual({ key1: 'type', key2: 'type_value' });
    });

    it('should handle empty objects', () => {
        const env = {};
        expect(fixEnv(env)).toEqual({});
    });

    it('should handle large objects', () => {
        const env = { ...Array.from({ length: 1000 }, (_, i) => ({ key: `key${i}`, value: `value${i}` })) };
        const fixedEnv = fixEnv(env);
        expect(fixedEnv).toEqual({ ...Array.from({ length: 1000 }, (_, i) => ({ key: `key${i}`, value: `value${i}` })) });
    });

    it('should handle negative and zero values', () => {
        const env = { key1: -1, key2: 0, key3: 'no-typo' };
        expect(fixEnv(env)).toEqual({ key1: -1, key2: 0, key3: 'no-typo' });
    });

    it('should handle non-string values', () => {
        const env = { key1: 'value1', key2: 456, key3: true, key4: null };
        expect(fixEnv(env)).toEqual({ key1: 'value1', key2: 456, key3: true, key4: null });
    });
});