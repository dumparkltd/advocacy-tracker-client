/*
 *
 * EntityListHeader
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import {
  Box, Text, ResponsiveContext,
} from 'grommet';
import { Multiple } from 'grommet-icons';

import { isMinSize } from 'utils/responsive';

import ButtonFlat from 'components/buttons/ButtonFlat';
import Bookmarker from 'containers/Bookmarker';

import EntityListViewOptions from 'components/EntityListViewOptions';

import PrintHide from 'components/styled/PrintHide';
import Icon from 'components/Icon';

import messages from './messages';

const Styled = styled(PrintHide)`
  display: ${({ isPrint }) => isPrint ? 'none' : 'block'};
`;

const TheHeader = styled((p) => <Box direction="row" {...p} />)`
  height: ${({ theme }) => theme.sizes.headerList.banner.height}px;
  position: relative;
  z-index: 96;
`;
const HeaderSection = styled((p) => <Box direction="row" {...p} />)`
  position: relative;
`;

const HeaderActionsWrapper = styled(
  (p) => (
    <Box
      direction="row"
      align="center"
      plain
      responsive={false}
      {...p}
    />
  )
)`
  background: white;
  box-shadow: ${({ isOnMap }) => isOnMap ? '0px 0px 5px 0px rgba(0,0,0,0.2)' : 'none'};
  border-radius: 999px;
  padding: 4px 13px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    padding: 4px 16px;
  }
`;

const ButtonActions = styled((p) => <ButtonFlat {...p} />)`
  padding: 0;
  min-height: 33px;
  min-width: 33px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    padding: 0;
  }
`;

const FilterButton = styled((p) => <ButtonFlat {...p} />)`
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  padding: 4px 13px;
  border: none;
  border-radius: 999px;
  background: ${palette('primary', 1)};
  color: white;
  font-family: ${({ theme }) => theme.fonts.title};
  text-transform: uppercase;
  font-weight: 300;
  min-height: 33px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.ms}) {
    min-width: 33px;
    padding: 4px 16px;
  }
  &:hover {
    box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
    background: ${palette('primary', 0)};
    color: white;
  }
`;

export class EntityListHeader extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      onShowFilters,
      canEdit,
      headerActions,
      viewOptions,
      isPrintView,
      isOnMap,
      intl,
    } = this.props;

    const managerActions = canEdit && headerActions && headerActions.filter(
      (action) => action.isMember
    );
    const normalActions = headerActions && headerActions.filter(
      (action) => !action.isMember
    );

    return (
      <ResponsiveContext.Consumer>
        {(size) => (
          <Styled isPrint={isPrintView}>
            <TheHeader
              margin={{ bottom: 'xsmall' }}
              pad={{ top: 'ms' }}
              align="center"
              justify="between"
            >
              <HeaderSection>
                <PrintHide>
                  {viewOptions && viewOptions.length > 1
                    && (
                      <EntityListViewOptions
                        options={viewOptions}
                        isPrintView={isPrintView}
                        isOnMap={isOnMap}
                      />
                    )}
                </PrintHide>
              </HeaderSection>
              <Box direction="row" gap="small">
                {(normalActions || managerActions) && (
                  <HeaderSection>
                    <HeaderActionsWrapper
                      isOnMap={isOnMap}
                      gap={isMinSize(size, 'ms') ? 'xsmall' : 'xxsmall'}
                    >
                      {normalActions && normalActions.map(
                        (action, i) => {
                          if (action.type === 'bookmarker') {
                            return (
                              <Box key={i}>
                                <Bookmarker
                                  viewTitle={action.title}
                                  type={action.entityType}
                                />
                              </Box>
                            );
                          }
                          if (action.type === 'icon') {
                            return (
                              <Box key={i}>
                                <ButtonActions
                                  onClick={action.onClick && (() => action.onClick())}
                                  title={action.title}
                                  alt={action.title}
                                  subtle
                                >
                                  <Icon name={action.icon} title={action.title} />
                                </ButtonActions>
                              </Box>
                            );
                          }
                          return null;
                        }
                      )}
                      {managerActions && managerActions
                        .filter(
                          (action) => action.icon === 'import'
                        ).map(
                          (action, i) => (
                            <Box key={i + 1000}>
                              <ButtonActions
                                onClick={action.onClick && (() => action.onClick())}
                                title={action.title}
                                alt={action.title}
                                subtle
                              >
                                <Multiple size="small" style={{ stroke: 'currentColor' }} />
                              </ButtonActions>
                            </Box>
                          )
                        )}
                    </HeaderActionsWrapper>
                  </HeaderSection>
                )}
                {isMinSize(size, 'small') && (
                  <HeaderSection align="center">
                    <FilterButton
                      onClick={onShowFilters}
                    >
                      <Box direction="row" gap="xsmall" align="center" responsive={false}>
                        {isMinSize(size, 'medium') && (
                          <Text style={{ marginTop: '-3px' }}>
                            {intl.formatMessage(messages.listOptions.showFilter)}
                          </Text>
                        )}
                        <Box style={{ marginTop: '2px' }}>
                          <Icon name="filter" size="30px" text />
                        </Box>
                      </Box>
                    </FilterButton>
                  </HeaderSection>
                )}
              </Box>
            </TheHeader>
          </Styled>
        )}
      </ResponsiveContext.Consumer>
    );
  }
}
EntityListHeader.propTypes = {
  onShowFilters: PropTypes.func,
  canEdit: PropTypes.bool,
  isPrintView: PropTypes.bool,
  isOnMap: PropTypes.bool,
  headerActions: PropTypes.array,
  viewOptions: PropTypes.array,
  intl: intlShape.isRequired,
};

export default injectIntl(EntityListHeader);
