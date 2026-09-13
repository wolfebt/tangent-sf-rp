import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout } from '../firebase';
import { SystemBootSplash } from '../components/UI/SystemBootSplash';
import { TerranNetAuthModal } from '../components/UI/TerranNetAuthModal';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userHandle, setUserHandle] = useState(localStorage.getItem('userHandle') || '');
  const [customClaims, setCustomClaims] = useState({});
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  // Default to true so Key Developer has complete master access by default at this stage
  const [adminOverride, setAdminOverride] = useState(localStorage.getItem('omnicortex_admin_override') !== 'false');

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const triggerBootSplash = () => setShowSplash(true);

  const refreshUserHandle = () => {
    setUserHandle(localStorage.getItem('userHandle') || '');
  };

  const toggleAdminOverride = () => {
    const nextState = !adminOverride;
    setAdminOverride(nextState);
    localStorage.setItem('omnicortex_admin_override', nextState ? 'true' : 'false');
  };

  useEffect(() => {
    let userUnsub = null;

    // Safety watchdog: ensure auth resolution never hangs beyond 4.5s
    const watchdogTimer = setTimeout(() => {
      setLoading(false);
    }, 4500);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(watchdogTimer);
      setCurrentUser(user);
      if (userUnsub) {
        userUnsub();
        userUnsub = null;
      }

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

        try {
          const userDocRef = doc(db, 'users', user.uid);
          userUnsub = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.userHandle) {
                localStorage.setItem('userHandle', data.userHandle);
                setUserHandle(data.userHandle);
              }
              if (data.userContactInfo !== undefined) localStorage.setItem('userContactInfo', data.userContactInfo);
              if (data.geminiApiKey !== undefined) localStorage.setItem('geminiApiKey', data.geminiApiKey);
              if (data.aiPlatform !== undefined) localStorage.setItem('aiPlatform', data.aiPlatform);
              if (data.otherAiApiKey !== undefined) localStorage.setItem('otherAiApiKey', data.otherAiApiKey);
            }
          }, (err) => {
            console.warn("Error fetching user profile settings from Firestore:", err);
          });
        } catch (err) {
          console.warn("Failed to attach Firestore user settings listener:", err);
        }
      } else {
        setCustomClaims({});
        setHasAdminClaim(false);
      }
      setLoading(false);
    });

    const handleStorageChange = () => {
      refreshUserHandle();
      setAdminOverride(localStorage.getItem('omnicortex_admin_override') !== 'false');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(watchdogTimer);
      unsubscribe();
      if (userUnsub) userUnsub();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setLoading(false);
    // On first launch if unauthenticated, prompt with the themed Terran Data Net gateway
    const guestDismissed = localStorage.getItem('terran_net_guest_dismissed');
    const storedHandle = localStorage.getItem('userHandle');
    if (!auth.currentUser && !guestDismissed && !storedHandle) {
      setIsAuthModalOpen(true);
    }
  };

  const isAdmin = hasAdminClaim || adminOverride;
  const isGM = isAdmin || customClaims.role === 'GM';
  const userRole = isAdmin
    ? (hasAdminClaim ? (customClaims.role || 'Architect') : 'Architect')
    : 'Operator';

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
    confirmLogout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    triggerBootSplash
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showSplash && (
        <SystemBootSplash onComplete={handleSplashComplete} />
      )}
      <TerranNetAuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </AuthContext.Provider>
  );
};

