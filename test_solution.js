const deleteTranslation = require('./deleteTranslation');

describe('deleteTranslation function', () => {
  it('should return an error for invalid parameters', (done) => {
    deleteTranslation({}, (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Invalid parameters');
      done();
    });
  });

  it('should return an error for negative translation ID', (done) => {
    deleteTranslation({ translationId: -1 }, (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Invalid translation ID');
      done();
    });
  });

  it('should return an error for zero translation ID', (done) => {
    deleteTranslation({ translationId: 0 }, (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Invalid translation ID');
      done();
    });
  });

  it('should return an error for non-numeric translation ID', (done) => {
    deleteTranslation({ translationId: 'abc' }, (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Invalid translation ID');
      done();
    });
  });

  it('should return a success message and ID for valid translation ID', (done) => {
    deleteTranslation({ translationId: 123 }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({ message: 'Translation deleted', id: 123 });
      done();
    });
  });

  it('should handle large translation ID correctly', (done) => {
    deleteTranslation({ translationId: Number.MAX_SAFE_INTEGER }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({
        message: 'Translation deleted',
        id: Number.MAX_SAFE_INTEGER
      });
      done();
    });
  });
});