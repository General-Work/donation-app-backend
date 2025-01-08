import { Request } from 'express';
import { User_Role } from './lib/constants';

declare global {
  namespace Express {
    interface Request {
      userDetails?: {
        user: string;
        username: string;
        name: string;
        id: string;
        active: boolean;
        tenantId?: string;
        role: User_Role;
      };
    }
  }
}
