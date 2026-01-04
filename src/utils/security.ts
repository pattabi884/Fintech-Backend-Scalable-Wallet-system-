import crypto from 'crypto';

export const generateHmac = (payload: any, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

export const verifyHmac = (payload: any, signature: string, secret: string): boolean => {
  const expected = generateHmac(payload, secret);
  return expected === signature;
};