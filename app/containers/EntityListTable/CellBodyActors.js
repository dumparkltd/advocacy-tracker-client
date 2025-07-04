import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Drop } from 'grommet';
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
const getActorLink = (actor) => `${ROUTES.ACTOR}/${actor.get('id')}`;

const getActorOnClick = (actor, onEntityClick, setShowContent) => (evt) => {
  if (evt) evt.preventDefault();
  if (setShowContent) setShowContent(false);
  onEntityClick(actor.get('id'), ROUTES.ACTOR);
};

export function CellBodyActors({
  entity,
  align = 'start',
  onEntityClick,
}) {
  const buttonRef = useRef();
  const [showContent, setShowContent] = useState(false);
  return (
    <Box alignContent={align}>
      {entity.single && (
        <Link
          href={getActorLink(entity.single)}
          onClick={getActorOnClick(entity.single, onEntityClick)}
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
            hasIndirect={!!entity.tooltipIndirect}
            entityType="actors"
            tooltipConfig={entity.tooltip}
            onEntityClick={(id) => {
              setShowContent(false);
              onEntityClick(id, ROUTES.ACTOR);
            }}
          />
          {entity.tooltipIndirect && (
            <DropEntityList
              indirect
              entityType="actors"
              tooltipConfig={entity.tooltipIndirect}
              onEntityClick={(id) => {
                setShowContent(false);
                onEntityClick(id, ROUTES.ACTOR);
              }}
            />
          )}
        </Drop>
      )}
    </Box>
  );
}

CellBodyActors.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  onEntityClick: PropTypes.func,
};


export default CellBodyActors;
