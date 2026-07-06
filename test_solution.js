const { createTranslationsAPI } = require('./path_to_your_module'); // Adjust the path accordingly

describe('createTranslationsAPI', () => {
  it('should return 400 status when text is missing', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    createTranslationsAPI(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Text is required');
  });

  it('should return 400 status when text is not a string', async () => {
    const req = { body: { text: 123 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    createTranslationsAPI(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid text format');
  });

  it('should return 400 status when text is empty', async () => {
    const req = { body: { text: '' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    createTranslationsAPI(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Text cannot be empty or whitespace');
  });

  it('should return 400 status when text is whitespace', async () => {
    const req = { body: { text: '   ' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    createTranslationsAPI(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Text cannot be empty or whitespace');
  });

  it('should return the translated text', async () => {
    const req = { body: { text: 'hello' } };
    const res = {
      json: jest.fn()
    };

    createTranslationsAPI(req, res);

    expect(res.json).toHaveBeenCalledWith({ originalText: 'hello', translatedText: 'HELLO' });
  });

  it('should return 500 status on translation error', async () => {
    const req = { body: { text: 'hello' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const translateMock = jest.spyOn(global, 'translate').mockImplementation(() => {
      throw new Error('Translation error');
    });

    createTranslationsAPI(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error processing translation');

    translateMock.mockRestore();
  });
});