/**
 * NextAuth exports
 * Central export point for authentication utilities
 */

import NextAuth from 'next-auth';
import { authConfig } from './config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

// Re-export config utilities
export {
  getExecutiveIdFromEmail,
  isAdminEmail,
  getRoleFromEmail,
  getExecutiveInfo,
  isDemoMode,
} from './config';
