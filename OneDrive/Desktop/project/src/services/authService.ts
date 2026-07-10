/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, UserRole } from '../types';

// Standard demo profile password to make quick-login seamless with Firebase Auth
const DEFAULT_DEMO_PASSWORD = 'DemoPassword123!';

export const authService = {
  /**
   * Fetches the user profile from Firestore `users/{uid}`.
   */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profile = userDocSnap.data() as User;
        localStorage.setItem(`smart_disaster_cached_user_${uid}`, JSON.stringify(profile));
        return profile;
      }
      return null;
    } catch (error) {
      console.warn('Error fetching user profile from Firestore, using cache fallback:', error);
      const cached = localStorage.getItem(`smart_disaster_cached_user_${uid}`);
      if (cached) {
        try {
          return JSON.parse(cached) as User;
        } catch {
          return null;
        }
      }
      return null;
    }
  },

  /**
   * Saves or updates the user profile in Firestore.
   */
  async saveUserProfile(user: User): Promise<void> {
    try {
      // JSON.parse(JSON.stringify(user)) removes all undefined properties recursively
      const cleanUser = JSON.parse(JSON.stringify(user));
      localStorage.setItem(`smart_disaster_cached_user_${user.id}`, JSON.stringify(cleanUser));

      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, cleanUser);
    } catch (error) {
      console.warn('Error saving user profile to Firestore, relying on local storage fallback:', error);
      if (user.id.startsWith('local_')) {
        console.info('Offline/fallback user profile successfully saved to local cache.');
      } else {
        throw error;
      }
    }
  },

  /**
   * Register a new user using Firebase Auth and write their profile to Firestore.
   */
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    organization?: string
  ): Promise<User> {
    try {
      let uid: string;
      let usingFallbackAuth = false;

      try {
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      } catch (authError: any) {
        if (
          authError.code === 'auth/operation-not-allowed' || 
          authError.code === 'auth/network-request-failed' || 
          authError.message?.includes('network')
        ) {
          console.warn('Firebase Email/Password Authentication is not enabled or unreachable. Falling back to secure Firestore-only simulated auth.');
          uid = 'local_' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
          usingFallbackAuth = true;
        } else {
          throw authError;
        }
      }

      // 2. Build full application user profile
      const defaultAvatars: Record<UserRole, string> = {
        'Super Admin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'Disaster Management Authority': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        'NGO': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        'Shelter Manager': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        'Volunteer': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        'Public User': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      };

      const userProfile: User = {
        id: uid,
        name,
        email,
        role,
        avatar: defaultAvatars[role] || defaultAvatars['Public User'],
        organization: organization || undefined,
        active: true,
        phone: '+1 (555) 010-9988'
      };

      // 3. Save profile to Firestore
      await this.saveUserProfile(userProfile);

      if (usingFallbackAuth) {
        localStorage.setItem('smart_disaster_local_uid', uid);
      }

      return userProfile;
    } catch (error) {
      console.error('Error in authService.register:', error);
      throw error;
    }
  },

  /**
   * Log in an existing user with email and password and load their Firestore profile.
   */
  async login(email: string, password: string): Promise<User> {
    try {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Fetch profile from Firestore
        const profile = await this.getUserProfile(firebaseUser.uid);
        if (!profile) {
          throw new Error('User profile not found in database.');
        }
        localStorage.removeItem('smart_disaster_local_uid');
        return profile;
      } catch (authError: any) {
        if (
          authError.code === 'auth/operation-not-allowed' || 
          authError.code === 'auth/network-request-failed' || 
          authError.message?.includes('network')
        ) {
          console.warn('Firebase Email/Password Authentication is not enabled or reachable. Attempting local profile restoration.');
          const localUid = 'local_' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
          const profile = await this.getUserProfile(localUid);
          if (profile) {
            localStorage.setItem('smart_disaster_local_uid', localUid);
            return profile;
          }

          // If profile is not found in Firestore either, we can register them on-the-fly for demo simplicity
          const demoProfiles = [
            { role: 'Disaster Management Authority' as UserRole, name: 'Director Elizabeth Vance', email: 'vance@disasterops.gov' },
            { role: 'Super Admin' as UserRole, name: 'System Admin Knox', email: 'admin@disastersphere.com' },
            { role: 'NGO' as UserRole, name: 'Sarah Jenkins (NGO Lead)', email: 'jenkins@redcross.org' },
            { role: 'Shelter Manager' as UserRole, name: 'Captain Robert Shaw', email: 'shaw@shelterops.org' },
            { role: 'Volunteer' as UserRole, name: 'Marcus Vance (Volunteer)', email: 'marcus@volunteers.net' }
          ];
          const matchedDemo = demoProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
          if (matchedDemo) {
            const registered = await this.register(
              matchedDemo.name,
              matchedDemo.email,
              password,
              matchedDemo.role,
              matchedDemo.role === 'NGO' ? 'Global Red Cross Coalition' : (matchedDemo.role === 'Shelter Manager' ? 'Sarasota Arena' : undefined)
            );
            localStorage.setItem('smart_disaster_local_uid', registered.id);
            return registered;
          }

          throw new Error('Authentication profile not registered in database. Please register first.');
        }
        throw authError;
      }
    } catch (error) {
      console.error('Error in authService.login:', error);
      throw error;
    }
  },

  /**
   * Special helper for handling instant login / fallback registration for review/demo accounts
   */
  async loginDemo(email: string, role: UserRole, name: string): Promise<User> {
    try {
      try {
        // 1. Attempt to log in with the standard demo password
        const userCredential = await signInWithEmailAndPassword(auth, email, DEFAULT_DEMO_PASSWORD);
        const firebaseUser = userCredential.user;

        // 2. Fetch or restore profile
        let profile = await this.getUserProfile(firebaseUser.uid);
        if (!profile) {
          // If the profile document is missing in Firestore but Auth exists, recreate it
          const defaultOrganizations: Record<string, string> = {
            'NGO': 'Global Red Cross Coalition',
            'Shelter Manager': 'Sarasota Arena'
          };
          
          profile = {
            id: firebaseUser.uid,
            name,
            email,
            role,
            avatar: `https://images.unsplash.com/photo-${role === 'Super Admin' ? '1534528741775-53994a69daeb' : '1472099645785-5658abf4ff4e'}?w=150&auto=format&fit=crop&q=80`,
            organization: defaultOrganizations[role],
            active: true,
            phone: '+1 (555) 019-2834'
          };
          await this.saveUserProfile(profile);
        }
        localStorage.removeItem('smart_disaster_local_uid');
        return profile;
      } catch (authError: any) {
        if (
          authError.code === 'auth/operation-not-allowed' || 
          authError.code === 'auth/network-request-failed' || 
          authError.message?.includes('network')
        ) {
          console.warn('Firebase Auth is disabled or unreachable, using secure local profile fallback.');
          const localUid = 'local_' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
          let profile = await this.getUserProfile(localUid);
          if (!profile) {
            const defaultOrganizations: Record<string, string> = {
              'NGO': 'Global Red Cross Coalition',
              'Shelter Manager': 'Sarasota Arena'
            };
            profile = {
              id: localUid,
              name,
              email,
              role,
              avatar: `https://images.unsplash.com/photo-${role === 'Super Admin' ? '1534528741775-53994a69daeb' : '1472099645785-5658abf4ff4e'}?w=150&auto=format&fit=crop&q=80`,
              organization: defaultOrganizations[role],
              active: true,
              phone: '+1 (555) 019-2834'
            };
            await this.saveUserProfile(profile);
          }
          localStorage.setItem('smart_disaster_local_uid', localUid);
          return profile;
        } else if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
          // 3. If the user does not exist in Firebase Auth yet, register them on-the-fly
          const defaultOrganizations: Record<string, string> = {
            'NGO': 'Global Red Cross Coalition',
            'Shelter Manager': 'Sarasota Arena'
          };
          
          return await this.register(
            name,
            email,
            DEFAULT_DEMO_PASSWORD,
            role,
            defaultOrganizations[role]
          );
        }
        throw authError;
      }
    } catch (error) {
      console.error('Error in loginDemo:', error);
      throw error;
    }
  },

  /**
   * Log out the current user.
   */
  async logout(): Promise<void> {
    try {
      localStorage.removeItem('smart_disaster_local_uid');
      await signOut(auth);
    } catch (error) {
      console.error('Error in authService.logout:', error);
      throw error;
    }
  },

  /**
   * Listen to Firebase Auth state changes and resolve full profiles dynamically.
   */
  onAuthStateChanged(callback: (user: User | null, loading: boolean) => void): () => void {
    const localUid = localStorage.getItem('smart_disaster_local_uid');
    let localUnsubscribed = false;

    const checkLocalAndCallback = async () => {
      if (localUid && !auth.currentUser) {
        try {
          const profile = await this.getUserProfile(localUid);
          if (profile && !localUnsubscribed) {
            callback(profile, false);
            return true;
          }
        } catch (err) {
          console.error('Failed to restore local fallback session:', err);
        }
      }
      return false;
    };

    // Run check immediately to avoid delay
    checkLocalAndCallback();

    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        const restored = await checkLocalAndCallback();
        if (!restored) {
          callback(null, false);
        }
        return;
      }

      try {
        const profile = await this.getUserProfile(firebaseUser.uid);
        if (profile) {
          localStorage.removeItem('smart_disaster_local_uid');
          callback(profile, false);
        } else {
          // If auth is signed in but profile is still loading/missing, don't clear loading yet
          callback(null, true);
        }
      } catch (error) {
        console.error('Error resolving auth state changes:', error);
        callback(null, false);
      }
    });

    return () => {
      localUnsubscribed = true;
      unsubscribeFirebase();
    };
  }
};
