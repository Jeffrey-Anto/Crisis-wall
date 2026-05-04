import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { Lock, Mail } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { BrandLogo } from "../components/BrandLogo";

export function Signup() {
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // BUG-02: Redirect already-authenticated users away from the signup page
  if (!isLoading && user) return <Navigate to="/" replace />;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      // Alert the user to check email if confirmation is enabled, otherwise navigate
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <BrandLogo className="h-12 w-12 rounded-xl" iconClassName="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100 tracking-tight">
          Request Clearance
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Create your Crisis Intelligence account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 py-8 px-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-800 backdrop-blur-xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-sm text-red-400 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-slate-950 border border-slate-800 rounded-lg py-2.5 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="agent@crisiswall.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-slate-950 border border-slate-800 rounded-lg py-2.5 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]" disabled={loading}>
                {loading ? "Processing Request..." : "Request Access"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have clearance?{" "}
              <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
