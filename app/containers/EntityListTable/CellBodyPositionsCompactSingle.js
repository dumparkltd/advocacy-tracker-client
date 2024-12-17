import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import {
  Drop,
  Text,
  Box,
  ResponsiveContext,
} from 'grommet';

import { isMinSize } from 'utils/responsive';

import Dot from 'components/styled/Dot';
import Button from 'components/buttons/ButtonSimple';

import appMessages from 'containers/App/messages';

const LinkTooltip = styled(
  React.forwardRef((p, ref) => <Button as="a" {...p} ref={ref} />)
)`
  border: 1px solid transparent;
  &:hover {
    border: 1px solid black;
  }
`;

const Value = styled((p) => <Text size="xsmall" {...p} />)``;
const Label = styled((p) => <Text size="xxxsmall" {...p} />)`
  color: ${({ theme }) => theme.global.colors.hint};
`;
const LabelValueWrap = styled((p) => <Box gap="xsmall" {...p} />)``;

export function CellBodyPositionsCompactSingle({
  position,
  mainEntity,
  width,
  onEntityClick,
}) {
  // const [showContent, setShowContent] = React.useState(false);
  const infoRef = React.useRef(null);
  const [info, setInfo] = React.useState(false);
  // const [hover, isHover] = React.useState(false);
  // info && console.log(position)
  const { id, path, href } = mainEntity;
  const size = React.useContext(ResponsiveContext);
  const isSmall = !isMinSize(size, 'medium');
  return (
    <>
      <LinkTooltip
        onClick={(evt) => {
          if (evt) evt.preventDefault();
          if (!isSmall && onEntityClick && mainEntity) {
            onEntityClick(id, path);
          } else {
            setInfo(true);
          }
        }}
        onMouseOver={() => setInfo(true)}
        onMouseLeave={() => setInfo(false)}
        onFocus={() => setInfo(true)}
        onBlur={() => setInfo(false)}
        ref={infoRef}
        title="Click for position details"
        href={href}
      >
        <Dot
          size="32px"
          width={width}
          color={position.color}
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
          trapFocus={false}
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
            <LabelValueWrap>
              <Label>
                <FormattedMessage {...appMessages.entities.indicators.single} />
              </Label>
              <Value weight={500}>
                {position.indicatorTitle}
              </Value>
            </LabelValueWrap>
            <LabelValueWrap>
              <Label>
                <FormattedMessage {...appMessages.attributes.supportlevel_id} />
              </Label>
              <Box direction="row" gap="xsmall" align="center">
                <Dot color={position.color} />
                <Value>
                  <FormattedMessage {...appMessages.supportlevels[position.supportlevelId]} />
                </Value>
              </Box>
            </LabelValueWrap>
            {position.authority && (
              <LabelValueWrap>
                <Label>
                  Level of authority
                </Label>
                <Value>
                  {position.authority}
                </Value>
              </LabelValueWrap>
            )}
            {position.groupTitle && (
              <LabelValueWrap>
                <Label>
                  As member of
                </Label>
                <Value>
                  {position.groupTitle}
                </Value>
              </LabelValueWrap>
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
  mainEntity: PropTypes.object,
  onEntityClick: PropTypes.func,
  intl: intlShape,
};

export default injectIntl(CellBodyPositionsCompactSingle);
