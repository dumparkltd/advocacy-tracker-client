import React from 'react';

const PrintContext = React.createContext(null);

const usePrint = () => React.useContext(PrintContext);

export { PrintContext, usePrint };
