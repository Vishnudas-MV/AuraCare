import { Router } from 'express';
import { authController } from './auth.controller';
import { validateZod } from '../../middlewares/validateZod.middleware';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { createRateLimiter } from '../../middlewares/rateLimiter.middleware';
import { loginSchema, refreshTokenSchema } from './auth.schemas';

const router = Router();

// Dedicated stricter rate limiter for authentication endpoints to prevent brute force
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
});

router.post('/login', authLimiter, validateZod(loginSchema), authController.login);
router.post('/refresh', validateZod(refreshTokenSchema), authController.refresh);
router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.getCurrentUser);

export default router;
