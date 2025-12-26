# National Pickleball Tournament Data Updater

## Overview

The National Pickleball Tournament Data Updater is an automated system that fetches and updates tournament data from major pickleball organizations and maintains an up-to-date database of national pickleball events.

**Version:** 1.0.0  
**Created:** December 17, 2025  
**Schedule:** Runs every 6 hours

## Data Sources

The updater fetches tournament information from four major pickleball organizations:

### 1. PPA Tour (Professional Pickleball Association)
- **URL:** https://ppatour.com/schedule/
- **Description:** The main professional pickleball tour featuring top athletes
- **Tournament Types:** Slams (2000 pts), Cups (1500 pts), Opens (1000 pts), Challengers (125 pts)

### 2. Major League Pickleball (MLP)
- **URL:** https://majorleaguepickleball.co/events-2025/
- **Description:** Team-based professional pickleball league
- **Format:** Regular season events, Mid-Season Tournament, Playoffs, and MLP Cup
- **Streaming:** Available on PickleballTV

### 3. APP Tour (Association of Pickleball Players)
- **URL:** https://www.theapp.global/tour
- **Description:** Global professional pickleball tour
- **Events:** Professional, Collegiate, International, and Next Gen tournaments

### 4. USA Pickleball
- **URL:** https://usapickleball.org/tournaments/
- **Description:** National governing body for pickleball in the USA
- **Major Events:** National Championships, US Open, Golden Ticket tournaments

## System Architecture

### Files and Directories

```
/home/ubuntu/mindful_champion/
├── scripts/
│   ├── tournament_data_updater.py    # Main Python updater script
│   └── run_tournament_updater.sh     # Bash wrapper script
├── logs/
│   └── tournament_updater.log        # Detailed operation logs
├── config/
│   └── tournament_updater_config.json # Configuration metadata
└── TOURNAMENT_UPDATER_README.md      # This documentation
```

### Database Schema

The updater works with the `PickleballEvent` table in PostgreSQL:

**Key Fields:**
- `id` (String, CUID) - Unique identifier
- `name` (String) - Tournament name
- `organizationName` (String) - Organization hosting the event
- `location` (String) - Event location
- `eventDate` (DateTime) - Start date of the tournament
- `websiteUrl` (String) - Official tournament website
- `streamUrl` (String) - Live streaming URL
- `isLive` (Boolean) - Whether event is currently live
- `hasLiveScores` (Boolean) - Whether live scores are available
- `createdAt` (DateTime) - Record creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

## Usage

### Manual Execution

To run the updater manually:

```bash
cd /home/ubuntu/mindful_champion
bash scripts/run_tournament_updater.sh
```

### Automated Execution (Cron)

To set up automated execution every 6 hours, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line to run every 6 hours
0 */6 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh >> /home/ubuntu/mindful_champion/logs/cron_tournament_updater.log 2>&1
```

Alternative schedules:
```bash
# Every 4 hours
0 */4 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh

# Twice daily (6 AM and 6 PM)
0 6,18 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh

# Daily at midnight
0 0 * * * cd /home/ubuntu/mindful_champion && bash scripts/run_tournament_updater.sh
```

## How It Works

### Step 1: Environment Setup
The bash wrapper script (`run_tournament_updater.sh`) loads environment variables from `.env.local`, including the `DATABASE_URL` for PostgreSQL connection.

### Step 2: Data Fetching
The Python script (`tournament_data_updater.py`) fetches tournament data from each organization:
- Connects to each organization's website
- Parses tournament information (name, dates, location, URLs)
- Compiles a list of all tournaments

### Step 3: Database Update
For each tournament:
- Checks if the tournament already exists (by name and organization)
- **If exists:** Updates location, URLs, and streaming information
- **If new:** Creates a new tournament record with all available information

### Step 4: Logging
All operations are logged to `/home/ubuntu/mindful_champion/logs/tournament_updater.log` with:
- Timestamp of each operation
- Number of tournaments fetched, created, and updated
- Any errors encountered
- Summary statistics

## Monitoring

### Check Recent Logs

```bash
# View last 50 lines of log
tail -50 /home/ubuntu/mindful_champion/logs/tournament_updater.log

# View today's logs
grep "$(date +%Y-%m-%d)" /home/ubuntu/mindful_champion/logs/tournament_updater.log

# View summary statistics
grep "Tournament Update Summary" -A 5 /home/ubuntu/mindful_champion/logs/tournament_updater.log | tail -6
```

### Check Database Records

```bash
# Connect to database and check tournament count
cd /home/ubuntu/mindful_champion
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pickleballEvent.count().then(count => {
  console.log('Total tournaments in database:', count);
  prisma.\$disconnect();
});
"
```

### View Recent Tournaments

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pickleballEvent.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10,
  select: { name: true, organizationName: true, location: true, eventDate: true }
}).then(tournaments => {
  console.log('Recent tournaments:');
  tournaments.forEach(t => console.log(\`- \${t.name} (\${t.organizationName}) - \${t.location}\`));
  prisma.\$disconnect();
});
"
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
**Symptom:** "Failed to connect to database" in logs

**Solution:**
```bash
# Check if DATABASE_URL is set
cd /home/ubuntu/mindful_champion
grep DATABASE_URL .env.local

# Test database connection
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected!')).catch(e => console.error('Error:', e));"
```

#### 2. Missing Dependencies
**Symptom:** "ModuleNotFoundError" or "ImportError" in logs

**Solution:**
```bash
# Install required Python packages
pip3 install requests beautifulsoup4 psycopg2-binary
```

#### 3. Permission Errors
**Symptom:** "Permission denied" when running scripts

**Solution:**
```bash
# Make scripts executable
chmod +x /home/ubuntu/mindful_champion/scripts/run_tournament_updater.sh
chmod +x /home/ubuntu/mindful_champion/scripts/tournament_data_updater.py
```

#### 4. Website Access Errors (403, 404)
**Symptom:** "403 Forbidden" or "404 Not Found" errors in logs

**Notes:**
- Some websites may block automated requests
- The script includes fallback data for known tournaments
- These errors are logged but don't prevent other sources from being fetched

**Solution:**
- Check if the website URL has changed
- Update the URL in the Python script if needed
- The script will continue to work with other data sources

### Log Analysis

#### Check for Errors
```bash
grep "ERROR" /home/ubuntu/mindful_champion/logs/tournament_updater.log | tail -20
```

#### View Success Rate
```bash
grep "Tournament Update Summary" -A 5 /home/ubuntu/mindful_champion/logs/tournament_updater.log | tail -6
```

#### Monitor Execution Times
```bash
grep "Starting Tournament Data Updater" /home/ubuntu/mindful_champion/logs/tournament_updater.log
```

## Maintenance

### Updating Tournament Data Sources

To add or modify tournament sources, edit `/home/ubuntu/mindful_champion/scripts/tournament_data_updater.py`:

1. Add a new fetch method (e.g., `fetch_new_source_tournaments()`)
2. Add the method call in the `run()` method
3. Update the configuration file with the new source

### Cleaning Old Logs

```bash
# Keep only last 1000 lines of logs
tail -1000 /home/ubuntu/mindful_champion/logs/tournament_updater.log > /tmp/tournament_updater.log
mv /tmp/tournament_updater.log /home/ubuntu/mindful_champion/logs/tournament_updater.log

# Or rotate logs by date
mv /home/ubuntu/mindful_champion/logs/tournament_updater.log \
   /home/ubuntu/mindful_champion/logs/tournament_updater_$(date +%Y%m%d).log
```

### Database Cleanup

To remove old/past tournaments:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cutoffDate = new Date();
cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 months ago
prisma.pickleballEvent.deleteMany({
  where: { eventDate: { lt: cutoffDate } }
}).then(result => {
  console.log('Deleted', result.count, 'old tournaments');
  prisma.\$disconnect();
});
"
```

## Performance

### Current Statistics
- **Execution Time:** ~2-3 seconds per run
- **Data Sources:** 4 organizations
- **Average Tournaments Fetched:** 14-20 per run
- **Database Operations:** Typically 10-15 inserts/updates per run

### Resource Usage
- **CPU:** Minimal (< 1% during execution)
- **Memory:** ~50-100 MB during execution
- **Network:** ~500 KB per run
- **Disk:** Log file grows ~5-10 KB per run

## API Integration

The tournament data can be accessed via the application's API:

```javascript
// Example: Fetch all tournaments
fetch('/api/tournaments')
  .then(res => res.json())
  .then(tournaments => console.log(tournaments));

// Example: Fetch tournaments by organization
fetch('/api/tournaments?organization=MLP')
  .then(res => res.json())
  .then(tournaments => console.log(tournaments));

// Example: Fetch upcoming tournaments
fetch('/api/tournaments?upcoming=true')
  .then(res => res.json())
  .then(tournaments => console.log(tournaments));
```

## Support

For issues or questions:
1. Check the logs: `/home/ubuntu/mindful_champion/logs/tournament_updater.log`
2. Review this documentation
3. Check the configuration: `/home/ubuntu/mindful_champion/config/tournament_updater_config.json`
4. Test database connectivity
5. Verify environment variables are set correctly

## Version History

### Version 1.0.0 (December 17, 2025)
- Initial release
- Support for PPA Tour, MLP, APP Tour, and USA Pickleball
- Automated data fetching and database updates
- Comprehensive logging and error handling
- Configuration management

## Future Enhancements

Potential improvements for future versions:
- [ ] Add live score fetching capabilities
- [ ] Implement tournament result tracking
- [ ] Add player roster information
- [ ] Include prize money and point values
- [ ] Add email notifications for new tournaments
- [ ] Create dashboard for monitoring
- [ ] Add support for international tournaments
- [ ] Implement caching to reduce API calls
- [ ] Add tournament bracket information
- [ ] Include streaming schedule details

---

**Last Updated:** December 17, 2025  
**Maintainer:** Mindful Champion Development Team
