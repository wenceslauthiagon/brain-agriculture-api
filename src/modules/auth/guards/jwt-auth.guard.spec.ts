import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('jwt_auth_guard', () => {
  let guard: JwtAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const create_context = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };

    guard = new JwtAuthGuard(reflector as unknown as Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('TC0001 - should allow_access_to_public_route', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = guard.canActivate(create_context());

    expect(result).toBe(true);
  });

  it('TC0002 - should delegate_to_passport_guard_for_protected_routes', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const parent_spy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(create_context());

    expect(parent_spy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('TC0003 - should block_request_without_token', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(
      UnauthorizedException,
    );
  });

  it('TC0004 - should block_request_when_passport_returns_an_error', () => {
    expect(() =>
      guard.handleRequest(new Error('invalid token'), { user: true }),
    ).toThrow(UnauthorizedException);
  });

  it('TC0005 - should return_the_user_when_the_token_is_valid', () => {
    const user = { userId: 'user-1', username: 'admin' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });
});
