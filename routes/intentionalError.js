const express = require('express');
const router = express.Router();
const Util = require('../utilities/index'); // Ensure the correct path

// Intentional error route wrapped in handleErrors
router.get('/trigger-error', Util.handleErrors(async (req, res, next) => {
    throw new Error('Intentional 500 Internal Server Error');
}));

module.exports = router