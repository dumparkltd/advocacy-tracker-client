import React from 'react';
import PropTypes from 'prop-types';
// import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Box, Text, Button,
} from 'grommet';
import styled from 'styled-components';

const Styled = styled((p) => <Box {...p} />)`
  height: fit-content;
`;
const CardLink = styled((p) => <Button plain as="a" {...p} />)`
  padding: 20px 15px;
  color: ${({ theme }) => theme.global.colors.text.brand};
  &:hover {
    color: ${({ theme }) => theme.global.colors.text.highlight};
  }
`;
const TitleWrap = styled((p) => <Box {...p} />)``;
const Count = styled((p) => <Text {...p} />)`
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: 54px;
  line-height: 60px;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    font-size: 72px;
    line-height: 80px;
  }
`;
const Title = styled((p) => <Text size="xxlarge" {...p} />)`
  font-family: ${({ theme }) => theme.fonts.title};
`;
const Description = styled((p) => <Text size="small" {...p} />)``;

export function CardTeaser({
  // isInverted,
  onClick,
  path,
  count,
  title,
  dataReady,
  description,
  basis,
}) {
  // const size = React.useContext(ResponsiveContext);
  return (
    <Styled
      elevation="small"
      background="white"
      basis={basis || 'full'}
      dataReady={dataReady}
    >
      <CardLink
        disabled={!dataReady}
        href={`${path}`}
        onClick={onClick}
      >
        <Box direction="column" justify="start" gap="medium">
          <TitleWrap
            direction="column"
            gap="xsmall"
          >
            <Title>
              {title}
            </Title>
            {typeof count !== 'undefined' && count !== null && (
              <Count>{count}</Count>
            )}
          </TitleWrap>
          {description && (
            <Description>
              {description}
            </Description>
          )}
        </Box>
      </CardLink>
    </Styled>
  );
}

CardTeaser.propTypes = {
  // intl: intlShape.isRequired,
  // isInverted: PropTypes.bool,
  dataReady: PropTypes.bool,
  onClick: PropTypes.func,
  path: PropTypes.string,
  count: PropTypes.number,
  title: PropTypes.string,
  description: PropTypes.string,
  basis: PropTypes.string,
};

export default CardTeaser;
