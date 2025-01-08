import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: any) {
    return {
      user: payload.sub,
      username: payload.username,
      id: payload.id,
      tenantId: payload?.tenantId,
      role: payload?.role,
      name: payload?.name,
      active: payload?.active,
    };
  }
}
