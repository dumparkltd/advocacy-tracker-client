import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import SelectReset from 'components/SelectReset';
import ButtonSort from 'components/buttons/ButtonSort';
import Icon from 'components/Icon';

import ColumnHeader from 'components/styled/ColumnHeader';

import messages from './messages';

const Styled = styled(ColumnHeader)`
  padding-right: 0;
`;
const LabelWrap = styled.div`
  display: table-cell;
  padding-right: 4px;
  @media (min-width: ${({ theme }) => theme && theme.breakpointsMin ? theme.breakpointsMin.medium : '769px'}) {
    padding-left: ${(props) => props.isSelect ? 0 : 7}px;
  }
`;

const Label = styled.label`
  vertical-align: middle;
`;
const Wrapper = styled.div`
  display: table;
  width: 100%;
`;
const SelectWrapper = styled.div`
  display: table-cell;
  text-align: right;
  padding-right: 2px;
`;

class ColumnSelect extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      width, label,
    } = this.props;
    const { intl } = this.context;
    const sortOptions = this.props.sortOptions && this.props.sortOptions.map((option) => ({
      value: option.attribute,
      label: intl.formatMessage(messages.sortAttributes[option.attribute]),
    }));

    const sortOrderOption = this.props.sortOrderOptions.find((option) => this.props.sortOrder === option.value);
    const nextSortOrderOption = sortOrderOption && this.props.sortOrderOptions.find((option) => sortOrderOption.nextValue === option.value);

    return (
      <Styled colWidth={width * 100}>
        <Wrapper>
          <LabelWrap>
            <Label>{label}</Label>
          </LabelWrap>
          { sortOptions && this.props.sortBy && (
            <SelectWrapper>
              <SelectReset
                value={this.props.sortBy}
                index="sortby"
                options={sortOptions}
                isReset={false}
                onChange={this.props.onSortBy}
              />
              {nextSortOrderOption
              && (
                <ButtonSort
                  sortActive
                  onClick={(e) => {
                    e.preventDefault();
                    this.props.onSortOrder(nextSortOrderOption.value);
                  }}
                >
                  <Icon name={sortOrderOption.icon} />
                </ButtonSort>
              )
              }
            </SelectWrapper>
          )}
        </Wrapper>
      </Styled>
    );
  }
}

ColumnSelect.propTypes = {
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  sortOptions: PropTypes.array,
  sortOrderOptions: PropTypes.array,
  onSortBy: PropTypes.func,
  onSortOrder: PropTypes.func,
  label: PropTypes.string,
  width: PropTypes.number,
};
ColumnSelect.defaultProps = {
  label: 'label',
};
ColumnSelect.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default ColumnSelect;
