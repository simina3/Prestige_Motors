// This defines multiple REST API endpoints for authentication:
//  GET/POST T /api/auth/callback/:provider
//  POST /api/auth/signout
//  GET /api/auth/csrf
// ... more

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };