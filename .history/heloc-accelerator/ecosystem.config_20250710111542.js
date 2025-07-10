module.exports = {
  apps: [{
    name: 'heloc-accelerator',
    script: 'npm',
    args: 'start',
    cwd: '/opt/heloc-accelerator/app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: '/opt/heloc-accelerator/logs/app.log',
    out_file: '/opt/heloc-accelerator/logs/app.log',
    error_file: '/opt/heloc-accelerator/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Process management
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    max_memory_restart: '1G',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Auto restart settings
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};
