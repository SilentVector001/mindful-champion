
# API Credentials Required for Live Media Center

This document outlines the API credentials and setup steps needed to enable real-time data for the Media Center's live tournament streaming and scores.

## Current Status

⚠️ **The application is currently using MOCK DATA for demonstration purposes.**

The video player shows a demo video (`/videos/pro-technique-demo.mp4`) instead of live streams because real API credentials have not been configured yet.

## Required API Services

### 1. PickleballTV API
**Purpose**: Live tournament streaming and video content

**Required Credentials**:
- API Key
- Client ID (if applicable)
- Stream Access Token

**How to Get**:
1. Visit https://pickleballtv.com/
2. Contact their business/API team: support@pickleballtv.com
3. Request API access for streaming integration
4. Obtain credentials for programmatic stream access

**Environment Variables**:
```env
PICKLEBALLTV_API_KEY=your_api_key_here
PICKLEBALLTV_CLIENT_ID=your_client_id_here
PICKLEBALLTV_STREAM_TOKEN=your_stream_token_here
```

**API Documentation**: Request from PickleballTV support

**Cost**: Contact PickleballTV for pricing (likely requires business/enterprise plan)

---

### 2. PPA Tour API
**Purpose**: Professional Pickleball Association tournament data and schedules

**Required Credentials**:
- API Key
- OAuth Client ID & Secret (if required)

**How to Get**:
1. Visit https://ppatour.com/
2. Navigate to their developer or business section
3. Contact: info@ppatour.com or api@ppatour.com
4. Request API access for tournament data

**Environment Variables**:
```env
PPA_TOUR_API_KEY=your_api_key_here
PPA_TOUR_CLIENT_ID=your_client_id_here
PPA_TOUR_CLIENT_SECRET=your_client_secret_here
```

**API Documentation**: https://ppatour.com/api/docs (if available) or request from their team

**Cost**: Contact PPA for pricing

---

### 3. Major League Pickleball (MLP) API
**Purpose**: MLP tournament data, team standings, and live scores

**Required Credentials**:
- API Key or OAuth tokens

**How to Get**:
1. Visit https://majorleaguepickleball.net/
2. Contact their media or API team
3. Email: info@majorleaguepickleball.net
4. Request API access for tournament integration

**Environment Variables**:
```env
MLP_API_KEY=your_api_key_here
MLP_ACCESS_TOKEN=your_access_token_here
```

**API Documentation**: Request from MLP team

**Cost**: Contact MLP for pricing

---

### 4. USA Pickleball API
**Purpose**: Official USAP tournament data and player rankings

**Required Credentials**:
- API Key
- Member/Organization ID

**How to Get**:
1. Visit https://usapickleball.org/
2. Contact their technical team
3. Email: tech@usapickleball.org
4. Explain your integration needs

**Environment Variables**:
```env
USAP_API_KEY=your_api_key_here
USAP_ORG_ID=your_org_id_here
```

**API Documentation**: https://usapickleball.org/api-docs (if available)

**Cost**: May require USAP membership or organizational partnership

---

### 5. Tennis Channel / Pickleball Channel API
**Purpose**: Live streaming for televised tournaments

**Required Credentials**:
- API Key
- Stream Access Token
- Channel ID

**How to Get**:
1. Visit https://www.tennischannel.com/
2. Contact their digital/API team
3. Email: digital@tennischannel.com
4. Request streaming API access

**Environment Variables**:
```env
TENNIS_CHANNEL_API_KEY=your_api_key_here
TENNIS_CHANNEL_STREAM_TOKEN=your_stream_token_here
TENNIS_CHANNEL_CHANNEL_ID=your_channel_id_here
```

**Cost**: Likely requires commercial licensing agreement

---

### 6. BetsAPI (For Live Scores)
**Purpose**: Real-time match scores and statistics

**Required Credentials**:
- API Key

**How to Get**:
1. Visit https://betsapi.com/
2. Sign up for an account
3. Subscribe to pickleball data feeds
4. Get API key from dashboard

**Environment Variables**:
```env
BETS_API_KEY=your_api_key_here
```

**API Documentation**: https://betsapi.com/docs

**Cost**: ~$30-200/month depending on usage

**Status**: ⚠️ Currently using mock data - Need to verify if BetsAPI supports pickleball

---

## Setup Instructions

### Step 1: Obtain API Credentials

Contact each service provider listed above and obtain the necessary credentials. This may take several weeks depending on response times.

### Step 2: Add Environment Variables

Create or update your `.env.local` file:

```bash
# PickleballTV
PICKLEBALLTV_API_KEY=your_api_key_here
PICKLEBALLTV_CLIENT_ID=your_client_id_here
PICKLEBALLTV_STREAM_TOKEN=your_stream_token_here

# PPA Tour
PPA_TOUR_API_KEY=your_api_key_here

# MLP
MLP_API_KEY=your_api_key_here

# USAP
USAP_API_KEY=your_api_key_here

# Tennis/Pickleball Channel
TENNIS_CHANNEL_API_KEY=your_api_key_here
TENNIS_CHANNEL_STREAM_TOKEN=your_stream_token_here

# BetsAPI (for live scores)
BETS_API_KEY=your_api_key_here
```

### Step 3: Implement API Integration

Once credentials are obtained, we'll need to:

1. **Create Service Layer Files**:
   - `/lib/media-api/pickleballtv-service.ts`
   - `/lib/media-api/ppa-tour-service.ts`
   - `/lib/media-api/mlp-service.ts`
   - `/lib/media-api/usap-service.ts`
   - `/lib/media-api/tennis-channel-service.ts`

2. **Update API Routes**:
   - `/app/api/media-hub/live-tournaments/route.ts` - Replace mock data with real API calls
   - `/app/api/media-hub/live-scores/route.ts` - Integrate with real score feeds

3. **Update Components**:
   - `/components/media/live-tournament-streaming.tsx` - Handle real stream URLs
   - `/components/media/enhanced-video-player.tsx` - Support different stream formats

### Step 4: Test Integration

Test with each API:
```bash
# Test PickleballTV connection
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.pickleballtv.com/streams/live

# Test PPA Tour connection
curl -H "X-API-Key: YOUR_API_KEY" https://api.ppatour.com/tournaments/live

# Test MLP connection
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.majorleaguepickleball.net/events/live
```

---

## Automated Content Updates

### Current Daemon Configuration

The application has a daemon task set up to run **3 times daily**:
- 12:01 AM EST (overnight update)
- 6:00 AM EST (morning update)
- 6:00 PM EST (evening update)

**Location**: `/scripts/daemons/media-center-sync.ts`

### What the Daemon Does

When real API credentials are configured, the daemon will:

1. **Sync Live Tournaments**: Fetch current live events from all APIs
2. **Update Scores**: Pull latest match scores and standings
3. **Refresh Stream URLs**: Update stream links and metadata
4. **Cache Data**: Store in database for fast retrieval
5. **Clean Old Data**: Remove expired events and old matches

### Manual Sync

Admin users can manually trigger a sync from the admin dashboard:
- Navigate to `/admin/videos`
- Click "Sync Media Content"
- Or call the API: `POST /api/media-center/sync`

---

## Implementation Timeline

### Phase 1: Immediate (Using Mock Data) ✅
- [x] UI components built
- [x] Mock data system functional
- [x] Video player working with demo content
- [x] Add to Calendar functionality
- [x] Auto-refresh every 30 seconds

### Phase 2: API Credentials Acquisition (1-4 weeks)
- [ ] Contact all service providers
- [ ] Obtain API keys and credentials
- [ ] Set up developer/business accounts
- [ ] Review API documentation
- [ ] Understand rate limits and costs

### Phase 3: Integration Development (1-2 weeks)
- [ ] Create service layer for each API
- [ ] Implement authentication flows
- [ ] Handle rate limiting
- [ ] Add error handling
- [ ] Build data transformation layer

### Phase 4: Testing & Deployment (1 week)
- [ ] Test each API connection
- [ ] Verify stream playback
- [ ] Validate score accuracy
- [ ] Performance testing
- [ ] Deploy to production

---

## Alternative: Free/Demo Options

If you want to test the live streaming functionality without purchasing API access:

### Option 1: YouTube Live Streams
Use YouTube Data API (Free tier available):
```env
YOUTUBE_API_KEY=your_youtube_key_here
```

Search for "pickleball live stream" and embed public YouTube live streams.

### Option 2: Public RSS Feeds
Some organizations provide RSS feeds for tournament schedules:
- Parse RSS/XML feeds
- No API key required
- Limited to schedule data (no live streams)

### Option 3: Web Scraping (Not Recommended)
- Scrape public tournament pages
- Legal/ethical concerns
- Fragile (breaks when sites update)
- Against most Terms of Service

---

## Cost Summary

**Estimated Monthly Costs** (approximate):

| Service | Estimated Cost | Required? |
|---------|---------------|-----------|
| PickleballTV API | $200-500/mo | **Yes** (for streams) |
| PPA Tour API | $100-300/mo | **Yes** (for tournaments) |
| MLP API | $100-250/mo | Yes (for MLP events) |
| USAP API | $50-150/mo | Yes (for official data) |
| Tennis Channel API | $300-1000/mo | Optional (for TV broadcasts) |
| BetsAPI | $30-200/mo | Yes (for live scores) |

**Total Estimated**: $780-2,400/month

**Note**: Actual costs may vary. Some providers may offer bundle deals or non-profit discounts.

---

## Support & Questions

If you need help implementing these integrations:

1. **Check Documentation**: Each API should have documentation
2. **Contact Providers**: Reach out to their support teams
3. **Developer Forums**: Look for community forums or Discord servers
4. **Hire Integration Help**: Consider hiring a developer experienced with sports streaming APIs

---

## Current Workaround

Until real API credentials are obtained, the application will continue to use:
- **Demo Video**: `/videos/pro-technique-demo.mp4` for visual demonstration
- **Mock Tournament Data**: Simulated live and upcoming events
- **Mock Scores**: Simulated match scores and updates
- **Calendar Integration**: ✅ Fully functional (works with mock data)
- **Auto-refresh**: ✅ Working (refreshes mock data)

This provides a complete user experience for demonstration and testing purposes.

---

**Last Updated**: November 15, 2025  
**Status**: Awaiting API credentials for production deployment
