# Tournament Updater - Scheduling Setup Instructions

## Overview
This document provides instructions for setting up automated scheduling for the National Pickleball Tournament Data Updater to run every 6 hours.

## Current Status
- ✅ Scripts are configured and tested
- ✅ Database connection verified
- ✅ Manual execution working
- ⚠️ Automated scheduling not yet configured

## Option 1: Using Cron (Recommended)

### Step 1: Install Cron (if not already installed)
```bash
# Check if cron is installed
which cron || which crond

# If not installed, install it
sudo apt-get update
sudo apt-get install cron

# Start and enable cron service
sudo systemctl start cron
sudo systemctl enable cron
```

### Step 2: Add Cron Job
```bash
# Open crontab editor
crontab -e

# Add this line to run every 6 hours (at 00:00, 06:00, 12:00, 18:00)
0 */6 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh >> logs/tournament_updater_cron.log 2>&1
```

### Step 3: Verify Cron Job
```bash
# List current cron jobs
crontab -l

# Check cron service status
sudo systemctl status cron
```

### Alternative Cron Schedules

**Every 4 hours:**
```bash
0 */4 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh >> logs/tournament_updater_cron.log 2>&1
```

**Twice daily (6 AM and 6 PM):**
```bash
0 6,18 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh >> logs/tournament_updater_cron.log 2>&1
```

**Daily at midnight:**
```bash
0 0 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh >> logs/tournament_updater_cron.log 2>&1
```

## Option 2: Using Systemd Timer

### Step 1: Create Service File
Create `/etc/systemd/system/tournament-updater.service`:

```ini
[Unit]
Description=National Pickleball Tournament Data Updater
After=network.target postgresql.service

[Service]
Type=oneshot
User=ubuntu
WorkingDirectory=/home/ubuntu/mindful_champion
ExecStart=/bin/bash /home/ubuntu/mindful_champion/scripts/run_tournament_updater.sh
StandardOutput=append:/home/ubuntu/mindful_champion/logs/tournament_updater_systemd.log
StandardError=append:/home/ubuntu/mindful_champion/logs/tournament_updater_systemd.log

[Install]
WantedBy=multi-user.target
```

### Step 2: Create Timer File
Create `/etc/systemd/system/tournament-updater.timer`:

```ini
[Unit]
Description=Run Tournament Updater every 6 hours
Requires=tournament-updater.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=6h
Unit=tournament-updater.service

[Install]
WantedBy=timers.target
```

### Step 3: Enable and Start Timer
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable the timer
sudo systemctl enable tournament-updater.timer

# Start the timer
sudo systemctl start tournament-updater.timer

# Check timer status
sudo systemctl status tournament-updater.timer

# List all timers
sudo systemctl list-timers
```

### Step 4: Manual Service Execution (for testing)
```bash
# Run the service manually
sudo systemctl start tournament-updater.service

# Check service status
sudo systemctl status tournament-updater.service

# View logs
journalctl -u tournament-updater.service -n 50
```

## Option 3: Using Docker/Container Scheduler

If running in a containerized environment:

### Docker Compose with Cron
Add to `docker-compose.yml`:

```yaml
services:
  tournament-updater:
    image: python:3.9-slim
    volumes:
      - ./:/app
    working_dir: /app
    command: >
      sh -c "apt-get update && apt-get install -y cron &&
             echo '0 */6 * * * cd /app && bash scripts/run_tournament_updater.sh >> logs/tournament_updater_cron.log 2>&1' | crontab - &&
             cron -f"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
```

## Monitoring Scheduled Executions

### Check Cron Logs
```bash
# View cron-specific logs
tail -f /home/ubuntu/mindful_champion/logs/tournament_updater_cron.log

# View main updater logs
tail -f /home/ubuntu/mindful_champion/logs/tournament_updater.log

# Check for errors
grep "ERROR" /home/ubuntu/mindful_champion/logs/tournament_updater.log | tail -20
```

### Check Systemd Timer Logs
```bash
# View timer logs
journalctl -u tournament-updater.timer -n 50

# View service logs
journalctl -u tournament-updater.service -n 50

# Follow logs in real-time
journalctl -u tournament-updater.service -f
```

### Verify Execution History
```bash
# Check when updater last ran
grep "Starting Tournament Data Updater" /home/ubuntu/mindful_champion/logs/tournament_updater.log | tail -5

# Check recent execution summaries
grep "Tournament Update Summary" -A 5 /home/ubuntu/mindful_champion/logs/tournament_updater.log | tail -30
```

## Troubleshooting

### Cron Not Running
```bash
# Check if cron service is running
sudo systemctl status cron

# Restart cron service
sudo systemctl restart cron

# Check cron logs
sudo tail -f /var/log/syslog | grep CRON
```

### Environment Variables Not Loading
```bash
# Verify .env file exists and has DATABASE_URL
cat /home/ubuntu/mindful_champion/.env | grep DATABASE_URL

# Test script manually
cd /home/ubuntu/mindful_champion
bash scripts/run_tournament_updater.sh
```

### Permission Issues
```bash
# Ensure scripts are executable
chmod +x /home/ubuntu/mindful_champion/scripts/run_tournament_updater.sh
chmod +x /home/ubuntu/mindful_champion/scripts/tournament_data_updater.py

# Ensure log directory is writable
chmod 755 /home/ubuntu/mindful_champion/logs
```

### Database Connection Issues
```bash
# Test database connection
cd /home/ubuntu/mindful_champion
source .env
python3 -c "import psycopg2; conn = psycopg2.connect('$DATABASE_URL'); print('Connected!'); conn.close()"
```

## Testing the Schedule

### Test Cron Job Immediately
```bash
# Run the cron command manually
cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh >> logs/tournament_updater_cron.log 2>&1

# Check if it worked
tail -20 logs/tournament_updater_cron.log
```

### Test Systemd Service
```bash
# Run service manually
sudo systemctl start tournament-updater.service

# Check status
sudo systemctl status tournament-updater.service

# View output
tail -20 logs/tournament_updater_systemd.log
```

## Maintenance

### Disable Scheduling Temporarily
```bash
# For cron
crontab -e
# Comment out the line with #

# For systemd
sudo systemctl stop tournament-updater.timer
sudo systemctl disable tournament-updater.timer
```

### Re-enable Scheduling
```bash
# For cron
crontab -e
# Uncomment the line

# For systemd
sudo systemctl enable tournament-updater.timer
sudo systemctl start tournament-updater.timer
```

### Update Schedule Frequency
```bash
# For cron - edit crontab
crontab -e
# Modify the schedule line

# For systemd - edit timer file
sudo nano /etc/systemd/system/tournament-updater.timer
# Modify OnUnitActiveSec value
sudo systemctl daemon-reload
sudo systemctl restart tournament-updater.timer
```

## Verification Checklist

After setting up scheduling, verify:

- [ ] Cron/systemd service is running
- [ ] Scheduled job appears in crontab/timer list
- [ ] Log files are being created/updated
- [ ] Database is being updated with new data
- [ ] No errors in logs
- [ ] Script runs successfully on schedule

## Support

For issues with scheduling setup:
1. Check the main documentation: `TOURNAMENT_UPDATER_README.md`
2. Review logs in `/home/ubuntu/mindful_champion/logs/`
3. Test manual execution first
4. Verify environment variables are set
5. Check system logs for cron/systemd errors

---

**Created:** January 3, 2026  
**Last Updated:** January 3, 2026  
**Maintainer:** Mindful Champion Development Team
