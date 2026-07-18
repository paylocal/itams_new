const fs = require('fs');
const path = require('path');

/**
 * Validates a file's name against specific criteria.
 * @param {string} fileName - The name of the file to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidFileName(fileName) {
    const allowedChars = /^[a-zA-Z0-9_]+$/;
    return allowedChars.test(fileName);
}

/**
 * Reads a file and logs its content with error handling.
 * @param {string} filePath - The path to the file to read.
 */
async function readFile(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        console.log(`Content of ${filePath}:`);
        console.log(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
    }
}

/**
 * Processes all files in a directory with error handling and validation.
 * @param {string} dirPath - The path to the directory containing the files.
 */
async function processFiles(dirPath) {
    try {
        const files = await fs.promises.readdir(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            if (fs.lstatSync(filePath).isFile() && isValidFileName(file)) {
                await readFile(filePath);
            } else {
                console.warn(`Skipping invalid file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Error processing files:', error.message);
    }
}

// Example usage:
const legacyScriptsDir = path.join(__dirname, 'tools', 'legacy-scripts');
processFiles(legacyScriptsDir).catch(console.error);
```

This code includes:
1. Validation for file names to ensure they contain only allowed characters.
2. Error handling when reading files.
3. A loop to process all files in the specified directory.
4. Logging of errors and warnings.