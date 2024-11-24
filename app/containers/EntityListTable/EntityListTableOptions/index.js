import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { Box, Text, ResponsiveContext } from 'grommet';
import { PAGE_ITEM_OPTIONS } from 'themes/config';

import { isMinSize } from 'utils/responsive';

import { usePrint } from 'containers/App/PrintContext';

import BoxPrint from 'components/styled/BoxPrint';
import ButtonPill from 'components/buttons/ButtonPill';
import SelectReset from 'components/SelectReset';
import EntityListSearch from 'components/EntityListSearch';

import MapSubjectOptions from 'containers/MapContainer/MapInfoOptions/MapSubjectOptions';
import MapOption from 'containers/MapContainer/MapInfoOptions/MapOption';

import appMessages from 'containers/App/messages';

const EntityListSearchWrapper = styled((p) => <Box {...p} />)`
  width: 100%;
`;

export function EntityListTableOptions({
  options = {},
  onPageItemsSelect,
  onSearch,
  searchQuery,
  pageSelectValue,
  intl,
}) {
  const {
    checkboxOptions,
    typeOptions,
    subjectOptions,
    hasSearch,
    hasPageSelect,
    searchPlaceholder,
  } = options;
  const isPrintView = usePrint();
  const size = React.useContext(ResponsiveContext);
  return (
    <Box
      justify="start"
      fill="horizontal"
      margin={{ bottom: 'medium' }}
      gap="small"
    >
      <Box direction="row" justify="between" align="center">
        {!isPrintView && subjectOptions && subjectOptions.length > 0 && (
          <Box style={{ position: 'relative', top: '5px' }}>
            <MapSubjectOptions
              inList
              options={subjectOptions}
            />
          </Box>
        )}
        {isMinSize(size, 'large') && hasPageSelect && (
          <Box>
            <SelectReset
              value={pageSelectValue}
              label={intl && intl.formatMessage(appMessages.labels.perPage)}
              index="page-select"
              options={PAGE_ITEM_OPTIONS && PAGE_ITEM_OPTIONS.map((option) => ({
                value: option.value.toString(),
                label: option.value.toString(),
              }))}
              isReset={false}
              onChange={onPageItemsSelect}
            />
          </Box>
        )}
      </Box>
      {(hasSearch || hasPageSelect || typeOptions || checkboxOptions) && (
        <Box
          direction={isMinSize(size, 'large') ? 'row' : 'column'}
          justify={isMinSize(size, 'large') ? 'between' : 'start'}
          gap={isMinSize(size, 'large') ? 'none' : 'small'}
          align={isMinSize(size, 'large') ? 'start' : 'end'}
        >
          <Box
            gap="small"
            basis={isMinSize(size, 'large') ? '1/2' : '1'}
          >
            {!isPrintView && typeOptions && typeOptions.length > 0 && (
              <BoxPrint
                isPrint={isPrintView}
                printHide
                direction="row"
                gap="xsmall"
                wrap
                margin={{ top: '5px' }}
              >
                {typeOptions.map(
                  (type) => (
                    <ButtonPill
                      key={type.id}
                      onClick={() => type.onClick()}
                      active={type.active}
                    >
                      <Text size="small" style={{ position: 'relative', top: '-1px' }}>
                        {type.label}
                      </Text>
                    </ButtonPill>
                  )
                )}
              </BoxPrint>
            )}
            {!isPrintView && checkboxOptions && checkboxOptions.length > 0 && (
              <Box>
                {checkboxOptions && checkboxOptions.map(
                  (option, i) => (
                    <MapOption key={i} option={option} />
                  )
                )}
              </Box>
            )}
          </Box>
          <Box
            basis={isMinSize(size, 'large') ? '1/2' : 'auto'}
            alignSelf={isMinSize(size, 'large') ? 'start' : 'end'}
            justify="end"
            fill={isMinSize(size, 'medium') ? false : 'horizontal'}
          >
            {hasSearch && (
              <EntityListSearchWrapper>
                <EntityListSearch
                  searchQuery={searchQuery}
                  onSearch={onSearch}
                  placeholder={searchPlaceholder}
                />
              </EntityListSearchWrapper>
            )}
          </Box>
          {!isMinSize(size, 'large') && hasPageSelect && (
            <Box alignSelf="end">
              <SelectReset
                value={pageSelectValue}
                label={intl && intl.formatMessage(appMessages.labels.perPage)}
                index="page-select"
                options={PAGE_ITEM_OPTIONS && PAGE_ITEM_OPTIONS.map((option) => ({
                  value: option.value.toString(),
                  label: option.value.toString(),
                }))}
                isReset={false}
                onChange={onPageItemsSelect}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

EntityListTableOptions.propTypes = {
  options: PropTypes.object,
  onPageItemsSelect: PropTypes.func,
  onSearch: PropTypes.func,
  searchQuery: PropTypes.string,
  pageSelectValue: PropTypes.string,
  intl: intlShape,
};

export default injectIntl(EntityListTableOptions);
