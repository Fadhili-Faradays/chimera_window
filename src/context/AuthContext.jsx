import { createContext, useEffect, useState, useCallback } from "react";
import apiClient, { registerUnauthorizedHandler, setAuthToken } from "../apiClient";

export const AuthContext = createContext({
  auth: {
    isSignedIn: false,
    role: null,
    user: null,
    token: null,
  },
  signin: () => {},
  signout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem("chimera_auth");
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && parsed.token && parsed.role && parsed.user) {
        return parsed;
      }
      return { isSignedIn: false, role: null, user: null, token: null };
    } catch (error) {
      return { isSignedIn: false, role: null, user: null, token: null };
    }
  });

  useEffect(() => {
    if (auth.token) {
      setAuthToken(auth.token);
    } else {
      setAuthToken(null);
    }
    localStorage.setItem("chimera_auth", JSON.stringify(auth));
  }, [auth]);

  const signout = useCallback(() => {
    setAuth({ isSignedIn: false, role: null, user: null, token: null });
    setAuthToken(null);
    localStorage.removeItem("chimera_auth");
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      signout();
    });
  }, [signout]);

  const signin = (authData) => {
    setAuth({ isSignedIn: true, ...authData });
  };

  return (
    <AuthContext.Provider value={{ auth, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};
