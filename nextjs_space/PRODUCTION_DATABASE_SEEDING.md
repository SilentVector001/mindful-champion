# Production Database Seeding Guide

## Investigation Summary

### Local Database Status ✅
- **Database Host**: `db-e62f243fc.db003.hosteddb.reai.io:5432`
- **Tournament Count**: 30 tournaments seeded
- **API Logic**: Working correctly (returns all 30 tournaments)
- **Sample Data**: Miami Open, Austin City Limits, San Diego Coastal Cup, etc.

### Issue Analysis
The local database has data, but the production Vercel deployment shows 0 tournaments. This indicates:
- Vercel's `DATABASE_URL` environment variable points to a **different database**
- OR the production database hasn't been seeded yet

---

## Solution: Seed Production Database via Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Pull environment variables**:
   ```bash
   cd /home/ubuntu/mindful-champion
   vercel env pull .env.production
   ```

4. **Run seed script against production database**:
   ```bash
   # Use production DATABASE_URL
   export $(cat .env.production | xargs)
   npx tsx scripts/seed-tournaments.ts
   ```

5. **Verify seeding**:
   ```bash
   npx tsx scripts/check-db-connection.ts
   ```

---

### Method 2: Via Vercel Dashboard (Alternative)

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Copy the production `DATABASE_URL`**

3. **Run seed script locally with production URL**:
   ```bash
   cd /home/ubuntu/mindful-champion
   DATABASE_URL="<paste-production-url-here>" npx tsx scripts/seed-tournaments.ts
   ```

---

### Method 3: Deploy Seed Script as API Route

Create an admin API endpoint to seed the database:

```typescript
// app/api/admin/seed-tournaments/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, SkillLevel, TournamentStatus, TournamentFormat } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Add authentication check here
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear existing tournaments
    await prisma.tournament.deleteMany({});

    // Seed 30 tournaments (use the same data from scripts/seed-tournaments.ts)
    const tournamentsToCreate = [
      // ... tournament data ...
    ];

    for (const tournament of tournamentsToCreate) {
      await prisma.tournament.create({ data: tournament });
    }

    const count = await prisma.tournament.count();
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${count} tournaments` 
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
```

**Usage**:
```bash
# After deploying, call the endpoint
curl -X POST https://your-app.vercel.app/api/admin/seed-tournaments \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

---

## Verification Steps

After seeding, verify the data is accessible:

1. **Check database directly**:
   ```bash
   npx tsx scripts/check-db-connection.ts
   ```

2. **Test API endpoint**:
   ```bash
   curl https://your-app.vercel.app/api/tournaments | jq '.tournaments | length'
   ```

3. **Check tournaments page**:
   - Visit: `https://your-app.vercel.app/tournaments`
   - Should display 30 tournaments with filters and sorting

---

## Database Connection Verification

To confirm which database Vercel is using:

1. **Add a diagnostic API endpoint**:
   ```typescript
   // app/api/admin/db-info/route.ts
   import { NextResponse } from 'next/server';
   import { prisma } from '@/lib/db';

   export async function GET() {
     const count = await prisma.tournament.count();
     const dbUrl = process.env.DATABASE_URL || '';
     const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'Unknown';
     
     return NextResponse.json({
       host: dbHost,
       tournamentCount: count,
       // Don't expose full URL in production
     });
   }
   ```

2. **Call it to see the database host and count**:
   ```bash
   curl https://your-app.vercel.app/api/admin/db-info
   ```

---

## Common Issues

### Issue: "Connection refused" or "Too many connections"
**Solution**: The database connection pool might be exhausted. Restart Vercel deployment:
```bash
vercel --prod
```

### Issue: Seeding takes too long or times out
**Solution**: Reduce batch size or use `createMany`:
```typescript
await prisma.tournament.createMany({
  data: tournamentsToCreate,
  skipDuplicates: true,
});
```

### Issue: Permission denied on production database
**Solution**: Verify the `DATABASE_URL` has write permissions. Check with your database provider.

---

## Next Steps

1. Choose one of the seeding methods above
2. Run the seed script against production
3. Verify tournaments appear on the live site
4. If issues persist, check Vercel logs: `vercel logs --prod`

---

## Files Referenced
- `/scripts/seed-tournaments.ts` - Seed script with 30 tournaments
- `/scripts/check-db-connection.ts` - Database verification script
- `/app/api/tournaments/route.ts` - Tournaments API endpoint
- `/lib/db.ts` - Prisma client configuration
