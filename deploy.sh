#!/bin/bash

# Comedy Genius Analytics Deployment Script
# Supports both development and production deployments

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
SKIP_DEPS=false
SKIP_BUILD=false
SKIP_MIGRATE=false
SSL_SETUP=false
BACKUP_DB=false
FRONTEND_PORT=5173
BACKEND_PORT=5000

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_help() {
    echo "Comedy Genius Analytics Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --env [development|production]  Set environment (default: development)"
    echo "  --ssl                          Configure SSL certificates"
    echo "  --backup                       Backup database before deployment"
    echo "  --skip-deps                    Skip dependency installation"
    echo "  --skip-build                   Skip frontend build"
    echo "  --skip-migrate                 Skip database migrations"
    echo "  --help                         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh                    # Development deployment"
    echo "  ./deploy.sh --env production   # Production deployment"
    echo "  ./deploy.sh --env production --ssl --backup  # Full production deployment"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --ssl)
            SSL_SETUP=true
            shift
            ;;
        --backup)
            BACKUP_DB=true
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-migrate)
            SKIP_MIGRATE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    exit 1
fi

print_info "Starting deployment for environment: $ENVIRONMENT"

# Check for required commands
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

print_info "Checking required dependencies..."
check_command "node"
check_command "npm"
check_command "git"
check_command "psql"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing globally..."
    npm install -g pm2
fi

# Function to check if PostgreSQL is running
check_postgres() {
    if ! systemctl is-active --quiet postgresql; then
        print_warning "PostgreSQL is not running. Attempting to start..."
        sudo systemctl start postgresql
        sleep 2
    fi
}

# Function to backup database
backup_database() {
    if [ "$BACKUP_DB" = true ]; then
        print_info "Backing up database..."
        
        # Source environment variables
        if [ -f "backend/.env" ]; then
            export $(cat backend/.env | grep -v '^#' | xargs)
        fi
        
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h $DB_HOST $DB_NAME > "$BACKUP_FILE"; then
            print_success "Database backed up to: $BACKUP_FILE"
        else
            print_error "Database backup failed"
            exit 1
        fi
    fi
}

# Function to install dependencies
install_dependencies() {
    if [ "$SKIP_DEPS" = false ]; then
        print_info "Installing dependencies..."
        
        # Install all dependencies
        if npm run install:all; then
            print_success "Dependencies installed successfully"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    else
        print_info "Skipping dependency installation"
    fi
}

# Function to setup environment file
setup_environment() {
    if [ ! -f "backend/.env" ]; then
        if [ -f ".env.example" ]; then
            print_info "Creating .env file from template..."
            cp .env.example backend/.env
            print_warning "Please edit backend/.env with your configuration"
            
            # For development, create a basic working config
            if [ "$ENVIRONMENT" = "development" ]; then
                cat > backend/.env << EOF
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cg_analytics
DB_USER=cg_user
DB_PASSWORD=cg_analytics_password
DB_SSL=false

# Authentication
JWT_SECRET=cg_analytics_jwt_secret_$(date +%s)

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=development

# Admin
ADMIN_EMAIL=admin@comedygenius.tv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password123
EOF
                print_info "Created development .env file"
            fi
        else
            print_error ".env.example not found. Cannot create environment file."
            exit 1
        fi
    fi
}

# Function to setup database
setup_database() {
    if [ "$SKIP_MIGRATE" = false ]; then
        print_info "Setting up database..."
        
        # Source environment variables
        if [ -f "backend/.env" ]; then
            export $(cat backend/.env | grep -v '^#' | xargs)
        fi
        
        # Check if database exists
        if ! PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
            print_info "Creating database..."
            sudo -u postgres createdb $DB_NAME 2>/dev/null || true
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
        fi
        
        # Run migrations
        print_info "Running database migrations..."
        cd backend
        
        # Check if Sequelize CLI is available
        if [ -f "node_modules/.bin/sequelize" ]; then
            npx sequelize-cli db:migrate
        else
            # Fallback to manual sync
            node -e "
                const { sequelize } = require('./models');
                sequelize.sync({ alter: true }).then(() => {
                    console.log('Database synced successfully');
                    process.exit(0);
                }).catch(err => {
                    console.error('Database sync failed:', err);
                    process.exit(1);
                });
            "
        fi
        
        cd ..
        print_success "Database setup completed"
    else
        print_info "Skipping database migrations"
    fi
}

# Function to create admin user
create_admin_user() {
    print_info "Creating admin user..."
    
    cd backend
    
    # Check if create-admin script exists
    if [ -f "scripts/create-admin.js" ]; then
        node scripts/create-admin.js
    else
        # Create inline admin user
        node -e "
            const { User } = require('./models');
            const bcrypt = require('bcryptjs');
            
            async function createAdmin() {
                try {
                    const adminEmail = process.env.ADMIN_EMAIL || 'admin@comedygenius.tv';
                    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
                    
                    // Check if admin exists
                    const existing = await User.findOne({ where: { email: adminEmail } });
                    if (existing) {
                        console.log('Admin user already exists');
                        return;
                    }
                    
                    // Create admin
                    const hashedPassword = await bcrypt.hash(adminPassword, 10);
                    await User.create({
                        username: process.env.ADMIN_USERNAME || 'admin',
                        email: adminEmail,
                        password: hashedPassword,
                        role: 'super_admin',
                        isActive: true
                    });
                    
                    console.log('Admin user created:');
                    console.log('Email:', adminEmail);
                    console.log('Password:', adminPassword);
                } catch (error) {
                    console.error('Error creating admin:', error);
                }
                process.exit(0);
            }
            
            createAdmin();
        "
    fi
    
    cd ..
}

# Function to build frontend
build_frontend() {
    if [ "$SKIP_BUILD" = false ]; then
        print_info "Building frontend..."
        
        if [ "$ENVIRONMENT" = "production" ]; then
            if npm run build; then
                print_success "Frontend built successfully"
            else
                print_error "Frontend build failed"
                exit 1
            fi
        else
            print_info "Skipping frontend build for development environment"
        fi
    else
        print_info "Skipping frontend build"
    fi
}

# Function to setup SSL
setup_ssl() {
    if [ "$SSL_SETUP" = true ] && [ "$ENVIRONMENT" = "production" ]; then
        print_info "Setting up SSL certificates..."
        
        # Check if certbot is installed
        if ! command -v certbot &> /dev/null; then
            print_info "Installing certbot..."
            sudo apt update
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        # Get domain from user
        read -p "Enter your domain name (e.g., comedygenius.tv): " DOMAIN
        
        if [ -n "$DOMAIN" ]; then
            # Obtain certificate
            sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
            print_success "SSL certificate obtained for $DOMAIN"
        else
            print_warning "No domain provided. Skipping SSL setup."
        fi
    fi
}

# Function to configure Nginx
configure_nginx() {
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "Configuring Nginx..."
        
        # Check if Nginx is installed
        if ! command -v nginx &> /dev/null; then
            print_info "Installing Nginx..."
            sudo apt update
            sudo apt install -y nginx
        fi
        
        # Create Nginx configuration
        sudo tee /etc/nginx/sites-available/cg-analytics > /dev/null << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 100M;
    }
}
EOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/cg-analytics /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        
        print_success "Nginx configured successfully"
    fi
}

# Function to start services
start_services() {
    print_info "Starting services..."
    
    # Stop any existing PM2 processes
    pm2 delete all 2>/dev/null || true
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Start production services
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup systemd -u $USER --hp $HOME
        
        print_success "Production services started"
    else
        # Start development services
        print_info "Starting development servers..."
        
        # Start backend
        cd backend
        pm2 start server.js --name "cg-backend-dev" --watch
        cd ..
        
        # Start frontend
        cd frontend
        pm2 start npm --name "cg-frontend-dev" -- run dev
        cd ..
        
        print_success "Development services started"
    fi
    
    # Show status
    pm2 status
}

# Function to run post-deployment checks
post_deployment_checks() {
    print_info "Running post-deployment checks..."
    
    # Check backend health
    sleep 5  # Wait for services to start
    
    if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
        print_success "Backend is running"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check frontend
    if [ "$ENVIRONMENT" = "production" ]; then
        if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
            print_success "Frontend is running"
        else
            print_warning "Frontend health check failed"
        fi
    fi
    
    # Show access URLs
    print_info "Access URLs:"
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "  Application: http://localhost (or your domain)"
    else
        print_info "  Frontend: http://localhost:$FRONTEND_PORT"
        print_info "  Backend API: http://localhost:$BACKEND_PORT"
    fi
    
    print_info "  PM2 Monitor: pm2 monit"
    print_info "  Logs: pm2 logs"
}

# Main deployment flow
main() {
    print_info "Starting Comedy Genius Analytics deployment..."
    
    # Check PostgreSQL
    check_postgres
    
    # Backup database if requested
    backup_database
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Create admin user
    create_admin_user
    
    # Build frontend
    build_frontend
    
    # Configure Nginx (production only)
    configure_nginx
    
    # Setup SSL if requested
    setup_ssl
    
    # Start services
    start_services
    
    # Run post-deployment checks
    post_deployment_checks
    
    print_success "Deployment completed successfully!"
    
    # Show helpful commands
    echo ""
    print_info "Useful commands:"
    echo "  pm2 status          - Check service status"
    echo "  pm2 logs            - View logs"
    echo "  pm2 restart all     - Restart all services"
    echo "  npm run logs        - View application logs"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo ""
        print_warning "Development deployment completed."
        print_warning "Remember to never use development settings in production!"
    fi
}

# Run main function
main