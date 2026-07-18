const fs = require('fs');
const path = require('../path'); // Adjust the path to your actual module location

// Mocking fs.promises and path for testing
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        readdir: jest.fn()
    }
}));

jest.mock('path', () => ({
    join: jest.fn((a, b) => `${a}/${b}`)
}));

describe('isValidFileName', () => {
    it('should return true for valid file names', () => {
        expect(isValidFileName('script1.js')).toBe(true);
        expect(isValidFileName('_script2.js')).toBe(true);
    });

    it('should return false for invalid file names', () => {
        expect(isValidFileName('script!@.js')).toBe(false);
        expect(isValidFileName('script..js')).toBe(false);
        expect(isValidFileName('script.js ')).toBe(false);
    });
});

describe('readFile', () => {
    it('should read and log file content', async () => {
        fs.promises.readFile.mockResolvedValueOnce('file content');
        await readFile('/path/to/file.js');
        expect(fs.promises.readFile).toHaveBeenCalledWith('/path/to/file.js', 'utf8');
        console.log = jest.fn();
        expect(console.log).toHaveBeenCalledWith('Content of /path/to/file.js:');
        expect(console.log).toHaveBeenCalledWith('file content');
    });

    it('should log error if file read fails', async () => {
        fs.promises.readFile.mockRejectedValueOnce(new Error('Error'));
        await readFile('/path/to/file.js');
        console.error = jest.fn();
        expect(console.error).toHaveBeenCalledWith('Error reading file /path/to/file.js:', 'Error');
    });
});

describe('processFiles', () => {
    it('should process valid files in directory', async () => {
        fs.promises.readdir.mockResolvedValueOnce(['script1.js', 'script2.js']);
        fs.lstatSync.mockReturnValueOnce({ isFile: () => true });
        fs.promises.readFile.mockResolvedValueOnce('content1');
        fs.promises.readFile.mockResolvedValueOnce('content2');

        const consoleLog = jest.spyOn(console, 'log');
        await processFiles('/path/to/dir');
        expect(fs.promises.readdir).toHaveBeenCalledWith('/path/to/dir');
        expect(fs.lstatSync).toHaveBeenCalledWith('/path/to/dir/script1.js');
        expect(fs.promises.readFile).toHaveBeenCalledWith('/path/to/dir/script1.js', 'utf8');
        expect(consoleLog).toHaveBeenCalledWith('Content of /path/to/dir/script1.js:');
        expect(consoleLog).toHaveBeenCalledWith('content1');
        expect(consoleLog).toHaveBeenCalledWith('Content of /path/to/dir/script2.js:');
        expect(consoleLog).toHaveBeenCalledWith('content2');
    });

    it('should skip invalid files', async () => {
        fs.promises.readdir.mockResolvedValueOnce(['script1.js', 'script!@.js']);
        fs.lstatSync.mockReturnValueOnce({ isFile: () => true });
        fs.lstatSync.mockReturnValueOnce({ isFile: () => false });

        const consoleLog = jest.spyOn(console, 'log');
        await processFiles('/path/to/dir');
        expect(fs.promises.readdir).toHaveBeenCalledWith('/path/to/dir');
        expect(fs.lstatSync).toHaveBeenCalledWith('/path/to/dir/script1.js');
        expect(fs.promises.readFile).not.toHaveBeenCalled();
        expect(consoleLog).toHaveBeenCalledWith('Skipping invalid file: /path/to/dir/script!@.js');
    });

    it('should log error if directory read fails', async () => {
        fs.promises.readdir.mockRejectedValueOnce(new Error('Error'));
        await processFiles('/path/to/dir');
        const consoleError = jest.spyOn(console, 'error');
        expect(fs.promises.readdir).toHaveBeenCalledWith('/path/to/dir');
        expect(consoleError).toHaveBeenCalledWith('Error processing files:', 'Error');
    });
});