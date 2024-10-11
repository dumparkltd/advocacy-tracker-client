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
  width: 500px;
`;

export function EntityListTableOptions({
  options = {},
  onPageItemsSelect,
  onSearch,
  searchQuery,
  pageSelectValue,
  intl,
}) {
  const size = React.useContext(ResponsiveContext);
  const {
    checkboxOptions,
    typeOptions,
    subjectOptions,
    hasSearch,
    hasPageSelect,
  } = options;
  const isPrintView = usePrint();

  return (
    <Box
      direction={isMinSize(size, 'medium') ? 'row' : 'column'}
      justify={subjectOptions ? 'between' : 'end'}
      fill="horizontal"
      margin={{ bottom: 'small' }}
    >
      {!isPrintView && (
        <Box
          direction="column"
          align="start"
          gap="xsmall"
          pad={{ vertical: 'small' }}
        >
          {subjectOptions && subjectOptions.length > 0 && (
            <Box>
              <MapSubjectOptions
                inList
                options={subjectOptions}
              />
            </Box>
          )}
          {typeOptions && typeOptions.length > 0 && (
            <BoxPrint
              isPrint={isPrintView}
              printHide
              direction="row"
              gap="xsmall"
              wrap
            >
              {typeOptions.map(
                (type) => (
                  <ButtonPill
                    key={type.id}
                    onClick={() => type.onClick()}
                    active={type.active}
                  >
                    <Text size="small">
                      {type.label}
                    </Text>
                  </ButtonPill>
                )
              )}
            </BoxPrint>
          )}
          {checkboxOptions && checkboxOptions.length > 0 && (
            <Box>
              {checkboxOptions && checkboxOptions.map(
                (option, i) => (
                  <MapOption key={i} option={option} />
                )
              )}
            </Box>
          )}
        </Box>
      )}
      {(hasSearch || hasPageSelect) && (
        <Box
          direction="column"
          align="end"
          gap="small"
          pad={{ vertical: 'small' }}
          justify={hasSearch ? 'start' : 'end'}
        >
          {hasPageSelect && (
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
          {hasSearch && (
            <EntityListSearchWrapper>
              <EntityListSearch searchQuery={searchQuery} onSearch={onSearch} />
            </EntityListSearchWrapper>
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
