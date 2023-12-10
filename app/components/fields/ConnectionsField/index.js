import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';

import appMessages from 'containers/App/messages';
import { usePrint } from 'containers/App/PrintContext';

import PrintHide from 'components/styled/PrintHide';
import FieldWrap from 'components/fields/FieldWrap';
import EntityListTable from 'containers/EntityListTable';
// import EntityListItemsWrap from 'components/fields/EntityListItemsWrap';
import EmptyHint from 'components/fields/EmptyHint';
import ButtonFactory from 'components/buttons/ButtonFactory';


const StyledFieldWrap = styled(FieldWrap)`
  padding-top: 5px;
`;

export function ConnectionsField({ field, intl }) {
  const noOfValues = field.values ? field.values.size : 0;
  const label = `${noOfValues} ${intl.formatMessage(
    noOfValues === 1
      ? appMessages.entities[field.entityType].single
      : appMessages.entities[field.entityType].plural
  )}`;
  const isPrint = usePrint();
  return (
    <StyledFieldWrap>
      {(field.values && field.values.size > 0) && (
        <EntityListTable
          config={{
            connections: field.connectionOptions,
            clientPath: field.entityPath,
          }}
          label={label}
          entities={field.values}
          taxonomies={field.taxonomies}
          connections={field.connections}
          onEntityClick={field.onEntityClick}
          showValueForAction={field.showValueForAction}
          columns={field.columns}
          moreLess={!isPrint}
          inSingleView
          sortBy={field.sortBy}
          sortOrder={field.sortOrder}
        />
      )}
      {noOfValues === 0 && (
        <EmptyHint>
          <FormattedMessage {...field.showEmpty} />
        </EmptyHint>
      )}
      {field.onCreate && (
        <PrintHide>
          <div style={{ textAlign: 'right' }}>
            <ButtonFactory
              button={{
                type: 'addFlatPrimary',
                title: `Add new ${intl.formatMessage(appMessages.entities[field.entityType].single)}`,
                onClick: () => field.onCreate(),
              }}
            />
          </div>
        </PrintHide>
      )}
    </StyledFieldWrap>
  );
}

ConnectionsField.propTypes = {
  field: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};
ConnectionsField.contextTypes = {
};

export default injectIntl(ConnectionsField);
