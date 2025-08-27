'use client';

import { useEffect } from 'react';

export function DatabaseInitializer() {
  useEffect(() => {
    // Initialize database on app load
    const initializeDatabase = async () => {
      try {
        console.log('🔧 Initializing Next.js database...');
        const response = await fetch('/api/init', {
          method: 'POST',
        });
        
        if (!response.ok) {
          console.error('❌ Database initialization failed:', response.statusText);
          return;
        }
        
        const result = await response.json();
        console.log('✅ Database initialized successfully:', result);
      } catch (error) {
        console.error('❌ Database initialization error:', error);
      }
    };

    initializeDatabase();
  }, []);

  return null; // This component doesn't render anything
}
