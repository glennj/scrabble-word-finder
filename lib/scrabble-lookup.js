#!/usr/bin/env node
'use strict';

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dictFile = '/usr/share/dict/american-english';

/* eslint no-debugger: "warn" */
/* eslint brace-style: ["error", "stroustrup"] */

var wordsModuleFile = './words.js';
var words = {};

/* ********************************
 * generate the words module
 */

var charFrequency = function charFrequency(word) {
  return Array.from(word.toLowerCase()).reduce(function (freq, char) {
    freq[char] = (freq[char] || 0) + 1; // eslint-disable-line no-param-reassign
    return freq;
  }, {});
};

var processWord = function processWord(word) {
  if (/[^a-z]/.test(word)) return;
  var freq = charFrequency(word);
  var key = Array.from(word.toLowerCase()).sort().join('');
  if (key in words) {
    words[key].words.push(word);
  } else {
    words[key] = { freq: freq, words: [word] };
  }
};

var writeWordFile = function writeWordFile(file) {
  debugger;
  Object.keys(words).forEach(function (key) {
    words[key].words = Array.from(new Set(words[key].words.map(function (w) {
      return w.toLowerCase();
    })));
  });
  var data = '/* generated from ' + file + ' on ' + new Date().toString() + ' */\n' + ('const words = ' + JSON.stringify(words) + ';\n') + 'module.exports = words;\n';

  /*
  fs.promises
    .writeFile(wordsModuleFile, data)
    .then(() => { console.log(`${wordsModuleFile} complete.`); });
  */
  _fs2.default.writeFileSync(wordsModuleFile, data);
};

var generateWordsModule = function generateWordsModule() {
  var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : dictFile;

  debugger;
  /*
  const rl = readline.createInterface({ input: fs.createReadStream(file) });
  rl.on('line', processWord);
  rl.on('close', writeWordFile);
  */
  var content = _fs2.default.readFileSync(file);
  content.toString().split('\n').forEach(processWord);
  writeWordFile(file);
  /*
  fs.readFile(file, (err, data) => {
    debugger;
    if (err) throw err;
    data.toString().split('\n').map(processWord);
    writeWordFile();
  });
  */
};

/* ********************************
 * lookup
 */

if (_fs2.default.existsSync(_path2.default.join(__dirname, wordsModuleFile))) {
  words = require(wordsModuleFile); // eslint-disable-line global-require, import/no-dynamic-require
}

var lookup = function lookup(letters) {
  var freq = charFrequency(letters);
  var re = new RegExp('^[' + Object.keys(freq).join('') + ']{3,}$');

  /* eslint-disable  no-param-reassign */
  return Object.keys(words).filter(function (key) {
    var frq = words[key].freq;
    return re.test(key) && Object.keys(frq).every(function (c) {
      return frq[c] <= freq[c];
    });
  }).reduce(function (wrds, key) {
    return wrds.concat(words[key].words);
  }, []).sort().reduce(function (map, word) {
    map[word.length] = (map[word.length] || []).concat(word);
    return map;
  }, {});
  /* eslint-enable  no-param-reassign */
};

var main = function main() {
  var usage = 'usage: ' + process.argv[1].replace(/.+\//, '') + ' [-h] <-g dictionaryFile | tiles>\nwhere: -g  -- generate word list from dictionary (default ' + dictFile + ')\n';

  var args = (0, _minimist2.default)(process.argv.slice(2), {
    boolean: ['h', 'g']
  });
  if (args.h) {
    console.log(usage);
  } else if (args.g) {
    generateWordsModule(args._[0]);
  } else {
    if (!words) {
      console.log('Words module does not exist... generating it.');
      generateWordsModule();
    }
    console.log(lookup(args._[0]));
  }
};

module.exports = lookup;

if (!module.parent) {
  main();
}