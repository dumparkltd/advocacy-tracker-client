import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { lowerCase } from 'utils/string';
import { getEntitySortComparator } from 'utils/sort';

import { fitComponent, SCROLL_PADDING } from 'utils/scroll-to-component';

import { omit } from 'lodash/object';
import Button from 'components/buttons/Button';

import Icon from 'components/Icon';

import { FORM_NON_CONTROL_PROPS } from 'themes/config';

import MultiSelectControl from '../MultiSelectControl';
import MultiSelectActiveOption from './MultiSelectActiveOption';
import messages from './messages';

const MultiSelectWrapper = styled.div`
  position: absolute;
  top: ${({ align }) => align === 'top' ? 0 : 'auto'};
  bottom: ${({ align }) => align === 'bottom' ? 0 : 'auto'};
  right: 0;
  max-height: 450px;
  min-height: 300px;
  height: ${(props) => props.wrapperHeight ? props.wrapperHeight : 450}px;
  width: 100%;
  overflow: hidden;
  display: block;
  z-index: 10;
  background-color: ${palette('background', 0)};
  border-left: 1px solid;
  border-right: 1px solid;
  border-bottom: 1px solid;
  border-color: ${palette('light', 2)};
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    min-width: 350px;
  }
`;
const MultiSelectFieldWrapper = styled.div`
  position: relative;
`;
const MultiselectActiveOptions = styled.div`
  position: relative;
`;
const MultiselectActiveOptionList = styled.div`
  position: relative;
`;

const MultiSelectDropdownIcon = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  padding: 15px 8px 0 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding-right: 16px;
  }
`;
const MultiSelectDropButton = styled((p) => <Button {...p} />)`
  position: relative;
  width: 100%;
  text-align: left;
  color: ${palette('multiSelectFieldButton', 0)};
  background-color: #DADDE0;
  font-size: 14px;
  line-height: 18px;
  border: 1px solid #f0f0f0;
  padding: 0.7em;
  min-height: 50px;
  &:hover {
    background-color: #B7BCBF;
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

const Anchor = styled.div`
  position: relative;
`;
class MultiSelectField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      multiselectOpen: null,
    };
    this.controlRef = React.createRef();
  }

  componentDidUpdate() {
    if (
      this.controlRef
      && this.controlRef.current
      && this.props.scrollContainer
    ) {
      fitComponent(this.controlRef.current, this.props.scrollContainer);
    }
  }

  // MULTISELECT
  onToggleMultiselect = (field) => {
    this.setState(
      (prevState) => ({
        multiselectOpen: prevState.multiselectOpen !== field.id
          ? field.id
          : null,
      })
    );
  }

  onCloseMultiselect = () => {
    this.setState({
      multiselectOpen: null,
    });
  }

  onMultiSelectItemRemove = (option) => this.props.handleUpdate && this.props.handleUpdate(
    this.props.fieldData.map((d) => option.get('value') === d.get('value')
      ? d.set('checked', false)
      : d)
  );

  onMultiSelectItemConnectionAttributeChange =
    ({ option, attribute, value }) => this.props.handleUpdate && this.props.handleUpdate(
      this.props.fieldData.map(
        (d) => {
          if (option.get('value') === d.get('value')) {
            if (d.get('association')) {
              return d.setIn(['association', attribute.attribute], value);
            }
            return d.set('association', Map({ [attribute.attribute]: value }));
          }
          return d;
        }
      )
    );

  getMultiSelectActiveOptions = (field, fieldData) => {
    // use form data if already loaded
    if (fieldData) {
      return this.sortOptions(
        fieldData.map(
          (option, index) => option.set('index', index)
        ).filter(
          (o) => o.get('checked')
        )
      );
    }
    // until then use initial options
    return this.sortOptions(
      field.options.map(
        (option, index) => option.set('index', index)
      ).filter(
        (o) => o.get('checked')
      )
    );
  }

  getOptionSortValueMapper = (option) => {
    if (option.get('order')) {
      return option.get('order');
    }
    return option.get('label');
  }

  sortOptions = (options) => options.sortBy(
    (option) => this.getOptionSortValueMapper(option),
    (a, b) => getEntitySortComparator(a, b, 'asc')
  )

  render() {
    const { field, fieldData } = this.props;
    const { intl } = this.context;
    const { id, model, ...controlProps } = omit(field, FORM_NON_CONTROL_PROPS);
    // console.log('field', field)
    // console.log('fieldData', fieldData && fieldData.toJS())
    const options = this.getMultiSelectActiveOptions(field, fieldData);
    return (
      <MultiSelectFieldWrapper>
        <Anchor>
          <MultiSelectDropButton
            onClick={(evt) => {
              if (evt !== undefined && evt.preventDefault) evt.preventDefault();
              this.onToggleMultiselect(field);
            }}
          >
            {field.label}
            <MultiSelectDropdownIcon>
              <Icon name={this.state.multiselectOpen === id ? 'dropdownClose' : 'dropdownOpen'} />
            </MultiSelectDropdownIcon>
          </MultiSelectDropButton>
          { this.state.multiselectOpen === id
            && (
              <MultiSelectWrapper
                ref={this.controlRef}
                align="top"
                wrapperHeight={(
                  this.props.scrollContainer
                  && this.props.scrollContainer.current
                  && this.props.scrollContainer.current.getBoundingClientRect
                )
                  ? this.props.scrollContainer.current.getBoundingClientRect().height - (SCROLL_PADDING * 2)
                  : 450
                }
              >
                <MultiSelectControl
                  id={id}
                  model={model || `.${id}`}
                  title={intl.formatMessage(messages.update, { type: lowerCase(field.label) })}
                  onCancel={this.onCloseMultiselect}
                  inSingleForm
                  closeOnClickOutside={this.props.closeOnClickOutside}
                  buttons={[
                    field.onCreate
                      ? {
                        type: 'addFlat',
                        position: 'left',
                        onClick: field.onCreate,
                      }
                      : null,
                    {
                      type: 'closeText',
                      onClick: this.onCloseMultiselect,
                    },
                  ]}
                  {...controlProps}
                />
              </MultiSelectWrapper>
            )
          }
        </Anchor>
        {options.size > 0 && (
          <MultiselectActiveOptions>
            <MultiselectActiveOptionList>
              {options.map((option, i) => (
                <MultiSelectActiveOption
                  key={i}
                  option={option}
                  field={field}
                  onItemRemove={this.onMultiSelectItemRemove}
                  onConnectionAttributeChange={this.onMultiSelectItemConnectionAttributeChange}
                />
              ))}
            </MultiselectActiveOptionList>
          </MultiselectActiveOptions>
        )}
      </MultiSelectFieldWrapper>
    );
  }
}

MultiSelectField.propTypes = {
  field: PropTypes.object,
  fieldData: PropTypes.object,
  handleUpdate: PropTypes.func,
  closeOnClickOutside: PropTypes.bool,
  scrollContainer: PropTypes.object,
};

MultiSelectField.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default MultiSelectField;
