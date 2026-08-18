import React, { useState, useEffect } from 'react';
import { Mail, User, KeyRound, ArrowRight, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthAPI } from './apiService';

const SIDE_IMAGE = '/heroimage/heroimage2.jpg';

export default function LoginAuth({ onLoginSuccess, onBackToHome }) {
  const [step, setStep] = useState('input'); // 'input', 'register', 'success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInvite, setHasInvite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const pendingInvite = localStorage.getItem('pendingInvite');

    if (pendingInvite &&
        pendingInvite !== '' &&
        pendingInvite !== 'null' &&
        pendingInvite !== 'undefined') {
      setHasInvite(true);
    } else {
      setHasInvite(false);
      if (pendingInvite) {
        localStorage.removeItem('pendingInvite');
      }
    }
  }, []);

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const inviteToken = localStorage.getItem('pendingInvite');
      await AuthAPI.login(email, password, inviteToken);
      const userDetails = await AuthAPI.getCurrentUser();

      if (inviteToken) {
        localStorage.removeItem('pendingInvite');
      }

      setStep('success');

      setTimeout(() => {
        onLoginSuccess({
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          ...userDetails
        });
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const inviteToken = localStorage.getItem('pendingInvite');

      await AuthAPI.register({
        email,
        password,
        firstName,
        lastName,
        inviteToken
      });

      await handleLogin();
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - photo panel */}
      <div className="hidden md:block md:w-1/2 relative">
        <img src={SIDE_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12222B]/60 via-[#12222B]/10 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <span className="text-2xl font-extrabold text-white tracking-tight">TripSync</span>
          <p className="text-white/80 mt-2 max-w-xs">
            One shared plan for routes, tasks, and expenses.
          </p>
        </div>
      </div>

      {/* Right - form panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-5 sm:p-8 md:p-12 bg-white">
        <div className="max-w-sm w-full">
          {step !== 'success' && onBackToHome && (
            <button
              onClick={onBackToHome}
              className="mb-6 sm:mb-8 flex items-center gap-2 text-sm text-[#12222B]/60 hover:text-[#12222B] font-medium transition"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
          )}

          {step === 'input' && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12222B] tracking-tight mb-2">
                {isRegistering ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="text-sm sm:text-base text-[#12222B]/50 mb-6 sm:mb-8">
                {isRegistering ? 'Fill in your details to get started' : 'Sign in to continue planning'}
              </p>

              {hasInvite && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#FF5A36]/8 rounded-xl text-sm font-medium text-[#FF5A36] mb-6">
                  <CheckCircle size={16} />
                  You have a trip invite — you'll be added after {isRegistering ? 'registration' : 'login'}.
                </div>
              )}

              <div className="space-y-4">
                {isRegistering && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#12222B] mb-1.5">
                        First name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12222B]/30" size={18} />
                        <input
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-[#12222B]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/25 focus:border-[#FF5A36] transition text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#12222B] mb-1.5">
                        Last name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12222B]/30" size={18} />
                        <input
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-[#12222B]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/25 focus:border-[#FF5A36] transition text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#12222B] mb-1.5">
                    Email Id
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12222B]/30" size={18} />
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
                      className="w-full pl-10 pr-4 py-3 border border-[#12222B]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/25 focus:border-[#FF5A36] transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#12222B] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12222B]/30" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
                      className="w-full pl-10 pr-11 py-3 border border-[#12222B]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/25 focus:border-[#FF5A36] transition text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#12222B]/30 hover:text-[#12222B]/60 transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  onClick={isRegistering ? handleRegister : handleLogin}
                  disabled={loading}
                  className="w-full bg-[#FF5A36] text-white py-3.5 rounded-xl font-bold hover:bg-[#e84a28] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isRegistering ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {isRegistering ? 'Create account' : 'Login'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-[#12222B]/50 text-center mt-8">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={toggleMode}
                  className="text-[#FF5A36] hover:text-[#e84a28] font-bold"
                >
                  {isRegistering ? 'Sign in' : 'Register Now'}
                </button>
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF5A36]/10 rounded-full mb-6">
                <CheckCircle size={32} className="text-[#FF5A36]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#12222B] tracking-tight mb-2">
                {isRegistering ? 'Account created' : 'Welcome back'}
              </h2>
              <p className="text-[#12222B]/50 mb-8">
                {hasInvite ? 'Joining your trip...' : 'Logging you in...'}
              </p>
              <div className="w-8 h-8 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}