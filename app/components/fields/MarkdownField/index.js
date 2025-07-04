import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { FormattedMessage } from 'react-intl';

import { truncateText } from 'utils/string';

import FieldWrap from 'components/fields/FieldWrap';
import Label from 'components/fields/Label';
import ToggleAllItems from 'components/fields/ToggleAllItems';

import { usePrint } from 'containers/App/PrintContext';
import appMessages from 'containers/App/messages';

const Markdown = styled(ReactMarkdown)`
  font-size: ${({ theme }) => theme.text.mediumTall.size};
  line-height: ${({ theme }) => theme.text.mediumTall.height};
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: ${({ theme, isPrint }) => isPrint ? theme.textPrint.mediumTall.size : theme.text.mediumTall.size};
  }
  @media print {
    font-size: ${({ theme }) => theme.textPrint.mediumTall.size};
  }
`;

const LIMIT = 250;

// TODO also render HTML if not markdown
export function MarkdownField({ field }) {
  const isPrint = usePrint();
  const [showAll, setShowAll] = React.useState(false);
  let { value } = field;
  if (field.moreLess && !showAll && field.value && field.value.length > LIMIT) {
    value = truncateText(field.value, LIMIT, true, true, false);
    // const truncateText = (
    //   text,
    //   limit,
    //   keepWords = true,
    //   appendEllipsis = true,
    //   grace = true,
    // )
  }
  return (
    <FieldWrap>
      {field.label && (
        <Label>
          <FormattedMessage {...field.label} />
        </Label>
      )}
      <Markdown source={value} className="react-markdown" isPrint={isPrint} />
      {field.moreLess && field.value && field.value.length > LIMIT && (
        <ToggleAllItems
          onClick={() => setShowAll(!showAll)}
        >
          {showAll && (
            <FormattedMessage {...appMessages.entities.showLess} />
          )}
          {!showAll && (
            <span>Show full text</span>
          )}
        </ToggleAllItems>
      )}
    </FieldWrap>
  );
}

MarkdownField.propTypes = {
  field: PropTypes.object.isRequired,
};

export default MarkdownField;
