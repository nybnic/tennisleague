import { AUTH_SYSTEM, isNewAuthSystem } from '@/config/authSystem';
import { supabaseAuth } from '@/integrations/supabase/authClient';

export function DebugAuthPage() {
  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">🔧 Auth System Debug</h1>

      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-lg">Environment</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>AUTH_SYSTEM:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{AUTH_SYSTEM}</code>
          </p>
          <p>
            <strong>Is New Auth System:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{isNewAuthSystem ? 'true' : 'false'}</code>
          </p>
          <p>
            <strong>Supabase URL:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
              {import.meta.env.VITE_SUPABASE_URL_AUTH ? '✅ Configured' : '❌ Missing'}
            </code>
          </p>
          <p>
            <strong>Supabase Anon Key:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
              {import.meta.env.VITE_SUPABASE_ANON_KEY_AUTH ? '✅ Configured' : '❌ Missing'}
            </code>
          </p>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-lg">Supabase Auth Client</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Client Created:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
              {supabaseAuth ? '✅ Yes' : '❌ No'}
            </code>
          </p>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-lg">What to Do Next</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If all checkmarks show ✅, environment is configured correctly</li>
          <li>If you see ❌, check your <code>.env.local.auth</code> file</li>
          <li>Restart the dev server after updating env variables</li>
          <li>Go to <code>/auth/sign-in</code> to test magic link authentication</li>
        </ul>
      </section>
    </div>
  );
}
