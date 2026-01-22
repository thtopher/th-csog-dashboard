/**
 * NextAuth Configuration
 * Configures Microsoft Entra ID (Azure AD) authentication
 */

import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Credentials from 'next-auth/providers/credentials';
import { DEFAULT_EXECUTIVES } from '@/config/executives';

// Map email domains/addresses to executive IDs
const EMAIL_TO_EXECUTIVE: Record<string, string> = {
  'david@thirdhorizon.com': 'exec-ceo',
  'greg@thirdhorizon.com': 'exec-president',
  'jordana@thirdhorizon.com': 'exec-coo',
  'aisha@thirdhorizon.com': 'exec-cfo',
  'chris@thirdhorizon.com': 'exec-cdao',
  'cheryl@thirdhorizon.com': 'exec-cgo',
  'ashley@thirdhorizon.com': 'exec-cso',
};

// Admin emails (non-executive admins)
const ADMIN_EMAILS = ['topher@thirdhorizon.com'];

// Demo users for development mode
const DEMO_USERS: Record<string, { name: string; role: string; executiveId?: string; title?: string }> = {
  'david@thirdhorizon.com': { name: 'David Smith', role: 'admin', executiveId: 'exec-ceo', title: 'CEO' },
  'greg@thirdhorizon.com': { name: 'Greg Williams', role: 'csog_member', executiveId: 'exec-president', title: 'President' },
  'jordana@thirdhorizon.com': { name: 'Jordana Choucair', role: 'csog_member', executiveId: 'exec-coo', title: 'COO' },
  'aisha@thirdhorizon.com': { name: 'Aisha Waheed', role: 'csog_member', executiveId: 'exec-cfo', title: 'CFO' },
  'chris@thirdhorizon.com': { name: 'Chris Hart', role: 'csog_member', executiveId: 'exec-cdao', title: 'CDAO' },
  'cheryl@thirdhorizon.com': { name: 'Cheryl Matochik', role: 'csog_member', executiveId: 'exec-cgo', title: 'CGO' },
  'ashley@thirdhorizon.com': { name: 'Ashley DeGarmo', role: 'csog_member', executiveId: 'exec-cso', title: 'CSO' },
  'topher@thirdhorizon.com': { name: 'Topher Rasmussen', role: 'admin', title: 'System Administrator' },
  'demo@thirdhorizon.com': { name: 'Demo User', role: 'staff' },
};

/**
 * Map user email to executive ID
 */
export function getExecutiveIdFromEmail(email: string): string | undefined {
  const normalizedEmail = email.toLowerCase().trim();
  return EMAIL_TO_EXECUTIVE[normalizedEmail];
}

/**
 * Check if email belongs to an admin
 */
export function isAdminEmail(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  // CEO is also admin
  if (EMAIL_TO_EXECUTIVE[normalizedEmail] === 'exec-ceo') return true;
  return ADMIN_EMAILS.includes(normalizedEmail);
}

/**
 * Get user role from email
 */
export function getRoleFromEmail(email: string): 'admin' | 'csog_member' | 'staff' {
  const normalizedEmail = email.toLowerCase().trim();
  if (isAdminEmail(normalizedEmail)) return 'admin';
  if (EMAIL_TO_EXECUTIVE[normalizedEmail]) return 'csog_member';
  return 'staff';
}

/**
 * Get executive info from ID
 */
export function getExecutiveInfo(executiveId: string) {
  return DEFAULT_EXECUTIVES.find(exec => exec.id === executiveId);
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.AZURE_AD_CLIENT_ID;
}

/**
 * NextAuth configuration
 */
export const authConfig: NextAuthConfig = {
  providers: [
    // Microsoft Entra ID (Azure AD) for production SSO
    ...(process.env.AZURE_AD_CLIENT_ID ? [
      MicrosoftEntraID({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        // Tenant ID is embedded in the issuer URL
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
        authorization: {
          params: {
            scope: 'openid profile email User.Read',
          },
        },
      }),
    ] : []),

    // Credentials provider for demo mode
    Credentials({
      id: 'demo-login',
      name: 'Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Demo mode: accept any known email with password "demo"
        if (password !== 'demo') return null;

        const demoUser = DEMO_USERS[email];
        if (!demoUser) return null;

        return {
          id: `demo-${email.split('@')[0]}`,
          email,
          name: demoUser.name,
          role: demoUser.role,
          executiveId: demoUser.executiveId,
          title: demoUser.title,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;

        // For Microsoft SSO, derive role from email
        if (account?.provider === 'microsoft-entra-id') {
          const email = user.email || '';
          token.role = getRoleFromEmail(email);
          const executiveId = getExecutiveIdFromEmail(email);
          token.executiveId = executiveId;
          const execInfo = executiveId ? getExecutiveInfo(executiveId) : undefined;
          token.title = execInfo?.title;
        } else {
          // For demo login, use values from user object
          token.role = (user as { role?: string }).role || 'staff';
          token.executiveId = (user as { executiveId?: string }).executiveId;
          token.title = (user as { title?: string }).title;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.executiveId = token.executiveId as string | undefined;
        session.user.title = token.title as string | undefined;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Only allow Third Horizon email domain
      const email = user.email?.toLowerCase() || '';

      // In production, restrict to @thirdhorizon.com
      if (account?.provider === 'microsoft-entra-id') {
        if (!email.endsWith('@thirdhorizon.com')) {
          return false;
        }
      }

      return true;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  debug: process.env.NODE_ENV === 'development',
};

