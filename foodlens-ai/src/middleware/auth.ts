import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Support local dev requests or Demo Session token seamlessly
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = {
      uid: 'demo-user-foodlens-ai',
      email: 'demo@foodlens.ai',
      name: 'Aarav Sharma (Local Profile)',
    } as unknown as DecodedIdToken;
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token || token === 'DEMO_MODE_SESSION_TOKEN' || token === 'null' || token === 'undefined') {
    req.user = {
      uid: 'demo-user-foodlens-ai',
      email: 'demo@foodlens.ai',
      name: 'Aarav Sharma (Demo Profile)',
    } as unknown as DecodedIdToken;
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.warn('Token verification fallback to local demo profile:', error);
    req.user = {
      uid: 'demo-user-foodlens-ai',
      email: 'demo@foodlens.ai',
      name: 'Aarav Sharma (Local Profile)',
    } as unknown as DecodedIdToken;
    next();
  }
};
