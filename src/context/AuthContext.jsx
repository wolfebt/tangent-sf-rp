import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openHandleModal = () => setIsHandleModalOpen(true);
  const closeHandleModal = () => setIsHandleModalOpen(false);
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

              if (data.emailOptIn !== undefined) {
                setEmailOptIn(Boolean(data.emailOptIn));
                localStorage.setItem('emailOptIn', String(data.emailOptIn));
              }

              // Prompt for a handle if it has not been set yet, or if it is currently a temporary handle
              if (!hasSetHandle && (!data.userHandle || isTemporaryHandle(data.userHandle) || data.isTempHandle)) {
                setIsHandleModalOpen(true);
              }

              if (data.userContactInfo !== undefined) localStorage.setItem('userContactInfo', data.userContactInfo);
              if (data.geminiApiKey !== undefined) localStorage.setItem('geminiApiKey', data.geminiApiKey);
              if (data.aiPlatform !== undefined) localStorage.setItem('aiPlatform', data.aiPlatform);
              if (data.otherAiApiKey !== undefined) localStorage.setItem('otherAiApiKey', data.otherAiApiKey);
            } else {
              // First time registration: Assign a random 8-digit alphanumeric string as temporary handle
              const tempHandle = generateTempHandle(user.uid);
              setUserHandle(tempHandle);
              localStorage.setItem('userHandle', tempHandle);
              localStorage.setItem('handleSet', 'false');

              // Register user in 'users' collection so they appear on the network roster immediately
              setDoc(userDocRef, {
                uid: user.uid,
                displayName: tempHandle,
                userHandle: tempHandle,
                isTempHandle: true,
                handleSet: false,
                email: user.email || '', // Backend purpose only: actual ID, firebase login, platform emails
                emailOptIn: true,
                photoURL: user.photoURL || null,
                status: 'online',
                presenceState: 'online',
                lastSeen: serverTimestamp(),
                lastSeenLocal: new Date().toISOString(),
                createdAt: serverTimestamp()
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

  const confirmLogout = async (navigate) => {
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
  };

  const value = {
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
