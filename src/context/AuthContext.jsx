import { createContext, useEffect, useState } from "react";

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
      return saved
        ? JSON.parse(saved)
        : { isSignedIn: false, role: null, user: null, token: null };
    } catch (error) {
      return { isSignedIn: false, role: null, user: null, token: null };
    }
  });

  useEffect(() => {
    localStorage.setItem("chimera_auth", JSON.stringify(auth));
  }, [auth]);

  const signin = (authData) => {
    setAuth({ isSignedIn: true, ...authData });
  };

  const signout = () => {
    setAuth({ isSignedIn: false, role: null, user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};
