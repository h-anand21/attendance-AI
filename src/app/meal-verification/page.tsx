
'use client';

import { AppLayout } from '@/components/app-layout';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MealVerificationClient = dynamic(
  () => import('./meal-verification-client').then(mod => mod.MealVerificationClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function MealVerificationPage() {
  return (
    <AppLayout pageTitle="Mid-Day Meal Verification">
      <MealVerificationClient />
    </AppLayout>
  );
}
