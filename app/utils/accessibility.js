export const setFocusById = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.focus({ focusVisible: true });
    return true;
  }
  // console.log(`Element with ID ${id}, does not exist`);
  return false;
};

export const setFocusByRef = (ref) => ref && ref.current && ref.current.focus({ focusVisible: true });
