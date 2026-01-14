import { useState } from "react";
import { ArrowLeft, Store, Package, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginProps {
  userType: "retailer" | "brand";
  onBack: () => void;
  onLogin: () => void;
}

export function Login({ userType, onBack, onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  const Icon = userType === "retailer" ? Store : Package;
  const title = userType === "retailer" ? "Retailer" : "Brand";
  const gradient = userType === "retailer" 
    ? "from-purple-500 to-purple-600" 
    : "from-pink-500 to-pink-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-white/20 mb-4 sm:mb-6 touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Button>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Icon */}
          <div className={`bg-gradient-to-br ${gradient} w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
            <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-gray-800 text-xl sm:text-2xl text-center mb-2">
            {title} Login
          </h2>
          <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">
            Sign in to access your dashboard
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12 touch-manipulation"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2 touch-manipulation"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
                <input type="checkbox" className="rounded w-4 h-4" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-purple-600 hover:text-purple-700 touch-manipulation">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 bg-gradient-to-r ${gradient} hover:opacity-90 text-white touch-manipulation`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-purple-600 hover:text-purple-700 touch-manipulation">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}