import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Store, Package, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { authenticateUser, User } from "../lib/auth";

interface LoginPageProps {
  userType: "shopper" | "retailer" | "brand";
  onBack: () => void;
  onLogin: (user: User) => void;
}

export function LoginPage({ userType, onBack, onLogin }: LoginPageProps) {
  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';
    
    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // For testing: Allow sign-in if both fields are empty
    if (!email.trim() && !password.trim()) {
      setTimeout(() => {
        setIsLoading(false);
        // Create a dummy user based on userType for testing
        const dummyUser: User = {
          id: `test-${userType}-${Date.now()}`,
          email: "",
          password: "",
          name: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
          type: userType,
          ...(userType === "retailer" && { storeName: "Test Store" }),
          ...(userType === "brand" && { brandName: "Test Brand" }),
        };
        onLogin(dummyUser);
      }, 500);
      return;
    }
    
    // Authenticate
    const user = authenticateUser(email, password, userType);
    
    setTimeout(() => {
      setIsLoading(false);
      if (user) {
        onLogin(user);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }, 500);
  };

  const getConfig = () => {
    switch (userType) {
      case "shopper":
        return {
          icon: ShoppingCart,
          title: "Shopper Login",
          gradient: "from-cyan-500 to-blue-600",
          placeholder: "john@example.com",
        };
      case "retailer":
        return {
          icon: Store,
          title: "Retailer Login",
          gradient: "from-purple-500 to-pink-600",
          placeholder: "retailer@mupod.com",
        };
      case "brand":
        return {
          icon: Package,
          title: "Brand Login",
          gradient: "from-orange-500 to-red-600",
          placeholder: "coke@brand.com",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 overflow-hidden" style={{ touchAction: 'none' }}>
      <div className="w-full max-w-md bg-gradient-to-br from-black via-cyan-950 to-black rounded-3xl shadow-2xl shadow-cyan-500/30 border-2 border-cyan-500 overflow-hidden" style={{ height: '812px' }}>
        <div className="h-full flex flex-col p-6 overflow-hidden">
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-cyan-400 hover:bg-cyan-500/20 mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Login Card */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Icon */}
            <div className={`bg-gradient-to-br ${config.gradient} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-10`}>
              <Icon className="h-8 w-8 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-white text-2xl text-center mb-4">
              {config.title}
            </h2>
            <p className="text-cyan-400 text-center mb-12 text-sm">
              Sign in to access {userType === "shopper" ? "your shopping" : userType === "retailer" ? "your store" : "your brand"} dashboard
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-8">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-cyan-400">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={config.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-zinc-900 border-cyan-500/30 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-cyan-400">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-14 bg-zinc-900 border-cyan-500/30 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 flex items-center justify-end"
                    style={{ padding: '0.5rem' }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white`}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

