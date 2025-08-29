import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import React from 'react';

export default function TestConnection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test connection by fetching users (requires RLS to allow)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (error) throw error;
        
        setData(data);
      } catch (err) {
        console.error('Supabase test error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) return <div>Testing Supabase connection...</div>;
  
  return (
    <div className="p-8">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold">Connection Error</h3>
          <p>{error}</p>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm">
              <span className="font-semibold">Supabase URL:</span> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Successfully connected to Supabase!
          <pre className="mt-2 p-2 bg-white rounded overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
