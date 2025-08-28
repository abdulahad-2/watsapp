import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const SupabaseTest = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test connection by fetching users (requires RLS to allow)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (error) throw error;
        
        setSuccess(true);
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
  if (error) return <div className="text-red-500">Error: {error}</div>;
  
  return (
    <div className="p-4 bg-green-100 text-green-800 rounded">
      ✅ Successfully connected to Supabase!
    </div>
  );
};

export default SupabaseTest;
