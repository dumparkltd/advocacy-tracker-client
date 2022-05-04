import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { ROUTES, FF_ACTIONTYPE } from 'themes/config';

import { selectCurrentPathname } from 'containers/App/selectors';
import { updatePath } from 'containers/App/actions';
import appMessages from 'containers/App/messages';

import PrintHide from 'components/styled/PrintHide';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';

import LinkMain from './LinkMain';
import messages from './messages';

const Styled = styled.div`
  background-color: ${palette('primary', 3)};
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
  position: relative;
  padding: 40px 0 0;
  @media print {
    display: block;
    height: ${({ theme }) => theme.sizes.headerExplore.banner.height}px;
    position: static;
    box-shadow: none;
    background: white;
  }
`;

const LinkTitle = styled.div`
  font-weight: 500;
  font-size: ${({ theme }) => theme.text.small.size};
  line-height: ${({ theme }) => theme.text.small.height};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.medium.size};
    line-height: ${({ theme }) => theme.text.medium.height};
  }
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const NavMain = styled(PrintHide)`
  white-space: nowrap;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.text.large.size};
  line-height: ${({ theme }) => theme.text.large.height};
  max-width: 100%;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.xlarge.size};
    line-height: ${({ theme }) => theme.text.xlarge.height};
    max-width: ${({ theme }) => theme.text.xlarge.maxWidth};
  }
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    font-size: ${({ theme }) => theme.text.xxlarge.size};
    line-height: ${({ theme }) => theme.text.xxlarge.height};
    max-width: ${({ theme }) => theme.text.xxlarge.maxWidth};
  }
  margin: 0;
  color: ${({ theme }) => theme.global.colors.brand};
`;
const Label = styled.div`
  margin-top: 30px;
  font-size: 0.7em;
`;

const StyledContainer = styled(Container)`
  padding-bottom: 0;
`;
class HeaderExplore extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { onPageLink, currentPath } = this.props;
    const { intl } = this.context;

    const navItems = [
      {
        path: ROUTES.ACTIONS,
        title: intl.formatMessage(appMessages.nav.actions),
        active: currentPath && currentPath === ROUTES.ACTIONS,
      },
      {
        path: ROUTES.ACTORS,
        title: intl.formatMessage(appMessages.nav.actors),
        active: currentPath && currentPath === ROUTES.ACTORS,
      },
      {
        path: `${ROUTES.ACTIONS}/${FF_ACTIONTYPE}`,
        title: intl.formatMessage(appMessages.actiontypes[FF_ACTIONTYPE]),
        active: currentPath && currentPath === `${ROUTES.ACTIONS}/${FF_ACTIONTYPE}`,
      },
    ];
    return (
      <Styled>
        <StyledContainer>
          <Content>
            <Title>
              <FormattedMessage {...messages.title} />
            </Title>
            <Label>
              <FormattedMessage {...messages.explore} />
            </Label>
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

HeaderExplore.propTypes = {
  onPageLink: PropTypes.func.isRequired,
  currentPath: PropTypes.string,
};

HeaderExplore.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentPath: selectCurrentPathname(state),
});


export function mapDispatchToProps(dispatch) {
  return {
    onPageLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(HeaderExplore);
