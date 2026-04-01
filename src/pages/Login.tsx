import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  AlertCircle,
  Mail,
  Lock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LoginBackground } from "../components/auth/LoginBackground";
import { getLoginErrorMessage } from "../lib/login";
import {
  LOGIN_BRAND_SUBTITLE,
  LOGIN_BRAND_TITLE,
  LOGIN_DEMO_ADMIN_EMAIL,
  LOGIN_DEMO_ADMIN_LABEL,
  LOGIN_DEMO_PIN_HINT,
  LOGIN_DEMO_PIN_LABEL,
  LOGIN_DEMO_SECTION_TITLE,
  LOGIN_EMAIL_PLACEHOLDER,
  LOGIN_REDIRECT_PATH,
} from "../constants/loginPage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(LOGIN_REDIRECT_PATH);
    } catch (err: unknown) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans bg-[#0F1419]">
      <LoginBackground />

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-1000">
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-40 bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000" />

          <div className="flex flex-col items-center mb-12 relative z-10">
            <div className="mb-6 bg-gradient-to-br from-primary/20 to-accent/20 p-5 rounded-3xl border border-white/10 shadow-inner backdrop-blur-md transition-transform group-hover:scale-110 duration-700">
              <Dumbbell className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-white text-3xl font-black tracking-[0.15em] text-center uppercase leading-none">
              {LOGIN_BRAND_TITLE}
            </h1>
            <p className="text-blue-200/30 text-[10px] font-black uppercase tracking-[3px] mt-4 text-center">
              {LOGIN_BRAND_SUBTITLE}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full relative z-10 space-y-8"
          >
            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl flex items-center gap-4 text-xs font-bold animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-white/40 text-[9px] font-black uppercase tracking-[3px] ml-2">
                  Identifiant Professionnel
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={LOGIN_EMAIL_PLACEHOLDER}
                    className="h-14 pl-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/10 font-medium focus:ring-primary/40 focus:border-primary/40 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-white/40 text-[9px] font-black uppercase tracking-[3px] ml-2">
                  Code d'Accès Sécurisé
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 pl-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/10 font-medium focus:ring-primary/40 focus:border-primary/40 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 bg-gradient-to-br from-primary to-accent hover:from-primary hover:to-primary text-black font-black tracking-widest uppercase rounded-2xl shadow-2xl shadow-primary/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                  Authentification...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-6 w-6 mr-3" />
                  Entrer dans le Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center space-y-6 relative z-10">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[4px] mb-2">
                {LOGIN_DEMO_SECTION_TITLE}
              </span>
              <div className="grid grid-cols-1 gap-2">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] text-white/40 font-bold group-hover:bg-white/10 transition-colors">
                  <span className="text-primary/60">{LOGIN_DEMO_ADMIN_LABEL}</span>{" "}
                  {LOGIN_DEMO_ADMIN_EMAIL}
                </div>
              </div>
              <span className="text-[10px] text-white/20 font-black mt-2">
                {LOGIN_DEMO_PIN_LABEL}{" "}
                <span className="text-white/40">{LOGIN_DEMO_PIN_HINT}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
