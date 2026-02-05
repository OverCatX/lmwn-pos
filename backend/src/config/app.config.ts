import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
    return {
        port: parseInt(process.env.PORT || '3000', 10),
        env: process.env.NODE_ENV || 'development',
        apiPrefix: process.env.API_PREFIX || 'api',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    };
});
