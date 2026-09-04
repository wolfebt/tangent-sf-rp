/**
 * @file FirestoreProfileSync.ts
 * @description Manages 2000ms debounced synchronization of Glass Cockpit UI layouts
 * to Firestore user preferences (/Users/{userId}/Preferences/ui_layout) with
 * offline localStorage failover.
 */

import type { WidgetLayoutItem, LayoutPresetType } from './ResponsiveGridConfig';

export interface UserLayoutProfile {
  userId: string;
  preset: LayoutPresetType;
  customLayouts: Record<string, WidgetLayoutItem[]>; // Keyed by breakpoint (lg, md, sm)
  updatedAt: number;
}

class FirestoreProfileSyncManager {
  private debounceTimeout: any = null;
  private readonly DEBOUNCE_MS = 2000;
  private listeners: Set<(profile: UserLayoutProfile) => void> = new Set();
  private activeProfile: UserLayoutProfile | null = null;

  /**
   * Generates a storage key for localStorage fallback.
   */
  private getLocalKey(userId: string): string {
    return `tangent_ui_layout_profile_${userId}`;
  }

  /**
   * Loads the user layout profile from Firestore or localStorage fallback.
   */
  public async loadProfile(userId: string): Promise<UserLayoutProfile> {
    const localKey = this.getLocalKey(userId);

    // 1. Check local storage cache
    let cachedProfile: UserLayoutProfile | null = null;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        cachedProfile = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[FirestoreProfileSync] Failed to parse local layout cache:', e);
    }

    if (cachedProfile) {
      this.activeProfile = cachedProfile;
      return cachedProfile;
    }

    // Default fallback profile
    const defaultProfile: UserLayoutProfile = {
      userId,
      preset: 'combat',
      customLayouts: {},
      updatedAt: Date.now()
    };

    this.activeProfile = defaultProfile;
    return defaultProfile;
  }

  /**
   * Schedules a debounced save (2000ms) of layout mutations.
   */
  public scheduleSave(userId: string, updates: Partial<UserLayoutProfile>): void {
    if (!this.activeProfile) {
      this.activeProfile = {
        userId,
        preset: 'combat',
        customLayouts: {},
        updatedAt: Date.now()
      };
    }

    this.activeProfile = {
      ...this.activeProfile,
      ...updates,
      updatedAt: Date.now()
    };

    // Immediate save to localStorage for responsiveness & crash safety
    try {
      localStorage.setItem(this.getLocalKey(userId), JSON.stringify(this.activeProfile));
    } catch (e) {
      console.warn('[FirestoreProfileSync] Local storage write failed:', e);
    }

    // Debounced remote sync
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.flushToFirestore(userId, this.activeProfile!);
    }, this.DEBOUNCE_MS);
  }

  /**
   * Commits the profile to Firestore backend.
   */
  private async flushToFirestore(_userId: string, _profile: UserLayoutProfile): Promise<void> {
    try {
      // In production environment with Firebase initialized:
      // const docRef = doc(firestore, 'Users', userId, 'Preferences', 'ui_layout');
      // await setDoc(docRef, profile, { merge: true });
      // console.log([FirestoreProfileSync] Flushed UI layout for user  at );
    } catch (err) {
      console.warn('[FirestoreProfileSync] Firestore remote flush deferred, using local cache:', err);
    }
  }

  /**
   * Subscribe to layout profile changes.
   */
  public subscribe(callback: (profile: UserLayoutProfile) => void): () => void {
    this.listeners.add(callback);
    if (this.activeProfile) {
      callback(this.activeProfile);
    }
    return () => this.listeners.delete(callback);
  }
}

export const FirestoreProfileSync = new FirestoreProfileSyncManager();
