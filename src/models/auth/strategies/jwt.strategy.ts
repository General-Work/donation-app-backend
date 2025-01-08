import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: any) {
    // console.log(payload)
    return {
      user: payload.sub,
      username: payload.username,
      id: payload.id,
      tenantId: payload?.tenantId,
      role: payload?.role,
      name: payload?.name,
      active: payload?.active,
      // staffDbId: payload.staffDbId,
    };
  }
}
