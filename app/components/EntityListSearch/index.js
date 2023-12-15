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

import Icon from 'components/Icon';
import Button from 'components/buttons/Button';
import DebounceInput from 'react-debounce-input';
import PrintHide from 'components/styled/PrintHide';

import { selectIsPrintView } from 'containers/App/selectors';

import messages from './messages';

const Search = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: ${palette('background', 0)};
  color: ${palette('dark', 2)};
  padding: 2px 7px;
  border: 1px solid ${({ active }) => active ? palette('light', 4) : palette('light', 2)};
  box-shadow: 0 0 3px 0 ${({ active }) => active ? palette('dark', 2) : 'transparent'};
  min-height: ${({ small }) => small ? 30 : 36}px;
  border-radius: 5px;
  position: relative;
  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
    display: ${({ hidePrint }) => hidePrint ? 'none' : 'block'};
  }
`;
const SearchInput = styled(DebounceInput)`
  background-color: ${palette('background', 0)};
  border: none;
  padding: 3px;
  &:focus {
    outline: none;
  }
  flex: 1;
  font-size: 0.85em;
  @media print {
    display: none;
  }
`;
const Clear = styled(Button)`
  padding: ${(props) => props.small ? '4px 6px' : '8px 6px'};
  position: absolute;
  top: 0;
  right: 0;
  background-color: ${palette('background', 4)};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding: ${({ small }) => small ? '4px 6px' : '8px 6px'};
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
            {searchQuery && (
              <Clear
                onClick={() => onSearch()}
              >
                <Icon name="removeSmall" />
              </Clear>
            )}
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
