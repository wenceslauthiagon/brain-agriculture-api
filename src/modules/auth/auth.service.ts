import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { AuthTokenPayload } from './interfaces/auth-token-payload.interface';

export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const expectedUsername = this.configService.get<string>('AUTH_USERNAME');
    const passwordHash = this.configService.get<string>('AUTH_PASSWORD_HASH');

    if (!expectedUsername || !passwordHash) {
      throw new UnauthorizedException();
    }

    if (dto.username !== expectedUsername) {
      throw new UnauthorizedException();
    }

    const passwordMatches = await compare(dto.password, passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const payload: AuthTokenPayload = {
      sub: expectedUsername,
      username: expectedUsername,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
    };
  }
}
