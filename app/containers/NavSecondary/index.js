import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { updatePath } from 'containers/App/actions';

import PrintHide from 'components/styled/PrintHide';
import Container from 'components/styled/Container';
import Content from 'components/styled/ContentSimple';

import LinkMain from './LinkMain';
// import messages from './messages';

const Styled = styled.div`
  background-color: white;
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  position: relative;
  height: ${({ theme }) => theme.sizes.navSecondary.height}px;
  @media print {
    display: block;
    position: static;
    box-shadow: none;
    background: white;
  }
`;

const LinkTitle = styled.div``;

const NavMain = styled(PrintHide)`
  white-space: nowrap;
  height: ${({ theme }) => theme.sizes.navSecondary.height}px;
  position: relative;
`;

const Note = styled(Text)`
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme }) => theme.text.medium.size};
  line-height: ${({ theme }) => theme.text.medium.size};
  border-bottom: 4px solid transparent;
  padding: 5px 0.5em 5px;
  opacity: 0.3;
  @media print {
    font-size: ${({ theme }) => theme.sizes.header.print.title};
  }
  position: absolute;
  top: ${({ theme }) => theme.global.edgeSize.hair};
  right: 0;
  @media (min-width: ${({ theme }) => theme.breakpointsMin.medium}) {
    position: static;
  }

`;

const StyledContainer = styled(Container)`
  padding-bottom: 0;
`;
class NavSecondary extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { onPageLink, navItems } = this.props;

    return (
      <Styled>
        <StyledContainer>
          <Content>
            <NavMain>
              <Box direction="row" justify="between" align="end" fill>
                <Box direction="row" align="end" fill>
                  {navItems && navItems.map((item, i) => (
                    <LinkMain
                      key={i}
                      href={item.path}
                      active={item.active}
                      onClick={(evt) => {
                        if (evt !== undefined && evt.preventDefault) evt.preventDefault();
                        onPageLink(item.path);
                      }}
                    >
                      <LinkTitle active={item.active}>
                        {item.title}
                      </LinkTitle>
                    </LinkMain>
                  ))}
                </Box>
                <Note>
                  For authorised use only. Share with care.
                </Note>
              </Box>
            </NavMain>
          </Content>
        </StyledContainer>
      </Styled>
    );
  }
}

NavSecondary.propTypes = {
  onPageLink: PropTypes.func.isRequired,
  navItems: PropTypes.array,
};

export function mapDispatchToProps(dispatch) {
  return {
    onPageLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
  };
}


export default connect(null, mapDispatchToProps)(NavSecondary);
