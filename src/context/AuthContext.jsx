import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userHandle, setUserHandle] = useState(localStorage.getItem('userHandle') || '');
  const [customClaims, setCustomClaims] = useState({});
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  const [adminOverride, setAdminOverride] = useState(localStorage.getItem('omnicortex_admin_override') === 'true');

  const refreshUserHandle = () => {
    setUserHandle(localStorage.getItem('userHandle') || '');
  };

  const toggleAdminOverride = () => {
    const nextState = !adminOverride;
    setAdminOverride(nextState);
    localStorage.setItem('omnicortex_admin_override', nextState ? 'true' : 'false');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          const claims = tokenResult.claims || {};
          setCustomClaims(claims);
          const isClaimAdmin = !!(claims.admin || claims.role === 'admin' || claims.role === 'GM');
          setHasAdminClaim(isClaimAdmin);
        } catch (err) {
          console.error("Error retrieving user token claims:", err);
          setCustomClaims({});
          setHasAdminClaim(false);
        }
      } else {
        setCustomClaims({});
        setHasAdminClaim(false);
      }
      setLoading(false);
    });

    const handleStorageChange = () => {
      refreshUserHandle();
      setAdminOverride(localStorage.getItem('omnicortex_admin_override') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isAdmin = hasAdminClaim || adminOverride;
  const isGM = isAdmin || customClaims.role === 'GM';
  const userRole = isAdmin
    ? (hasAdminClaim ? (customClaims.role || 'Admin') : 'Admin (Dev Override)')
    : 'Player';

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
    isAdmin,
    isGM,
    userRole,
    hasAdminClaim,
    adminOverride,
    toggleAdminOverride,
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

