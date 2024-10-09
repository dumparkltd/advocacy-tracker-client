import {
  cleanupSearchTarget,
  startsWith,
  regExMultipleWords,
  lowerCase,
} from 'utils/string';

export const prepOptions = (options, search) => options
  && options
    .map((option) => ({
      code: option.getIn(['attributes', 'code']),
      label: option.getIn(['attributes', 'title']),
      typeId: option.get('id'),
    }))
    .filter((option) => filterOption(option, search))
    .sort((a, b) => (a.label < b.label ? -1 : 1));

export const filterOption = (option, search) => {
  if (!search || search.length < 2) return true;
  try {
    const regex = new RegExp(regExMultipleWords(search), 'i');
    return (
      startsWith(lowerCase(option.code), lowerCase(search))
      || regex.test(cleanupSearchTarget(option.label))
    );
  } catch (e) {
    return true;
  }
};
