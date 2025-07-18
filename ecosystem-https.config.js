module.exports = {
  apps: [{
    name: 'cg-analytics-https',
    script: '/home/ec2-user/CG-Analytics2/backend/server-https.js',
    cwd: '/home/ec2-user/CG-Analytics2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      HTTP_PORT: 80,
      HTTPS_PORT: 443
    },
    error_file: './logs/https-error.log',
    out_file: './logs/https-out.log',
    log_file: './logs/https-combined.log',
    time: true
  }]
}