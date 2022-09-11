export const hasNewError = (nextProps, props) => {
  const { viewDomain } = props;
  const { viewDomain: nextViewDomain } = nextProps;
  return (!nextViewDomain || !viewDomain) || (
    !nextViewDomain.getIn(['page', 'submitValid'])
    && !!viewDomain.getIn(['page', 'submitValid'])
  ) || (
    nextViewDomain.getIn(['page', 'saveError'])
    && !viewDomain.getIn(['page', 'saveError'])
  ) || (
    nextViewDomain.getIn(['page', 'deleteError'])
    && !viewDomain.getIn(['page', 'deleteError'])
  );
};
export const hasNewErrorNEW = (nextProps, props) => {
  const { viewDomainPage } = props;
  const nextPage = nextProps.viewDomainPage;
  if (!nextPage || !viewDomainPage) {
    return false;
  }
  return (
    !nextPage.get('submitValid')
    && !!viewDomainPage.get('submitValid')
  ) || (
    nextPage.get('saveError')
    && !viewDomainPage.get('saveError')
  ) || (
    nextPage.get('deleteError')
    && !viewDomainPage.get('deleteError')
  );
};
