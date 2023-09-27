import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled, { css } from 'styled-components';
import { Box } from 'grommet';

import FieldWrap from 'components/fields/FieldWrap';
import ListItem from 'components/fields/ListItem';
import ListLabel from 'components/fields/ListLabel';
import ListLabelWrap from 'components/fields/ListLabelWrap';
import ListLink from 'components/fields/ListLink';
import EmptyHint from 'components/fields/EmptyHint';
import InfoOverlay from 'components/InfoOverlay';

import { usePrint } from 'containers/App/PrintContext';

const StyledFieldWrap = styled(FieldWrap)`
  padding-top: 15px;
  ${({ isPrint }) => isPrint && css`pointer-events: none;`}
`;

function TaxonomyField({ field, intl }) {
  const isPrint = usePrint();
  return (
    <StyledFieldWrap isPrint={isPrint}>
      <ListLabelWrap>
        <Box>
          <ListLabel>
            <FormattedMessage {...field.label} />
          </ListLabel>
        </Box>
        {field.info && (
          <InfoOverlay
            title={intl.formatMessage(field.label)}
            content={intl.formatMessage(field.info)}
            padButton="none"
            colorButton="dark-5"
          />
        )}
      </ListLabelWrap>
      {field.values.map((value, i) => (
        <ListItem key={i}>
          <Box
            direction="row"
            fill="horizontal"
            align="center"
            justify="between"
            flex={{ grow: 0, shrink: 0 }}
          >
            {value.linkTo
              ? (
                <ListLink to={value.linkTo}>
                  {value.label}
                </ListLink>
              )
              : (
                <div>
                  {value.label}
                </div>
              )
            }
            {value.info && (
              <InfoOverlay
                title={value.label}
                content={value.info}
                padButton="none"
                colorButton="dark-5"
                markdown
              />
            )}
          </Box>
        </ListItem>
      ))}
      {field.showEmpty && (!field.values || field.values.length === 0)
        && (
          <EmptyHint>
            <FormattedMessage {...field.showEmpty} />
          </EmptyHint>
        )
      }
    </StyledFieldWrap>
  );
}

TaxonomyField.propTypes = {
  field: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TaxonomyField);
