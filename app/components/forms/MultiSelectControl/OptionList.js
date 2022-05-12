import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { kebabCase } from 'lodash/string';
import { FormattedMessage } from 'react-intl';
import { Box } from 'grommet';

import A from 'components/styled/A';

import Option from './Option';

import messages from './messages';

const Styled = styled.div`
  width: 100%;
`;
const ListWrapper = styled.div`
  width: 100%;
  border-top: 1px solid ${palette('light', 1)};
`;

const OptionsWrapper = styled((p) => <Box {...p} />)`
  width: 100%;
`;

const GroupWrapper = styled.div`
  width: 100%;
`;
const GroupTitle = styled.div`
  border-bottom: 1px solid ${palette('light', 1)};
  width: 100%;
  line-height: 1.3;
  font-size: 0.6em;
  font-weight: 500;
  padding: 0.8em 8px 0.4em 16px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: 0.7em;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smallest};
  }
`;

const Empty = styled.div`
  padding: 1em;
  color: ${palette('text', 1)};
`;

const More = styled.div`
  display: block;
  width: 100%;
  padding: 0.5em 1em;
  text-align: center;
  font-size: 0.85em;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;
const MoreLink = styled(A)`
  font-weight: bold;
`;

const SHOW_INCREMENT = 20;

function OptionList(props) {
  const [noItems, setNoItems] = useState(SHOW_INCREMENT);


  // do groups not slice
  const options = props.groups
    ? props.options
    : (props.options && props.options.slice(0, noItems));
  const groups = options && options
    .groupBy((option) => option.get('group') || 1)
    .map((group, key) => props.groups
      ? Map()
        .set('options', group)
        .set('title', props.groups.get(key))
      : Map().set('options', group));

  const hasMore = options.size < props.options.size;
  return (
    <Styled>
      <ListWrapper>
        { groups && groups.toList().map((group, gid) => (
          <GroupWrapper key={gid}>
            { group.get('title') && (
              <GroupTitle>
                { group.get('title') }
              </GroupTitle>
            )}
            <OptionsWrapper>
              { group.get('options') && group.get('options').map((option, i) => {
                const id = `${i}-${kebabCase(option.get('value'))}`;
                return (
                  <Option
                    key={id}
                    optionId={id}
                    option={option}
                    secondary={props.secondary}
                    onCheckboxChange={props.onCheckboxChange}
                  />
                );
              })}
            </OptionsWrapper>
          </GroupWrapper>
        ))}
        { (!props.options || props.options.size === 0)
          && (
            <Empty>
              <FormattedMessage {...messages.empty} />
            </Empty>
          )
        }
      </ListWrapper>
      { hasMore
        && (
          <More>
            <FormattedMessage
              {...messages.showingOptions}
              values={{
                no: options.size,
                total: props.options.size,
              }}
            />
            <MoreLink
              href="/"
              onClick={(evt) => {
                if (evt && evt.preventDefault) evt.preventDefault();
                setNoItems(noItems + SHOW_INCREMENT);
              }}
            >
              <FormattedMessage {...messages.showMore} />
            </MoreLink>
          </More>
        )
      }
    </Styled>
  );
}


OptionList.propTypes = {
  options: PropTypes.object,
  secondary: PropTypes.bool,
  onCheckboxChange: PropTypes.func,
  groups: PropTypes.object,
};

export default OptionList;
