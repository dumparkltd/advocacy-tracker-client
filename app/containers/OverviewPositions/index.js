import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { qe } from 'utils/quasi-equals';
import { Box, Text, Heading } from 'grommet';

import styled from 'styled-components';
import { palette } from 'styled-theme';

import appMessages from 'containers/App/messages';
import messages from './messages';

import { ROUTES, ACTIONTYPES } from 'themes/config';
import { loadEntitiesIfNeeded, setMapIndicator } from 'containers/App/actions';

import {
  selectReady,
  selectIndicators,
  selectMapIndicator,
} from 'containers/App/selectors';

import HeaderExplore from 'containers/HeaderExplore';
import Footer from 'containers/Footer';

import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import Loading from 'components/Loading';

import { DEPENDENCIES } from './constants';

const ViewContainer = styled(Container)`
  min-height: 80vH;
  @media print {
    min-height: 50vH;
  }
`;
const StyledCard = styled((p) => <Box {...p} />)``;

const TitleMedium = styled((p) => <Heading level='2' {...p} />)`        
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;
const SubTitle = styled((p) => <Heading level='3' {...p} />)`        
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;

const IndicatorList = styled((p) => <Box {...p} />)`
  border-right: 1px solid ${palette('light', 2)};
`;
const MapContainerWrapper = styled((p) => <Box {...p} />)``;
const IndicatorListItem = styled((p) => <Box {...p} />)`
  border-bottom: 1px solid ${palette('light', 2)};
  width: 100%;
  background: ${({ active }) => (active ? palette('primary', 1) : 'white')};
  position: relative;

  &:focus {
    outline: none;
    box-shadow: none;
  }
  /* extra width at the start, on selected item */
  &::before {
    display: ${({ active }) => (active ? 'block' : 'none')};
    position: absolute;
    content: '';
    top: 50%;
    left: -5px; 
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 21px solid ${palette('primary', 1)};
    border-bottom: 21px solid ${palette('primary', 1)};
    border-right: 12px solid ${palette('primary', 1)};
  }
  /* arrow at the end, on selected item */
  &::after {
    display: ${({ active }) => (active ? 'inline-block' : 'none')};
    content: '';
    position: absolute;
    right: -24px;
    top: 50%;
    transform: translateY(-50%); 
    border-width: 15px; 
    border-style: solid;
    border-color: transparent transparent transparent ${palette('primary', 1)};
  }
  `;
const IndicatorListTitle = styled((p) => <Text size='small' {...p} />)`        
  color: ${palette('dark', 4)};
  font-style: italic;
`;
const IndicatorLabel = styled((p) => <Text size='small' {...p} />)`
  width: 90%;
  display: block;
  white-space: nowrap;         
  overflow: hidden;   
  text-overflow: ellipsis; 
  color: ${({ active }) => active ? 'white' : 'black'};
`;
export function OverviewPositions({
  onLoadData,
  intl,
  dataReady,
  indicators,
  mapIndicator,
  onSetMapIndicator,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  // const size = React.useContext(ResponsiveContext);
  const indicatorOptions = indicators && indicators.reduce(
    (memo, entity) => {
      return [
        ...memo,
        {
          id: entity.get('id'),
          value: entity.get('id'),
          label: entity.getIn(['attributes', 'title']),
          active: qe(mapIndicator, entity.get('id')),
          onClick: (value) => onSetMapIndicator(value),
          //href: `${ROUTES.INDICATOR}/${entity.get('id')}`,
        },
      ];
    }, []);

  return (
    <ContainerWrapper bg>
      <HeaderExplore
        navItems={[
          {
            path: ROUTES.POSITIONS,
            active: true,
            title: 'Overview',
          },
          {
            path: `${ROUTES.ACTIONS}/${ACTIONTYPES.EXPRESS}`,
            title: intl.formatMessage(appMessages.entities[`actions_${ACTIONTYPES.EXPRESS}`].plural),
          },
          {
            path: ROUTES.INDICATORS,
            title: intl.formatMessage(appMessages.entities.indicators.plural),
          },
        ]}
      />
      <Loading loading={!dataReady} />
      <ViewContainer>
        <ContentSimple>
          <Box pad={{ top: 'large' }}>
            <TitleMedium>
              <FormattedMessage {...messages.pageTitle} />
            </TitleMedium>
          </Box>
          <Box pad={{ top: 'small', bottom: 'xsmall' }}>
            <SubTitle>
              <FormattedMessage {...messages.subTitle} />
            </SubTitle>
          </Box>
          <StyledCard
            elevation='small'
            background='white'
            basis='full'
            direction='row'
          >
            <IndicatorList
              flex={{ shrink: 0 }}
              basis='30%'
            >
              <IndicatorListItem
                pad={{
                  vertical: 'small',
                  horizontal: 'xsmall'
                }}
              >
                <IndicatorListTitle>
                  <FormattedMessage {...messages.indicatorListTitle} />
                </IndicatorListTitle>
              </IndicatorListItem>
              {indicatorOptions
                && indicatorOptions.map(indicator =>
                  indicator &&
                  <IndicatorListItem
                    pad={{
                      vertical: 'small',
                      horizontal: 'small'
                    }}
                    active={indicator.active}
                    key={indicator.id}
                    id={indicator.id}
                    onClick={() => indicator.onClick(indicator.value)}
                  >
                    <IndicatorLabel active={indicator.active}>
                      {indicator.label}
                    </IndicatorLabel>
                  </IndicatorListItem>
                )
              }
            </IndicatorList>
            <MapContainerWrapper flex={{ grow: 1 }}>
              MAP
            </MapContainerWrapper>
          </StyledCard>
        </ContentSimple>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

OverviewPositions.propTypes = {
  intl: intlShape.isRequired,
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  // onUpdatePath: PropTypes.func.isRequired,
  // types: PropTypes.instanceOf(Map),
};

const mapStateToProps = createStructuredSelector({
  dataReady: (state) => selectReady(state, { path: DEPENDENCIES }),
  indicators: (state) => selectIndicators(state),
  mapIndicator: (state) => selectMapIndicator(state),
  // types: (state) => selectActiontypesWithActionCount(state),
});


export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onSetMapIndicator: (value) => dispatch(setMapIndicator(value)),
    // onUpdatePath: (path) => {
    //   dispatch(updatePath(path));
    // },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(OverviewPositions));
