import type { ReactNode } from "react";
import { BarChart3, Database, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import MagneticDock from "@/components/ui/magnetic-dock";
import { BackgroundPathsBackdrop } from "@/components/ui/background-paths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  userName: string;
  onSignOut: () => void;
  children: ReactNode;
}

const links = [
  { to: "/transactions", label: "Transactions", icon: Database },
  { to: "/analysis", label: "Analysis", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ eyebrow, title, subtitle, userName, onSignOut, children }: AppShellProps) {
  return (
    <div className="dark relative min-h-screen bg-slate-950 text-slate-100">
      <BackgroundPathsBackdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="mb-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="flex items-center gap-4 lg:justify-self-start">
              <Link to="/" className="font-[Manrope] text-sm font-extrabold uppercase tracking-[0.28em] text-white">
                FlowScore
              </Link>
            </div>
            <div className="flex justify-center">
              <MagneticDock items={links} />
            </div>
            <div className="flex items-center gap-3 lg:justify-self-end">
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                {userName}
              </Badge>
              <Button variant="outline" onClick={onSignOut} className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white">
                Sign out
              </Button>
            </div>
          </div>

          <div className="mt-8 max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
            <h1 className="font-[Manrope] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
          </div>
        </header>

        <main className="grid flex-1 gap-6 md:grid-cols-2">{children}</main>
      </div>
    </div>
  );
}
