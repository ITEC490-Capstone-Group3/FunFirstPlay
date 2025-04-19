# FunFirstPlay Backend

This is the backend API for the FunFirstPlay web application.

## Technology Stack

- Node.js
- Express.js
- PostgreSQL (Hosted on Digital Ocean)
- Nginx (Reverse Proxy)
- PM2 (Process Management)

## Production Deployment

The entire application (both frontend and backend API) is hosted on a single Digital Ocean Droplet:

- Frontend: `https://funfirstplay.tech`
- API: `https://funfirstplay.tech/api`

## Database Configuration

This application uses a PostgreSQL database hosted on Digital Ocean. The database connection details are configured in the `.env` file using the following format:

```
DB_USER=doadmin
DB_PASSWORD=<your_database_password>
DB_HOST=<your_database_host>.m.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_SSL_MODE=require
```

The application loads these values from environment variables.

## Production Deployment to Digital Ocean Droplet

The application (frontend + API) is configured to deploy to a single Digital Ocean Droplet at IP 146.190.50.221 running Ubuntu 22.04 LTS.

### Prerequisites

1. A Digital Ocean Droplet with Ubuntu 22.04
2. Domain name configured to point to the Droplet (funfirstplay.tech and www.funfirstplay.tech)
3. SSH access to the Droplet using the KU key

### Automatic Deployment

A deployment script was created to automate the deployment process:

[deploy.sh](./scripts/deploy.sh)

This script will:
1. Connect to the Digital Ocean Droplet
2. Install all necessary dependencies (Node.js, Nginx, PM2)
3. Copy frontend files to `/opt/funfirstplay/frontend`
4. Copy backend files to `/opt/funfirstplay/backend`
5. Set up environment variables
6. Install backend dependencies and start the API using PM2
7. Configure Nginx to serve both frontend static files and backend API
8. Set up SSL with Let's Encrypt for the domain

### Manual Deployment Steps

If you prefer to deploy manually:

1. SSH into the Digital Ocean Droplet:
   ```
   ssh -i ~/.ssh/KU root@146.190.50.221
   ```

2. Install required packages:
   ```
   apt-get update
   apt-get install -y git nodejs npm nginx certbot python3-certbot-nginx
   npm install -g pm2
   ```

3. Create the necessary directories:
   ```
   mkdir -p /opt/funfirstplay/frontend
   mkdir -p /opt/funfirstplay/backend
   mkdir -p /var/log/funfirstplay
   ```

4. Copy frontend files to the server:
   ```
   # Using rsync from your local machine:
   rsync -avz -e "ssh -i ~/.ssh/KU" <path_to_project>/frontend/src/ root@146.190.50.221:/opt/funfirstplay/frontend/
   ```

5. Copy backend files to the server:
   ```
   # Using rsync from your local machine:
   rsync -avz -e "ssh -i ~/.ssh/KU" <path_to_project>/repo/backend/ root@146.190.50.221:/opt/funfirstplay/backend/
   ```

6. Install backend dependencies:
   ```
   cd /opt/funfirstplay/backend
   npm ci --production
   ```

7. Set up environment variables:
   ```
   cp .env.ffp .env
   ```

8. Set up the database:
   ```
   npm run migrate
   ```

9. Start the API with PM2:
   ```
   pm2 start src/server.js --name funfirstplay-api
   pm2 save
   pm2 startup
   ```

10. Configure Nginx:
    ```
    cp /opt/funfirstplay/backend/scripts/nginx-api.conf /etc/nginx/sites-available/funfirstplay
    cp /opt/funfirstplay/backend/scripts/nginx-ip.conf /etc/nginx/sites-available/api-ip
    ln -s /etc/nginx/sites-available/funfirstplay /etc/nginx/sites-enabled/
    ln -s /etc/nginx/sites-available/api-ip /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default  # Remove default site
    nginx -t
    systemctl reload nginx
    ```

11. Set up SSL with Let's Encrypt:
    ```
    certbot --nginx -d funfirstplay.tech -d www.funfirstplay.tech --non-interactive --agree-tos --email <your_email>
    ```

## Monitoring in Production

To monitor the application in production:

1. Check application logs:
   ```
   # SSH into the server
   ssh -i ~/.ssh/KU root@146.190.50.221
   
   # View application logs
   tail -f /var/log/funfirstplay/*.log
   ```

2. Check PM2 status and logs:
   ```
   # SSH into the server
   ssh -i ~/.ssh/KU root@146.190.50.221
   
   # Check process status
   pm2 status
   
   # View real-time logs
   pm2 logs funfirstplay-api
   ```

3. Access the health check endpoint:
   ```
   curl https://funfirstplay.tech/api/health
   ```

4. Check Nginx logs:
   ```
   # SSH into the server
   ssh -i ~/.ssh/KU root@146.190.50.221
   
   # Access logs (requests)
   tail -f /var/log/nginx/funfirstplay.tech-access.log
   
   # Error logs
   tail -f /var/log/nginx/funfirstplay.tech-error.log
   ```

## API Documentation

The API provides endpoints for the following resources:

- Authentication
- Users
- Sports
- Skill Levels
- Availability
- Matches
- Notifications

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/profile` - Get current user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout (protected)

### User Endpoints

- `GET /api/users` - Get all users (protected, admin-only in production)
- `GET /api/users/:userId` - Get user by ID (protected)
- `PUT /api/users/:userId` - Update user (protected)
- `DELETE /api/users/:userId` - Delete user (protected)
- `GET /api/users/:userId/sports` - Get user sports (protected)
- `POST /api/users/:userId/sports` - Add sport to user (protected)
- `DELETE /api/users/:userId/sports/:userSportId` - Remove sport from user (protected)
- `PUT /api/users/:userId/sports/:userSportId` - Update user sport skill level (protected)

### Sport Endpoints

- `GET /api/sports` - Get all sports
- `GET /api/sports/:sportId` - Get sport by ID
- `POST /api/sports` - Create a new sport (protected)
- `PUT /api/sports/:sportId` - Update sport (protected)
- `DELETE /api/sports/:sportId` - Delete sport (protected)

### Skill Level Endpoints

- `GET /api/skill-levels` - Get all skill levels
- `GET /api/skill-levels/:skillLevelId` - Get skill level by ID
- `POST /api/skill-levels` - Create a new skill level (protected)
- `PUT /api/skill-levels/:skillLevelId` - Update skill level (protected)
- `DELETE /api/skill-levels/:skillLevelId` - Delete skill level (protected)

### Availability Endpoints

- `POST /api/availability` - Create a new availability (protected)
- `GET /api/availability` - Get all availabilities for current user (protected)
- `GET /api/availability/:availabilityId` - Get availability by ID (protected)
- `PUT /api/availability/:availabilityId` - Update availability (protected)
- `DELETE /api/availability/:availabilityId` - Delete availability (protected)
- `GET /api/availability/users/available` - Find available users for a match (protected)

### Match Endpoints

- `GET /api/matches` - Get all matches
- `GET /api/matches/:matchId` - Get match by ID
- `GET /api/matches/user/matches` - Get user's matches (protected)
- `POST /api/matches` - Create a new match (protected)
- `PUT /api/matches/:matchId` - Update match (protected)
- `DELETE /api/matches/:matchId` - Delete match (protected)
- `POST /api/matches/:matchId/invite` - Invite players to a match (protected)
- `POST /api/matches/:matchId/respond` - Respond to match invitation (protected)

### Notification Endpoints

- `GET /api/notifications` - Get user's notifications (protected)
- `GET /api/notifications/unread/count` - Get unread notification count (protected)
- `POST /api/notifications/mark-all-read` - Mark all notifications as read (protected)
- `GET /api/notifications/:notificationId` - Get notification by ID (protected)
- `PUT /api/notifications/:notificationId/read` - Mark notification as read (protected)
- `DELETE /api/notifications/:notificationId` - Delete notification (protected)

## Monitoring

The API includes a health check endpoint at `/api/health` that returns the current status and version of the API.