import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { SetMetadata } from '@nestjs/common';
import { User_Role } from 'src/lib/constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: User_Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<User_Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No specific roles are required, so allow the request
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.userDetails;

    // console.log(user)

    // Check if user role matches one of the required roles
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission (role) to access this resource',
      );
    }

    return true;
  }
}
