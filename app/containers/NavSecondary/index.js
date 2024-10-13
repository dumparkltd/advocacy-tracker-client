import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

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
  padding: 20px 0 0;
  @media print {
    display: block;
    height: ${({ theme }) => theme.sizes.headerExplore.banner.height}px;
    position: static;
    box-shadow: none;
    background: white;
  }
`;

const LinkTitle = styled.div``;

const NavMain = styled(PrintHide)`
  white-space: nowrap;
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
// const mapStateToProps = (state) => ({
//   currentPath: selectCurrentPathname(state),
// });


export function mapDispatchToProps(dispatch) {
  return {
    onPageLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
  };
}


export default connect(null, mapDispatchToProps)(NavSecondary);
