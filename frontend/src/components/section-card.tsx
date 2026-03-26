import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function SectionCard({ title, description, className, children, action }: SectionCardProps) {
  return (
    <Card className={cn("border-white/10 bg-slate-950/55 text-slate-100 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.82)] backdrop-blur-2xl", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
