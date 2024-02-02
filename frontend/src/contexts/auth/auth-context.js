import { createContext } from 'react';

export const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

export const AuthContext = createContext({
  ...initialState,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  verify: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  changePassword: () => Promise.resolve(),
  updateUser: () => Promise.resolve(),
  setUser: () => {},
});
