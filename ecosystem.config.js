module.exports = {
  apps: [
    {
      name: 'cg-analytics-backend',
      script: './backend/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DB_NAME: 'cg_analytics',
        DB_USER: 'cg_user',
        DB_PASSWORD: 'SecurePass123',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        JWT_SECRET: 'cg_analytics_jwt_secret_2025_production_key'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    }
  ]
};