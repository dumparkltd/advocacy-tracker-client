import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-redux-form/immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import Checkbox from 'components/styled/Checkbox';
import { injectIntl, intlShape } from 'react-intl';

import appMessage from 'utils/app-message';

const Option = styled.div`
  padding: 0.25em 0;
`;
const Hint = styled.div`
  font-size: 0.85em;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

const Label = styled.label`
  color:  ${(props) => props.highlight ? palette('primary', 1) : palette('text', 0)};
`;
const LabelInner = styled.span`
  padding-left: 5px;
`;

const RadioControl = ({ model, options, intl }) => (
  <Field model={model}>
    {options && options.map((option, i) => {
      let label = option.label;
      if (!label && option.message) {
        label = appMessage(intl, option.message);
      }
      label = label || `option ${i}`;
      console.log(option);
      return (
        <Option key={i}>
          <Label highlight={option.highlight}>
            <Checkbox
              type="radio"
              name={model}
              value={option.value}
            />
            <LabelInner>{label}</LabelInner>
          </Label>
        </Option>
      );
    })}
  </Field>
);

RadioControl.propTypes = {
  model: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  intl: intlShape,
};

export default injectIntl(RadioControl);
