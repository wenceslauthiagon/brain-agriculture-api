import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const createContext = (): ExecutionContext =>
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

  it('TC0001 - Should allow access to @Public route', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = guard.canActivate(createContext());

    expect(result).toBe(true);
  });

  it('TC0002 - Should delegate to passport guard for protected routes', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const parentSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(createContext());

    expect(parentSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('TC0003 - Should block request without token', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(
      UnauthorizedException,
    );
  });
});
