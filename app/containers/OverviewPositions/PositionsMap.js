import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage } from 'react-intl';
import { qe } from 'utils/quasi-equals';
import {
  Box, Text, Heading, Button,
} from 'grommet';

import styled from 'styled-components';
import { palette } from 'styled-theme';

import { setMapIndicator } from 'containers/App/actions';

import { selectIndicators, selectMapIndicator } from 'containers/App/selectors';

import messages from './messages';

const StyledCard = styled((p) => <Box {...p} />)``;

const SubTitle = styled((p) => <Heading level="3" {...p} />)`
  color: black;
  text-transform: uppercase;
  font-weight: bold;
`;

const IndicatorPanel = styled((p) => <Box {...p} />)`
  border-right: 1px solid ${palette('light', 2)};
  width: 200px;
`;
const MapContainerWrapper = styled((p) => <Box {...p} />)``;
const IndicatorList = styled((p) => <Box {...p} />)``;
const IndicatorPanelHeader = styled((p) => <Box {...p} />)`
  border-bottom: 1px solid ${palette('light', 2)};
  width: 100%;
  position: relative;
`;
const IndicatorSelectButton = styled((p) => <Button plain {...p} />)`
  border-bottom: 1px solid ${palette('light', 2)};
  width: 100%;
  background: ${({ active }) => (active ? palette('primary', 1) : 'white')};
  position: relative;
  padding: ${({ theme }) => theme.global.edgeSize.small};
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
const IndicatorListTitle = styled((p) => <Text size="small" {...p} />)`
  color: ${palette('dark', 4)};
  font-style: italic;
`;
const IndicatorLabel = styled((p) => <Text size="small" {...p} />)`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ active }) => active ? 'white' : 'black'};
`;
export function PositionsMap({
  indicators,
  currentIndicatorId,
  onSetMapIndicator,
}) {
  // const size = React.useContext(ResponsiveContext);
  let activeId = currentIndicatorId;
  if (indicators && (!activeId || activeId === '')) {
    activeId = indicators.first().get('id');
  }
  return (
    <Box pad={{ top: 'small', bottom: 'xsmall' }}>
      <Box pad={{ top: 'small', bottom: 'xsmall' }}>
        <SubTitle>
          <FormattedMessage {...messages.subTitle} />
        </SubTitle>
      </Box>
      <StyledCard
        elevation="small"
        background="white"
        basis="full"
        direction="row"
      >
        <IndicatorPanel>
          <IndicatorPanelHeader
            pad={{
              vertical: 'small',
              horizontal: 'xsmall',
            }}
          >
            <IndicatorListTitle>
              <FormattedMessage {...messages.indicatorListTitle} />
            </IndicatorListTitle>
          </IndicatorPanelHeader>
          <IndicatorList>
            {indicators && indicators.entrySeq().map(([id, indicator]) => {
              const active = qe(activeId, id);
              return (
                <IndicatorSelectButton
                  active={active}
                  key={id}
                  id={id}
                  onClick={() => onSetMapIndicator(id)}
                >
                  <IndicatorLabel active={active}>
                    {indicator.getIn(['attributes', 'title'])}
                  </IndicatorLabel>
                </IndicatorSelectButton>
              );
            })}
          </IndicatorList>
        </IndicatorPanel>
        <MapContainerWrapper flex={{ grow: 1 }}>
          MAP
        </MapContainerWrapper>
      </StyledCard>
    </Box>
  );
}

PositionsMap.propTypes = {
  indicators: PropTypes.object,
  currentIndicatorId: PropTypes.string,
  onSetMapIndicator: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  currentIndicatorId: (state) => selectMapIndicator(state),
  indicators: (state) => selectIndicators(state),
});


export function mapDispatchToProps(dispatch) {
  return {
    onSetMapIndicator: (value) => dispatch(setMapIndicator(value)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(PositionsMap);
