#!/bin/bash
PGPASSWORD='sP9wXzLX9s0H3DnsYQJexVTiZxck_F9A' psql -h db-15bc420ce7.db002.hosteddb.reai.io -p 5432 -U role_15bc420ce7 -d 15bc420ce7 -c "SELECT email, name, \"createdAt\", \"isTrialActive\", \"trialEndDate\", \"subscriptionTier\" FROM \"User\" ORDER BY \"createdAt\" ASC;"
