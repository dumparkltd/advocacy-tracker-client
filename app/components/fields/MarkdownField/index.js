import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { FormattedMessage } from 'react-intl';

import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';

import { usePrint } from 'containers/App/PrintContext';
// import appMessages from 'containers/App/messages';

const Markdown = styled(ReactMarkdown)`
  font-size: ${({ theme }) => theme.text.mediumTall.size};
  line-height: ${({ theme }) => theme.text.mediumTall.height};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme, isPrint }) => isPrint ? theme.textPrint.mediumTall.size : theme.text.largeTall.size};
    line-height: ${({ theme }) => theme.text.largeTall.height};
  }
  @media print {
    font-size: ${({ theme }) => theme.textPrint.mediumTall.size};
  }
`;

// TODO also render HTML if not markdown
export function MarkdownField({ field }) {
  const isPrint = usePrint();
  return (
    <FieldWrap>
      {field.label
        && (
          <Label>
            <FormattedMessage {...field.label} />
          </Label>
        )
      }
      <Markdown source={field.value} className="react-markdown" isPrint={isPrint} />
    </FieldWrap>
  );
}

MarkdownField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default MarkdownField;
