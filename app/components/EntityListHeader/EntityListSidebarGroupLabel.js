/*
 *
 * EntityListSidebarGroupLabel
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Button, Box, Text } from 'grommet';
import { FormUp, FormDown } from 'grommet-icons';

import messages from './messages';

const Styled = styled((p) => <Button plain {...p} />)`
  color: ${palette('asideListGroup', 0)};
  padding: 0.25em 8px;
  padding-right: 4px;
  &:hover {
    color: ${palette('asideListGroupHover', 0)};
    /* background-color: ${palette('asideListGroupHover', 1)}; */
  }
`;

class EntityListSidebarGroupLabel extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      label, onToggle, expanded,
    } = this.props;
    const { intl } = this.context;
    return (
      <Box>
        <Styled
          onClick={onToggle}
          title={intl.formatMessage(
            expanded ? messages.groupExpand.hide : messages.groupExpand.show
          )}
        >
          <Box direction="row" justify="between" align="center">
            <Text size="xlarge" weight={600}>{label}</Text>
            {expanded && (
              <FormUp size="medium" />
            )}
            {!expanded && (
              <FormDown size="medium" />
            )}
          </Box>
        </Styled>
      </Box>
    );
  }
}

EntityListSidebarGroupLabel.propTypes = {
  label: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  expanded: PropTypes.bool,
};

EntityListSidebarGroupLabel.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default EntityListSidebarGroupLabel;
