-- Add sponsorApplicationId column to EmailNotification table if it doesn't exist
-- This migration ensures the database schema matches the Prisma schema

-- Check if column exists and add if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'EmailNotification' 
        AND column_name = 'sponsorApplicationId'
    ) THEN
        ALTER TABLE "EmailNotification" 
        ADD COLUMN "sponsorApplicationId" TEXT;
        
        RAISE NOTICE 'Added sponsorApplicationId column to EmailNotification table';
    ELSE
        RAISE NOTICE 'sponsorApplicationId column already exists';
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'EmailNotification_sponsorApplicationId_fkey'
    ) THEN
        ALTER TABLE "EmailNotification"
        ADD CONSTRAINT "EmailNotification_sponsorApplicationId_fkey"
        FOREIGN KEY ("sponsorApplicationId") 
        REFERENCES "SponsorApplication"(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for sponsorApplicationId';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Add index on sponsorApplicationId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'EmailNotification_sponsorApplicationId_idx'
    ) THEN
        CREATE INDEX "EmailNotification_sponsorApplicationId_idx" 
        ON "EmailNotification"("sponsorApplicationId");
        
        RAISE NOTICE 'Added index on sponsorApplicationId';
    ELSE
        RAISE NOTICE 'Index on sponsorApplicationId already exists';
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'EmailNotification'
AND column_name = 'sponsorApplicationId';
