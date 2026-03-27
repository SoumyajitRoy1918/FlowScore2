import { UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/context/app-context";

export default function ProfilePage() {
  const { profile, session, logout, gmailAuthenticated } = useAppContext();

  if (!gmailAuthenticated) {
    return (
      <AppShell
        eyebrow="Profile"
        title="Account details for the current user"
        subtitle="This page shows the registered account details currently associated with your session."
        userName={session?.fullName || "Signed in"}
        onSignOut={logout}
      >
        <SectionCard title="Authentication required" description="Gmail authentication is required to access profile details.">
          <div className="flex gap-3">
            <Button onClick={() => (window.location.href = "/transactions")} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
              Go to Transactions
            </Button>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Profile"
      title="Account details for the current user"
      subtitle="This page shows the registered account details currently associated with your session."
      userName={session?.fullName || "Signed in"}
      onSignOut={logout}
    >
      <SectionCard
        title="Account Summary"
        description="Loaded from the backend-backed account record cached for the signed-in user."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/10 bg-white/5">
            <CardContent className="px-5 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Name</div>
              <div className="mt-3 text-xl font-bold text-white">{profile?.fullName || "Unavailable"}</div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5">
            <CardContent className="px-5 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Email</div>
              <div className="mt-3 text-xl font-bold text-white">{profile?.email || "Unavailable"}</div>
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      <SectionCard
        title="Profile Summary"
        description="Full registered account attributes for the signed-in user."
      >
        <div className="space-y-3">
          {[
            ["Account ID", profile?.accountId || session?.accountId || "Unavailable"],
            ["Linked User ID", profile?.linkedUserId || session?.linkedUserId || "Unavailable"],
            ["Created At", profile?.createdAt || "Unavailable"],
            ["Last Login At", profile?.lastLoginAt || session?.signedInAt || "Unavailable"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <UserRound className="size-4" />
                {label}
              </div>
              <Badge variant="outline" className="w-fit rounded-full border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                {value}
              </Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}

