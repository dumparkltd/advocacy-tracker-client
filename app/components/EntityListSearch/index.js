/*
 *
 * EntityListSearch
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { palette } from 'styled-theme';

import { Box } from 'grommet';

import Icon from 'components/Icon';
import Button from 'components/buttons/Button';
import DebounceInput from 'react-debounce-input';
import PrintHide from 'components/styled/PrintHide';

import { selectIsPrintView } from 'containers/App/selectors';

import messages from './messages';

const Search = styled((p) => <Box direction="row" pad={{ vertical: 'xsmall', horizontal: 'medium' }} {...p} />)`
  width: 100%;
  background-color: ${palette('light', 1)};
  color: ${palette('dark', 2)};
  border: 1px solid ${palette('light', 3)};
  min-height: ${({ small }) => small ? 35 : 45}px;
  border-radius: 999px;
  position: relative;
  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
    display: ${({ hidePrint }) => hidePrint ? 'none' : 'block'};
  }
`;
const SearchInput = styled((p) => <DebounceInput {...p} />)`
  background-color: ${palette('light', 1)};
  color: ${palette('dark', 2)};
  border: none;
  padding: 3px;
  &::placeholder {
    color: ${palette('dark', 2)};
    opacity: 1;
    font-size: ${({ theme }) => theme.text.small.size};
  }
  &:focus {
    outline: none;
  }
  flex: 1;
  @media print {
    display: none;
  }
`;
const Clear = styled((p) => <Button {...p} />)`
  color: ${palette('dark', 4)};
  &:hover {
    color: ${palette('primary', 0)};
  }
  @media print {
    display: none;
  }
`;

export class EntityListSearch extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      active: false,
    };
  }

  render() {
    const {
      searchQuery,
      onSearch,
      placeholder,
      isPrint,
    } = this.props;
    const { intl } = this.context;
    // TODO set focus to input when clicking wrapper
    //  see https://github.com/nkbt/react-debounce-input/issues/65
    //  https://github.com/yannickcr/eslint-plugin-react/issues/678
    // for now this works all right thanks to flex layout
    // onClick={() => {
    //   this.inputNode.focus()
    // }}
    return (
      <>
        <PrintHide>
          <Search
            active={this.state.active}
            printHide={!searchQuery}
            isPrint={isPrint}
          >
            <SearchInput
              id="search"
              minLength={1}
              debounceTimeout={500}
              value={searchQuery || ''}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => this.setState({ active: true })}
              onBlur={() => this.setState({ active: false })}
              placeholder={placeholder || (intl.formatMessage(messages.searchPlaceholderEntities))}
            />
            <Box direction="row" gap="none" align="center">
              {searchQuery && (
                <Clear onClick={() => onSearch()}>
                  <Icon name="removeSmall" />
                </Clear>
              )}
              <Box>
                <Icon name="search" palette="dark" paletteIndex={4} />
              </Box>
            </Box>
          </Search>
        </PrintHide>
      </>
    );
  }
}

EntityListSearch.propTypes = {
  searchQuery: PropTypes.string,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  isPrint: PropTypes.bool,
};

EntityListSearch.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isPrint: selectIsPrintView(state),
});

export default connect(mapStateToProps, null)(EntityListSearch);
