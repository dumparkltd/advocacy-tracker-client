import React from 'react';
import PropTypes from 'prop-types';
// import { Control } from 'react-redux-form/immutable';
import { FormattedMessage } from 'react-intl';
import { Map } from 'immutable';

import { Box, Text } from 'grommet';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import Button from 'components/buttons/Button';
import ItemStatus from 'components/ItemStatus';
import Icon from 'components/Icon';
import appMessages from 'containers/App/messages';

// import qe from 'utils/quasi-equals';

const AttributeSelect = styled.select`
  background:#ffffff;
  border:1px solid #E0E1E2;
  color:#000;
  padding:5px;
`;
const AttributeInput = styled.input`
  background:#ffffff;
  border:1px solid #E0E1E2;
  color:#000;
  padding:5px;
`;

const Styled = styled(
  (p) => <Box direction="column" {...p} />
)`
  position: relative;
  background-color: ${palette('mainListItem', 1)};
  margin-bottom: 4px;
  margin-top: 4px;
`;

const MultiselectActiveOptionRemove = styled(Button)`
  display: block;
  color: ${palette('link', 2)};
  &:hover {
    color: ${palette('linkHover', 2)};
  }
  padding: 0 8px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0 16px;
  }
`;
const TitleWrap = styled((p) => <Box pad={{ left: 'small' }} direction="column" {...p} />)``;

const ConnectionAttributes = styled((p) => (
  <Box pad={{ horizontal: 'small', vertical: 'small' }} {...p} />
))`
  border-top: 1px solid ${palette('background', 1)};
`;

const Reference = styled.div`
  color: ${palette('text', 1)};
  &:hover {
    color: ${palette('text', 0)};
  }
  font-size: 0.85em;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

export function MultiSelectActiveOption({
  option,
  field,
  onItemRemove,
  onConnectionAttributeChange,
}) {
  return (
    <Styled>
      <Box direction="row" align="center" justify="between" pad={{ vertical: 'xsmall' }}>
        <TitleWrap>
          <Box direction="row" gap="small">
            {option.get('reference') && (
              <Box><Reference>{option.get('reference')}</Reference></Box>
            )}
            {option.get('draft') && (
              <Box><ItemStatus draft /></Box>
            )}
          </Box>
          <Box>{option.get('label')}</Box>
        </TitleWrap>
        <Box>
          <Box>
            <MultiselectActiveOptionRemove
              onClick={(evt) => {
                if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                onItemRemove(option, field);
              }}
            >
              <Icon name="removeSmall" />
            </MultiselectActiveOptionRemove>
          </Box>
        </Box>
      </Box>
      {field.connectionAttributes && (
        <ConnectionAttributes>
          {field.connectionAttributes.map((attribute) => {
            const value = option.get('association')
              ? option.getIn(['association', attribute.attribute])
              : 0;

            return (
              <Box key={attribute.attribute} direction="row" align="center" gap="medium">
                <Text size="small"><FormattedMessage {...appMessages.attributes[attribute.attribute]} /></Text>
                <Box>
                  {attribute.type === 'text' && (
                    <AttributeInput
                      type="text"
                      onChange={(e) => {
                        onConnectionAttributeChange({
                          attribute,
                          option,
                          value: e.target.value,
                        });
                      }}
                      value={value || ''}
                    />
                  )}
                  {attribute.type === 'select' && (
                    <AttributeSelect
                      onChange={(e) => {
                        onConnectionAttributeChange({
                          attribute,
                          option,
                          value: e.target.value,
                        });
                      }}
                      value={value || 0}
                    >
                      {attribute.options.map((attributeOption, j) => (
                        <option
                          key={j}
                          value={attributeOption.value}
                        >
                          {attributeOption.label || attributeOption.value}
                        </option>
                      ))}
                    </AttributeSelect>
                  )}
                </Box>
              </Box>
            );
          })}
        </ConnectionAttributes>
      )}
    </Styled>
  );
}

MultiSelectActiveOption.propTypes = {
  option: PropTypes.instanceOf(Map), // actors by actortype for current action
  field: PropTypes.object,
  onItemRemove: PropTypes.func,
  onConnectionAttributeChange: PropTypes.func,
};

export default MultiSelectActiveOption;
