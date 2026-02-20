import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { supabaseAuth } from '@/integrations/supabase/authClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

// Helper to add timeout to async operations
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timeout after ${ms}ms`)), ms)
    )
  ]);
}

export default function DiagnosticsPage() {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useUser();
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addDiag = (msg: string) => {
    console.log(msg);
    setDiagnostics(prev => [...prev, msg]);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
      alert('Failed to sign out. Try closing the tab.');
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setDiagnostics([]);

    try {
      addDiag('=== AUTH DIAGNOSTICS ===');
      addDiag(`User logged in: ${!!user}`);
      addDiag(`User ID: ${user?.id || 'N/A'}`);
      addDiag(`User email: ${user?.email || 'N/A'}`);
      addDiag(`User profile loaded: ${!!userProfile}`);
      addDiag(`Profile pseudonym: ${userProfile?.pseudonym || 'N/A'}`);

      if (!user?.id) {
        addDiag('❌ User not logged in - cannot run database tests');
        return;
      }

      await new Promise(r => setTimeout(r, 500));
      
      addDiag('');
      addDiag('=== DATABASE CHECKS (with 3 second timeouts) ===');
      
      // Check if user exists in users table
      addDiag('Checking users table...');
      try {
        const { data: userData, error: userError } = await withTimeout(
          supabaseAuth
            .from('users')
            .select('*')
            .eq('id', user.id),
          3000
        );
        
        if (userError) {
          addDiag(`❌ Error querying users: ${userError.message}`);
        } else {
          addDiag(`✓ Users table accessible`);
          addDiag(`  Found ${userData?.length || 0} users with this ID`);
          if (userData && userData.length > 0) {
            addDiag(`  User data: ${JSON.stringify(userData[0])}`);
          } else {
            addDiag(`  ⚠️  User profile not in database yet`);
          }
        }
      } catch (err) {
        addDiag(`⏱️  Timeout: ${err instanceof Error ? err.message : 'Unknown error'}`);
        addDiag(`  → Supabase may be slow or unreachable`);
      }

      // Check league_members
      addDiag('');
      addDiag('Checking league_members table...');
      try {
        const { data: memberData, error: memberError } = await withTimeout(
          supabaseAuth
            .from('league_members')
            .select('*')
            .eq('user_id', user.id),
          3000
        );
        
        if (memberError) {
          addDiag(`❌ Error querying league_members: ${memberError.message}`);
        } else {
          addDiag(`✓ league_members table accessible`);
          addDiag(`  Found ${memberData?.length || 0} memberships`);
        }
      } catch (err) {
        addDiag(`⏱️  Timeout: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Check leagues
      addDiag('');
      addDiag('Checking leagues table...');
      try {
        const { data: leagues, error: leaguesError } = await withTimeout(
          supabaseAuth
            .from('leagues')
            .select('*')
            .limit(5),
          3000
        );
        
        if (leaguesError) {
          addDiag(`❌ Error querying leagues: ${leaguesError.message}`);
        } else {
          addDiag(`✓ Leagues table accessible`);
          addDiag(`  Total leagues: ${leagues?.length || 0}`);
        }
      } catch (err) {
        addDiag(`⏱️  Timeout: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Test insert to users table
      addDiag('');
      addDiag('=== INSERT TEST ===');
      try {
        const { data: userData } = await withTimeout(
          supabaseAuth
            .from('users')
            .select('*')
            .eq('id', user.id),
          3000
        );

        if (!userData || userData.length === 0) {
          addDiag('Attempting to insert user profile...');
          const { data: insertData, error: insertError } = await withTimeout(
            supabaseAuth
              .from('users')
              .insert([{
                id: user.id,
                email: user.email,
                pseudonym: 'Test User',
              }])
              .select()
              .single(),
            3000
          );
          
          if (insertError) {
            addDiag(`❌ Insert failed: ${insertError.message}`);
            addDiag(`   Error code: ${(insertError as any).code}`);
            addDiag('');
            addDiag('   FIX: Go to your Supabase Auth project and:');
            addDiag('   1. Click "Authentication" → Users');
            addDiag('   2. Click "SQL Editor" → "New Query"');
            addDiag('   3. Run: ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
            addDiag('   4. Or add proper RLS policies for INSERT');
          } else {
            addDiag(`✓ Insert successful!`);
            if (insertData) {
              addDiag(`  Created: ${JSON.stringify(insertData)}`);
            }
          }
        } else {
          addDiag('✓ User profile already exists in database');
        }
      } catch (err) {
        addDiag(`⏱️  Insert test timeout: ${err instanceof Error ? err.message : 'Unknown error'}`);
        addDiag('   Database may be unreachable');
      }

      addDiag('');
      addDiag('=== SUMMARY ===');
      addDiag(`If you see timeouts → Database connectivity issue`);
      addDiag(`If you see RLS errors → Need to disable/configure RLS`);
    } catch (err) {
      addDiag(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Diagnostics</h1>
            <p className="text-muted-foreground">Check authentication and database status</p>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-semibold">Logged In:</span> {user ? '✓ Yes' : '✗ No'}
            </div>
            <div>
              <span className="font-semibold">User ID:</span> <code className="text-sm bg-muted p-1 rounded">{user?.id || 'N/A'}</code>
            </div>
            <div>
              <span className="font-semibold">Email:</span> {user?.email || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Profile Loaded:</span> {userProfile ? '✓ Yes' : '✗ No'}
            </div>
            {userProfile && (
              <div>
                <span className="font-semibold">Pseudonym:</span> {userProfile.pseudonym}
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={runDiagnostics} disabled={loading} size="lg" className="w-full">
          {loading ? 'Running... (times out after 3s per operation)' : 'Run Full Diagnostics'}
        </Button>

        {diagnostics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
                {diagnostics.map((diag, i) => (
                  <div key={i} className={
                    diag.includes('===') ? 'font-bold mt-4' :
                    diag.includes('❌') ? 'text-red-600' :
                    diag.includes('✓') ? 'text-green-600' :
                    diag.includes('⏱️') ? 'text-yellow-600' :
                    diag.includes('   ') ? 'text-muted-foreground pl-4' :
                    ''
                  }>
                    {diag}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <AlertDescription>
            <p className="mb-2"><strong>What to look for:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>⏱️ Timeouts → Supabase connectivity issue or database too slow</li>
              <li>❌ RLS errors → Need to disable Row Level Security in Supabase</li>
              <li>✓ All checks pass → System working, ready to test league creation</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
