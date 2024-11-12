import { toLower, deburr } from 'lodash/string';
import { reduce } from 'lodash/collection';
import { TEXT_TRUNCATE } from 'themes/config';

export const lowerCase = (str) => toLower(str).replace('wwf', 'WWF');
export const capitalize = (str) => str
  && str.split(' ').reduce(
    (m, word) => ([
      ...m,
      String(word[0]).toUpperCase() + String(lowerCase(word)).slice(1),
    ]),
    [],
  ).join(' ');

export const getPathFromUrl = (url) => url.split(/[?#]/)[0];

export const getFilenameFromUrl = (url) => url.split('/').pop();

export const cleanupSearchTarget = (str) => deburr(toLower(str));

// adapted from
// https://stackoverflow.com/questions/19793221/javascript-text-between-double-quotes
const extractAllPhrases = (str) => {
  const re = /"(.*?)"/g;
  const phrases = [];
  let current;
  /* eslint-disable no-cond-assign */
  while (current = re.exec(str)) {
    phrases.push(current.pop());
  }
  /* eslint-enable no-cond-assign */
  return phrases;
};

// match multiple words, incl substrings
// also check for exact phrases in "quotes"
export const regExMultipleWords = (str) => {
  // first extract phrases and turn to words
  const phrases = extractAllPhrases(str);
  const phraseWords = phrases.length > 0
    ? reduce(
      phrases,
      (memo, p) => `${memo}(?=.*${p})`,
      '',
    )
    : '';
  // then remove phrases from original string
  // and turn to words
  const strWithoutPhrases = reduce(
    phrases,
    (memo, p) => str.replace(`"${p}"`, ''),
    str,
  );
  const words = reduce(
    strWithoutPhrases
      .replace('"', '')
      .split(' '),
    (memo, s) => s !== ''
      ? `${memo}(?=.*${s})`
      : memo,
    '',
  );
  // finally combine
  return `${phraseWords}${words}`;
};

// match multiple words
export const regExMultipleWordsMatchStart = (str) => reduce(str.split(' '), (words, s) => `${words}(?=.*\\b${s})`, '');

export const truncateText = (
  text,
  limit,
  keepWords = true,
  appendEllipsis = true,
  grace = true,
) => {
  const limitClean = grace ? limit + TEXT_TRUNCATE.GRACE : limit;
  console.log(limitClean)
  if (text.length > (limitClean)) {
    if (!keepWords) {
      return appendEllipsis
        ? `${text.substring(0, limit).trim()}\u2026`
        : text.substring(0, limit).trim();
    }
    const words = text.split(' ');
    let truncated = '';
    while (truncated.length <= limit) {
      const word = words.shift();
      truncated = truncated.length > 0 ? `${truncated} ${word}` : word;
    }
    // check if really truncated (not a given as we accept full words)
    if (appendEllipsis) {
      return text.length > truncated.length ? `${truncated}\u2026` : text;
    }
    return truncated;
  }
  return text;
};

export const startsWith = (str, searchString) => str.substr(0, searchString.length) === searchString;
