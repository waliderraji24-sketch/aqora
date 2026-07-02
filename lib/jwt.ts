import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'aqora-default-secret';

if (!secret) {
  throw new Error('JWT_SECRET must be defined');
}

export function signToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, secret, { expiresIn: '14d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, secret) as Record<string, unknown>;
  } catch (error) {
    return null;
  }
}
