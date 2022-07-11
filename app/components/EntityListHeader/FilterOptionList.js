/*
 *
 * EntityListSidebarGroups
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
            (f, j) => {
              const filter = f.toJS();
              const connectionAttributeFilter = option.get('connectionAttributeFilters')
                && filter.connectedAttributes
                && option
                  .get('connectionAttributeFilters')
                  .find(
                    (caf) => caf.get('attribute') === filter.connectionAttributeName
                  );
              return (
                <Box key={j} align="start">
                  <Box direction="row">
                    <ButtonTagFilterWrap
                      onClick={(args) => {
                        onHideOptions();
                        filter.onClick(args);
                      }}
                      filter={filter}
                      label={getFilterLabel(filter, intl, true)}
                      showConnectedAttributes={false}
                    />
                    {connectionAttributeFilter && (
                      <OptionsOverlay
                        title="Select attribute options"
                        onChange={
                          (options) => {
                            const [value] = filter.queryValue.split('>');
                            const newValues = options
                              .filter((o) => o.get('checked'))
                              .map((o) => o.get('value'))
                              .toJS();
                            console.log(newValues);
                            // option active
                            onUpdateQuery({
                              arg: filter.query,
                              value: newValues.length > 0
                                ? `${value}>${filter.connectionAttributeName}=${newValues.join('|')}`
                                : value,
                              prevValue: filter.queryValue,
                              replace: true,
                            });
                          }
                        }
                        options={connectionAttributeFilter
                          .get('options')
                          .map(
                            (o) => o.set(
                              'label',
                              intl.formatMessage(appMessages[connectionAttributeFilter.get('optionMessages')][o.get('value')])
                            ).set(
                              'checked',
                              f.get('connectedAttributes').some(
                                (att) => att.get('value') === o.get('value')
                              )
                            )
                          )
                          .toList()
                        }
                      />
                    )}
                  </Box>
                  {filter.connectedAttributes && (
                    <Box
                      margin={{ left: 'medium', vertical: 'xsmall' }}
                      gap="xxsmall"
                      align="start"
                    >
                      {filter.connectedAttributes.map(
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
