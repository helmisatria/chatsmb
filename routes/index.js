const express = require('express');

const router = express.Router();

// Utils
const CLEANING = require('../utils/cleaningDataset');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const cleaningDataset = await CLEANING();

  res.json(cleaningDataset);
});

module.exports = router;
