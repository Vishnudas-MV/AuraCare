import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { LoginInput, RefreshTokenInput, MfaVerifyInput } from './auth.schemas';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const tenantId = req.tenant?.tenantId || input.tenantId;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TENANT_REQUIRED',
            message: 'Tenant ID must be specified via x-tenant-id header or in login payload',
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
        return;
      }

      const result = await authService.login(input, tenantId);

      res.status(200).json({
        success: true,
        message: result.requiresMfa ? 'MFA verification required' : 'Authentication successful',
        data: result,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: errorMsg,
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const tokens = await authService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: tokens,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh token';
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: errorMsg,
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1] || '';
      const sessionId = req.user?.sessionId;

      await authService.logout(token, sessionId);

      res.status(200).json({
        success: true,
        message: 'Successfully logged out',
      });
    } catch (err) {
      next(err);
    }
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        tenant: req.tenant,
      },
    });
  }
}

export const authController = new AuthController();
