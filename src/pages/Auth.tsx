import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState("no");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Check your email",
        description: "We sent you a password reset link.",
      });
      setForgotPassword(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // If admin selected and signup succeeded, verify the code
        if (isAdmin === "yes" && adminCode && data.session) {
          const { error: adminError } = await supabase.functions.invoke("verify-admin-code", {
            body: { admin_code: adminCode },
          });
          if (adminError) {
            toast({
              title: "Admin code invalid",
              description: "Account created as regular user. The admin code was incorrect.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Admin account created",
              description: "You've been registered as an admin.",
            });
          }
        }

        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 animate-pulse-glow">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-heading text-foreground">
            {forgotPassword ? "Reset password" : isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {forgotPassword ? "Enter your email to receive a reset link" : isLogin ? "Sign in to continue chatting" : "Join the conversation"}
          </p>
        </div>

        {forgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-card border-border focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <button onClick={() => setForgotPassword(false)} className="text-primary hover:underline font-medium">
                Back to sign in
              </button>
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground/80">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required={!isLogin}
                      className="bg-card border-border focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Register as Admin?</Label>
                    <Select value={isAdmin} onValueChange={setIsAdmin}>
                      <SelectTrigger className="bg-card border-border focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isAdmin === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="adminCode" className="text-foreground/80">Admin Code</Label>
                      <Input
                        id="adminCode"
                        type="password"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        placeholder="Enter the admin registration code"
                        required
                        className="bg-card border-border focus:ring-primary"
                      />
                    </div>
                  )}
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-card border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-card border-border focus:ring-primary"
                />
              </div>
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
