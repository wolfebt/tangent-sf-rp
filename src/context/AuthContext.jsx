import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userHandle, setUserHandle] = useState(localStorage.getItem('userHandle') || '');

  const refreshUserHandle = () => {
    setUserHandle(localStorage.getItem('userHandle') || '');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    const handleStorageChange = () => {
      refreshUserHandle();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const displayIdentity = userHandle || (currentUser ? (currentUser.displayName || currentUser.email) : '');

  const confirmLogout = async (navigate) => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      await logout();
      if (navigate) {
        navigate('/');
      }
    }
  };

  const value = {
    currentUser,
    userHandle,
    displayIdentity,
    refreshUserHandle,
    loginWithGoogle,
    logout,
    confirmLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
