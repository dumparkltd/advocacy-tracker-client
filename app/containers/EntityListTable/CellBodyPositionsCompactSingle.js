import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import { Drop, Text, Box } from 'grommet';
import Dot from 'components/styled/Dot';
import Button from 'components/buttons/ButtonSimple';

import appMessages from 'containers/App/messages';

const LinkTooltip = styled(
  React.forwardRef((p, ref) => <Button {...p} ref={ref} />)
)`
  border: 1px solid transparent;
  &:hover {
    border: 1px solid black;
  }
`;

const Value = styled((p) => <Text size="xsmall" {...p} />)``;
const Label = styled((p) => <Text size="xxsmall" {...p} />)`
  color: ${({ theme }) => theme.global.colors.hint};
`;

export function CellBodyPositionsCompactSingle({ position, width }) {
  // const [showContent, setShowContent] = React.useState(false);
  const infoRef = React.useRef(null);
  const [info, setInfo] = React.useState(false);
  // const [hover, isHover] = React.useState(false);
  // info && console.log(position)
  return (
    <>
      <LinkTooltip
        onClick={() => setInfo(!info)}
        onMouseOver={() => setInfo(true)}
        onMouseLeave={() => setInfo(false)}
        onFocus={() => setInfo(true)}
        onBlur={() => null}
        ref={infoRef}
      >
        <Dot
          size="32px"
          width={width}
          color={position.color}
          title={position.supportlevelId}
        />
      </LinkTooltip>
      {info && position && (
        <Drop
          target={infoRef.current}
          onClickOutside={() => setInfo(false)}
          align={{
            bottom: 'top',
            right: 'right',
          }}
          margin={{ bottom: 'xsmall' }}
          background="white"
          elevation="small"
          stretch={false}
        >
          <Box
            style={{
              width: '240px',
              minWidth: '240px',
              maxWidth: '240px',
            }}
            pad={{
              horizontal: 'small',
              vertical: 'small',
            }}
            gap="small"
            flex={{ shrink: 0 }}
          >
            <Box>
              <Label>
                <FormattedMessage {...appMessages.entities.indicators.single} />
              </Label>
              <Value>
                {position.indicatorTitle}
              </Value>
            </Box>
            <Box>
              <Label>
                <FormattedMessage {...appMessages.attributes.supportlevel_id} />
              </Label>
              <Value>
                <FormattedMessage {...appMessages.supportlevels[position.supportlevelId]} />
              </Value>
            </Box>
            {position.authority && (
              <Box>
                <Label>
                  Level of authority
                </Label>
                <Value>
                  {position.authority}
                </Value>
              </Box>
            )}
            {position.groupTitle && (
              <Box>
                <Label>
                  As member of
                </Label>
                <Value>
                  {position.groupTitle}
                </Value>
              </Box>
            )}
          </Box>
        </Drop>
      )}
    </>
  );
}

CellBodyPositionsCompactSingle.propTypes = {
  position: PropTypes.object,
  width: PropTypes.string, // eg 12px
  intl: intlShape,
};

export default injectIntl(CellBodyPositionsCompactSingle);
