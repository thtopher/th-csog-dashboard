import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      executiveId?: string;
      title?: string;
      image?: string;
    };
  }

  interface User {
    role?: string;
    executiveId?: string;
    title?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    executiveId?: string;
    title?: string;
  }
}
