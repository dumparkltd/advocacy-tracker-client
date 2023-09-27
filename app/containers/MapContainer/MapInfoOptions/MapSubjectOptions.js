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
  padding-bottom: ${({ inList }) => inList ? 2 : 10}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-bottom: ${({ inList }) => inList ? 5 : 15}px;
  }
`;
const TypeButton = styled((p) => <Button plain {...p} />)`
  padding: ${({ inList }) => inList ? '0px 2px' : '2px 2px'};
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'auto' : 'transparent'};
  background: none;
`;
const TextWrap = styled((p) => <Box {...p} />)`
  border-bottom: 1px solid;
  border-bottom-color: ${({ hasBorder }) => hasBorder ? 'auto' : 'transparent'};
`;

function MapSubjectOptions({ options, inList }) {
  const isPrint = usePrint();
  const optionActiveForPrint = isPrint && options
    ? options.find(
      (option) => option && option.active && !option.printHide
    )
    : null;

  return (
    <Styled inList={inList}>
      <PrintHide>
        {options && (
          <Box direction="row" gap="small">
            {
              options.map((option, i) => option && (
                <Box key={i}>
                  <TypeButton active={option.active} onClick={option.onClick} inList={inList}>
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
          <Box direction="row" gap="small" justify="start">
            <TextWrap hasBorder={inList}>
              <TextPrint size={inList ? 'medium' : 'large'}>
                {optionActiveForPrint.title}
              </TextPrint>
            </TextWrap>
          </Box>
        )}
      </PrintOnly>
    </Styled>
  );
}

MapSubjectOptions.propTypes = {
  options: PropTypes.array,
  inList: PropTypes.bool,
};

export default MapSubjectOptions;
