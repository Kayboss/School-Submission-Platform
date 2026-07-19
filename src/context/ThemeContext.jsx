import React, { createContext, useContext } from 'react';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '../styles/themeTokens';

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={themeTokens}>
      <ThemeProvider theme={themeTokens}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeContextProvider');
  }
  return context;
};
