import appMessage from 'utils/app-message';
import { lowerCase } from 'utils/string';

export const getOptionLabel = (option, intl) => {
  const { message, messagePrefix, label } = option;
  let optionLabel;
  if (message) {
    optionLabel = messagePrefix
      ? `${messagePrefix} ${lowerCase(appMessage(intl, message))}`
      : appMessage(intl, message);
  } else {
    optionLabel = label;
  }
  return optionLabel;
};
