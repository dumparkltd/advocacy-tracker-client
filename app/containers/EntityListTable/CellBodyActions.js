import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Text, Drop,
} from 'grommet';
import styled from 'styled-components';
import { truncateText } from 'utils/string';
import Button from 'components/buttons/ButtonTableCell';

import { ROUTES } from 'themes/config';
import DropEntityList from './DropEntityList';
import LabelTooltip from './LabelTooltip';
import LinkTooltip from './LinkTooltip';
import Label from './LabelCellBody';

const Link = styled((p) => <Button as="a" {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;

const getActionLink = (action) => `${ROUTES.ACTION}/${action.get('id')}`;

export function CellBodyActions({
  entity,
  align = 'start',
  onEntityClick,
}) {
  const buttonRef = useRef();
  const [showContent, setShowContent] = useState(false);
  return (
    <Box alignContent={align}>
      {entity.single && entity.date && (
        <Box flex={{ shrink: 0 }}>
          <Text size="xsmall" weight={500} wordBreak="keep-all">
            {entity.date}
          </Text>
        </Box>
      )}
      {entity.single && (
        <Link
          href={getActionLink(entity.single)}
          onClick={(evt) => {
            if (evt) evt.preventDefault();
            onEntityClick(entity.single.get('id'), ROUTES.ACTION);
          }}
          title={entity.value}
          alignSelf={align}
        >
          <Box>
            <Label textAlign={align} title={entity.value}>
              {truncateText(entity.value, 25)}
            </Label>
          </Box>
        </Link>
      )}
      {entity.tooltip && (
        <LinkTooltip
          ref={buttonRef}
          showContent={showContent}
          alignSelf={align}
          onClick={() => setShowContent(!showContent)}
        >
          <Box align="center" justify="center">
            <LabelTooltip textAlign={align}>
              {entity.value}
            </LabelTooltip>
          </Box>
        </LinkTooltip>
      )}
      {entity.tooltip && showContent && buttonRef.current && (
        <Drop
          target={buttonRef.current}
          onClickOutside={() => setShowContent(false)}
          align={{
            bottom: 'top',
          }}
          margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
          background="white"
          elevation="small"
          overflow={{
            vertical: 'auto',
            horizontal: 'hidden',
          }}
        >
          <DropEntityList
            entityType="actions"
            tooltipConfig={entity.tooltip}
            onEntityClick={(id) => {
              setShowContent(false);
              onEntityClick(id, ROUTES.ACTION);
            }}
          />
        </Drop>
      )}
    </Box>
  );
}

CellBodyActions.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  onEntityClick: PropTypes.func,
};


export default CellBodyActions;
