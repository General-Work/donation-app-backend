import * as bcryt from 'bcrypt';
import * as dayjs from 'dayjs';
import { Request } from 'express';

const phoneNumberConfig = {
  airtelTigo: { code: 'ATL', prefix: ['026', '027', '056', '057'] },
  mtn: { code: 'MTN', prefix: ['025', '024', '053', '054', '055', '059'] },
  vodafone: { code: 'VOD', prefix: ['020', '050'] },
};

export function generateDefaultPassword(): string {
  const length = 8;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let defaultPassword = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    defaultPassword += charset.charAt(randomIndex);
  }

  return defaultPassword;
}

export function encodedPassword(rawPassword: string) {
  const SALT = bcryt.genSaltSync();
  return bcryt.hashSync(rawPassword, SALT);
}

export function comparePasswords(rawPassword: string, hash: string) {
  return bcryt.compareSync(rawPassword, hash);
}

function convertObjectToQueryString(
  obj: Record<string, any>,
  deletePage?: boolean,
): string {
  if (deletePage) {
    delete obj.page;
    delete obj.pageSize;
  }

  const queryStringParams: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      queryStringParams.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`,
      );
    }
  }
  return queryStringParams.join('&');
}

export function getPaginationParams(req: Request) {
  const routeName = `${req.protocol}://${req.get('host')}${req.path}`;
  const path = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const query = req.query ? convertObjectToQueryString(req.query, true) : null;

  return {
    routeName,
    path,
    query,
  };
}

export function extractColumnAndDirection(enumValue: string): {
  column: string;
  direction: string;
} {
  const [column, direction] = enumValue.split('_');

  if (direction !== 'asc' && direction !== 'desc') {
    throw new Error('Invalid sort direction');
  }

  return { column, direction: direction.toUpperCase() };
}

export function getProviderCode(phoneNumber: string) {
  const prefix = phoneNumber.substring(0, 3);
  for (const provider in phoneNumberConfig) {
    if (phoneNumberConfig[provider].prefix.includes(prefix)) {
      return phoneNumberConfig[provider].code;
    }
  }
  return null;
}
