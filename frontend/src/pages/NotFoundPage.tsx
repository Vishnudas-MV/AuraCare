import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold text-ink">404 - Clinical Resource Not Found</h1>
      <p className="text-sm text-ink-muted mt-2 max-w-md">
        The requested patient record, encounter, or clinical page could not be located in this healthcare tenant.
      </p>
      <Button
        variant="primary"
        size="md"
        className="mt-6"
        leftIcon={<Home className="h-4 w-4" />}
        onClick={() => navigate('/dashboard')}
      >
        Return to Clinical Dashboard
      </Button>
    </div>
  );
};
