import React from 'react';
import { Shield, Sparkles, Moon, Sun, Monitor } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useThemeStore } from '@/store/themeStore';
import { HipaaComplianceBadge } from '@/features/common/HipaaComplianceBadge';
import { env } from '@/config/env.config';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <PageContainer
      title="System & Clinical Settings"
      description="Manage practice configurations, AI ambient parameters, and HIPAA audit preferences."
      actions={<HipaaComplianceBadge />}
    >
      <div className="max-w-4xl space-y-6">
        {/* Appearance & Theming */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Theme & Appearance</CardTitle>
            <CardDescription>
              Toggle between light, dark, or system preference with instant semantic CSS variable switches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'border-brand bg-brand/10 text-brand font-semibold shadow-xs'
                    : 'border-line bg-surface text-ink hover:bg-surface-subtle'
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'border-brand bg-brand/10 text-brand font-semibold shadow-xs'
                    : 'border-line bg-surface text-ink hover:bg-surface-subtle'
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  theme === 'system'
                    ? 'border-brand bg-brand/10 text-brand font-semibold shadow-xs'
                    : 'border-line bg-surface text-ink hover:bg-surface-subtle'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs">System Match</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Ambient AI Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <CardTitle className="text-base font-bold">Gemini Ambient AI Intelligence</CardTitle>
            </div>
            <CardDescription>
              Configure real-time audio scribing and automatic clinical extraction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Switch
              checked={env.VITE_ENABLE_GEMINI_AMBIENT}
              onCheckedChange={() => {}}
              label="Enable Ambient Clinical Scribe"
              description="Transcribe live provider-patient conversations and automatically synthesize 4-quadrant SOAP drafts."
            />
          </CardContent>
        </Card>

        {/* Security & HIPAA Compliance Audit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <CardTitle className="text-base font-bold">HIPAA Security & Audit Trail</CardTitle>
            </div>
            <CardDescription>
              All read, write, and export operations are logged with cryptographic hashes to the database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-ink-muted">
            <div className="p-3 rounded-lg bg-surface-subtle border border-line flex items-center justify-between">
              <span>Tenant Identifier:</span>
              <span className="font-mono font-semibold text-ink">tenant_auracare_general</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-line flex items-center justify-between">
              <span>Automatic Session Lockout:</span>
              <span className="font-semibold text-ink">15 Minutes Idle</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-line flex items-center justify-between">
              <span>At-Rest Cryptography:</span>
              <span className="font-semibold text-success">AES-256 GCM (HMAC SHA-256)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
