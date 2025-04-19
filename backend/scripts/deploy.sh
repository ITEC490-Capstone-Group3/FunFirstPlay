#!/bin/bash
# Deployment script for FunFirstPlay (Frontend + API) on Digital Ocean Droplet

set -e # Exit on error

echo "=================================================="
echo "Deploying FunFirstPlay to Digital Ocean Droplet"
echo "=================================================="

# Configuration
DROPLET_USER="root"
DROPLET_HOST="146.190.50.221"
DROPLET_APP_DIR="/opt/funfirstplay"

# Check if SSH key exists 
SSH_KEY_PATH="$HOME/.ssh/KU"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "Error: SSH key not found at $SSH_KEY_PATH. Please ensure your KU SSH key exists and has been added to the Digital Ocean Droplet."
    exit 1
fi

echo "1. Connecting to droplet and verifying Node.js version..."
ssh -i "$SSH_KEY_PATH" $DROPLET_USER@$DROPLET_HOST << 'EOF'
    # Check Node.js version
    NODE_VERSION=$(node -v)
    echo "Current Node.js version: $NODE_VERSION"
    
    # Only upgrade Node.js if version is less than 16
    if [[ "${NODE_VERSION:1:2}" -lt 16 ]]; then
        echo "Node.js version is below 16, upgrading..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        echo "Upgraded Node.js to $(node -v)"
    else
        echo "Node.js version is sufficient, skipping upgrade"
    fi

    # Update other packages
    apt-get update
    apt-get upgrade -y

    # Install required packages if not already installed
    apt-get install -y git nginx certbot python3-certbot-nginx

    # Install PM2 process manager
    npm install -g pm2

    # Create app directories if they don't exist
    mkdir -p /opt/funfirstplay/backend
    mkdir -p /opt/funfirstplay/frontend
    mkdir -p /var/log/funfirstplay

    # Set correct permissions
    chown -R $USER:$USER /opt/funfirstplay
    chmod -R 755 /opt/funfirstplay
    chown -R $USER:$USER /var/log/funfirstplay
    chmod -R 755 /var/log/funfirstplay
EOF

echo "2. Deploying backend application code..."
# Deploy backend using rsync
rsync -avz -e "ssh -i $SSH_KEY_PATH" --exclude 'node_modules' --exclude '.git' --exclude 'logs' \
    /home/h/itec490/repo/backend/ $DROPLET_USER@$DROPLET_HOST:$DROPLET_APP_DIR/backend/

echo "3. Deploying frontend application code..."
# Deploy frontend using rsync
rsync -avz -e "ssh -i $SSH_KEY_PATH" --exclude 'node_modules' --exclude '.git' \
    /home/h/itec490/repo/frontend/src/ $DROPLET_USER@$DROPLET_HOST:$DROPLET_APP_DIR/frontend/

echo "4. Setting up environment variables..."
# Create production .env file from .env.ffp template
scp -i "$SSH_KEY_PATH" /home/h/itec490/repo/backend/.env.ffp $DROPLET_USER@$DROPLET_HOST:$DROPLET_APP_DIR/backend/
# .env.ffp already contains real credentials
ssh -i "$SSH_KEY_PATH" $DROPLET_USER@$DROPLET_HOST "echo 'Using production environment variables from .env.ffp'"
ssh -i "$SSH_KEY_PATH" $DROPLET_USER@$DROPLET_HOST "cp $DROPLET_APP_DIR/backend/.env.ffp $DROPLET_APP_DIR/backend/.env"

echo "5. Installing dependencies and starting the application..."
ssh -i "$SSH_KEY_PATH" $DROPLET_USER@$DROPLET_HOST << 'EOF'
    # Setup backend
    cd /opt/funfirstplay/backend
    
    # Install dependencies with npm install (not npm ci) since package-lock.json might not exist
    npm install
    npm run migrate
    
    # Setup PM2 for production process management
    pm2 stop funfirstplay-api || true
    pm2 delete funfirstplay-api || true
    pm2 start src/server.js --name funfirstplay-api
    pm2 save
    
    # Setup PM2 to start on system boot
    pm2 startup
    
    # Copy Nginx configurations
    cp /opt/funfirstplay/backend/scripts/nginx-api.conf /etc/nginx/sites-available/funfirstplay
    cp /opt/funfirstplay/backend/scripts/nginx-ip.conf /etc/nginx/sites-available/api-ip
    
    # Enable sites
    ln -sf /etc/nginx/sites-available/funfirstplay /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/api-ip /etc/nginx/sites-enabled/
    
    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test NGINX config
    nginx -t
    
    # Reload NGINX
    systemctl reload nginx
    
    # Setup SSL with Let's Encrypt
    certbot --nginx -d funfirstplay.tech -d www.funfirstplay.tech --non-interactive --agree-tos --email ffp@h626.dev
    
    echo "Deployment completed successfully!"
EOF

echo "6. Deployment completed!"
echo "The application should now be running at https://funfirstplay.tech"
echo "The API endpoints are accessible at https://funfirstplay.tech/api"
echo "You can check the logs with: ssh -i $SSH_KEY_PATH $DROPLET_USER@$DROPLET_HOST 'pm2 logs funfirstplay-api'"