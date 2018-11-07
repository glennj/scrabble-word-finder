/* eslint object-curly-newline: ["error", { "multiline": true }] */

const express = require('express');
const lookup = require('../lib/scrabble-lookup');

const router = express.Router();

const title = 'Scrabble Words';

router.get('/', (req, res) => {
  const url = `${req.protocol}://${req.headers.host}${req.url}scrabble`;
  res.render('index', { title, url });
});

const columnize = (words) => {
  const lines = [];
  const keys = Object.keys(words).map(Number);
  const max = Math.max(...Object.values(words).map(l => l.length));
  for (let i = 0; i < max; i += 1) {
    const line = keys.map(k => (words[k][i] || '').padEnd(k));
    lines.push(`   ${line.join('   ')}\n`);
  }
  return lines.join('');
};

router.get('/:letters', (req, res) => {
  const { letters } = req.params;
  const words = lookup(letters);
  switch (req.accepts(['json', 'html'])) {
    case 'json':
      res.json(words);
      break;
    case 'html': {
      const sizes = Object.keys(words).sort();
      const lists = sizes.map(n => words[n]);
      res.render('scrabble', { title, letters, sizes, lists });
      break;
    }
    default:
      res.send(columnize(words));
  }
});

module.exports = router;
