/*
 * ImportFileSelectControl Messages
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  import: {
    single: {
      id: 'app.components.ImportFileSelectControl.import.single',
      defaultMessage: 'Import {total} row',
    },
    plural: {
      id: 'app.components.ImportFileSelectControl.import.plural',
      defaultMessage: 'Import {total} rows',
    },
    relationships: {
      id: 'app.components.ImportFileSelectControl.import.relationships',
      defaultMessage: '(with {total} connections)',
    },
  },
  selectFile: {
    id: 'app.components.ImportFileSelectControl.selectFile',
    defaultMessage: 'Select File',
  },
  fileSelectError: {
    id: 'app.components.ImportFileSelectControl.fileSelectError',
    defaultMessage: 'Error parsing file. Please make sure to use the correct format only.',
  },
});
