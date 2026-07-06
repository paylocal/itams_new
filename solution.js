/**
 * Deletes a translation from the database.
 *
 * @param {Object} req - The request object containing the translation ID to delete.
 * @param {Object} res - The response object used to send back the result of the operation.
 */
function deleteTranslation(req, res) {
    const translationId = req.params.id;

    if (!translationId || !Number.isInteger(Number(translationId))) {
        return res.status(400).json({ error: 'Invalid translation ID' });
    }

    // Assuming `deleteTranslationById` is a function that handles the deletion in the database
    deleteTranslationById(translationId)
        .then(() => {
            res.status(204).send(); // 204 No Content, successful deletion with no content to return
        })
        .catch((error) => {
            console.error('Error deleting translation:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
}