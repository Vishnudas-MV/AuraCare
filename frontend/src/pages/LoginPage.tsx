import React from 'react';
import { Activity } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand text-brand-foreground shadow-lg mb-3">
          <Activity className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          AuraCare EHR
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Cloud-Native Practice Management & Clinical EHR Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};
