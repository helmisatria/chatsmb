const express = require('express');

const router = express.Router();

// Utils
const Preprocessing = require('../utils/Preprocessing');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const { stopword, stemming, punctuation } = req.query;
  const Prep = new Preprocessing();
  await Prep.init();
  if (stopword) {
    await Prep.removeStopwords();
  }
  if (stemming) {
    await Prep.stemmingWords();
  }
  if (punctuation) {
    await Prep.removePunctuation();
  }
  await Prep.removeEmojis();
  Prep.questionMessages = await Prep.getSelectedTypeMessage('Q');

  res.json(Prep.data);
});

module.exports = router;
