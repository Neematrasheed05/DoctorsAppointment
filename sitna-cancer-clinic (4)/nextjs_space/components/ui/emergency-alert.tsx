
"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { getTranslation } from '@/lib/translations';

export function EmergencyAlert() {
  const { language } = useLanguage();

  return (
    <Alert className="border-red-200 bg-red-50 text-red-800 mb-6">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="font-medium">
        {getTranslation('emergency', language)}
      </AlertDescription>
    </Alert>
  );
}
