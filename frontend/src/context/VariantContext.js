import React, { createContext, useContext, useMemo } from 'react';

const VariantContext = createContext({ variant: 'consumer', isEnterprise: false, isConsumer: true });

export const useVariant = () => useContext(VariantContext);

export const VariantProvider = ({ children }) => {
  const variant = process.env.REACT_APP_VARIANT === 'enterprise' ? 'enterprise' : 'consumer';
  const value = useMemo(() => ({
    variant,
    isEnterprise: variant === 'enterprise',
    isConsumer: variant !== 'enterprise'
  }), [variant]);

  return (
    <VariantContext.Provider value={value}>{children}</VariantContext.Provider>
  );
};

