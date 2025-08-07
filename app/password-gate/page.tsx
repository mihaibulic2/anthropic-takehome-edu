'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/toast';

export default function PasswordGate() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/password-gate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        toast({ 
          type: 'error', 
          description: 'Invalid password. Please try again.' 
        });
        setPassword('');
      }
    } catch (error) {
      toast({ 
        type: 'error', 
        description: 'Something went wrong. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-8 flex flex-col p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Prototype Access
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Enter the password to access this prototype
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Checking...' : 'Access Prototype'}
          </Button>
        </form>
      </div>
    </div>
  );
}