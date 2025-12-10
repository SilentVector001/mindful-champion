'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Database, ArrowLeft } from 'lucide-react';

interface Program {
  id: string;
  programId?: string;
  name: string;
  skillLevel?: string;
  durationDays?: number;
  isActive?: boolean;
  createdAt?: string;
}

interface SeedResponse {
  success?: boolean;
  message: string;
  programs?: Program[];
  existingPrograms?: Program[];
  count?: number;
}

export default function SeedProgramsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<SeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingPrograms, setExistingPrograms] = useState<Program[]>([]);

  // Check existing programs on mount
  useEffect(() => {
    if (status === 'authenticated') {
      checkExistingPrograms();
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const checkExistingPrograms = async () => {
    try {
      setChecking(true);
      const response = await fetch('/api/admin/seed-programs');
      const data = await response.json();

      if (response.ok) {
        setExistingPrograms(data.programs || []);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        setTimeout(() => router.push('/admin'), 2000);
      }
    } catch (err) {
      console.error('Error checking programs:', err);
      setError('Failed to check existing programs');
    } finally {
      setChecking(false);
    }
  };

  const handleSeedPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/admin/seed-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: SeedResponse = await response.json();

      if (response.ok) {
        setResult(data);
        // Refresh the existing programs list
        await checkExistingPrograms();
      } else {
        setError(data.message || 'Failed to seed programs');
      }
    } catch (err) {
      console.error('Error seeding programs:', err);
      setError('An error occurred while seeding programs');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/admin')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Seed Training Programs</CardTitle>
              <CardDescription>
                Initialize the database with 7 comprehensive training programs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <p className="text-sm text-muted-foreground">
              {existingPrograms.length === 0 ? (
                'No training programs found in database'
              ) : (
                `${existingPrograms.length} training program${existingPrograms.length !== 1 ? 's' : ''} currently in database`
              )}
            </p>
          </div>

          {/* Existing Programs List */}
          {existingPrograms.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Existing Programs:</h3>
              <div className="grid gap-2">
                {existingPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{program.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {program.skillLevel} • {program.durationDays} days
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programs to be seeded */}
          <div className="space-y-2">
            <h3 className="font-semibold">Programs to be seeded:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Beginner Fundamentals (30 days)</li>
              <li>• Intermediate Skills Development (45 days)</li>
              <li>• Advanced Tournament Prep (60 days)</li>
              <li>• Pro Performance Mastery (90 days)</li>
              <li>• Dinking Mastery (21 days)</li>
              <li>• Serve & Return Excellence (21 days)</li>
              <li>• Mental Game Champion (30 days)</li>
            </ul>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {result && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {result.message}
                {result.programs && (
                  <div className="mt-2">
                    <p className="font-semibold">Created programs:</p>
                    <ul className="mt-1 space-y-1">
                      {result.programs.map((program) => (
                        <li key={program.id} className="text-sm">
                          ✓ {program.name} ({program.skillLevel})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.existingPrograms && (
                  <p className="mt-2 text-sm">
                    {result.count} programs already exist in the database.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Seed Button */}
          <Button
            onClick={handleSeedPrograms}
            disabled={loading || existingPrograms.length > 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Programs...
              </>
            ) : existingPrograms.length > 0 ? (
              'Programs Already Seeded'
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Training Programs
              </>
            )}
          </Button>

          {existingPrograms.length > 0 && (
            <p className="text-sm text-center text-muted-foreground">
              Programs have already been seeded. To re-seed, you need to manually delete existing programs from the database first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
