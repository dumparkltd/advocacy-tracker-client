import { get } from 'lodash/object';
import appMessages from 'containers/App/messages';

export default function appMessage(intl, messageKey) {
  if (get(appMessages, messageKey)) {
    return intl
      ? intl.formatMessage(get(appMessages, messageKey))
      : get(appMessages, messageKey).defaultMessage;
  }
  return `'${messageKey}' not found. `;
}
