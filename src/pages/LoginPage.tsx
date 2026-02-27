import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-nail-studio.jpg";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginAsManager } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Hero Image */}
      <div className="relative h-[35vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Nail Studio elegante" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <h1 className="text-3xl font-display font-bold text-primary-foreground drop-shadow-lg">
            Nail Studio
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1 drop-shadow">
            Il tuo spazio di bellezza
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex-1 px-6 pt-6 -mt-4 bg-background rounded-t-3xl relative z-10"
      >
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
          {isRegister ? "Crea il tuo account" : "Bentornata! ✨"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <Input
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-4 h-12 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-12 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground font-semibold text-base shadow-elevated hover:opacity-90 transition-opacity"
          >
            {isRegister ? "Registrati" : "Accedi"}
          </Button>
        </form>

        {/* Google Login */}
        <div className="mt-4">
          <div className="relative flex items-center my-4">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-xs text-muted-foreground">oppure</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <Button
            variant="outline"
            onClick={() => login("google", "")}
            className="w-full h-12 rounded-xl border-border font-medium gap-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continua con Google
          </Button>
        </div>

        {/* Toggle + Manager */}
        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-muted-foreground"
          >
            {isRegister ? "Hai già un account? " : "Non hai un account? "}
            <span className="text-primary font-medium">
              {isRegister ? "Accedi" : "Registrati"}
            </span>
          </button>
          
          <div>
            <button
              onClick={loginAsManager}
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              Accedi come gestore
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
