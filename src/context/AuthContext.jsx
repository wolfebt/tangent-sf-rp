import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout } from '../firebase';
import { SystemBootSplash } from '../components/UI/SystemBootSplash';
import { TerranNetAuthModal } from '../components/UI/TerranNetAuthModal';
import { OperatorHandlePromptModal } from '../components/UI/OperatorHandlePromptModal';
import { generateTempHandle, isTemporaryHandle, getEffectiveUserHandle } from '../utils/personaValidationUtils';
import { useConfirm } from './ConfirmContext';

const AuthContext = globalThis.__TANGENT_AUTH_CONTEXT__ || (globalThis.__TANGENT_AUTH_CONTEXT__ = createContext({}));

export const useAuth = () => useContext(AuthContext) || {};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
  const [userHandle, setUserHandle] = useState(localStorage.getItem('userHandle') || '');
  const [emailOptIn, setEmailOptIn] = useState(() => {
    const stored = localStorage.getItem('emailOptIn');
    return stored !== null ? stored === 'true' : null;
  });
  const [customClaims, setCustomClaims] = useState({});
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  // Default to true so Key Developer has complete master access by default at this stage
  const [adminOverride, setAdminOverride] = useState(localStorage.getItem('omnicortex_admin_override') !== 'false');

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const openHandleModal = useCallback(() => setIsHandleModalOpen(true), []);
  const closeHandleModal = useCallback(() => setIsHandleModalOpen(false), []);
  const triggerBootSplash = useCallback(() => setShowSplash(true), []);

  const refreshUserHandle = useCallback(() => {
    setUserHandle(localStorage.getItem('userHandle') || '');
  }, []);

  const toggleAdminOverride = useCallback(() => {
    setAdminOverride(prev => {
      const nextState = !prev;
      localStorage.setItem('omnicortex_admin_override', nextState ? 'true' : 'false');
      return nextState;
    });
  }, []);

  useEffect(() => {
    let userUnsub = null;
    let privateUnsub = null;

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
      if (privateUnsub) {
        privateUnsub();
        privateUnsub = null;
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
          const privateDocRef = doc(db, 'users', user.uid, 'private_settings', 'config');

          privateUnsub = onSnapshot(privateDocRef, (privSnap) => {
            if (privSnap.exists()) {
              const pData = privSnap.data();
              if (pData.emailOptIn !== undefined) {
                setEmailOptIn(Boolean(pData.emailOptIn));
                localStorage.setItem('emailOptIn', String(pData.emailOptIn));
              }
              if (pData.userContactInfo !== undefined) localStorage.setItem('userContactInfo', pData.userContactInfo);
              if (pData.geminiApiKey !== undefined) localStorage.setItem('geminiApiKey', pData.geminiApiKey);
              if (pData.aiPlatform !== undefined) localStorage.setItem('aiPlatform', pData.aiPlatform);
              if (pData.otherAiApiKey !== undefined) localStorage.setItem('otherAiApiKey', pData.otherAiApiKey);
              if (pData.customEndpoint !== undefined) localStorage.setItem('customEndpoint', pData.customEndpoint);
            }
          }, () => {});

          userUnsub = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const hasSetHandle = data.handleSet === true;

              if (data.userHandle && !data.userHandle.includes('@')) {
                localStorage.setItem('userHandle', data.userHandle);
                setUserHandle(data.userHandle);
              } else {
                // Operator without a current handle is assigned a random 8-digit alphanumeric string as a temporary handle
                const tempHandle = generateTempHandle(user.uid);
                setUserHandle(tempHandle);
                localStorage.setItem('userHandle', tempHandle);
                setDoc(userDocRef, { 
                  userHandle: tempHandle,
                  displayName: tempHandle,
                  isTempHandle: true,
                  handleSet: false
                }, { merge: true }).catch(() => {});
              }

              // Prompt for a handle if it has not been set yet, or if it is currently a temporary handle
              if (!hasSetHandle && (!data.userHandle || isTemporaryHandle(data.userHandle) || data.isTempHandle)) {
                setIsHandleModalOpen(true);
              }
            } else {
              // First time registration: Assign a random 8-digit alphanumeric string as temporary handle
              const tempHandle = generateTempHandle(user.uid);
              setUserHandle(tempHandle);
              localStorage.setItem('userHandle', tempHandle);
              localStorage.setItem('handleSet', 'false');

              // Register user in 'users' collection with public-only roster fields
              setDoc(userDocRef, {
                uid: user.uid,
                displayName: tempHandle,
                userHandle: tempHandle,
                isTempHandle: true,
                handleSet: false,
                photoURL: user.photoURL || null,
                status: 'online',
                presenceState: 'online',
                lastSeen: serverTimestamp(),
                lastSeenLocal: new Date().toISOString(),
                createdAt: serverTimestamp()
              }, { merge: true }).catch(() => {});

              // Store confidential account email & opt-in in owner-only private_settings/config subcollection
              setDoc(privateDocRef, {
                email: user.email || '',
                emailOptIn: true,
                updatedAt: new Date().toISOString()
              }, { merge: true }).catch(() => {});

              // Prompt for a handle and email list opt-in on first login
              setIsHandleModalOpen(true);
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
      if (privateUnsub) privateUnsub();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshUserHandle]);

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

  const isAuthorizedEmail = Boolean(currentUser?.email && currentUser.email.toLowerCase() === 'btw.284@gmail.com');
  const hasCloudAdminAccess = hasAdminClaim || isAuthorizedEmail;
  const isAdmin = hasAdminClaim || adminOverride || isAuthorizedEmail;
  const isGM = isAdmin || customClaims.role === 'GM';
  const userRole = (hasAdminClaim || isAuthorizedEmail)
    ? (customClaims.role || 'Architect')
    : (adminOverride ? 'Architect' : 'Operator');

  // Always use handles for operators, never expose email
  const displayIdentity = userHandle ? `@${userHandle}` : `@${getEffectiveUserHandle(currentUser)}`;

  const confirm = useConfirm();

  const confirmLogout = useCallback(async (navigate) => {
    const confirmed = await confirm({
      title: 'Log Out',
      message: 'Are you sure you want to disconnect from Terran Data Net and log out?',
      confirmLabel: 'Log Out',
      danger: false,
    });
    if (confirmed) {
      await logout();
      if (navigate) {
        navigate('/');
      }
    }
  }, [confirm]);

  const value = useMemo(() => ({
    currentUser,
    userHandle,
    displayIdentity,
    emailOptIn,
    isAdmin,
    isGM,
    userRole,
    hasAdminClaim,
    hasCloudAdminAccess,
    isAuthorizedEmail,
    adminOverride,
    toggleAdminOverride,
    refreshUserHandle,
    loginWithGoogle,
    logout,
    confirmLogout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    isHandleModalOpen,
    openHandleModal,
    closeHandleModal,
    triggerBootSplash
  }), [
    currentUser,
    userHandle,
    displayIdentity,
    emailOptIn,
    isAdmin,
    isGM,
    userRole,
    hasAdminClaim,
    hasCloudAdminAccess,
    isAuthorizedEmail,
    adminOverride,
    toggleAdminOverride,
    refreshUserHandle,
    confirmLogout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    isHandleModalOpen,
    openHandleModal,
    closeHandleModal,
    triggerBootSplash
  ]);

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
      <OperatorHandlePromptModal
        isOpen={isHandleModalOpen}
        onClose={closeHandleModal}
        currentUser={currentUser}
        currentHandle={userHandle}
        currentEmailOptIn={emailOptIn}
        onSaveSuccess={({ handle: newHandle, emailOptIn: newOptIn }) => {
          setUserHandle(newHandle);
          setEmailOptIn(newOptIn);
        }}
      />
    </AuthContext.Provider>
  );
};
