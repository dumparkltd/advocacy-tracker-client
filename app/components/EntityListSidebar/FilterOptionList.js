/*
 *
 * FilterOptionList
 *
 */

import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

import { truncateText } from 'utils/string';
import { getFilterLabel } from 'components/TagList/utils';
import OptionsOverlay from 'components/OptionsOverlay';
import ButtonTagFilterWrap from 'components/buttons/ButtonTagFilterWrap';
import appMessages from 'containers/App/messages';

import EntityListSidebarOption from './EntityListSidebarOption';

export function FilterOptionList({
  group,
  option,
  onShowForm,
  onHideOptions,
  intl,
  onUpdateQuery,
}) {
const optionCAF = option.get('connectionAttributeFilter');
  return (
    <Box>
      <EntityListSidebarOption
        option={option}
        groupId={group.get('id')}
        groupType={group.get('type')}
        onShowForm={onShowForm}
      />
      {option.get('currentFilters') && option.get('currentFilters').size > 0 && (
        <Box
          pad={{
            top: 'xxsmall',
            bottom: 'xsmall',
            left: 'medium',
          }}
          align="start"
          gap="xxsmall"
        >
          {option.get('currentFilters').map(
            (filter, j) => {
              const filterJS = filter.toJS();
              const hasAttributeOptions = filterJS.attributeOptions && ['without', 'any'].indexOf(filterJS.query) === -1;
              return (
                <Box key={j} align="start">
                  <Box direction="row" align="center">
                    <ButtonTagFilterWrap
                      onClick={(args) => {
                        onHideOptions();
                        filterJS.onClick(args);
                      }}
                      filter={filterJS}
                      label={getFilterLabel(filterJS, intl, true)}
                      showConnectedAttributes={false}
                    />
                    {filterJS.attributeOptions && hasAttributeOptions && (
                      <OptionsOverlay
                        title="Select attribute options"
                        onChange={
                          (options) => {
                            const [value] = filterJS.queryValue.split('>');
                            const newValues = options
                              .filter((o) => o.get('checked'))
                              .map((o) => o.get('value'))
                              .toJS();
                            // option active
                            onUpdateQuery({
                              arg: filterJS.query,
                              value: newValues.length > 0
                                ? `${value}>${optionCAF.get('attribute')}=${newValues.join('|')}`
                                : value,
                              prevValue: filterJS.queryValue,
                              replace: true,
                            });
                          }
                        }
                        options={filter.get('attributeOptions')
                          .map((o) => {
                            const label = intl.formatMessage(
                              appMessages[optionCAF.get('optionMessages')][o.get('value')]
                            );
                            const checked = filter.get('connectedAttributes')
                              ? filter.get('connectedAttributes').some(
                                (att) => att.get('value') === o.get('value')
                              )
                              : false;
                            return o.set('label', label).set('checked', checked);
                          })
                          .toList()
                        }
                      />
                    )}
                  </Box>
                  {filterJS.connectedAttributes && hasAttributeOptions && (
                    <Box
                      margin={{ left: 'medium', vertical: 'xsmall' }}
                      gap="xxsmall"
                      align="start"
                    >
                      {filterJS.connectedAttributes.map(
                        (att) => (
                          <Box
                            key={att.value}
                          >
                            <ButtonTagFilterWrap
                              filter={{
                                dot: att.color,
                              }}
                              level={2}
                              label={truncateText(att.label || att.value, 16)}
                              onClick={(args) => {
                                onHideOptions();
                                att.onClick(args);
                              }}
                            />
                          </Box>
                        )
                      )}
                    </Box>
                  )}
                </Box>
              );
            }
          )}
        </Box>
      )}
    </Box>
  );
}

FilterOptionList.propTypes = {
  group: PropTypes.object,
  option: PropTypes.object,
  onShowForm: PropTypes.func.isRequired,
  onHideOptions: PropTypes.func,
  onUpdateQuery: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(FilterOptionList);
