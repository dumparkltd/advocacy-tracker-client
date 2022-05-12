import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Box } from 'grommet';

import { lowerCase } from 'utils/string';
import appMessage from 'utils/app-message';
import IndeterminateCheckbox from 'components/forms/IndeterminateCheckbox';
import InfoOverlay from 'components/InfoOverlay';

import messages from './messages';

const Styled = styled((p) => (
  <Box fill="horizontal" direction="row" align="center" {...p} />
))`
  width: 100%;
  line-height: 1.3;
  font-size: ${({ theme }) => theme.text.xsmall.size};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    border-bottom: 1px solid ${palette('light', 1)};
    font-size: ${({ theme }) => theme.text.small.size};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const CheckboxWrapper = styled((p) => (
  <Box
    fill="vertical"
    flex={{ shrink: 0 }}
    align="center"
    {...p}
  />
))`
  width: 40px;
`;

const OptionLabel = styled((p) => <Box pad={{ vertical: 'small', right: 'xsmall' }} fill as="label" {...p} />)`
  vertical-align: middle;
  cursor: pointer;
  border-right: ${(props) => (props.changedToChecked || props.changedToUnchecked)
    ? '0.5em solid'
    : 'none'
};
  border-right-color: ${palette('buttonDefault', 1)};
`;

// font-weight: ${(props) => props.bold ? 500 : 'normal'};
const Label = styled.div`
  font-style: ${({ emphasis }) => emphasis ? 'italic' : 'normal'};
  position: relative;
`;
const New = styled.span`
  color: ${palette('primary', 4)};
  background-color: ${palette('primary', 0)};
  padding: 1px 5px;
  font-size: 0.8em;
  margin-left: 0.5em;
  border-radius: 4px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;
const Id = styled.span`
  color: ${palette('text', 1)};
  font-size: 0.9em;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;
const IdSpacer = styled.span`
  padding-left: 0.25em;
  padding-right: 0.25em;
  color: ${palette('text', 1)};
`;
// <Label bold={props.bold} italic={props.isNew}>
function Option({
  option,
  onCheckboxChange,
  optionId,
  intl,
  secondary,
}) {
  const emphasis = option.get('labelEmphasis');
  const reference = typeof option.get('reference') !== 'undefined' && option.get('reference') ? option.get('reference').toString() : '';
  const label = option.get('label');
  const optionInfo = option.get('info');
  const messagePrefix = option.get('messagePrefix');
  const message = option.get('message');
  const isNew = option.get('isNew');
  // const draft = option.get('draft');
  const checked = option.get('checked');
  const isIndeterminate = option.get('isIndeterminate');

  let optionLabel;
  if (message) {
    optionLabel = messagePrefix
      ? `${messagePrefix} ${lowerCase(appMessage(intl, message))}`
      : appMessage(intl, message);
  } else {
    optionLabel = label;
  }

  return (
    <Styled
      changedToChecked={option.get('changedToChecked')}
      changedToUnchecked={option.get('changedToUnchecked')}
      secondary={secondary}
    >
      <CheckboxWrapper>
        { isIndeterminate
          && (
            <IndeterminateCheckbox
              id={optionId}
              checked={checked}
              onChange={(checkedState) => {
                onCheckboxChange(checkedState, option);
              }}
            />
          )
        }
        { !isIndeterminate
          && (
            <input
              id={optionId}
              type="checkbox"
              checked={checked}
              onChange={(evt) => {
                evt.stopPropagation();
                onCheckboxChange(evt.target.checked, option);
              }}
            />
          )
        }
      </CheckboxWrapper>
      <OptionLabel
        htmlFor={optionId}
        changedToChecked={option.get('changedToChecked')}
        changedToUnchecked={option.get('changedToUnchecked')}
        secondary={secondary}
      >
        <Label emphasis={emphasis}>
          {reference
            && <Id>{reference}</Id>
          }
          {reference
            && <IdSpacer />
          }
          { optionLabel }
          {isNew
            && (
              <New>
                <FormattedMessage {...messages.new} />
              </New>
            )
          }
        </Label>
      </OptionLabel>
      {optionInfo && (
        <InfoOverlay
          title={optionLabel}
          content={optionInfo}
        />
      )}
    </Styled>
  );
}

Option.propTypes = {
  optionId: PropTypes.string,
  option: PropTypes.object,
  secondary: PropTypes.bool,
  onCheckboxChange: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(Option);
