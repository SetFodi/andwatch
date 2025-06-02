// app/auth/signup/page.tsx
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (passwordStrength < 2) {
      setError("Please use a stronger password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/auth/signin?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-700";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (!password) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    if (passwordStrength === 4) return "Strong";
    return "Very weak";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl animate-blob-slow"></div>
        <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-blob-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-violet-800/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Card with glassmorphism effect */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-md"></div>
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/40 border border-gray-800/70 overflow-hidden p-8">
            {/* Header with logo and animation */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-block group">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-600/40 to-purple-600/40 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md"></div>
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-500 group-hover:text-indigo-400 transition-all duration-500 relative z-10" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-2 relative z-10">
                    <span className="text-2xl font-light tracking-wide relative">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-fuchsia-300 transition-all duration-500 font-normal">and</span>
                      <span className="text-white group-hover:text-gray-200 transition-all duration-500">watch</span>
                    </span>
                  </div>
                </div>
              </Link>
              <h1 className="mt-4 text-2xl font-light tracking-wide text-white">Create Your Account</h1>
              <p className="mt-1 text-sm text-gray-400">Start tracking your entertainment journey</p>
            </div>
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 overflow-hidden rounded-lg">
                <div className="relative p-4 bg-rose-900/20 text-rose-200 text-sm border border-rose-800/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-rose-600"></div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full py-3 bg-gray-800/80 border border-gray-700/70 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 rounded-lg shadow-sm text-white placeholder-gray-500 text-sm transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={handlePasswordChange}
                    className="pl-10 w-full py-3 bg-gray-800/80 border border-gray-700/70 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 rounded-lg shadow-sm text-white placeholder-gray-500 text-sm transition-all duration-300"
                                       placeholder="At least 6 characters"
                  />
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`} 
                          style={{ width: `${passwordStrength * 25}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-400 min-w-[45px] text-right">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use 8+ characters with a mix of letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 w-full py-3 bg-gray-800/80 border ${
                      confirmPassword && password !== confirmPassword
                        ? "border-rose-500/70 focus:border-rose-500/70 focus:ring-rose-500/70"
                        : "border-gray-700/70 focus:border-indigo-500/70 focus:ring-indigo-500/70"
                    } focus:ring-1 rounded-lg shadow-sm text-white placeholder-gray-500 text-sm transition-all duration-300`}
                    placeholder="Confirm your password"
                  />
                  
                  {/* Password match indicator */}
                  {confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {password === confirmPassword ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-indigo-500/30 transition-all duration-300 relative group overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-500"></span>
                  <span className="relative flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </span>
                </button>
              </div>
            </form>
            
            {/* Terms of service */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 px-6">
                By creating an account, you agree to our <Link href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link> and <Link href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>
              </p>
            </div>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright text */}
        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} AndWatch. All rights reserved.
        </p>
      </div>
    </div>
  );
}

