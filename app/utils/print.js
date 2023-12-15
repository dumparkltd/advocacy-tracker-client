export const keydownHandlerPrint = (e, callback) => {
  // Watch for `metaKey` too (⌘ in Mac)
  if (window.print && callback && (e.ctrlKey || e.metaKey) && e.keyCode === 80) {
    e.preventDefault();
    e.stopImmediatePropagation();
    callback();
  }
};
