/**
 * src/components/auth/AuthCard.tsx
 *
 * Shared centered-card shell for the login/signup/forgot-password/
 * reset-password pages: full-screen backdrop, white card, icon-in-circle
 * header with a title.
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/PageLayout";
import { Card, CardBody } from "@/components/ui/card";

export interface AuthCardProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

export function AuthCard({ icon: Icon, title, children }: AuthCardProps) {
  return (
    <AppShell className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          <div className="mb-6 flex flex-col items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy">
              <Icon size={18} className="text-cream" aria-hidden="true" />
            </span>
            <h1 className="font-display text-3xl font-bold text-navy">{title}</h1>
          </div>
          {children}
        </CardBody>
      </Card>
    </AppShell>
  );
}
