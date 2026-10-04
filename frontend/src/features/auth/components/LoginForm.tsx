import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../auth.schemas';
import { useLoginMutation } from '../useAuthMutation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export const LoginForm: React.FC = () => {
  const { mutate: login, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'sjenkins@auracarehealth.org',
      password: 'password123',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-line">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold">Sign In to AuraCare</CardTitle>
        <CardDescription>
          Access HIPAA Tier-3 Encrypted Clinical Portal
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            placeholder="provider@hospital.org"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-line text-brand focus:ring-brand" defaultChecked />
              <span>Remember session</span>
            </label>
            <a href="#forgot" className="text-brand hover:underline">
              Reset credentials?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isPending}
          >
            Authenticate Clinician
          </Button>

          <p className="text-[11px] text-ink-muted text-center pt-2">
            Protected by multi-tenant cryptographic isolation & audit trail.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
