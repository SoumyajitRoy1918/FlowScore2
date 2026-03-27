import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AuthBackground } from "@/components/auth-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/context/app-context";
import type { AuthMessage } from "@/types/app";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, login, register } = useAppContext();
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState<AuthMessage>({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: false });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (session) {
      navigate("/transactions", { replace: true });
    }
  }, [navigate, session]);

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create your account"), [mode]);

  function showMessage(text: string, type: AuthMessage["type"]) {
    setMessage({ text, type });
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage({ text: "", type: "" });

    try {
      await login(loginForm);
      showMessage("Signed in successfully. Redirecting...", "success");
      window.setTimeout(() => navigate("/transactions", { replace: true }), 500);
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Unable to sign in.";
      showMessage(nextMessage, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage({ text: "", type: "" });

    if (registerForm.fullName.trim().length < 2) {
      showMessage("Enter your full name.", "error");
      setBusy(false);
      return;
    }

    if (registerForm.password.length < 8) {
      showMessage("Use at least 8 characters for your password.", "error");
      setBusy(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      showMessage("Passwords do not match.", "error");
      setBusy(false);
      return;
    }

    try {
      await register({
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
      });
      showMessage("Account created successfully. Redirecting...", "success");
      window.setTimeout(() => navigate("/transactions", { replace: true }), 500);
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Unable to create account.";
      showMessage(nextMessage, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <AuthBackground />
      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,460px)] lg:px-10">
        <section className="flex flex-col justify-between gap-8 py-4">
          <a href="/" className="w-fit font-[Manrope] text-sm font-extrabold uppercase tracking-[0.32em] text-white">
            FlowScore
          </a>

          <div className="max-w-3xl space-y-6">
            <Badge className="rounded-full border-white/10 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-200">
              Multi-Dimensional Trust Index
            </Badge>
            <div className="space-y-4">
              <h1 className="font-[Manrope] text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Financial trust, explained with clarity.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Sign in to review transactions, run semantic classification, and generate deterministic trust scoring from your financial behavior data.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-2xl">
              <CardHeader>
                <Badge className="w-fit rounded-full border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-200">
                  Explainable by design
                </Badge>
                <CardTitle className="text-white">No black-box scoring</CardTitle>
                <CardDescription className="text-slate-300">
                  Every dimension is traceable, formula-based, and ready for judge review.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-2xl">
              <CardHeader>
                <Badge className="w-fit rounded-full border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-200">
                  Privacy-first workflow
                </Badge>
                <CardTitle className="text-white">AI is semantic only</CardTitle>
                <CardDescription className="text-slate-300">
                  Classification supports the system, but the score itself stays deterministic.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="flex items-center lg:justify-end">
          <Card className="w-full border-white/10 bg-slate-950/70 text-white shadow-[0_30px_120px_-32px_rgba(15,23,42,0.8)] backdrop-blur-2xl">
            <CardHeader className="space-y-3">
              <Badge className="w-fit rounded-full border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-200">
                Secure access
              </Badge>
              <div className="space-y-1">
                <CardTitle className="text-3xl text-white">{title}</CardTitle>
                <CardDescription className="text-slate-300">
                  Use your email and password to sign in, or create a new account to get started.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)}>
                <TabsList className="grid w-full grid-cols-2 border-white/10 bg-white/5 text-slate-400">
                  <TabsTrigger
                    value="login"
                    className="text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-950"
                  >
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="text-slate-300 data-[state=active]:bg-white data-[state=active]:text-slate-950"
                  >
                    Create account
                  </TabsTrigger>
                </TabsList>

                {message.text ? (
                  <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
                    {message.text}
                  </div>
                ) : null}

                <TabsContent value="login">
                  <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Email address</label>
                      <Input
                        type="email"
                        placeholder="name@email.com"
                        value={loginForm.email}
                        onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Password</label>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={loginForm.remember}
                          onChange={(event) => setLoginForm((current) => ({ ...current, remember: event.target.checked }))}
                          className="size-4 rounded border border-white/15 bg-white/5"
                        />
                        Remember this browser
                      </label>
                      <span className="text-slate-400">SQL-backed auth</span>
                    </div>
                    <Button type="submit" size="lg" className="w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100" disabled={busy}>
                      {busy ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Full name</label>
                      <Input
                        type="text"
                        placeholder="Your Name"
                        value={registerForm.fullName}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Email address</label>
                      <Input
                        type="email"
                        placeholder="name@email.com"
                        value={registerForm.email}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Password</label>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          value={registerForm.password}
                          onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                          className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Confirm password</label>
                        <Input
                          type="password"
                          placeholder="Re-enter your password"
                          value={registerForm.confirmPassword}
                          onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                          className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100" disabled={busy}>
                      {busy ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="mt-6 text-sm leading-7 text-slate-400">
                Accounts are created and verified through the backend API, with session details cached in this browser for the current device.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

