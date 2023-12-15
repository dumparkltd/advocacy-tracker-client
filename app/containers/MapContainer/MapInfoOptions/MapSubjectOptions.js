import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button } from 'grommet';

// import ButtonFactory from 'components/buttons/ButtonFactory';

import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';
import TextPrint from 'components/styled/TextPrint';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled.div`
  padding-bottom: ${({ inList, isPrint }) => {
    if (isPrint) return 0;
    return inList ? 2 : 10;
  }}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-bottom: ${({ inList, isPrint }) => {
    if (isPrint) return 0;
    return inList ? 5 : 15;
  }}px;
  }
`;
const TypeButton = styled((p) => <Button plain {...p} />)`
  padding: ${({ inList }) => inList ? '0px 2px' : '2px 2px'};
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'auto' : 'transparent'};
  background: none;
`;

function MapSubjectOptions({ options, inList, align = 'start' }) {
  const isPrint = usePrint();
  const optionActiveForPrint = isPrint && options
    ? options.find(
      (option) => option && option.active && !option.printHide
    )
    : null;

  return (
    <Styled inList={inList} isPrint={isPrint}>
      <PrintHide>
        {options && (
          <Box direction="row" gap="small">
            {
              options.map((option, i) => option && (
                <Box key={i}>
                  <TypeButton
                    active={option.active}
                    onClick={option.onClick}
                    inList={inList}
                  >
                    <TextPrint size={inList ? 'medium' : 'large'}>
                      {option.title}
                    </TextPrint>
                  </TypeButton>
                </Box>
              ))
            }
          </Box>
        )}
      </PrintHide>
      <PrintOnly>
        {optionActiveForPrint && (
          <Box direction="row" gap="small" justify={align}>
            <TextPrint size={inList ? 'medium' : 'large'}>
              {optionActiveForPrint.title}
            </TextPrint>
          </Box>
        )}
      </PrintOnly>
    </Styled>
  );
}

MapSubjectOptions.propTypes = {
  options: PropTypes.array,
  inList: PropTypes.bool,
  align: PropTypes.string,
};

export default MapSubjectOptions;
