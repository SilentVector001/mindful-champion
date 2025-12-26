# Media Sync - Quick Reference Guide

## Manual Execution

To manually run the media synchronization script:

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npx tsx scripts/sync-media-content.ts
```

## Verify Sync Results

To verify the sync was successful:

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npx tsx scripts/verify-sync.ts
```

## View Latest Log

```bash
ls -lt /home/ubuntu/mindful_champion/logs/media-sync-*.log | head -1 | awk '{print $NF}' | xargs cat
```

## Scheduled Execution

The script runs automatically 3x daily:
- 12:01 AM UTC
- 6:00 AM UTC  
- 6:00 PM UTC

## What Gets Synced

1. **Live Streams** - YouTube & PickleballTV streams
2. **Podcasts** - Episodes from major pickleball podcasts
3. **Events** - Upcoming tournaments and competitions
4. **Training Videos** - Instructional content (manual curation)
5. **Live Scores** - Real-time match results
6. **Cache Cleanup** - Removes expired cache entries

## Log Location

All sync logs are stored in:
```
/home/ubuntu/mindful_champion/logs/media-sync-<timestamp>.log
```

## Troubleshooting

### Script Fails to Run
- Check DATABASE_URL is set in `/home/ubuntu/mindful_champion/.env.local`
- Ensure Prisma client is generated: `npx prisma generate`

### No Data Synced
- Check API keys in environment variables
- Review log file for specific errors
- Verify network connectivity to external APIs

### Database Connection Issues
- Verify DATABASE_URL format
- Check database is accessible
- Ensure Prisma schema is up to date

## Support

For issues or questions, check:
1. Latest log file for error details
2. Execution summary in `/home/ubuntu/mindful_champion/logs/`
3. Script source at `/home/ubuntu/mindful_champion/nextjs_space/scripts/sync-media-content.ts`
