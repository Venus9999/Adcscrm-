import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  FileCheck2,
  UserPlus,
  Building2,
  Phone,
  Globe,
  Sparkles,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const LoginScreen: React.FC = () => {
  const {
    login,
    registerClient,
    companies,
    requestPasswordReset,
    verifyOtpAndResetPassword,
    crmBranding,
  } = useCRM();

  // Auth Mode: Login vs Client Self-Registration
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client Registration state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regNationality, setRegNationality] = useState('United Arab Emirates');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regPassport, setRegPassport] = useState('');
  const [regCompanyId, setRegCompanyId] = useState(companies[0]?.id || '');
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: OTP, 3: New Pass, 4: Success
  const [resetEmail, setResetEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setLoginError(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setLoginError(err.message || 'An unexpected error occurred during login.');
    }
  };

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim()) {
      setRegError('Please provide your full legal name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please provide a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await registerClient({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim() || '+971 50 000 0000',
        nationality: regNationality,
        companyName: regCompanyName.trim() || undefined,
        passportNo: regPassport.trim() || undefined,
        companyId: regCompanyId || undefined,
      });

      setIsRegistering(false);
      if (!res.success) {
        setRegError(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setIsRegistering(false);
      setRegError(err?.message || 'An error occurred during registration.');
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    const res = requestPasswordReset(resetEmail);
    if (res.success && res.otpCode) {
      setGeneratedOtp(res.otpCode);
      setResetStep(2);
    } else {
      setResetError(res.error || 'Failed to request reset OTP.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (inputOtp.trim() !== generatedOtp.trim()) {
      setResetError('Invalid OTP code. Please enter the 6-digit code generated for this session.');
      return;
    }

    setResetStep(3);
  };

  // Step 3: Set New Password
  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify.');
      return;
    }

    const res = verifyOtpAndResetPassword(resetEmail, inputOtp, newPassword);
    if (res.success) {
      setResetSuccessMessage(`Password updated successfully for ${resetEmail}.`);
      setResetStep(4);
      setPassword(newPassword);
      setEmail(resetEmail);
    } else {
      setResetError(res.error || 'Failed to update password.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Brand & Overview (Visual Column) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/60 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            {/* Logo and Brand Title */}
            <div className="flex items-center gap-3.5">
              {crmBranding.logoUrl ? (
                <div className="h-14 px-3 py-2 bg-white rounded-2xl flex items-center justify-center ring-2 ring-white/30 shadow-xl shadow-blue-500/20 shrink-0">
                  <img
                    src={crmBranding.logoUrl}
                    alt={crmBranding.name}
                    className="h-9 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/30">
                  {crmBranding.shortName ? crmBranding.shortName[0] : 'A'}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white tracking-tight">{crmBranding.name}</h1>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
                  {crmBranding.tagline}
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="pt-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Role-Based Access Security</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Master governance, branch operations, PRO document processing, and client investor portal.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">UAE Visa & ICP / GDRFA Clearance</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    16-stage pipeline, automated status emails, document vault & multi-currency escrow accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* UAE Clearance Notice */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>UAE Corporate Clearance & PRO Platform</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              256-Bit SSL Active
            </span>
          </div>
        </div>

        {/* Right Side: Login / Registration Form (Interactive Column) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-slate-900">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Client Registration</span>
              </button>
            </div>

            {authMode === 'login' ? (
              <div>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Workspace</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your registered corporate credentials to access the workspace.
                  </p>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div className="flex-1">
                      <p className="font-semibold">{loginError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Corporate Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Password / Security PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email || '');
                          setResetStep(1);
                          setResetError(null);
                          setShowForgotModal(true);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium tracking-wide"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-400 font-medium">Keep me signed in</span>
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to CRM Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Switch to Client Registration CTA */}
                  <div className="pt-3 border-t border-slate-800/80 text-center">
                    <p className="text-xs text-slate-400">
                      New Investor, Business Owner, or Client?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setRegError(null);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors cursor-pointer ml-1 inline-flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register as Client</span>
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              /* Client Self-Registration Form */
              <div>
                <div className="mb-5 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white tracking-tight">Client Account Setup</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                        SELF-SERVICE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Register to apply for UAE visas, company setup, tax clearance, and track services.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const suffix = Math.floor(100 + Math.random() * 900);
                      setRegFullName(`Investor Tariq Al-Mansoor`);
                      setRegEmail(`investor${suffix}@dubai-ventures.ae`);
                      setRegPassword('Client@2026!');
                      setRegPhone('+971 50 888 7766');
                      setRegNationality('United Arab Emirates');
                      setRegCompanyName('Al-Mansoor Global Holdings');
                      setRegPassport(`N8899${suffix}`);
                      setRegError(null);
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Autofill Sample</span>
                  </button>
                </div>

                {/* Error Banner */}
                {regError && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div className="flex-1">
                      <p className="font-semibold">{regError}</p>
                      {regError.includes('already exists') && (
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(regEmail);
                            setAuthMode('login');
                            setLoginError(null);
                            setRegError(null);
                          }}
                          className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Click here to Sign In with {regEmail}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleClientRegister} className="space-y-3.5">
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Alexander Wright"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="client@investor.com"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Password & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-300">
                          Portal Password *
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Min. 6 chars</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create strong password"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                          title={showRegPassword ? 'Hide password' : 'Show password'}
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Nationality & Company / Entity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nationality
                      </label>
                      <select
                        value={regNationality}
                        onChange={(e) => setRegNationality(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                      >
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Other">Other Global</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Company / Entity Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={regCompanyName}
                        onChange={(e) => setRegCompanyName(e.target.value)}
                        placeholder="e.g. Apex Global FZ-LLC"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Passport / Trade License Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Passport / Emirates ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={regPassport}
                        onChange={(e) => setRegPassport(e.target.value)}
                        placeholder="e.g. N12345678"
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all font-medium uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Preferred Branch / Entity
                      </label>
                      <select
                        value={regCompanyId || companies[0]?.id || ''}
                        onChange={(e) => setRegCompanyId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                      >
                        {companies.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Register CTA */}
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-3"
                  >
                    {isRegistering ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating Client Profile...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Register & Enter Client Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Switch to Sign In CTA */}
                  <div className="pt-3 border-t border-slate-800/80 text-center">
                    <p className="text-xs text-slate-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setLoginError(null);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold underline transition-colors cursor-pointer ml-1 inline-flex items-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Sign In here</span>
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Enterprise Security Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium text-slate-400">Enterprise Encrypted Authentication</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">ADCS Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                  <p className="text-[11px] text-slate-400">Step {resetStep} of 3 • Secure Recovery</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Error Message inside Modal */}
            {resetError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <p>{resetError}</p>
              </div>
            )}

            {/* Step 1: Enter Email */}
            {resetStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter your registered CRM account email address. We will generate a secure 6-digit verification code.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. your registered corporate email"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Generate Reset Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-300">Generated OTP Security Code:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedOtp)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedOtp ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                    <span className="text-xl font-mono font-black tracking-widest text-emerald-400">
                      {generatedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInputOtp(generatedOtp)}
                      className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold"
                    >
                      Auto-Fill
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Simulated verification code issued to: <span className="text-slate-200 font-semibold">{resetEmail}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    placeholder="Enter code"
                    className="w-full text-center tracking-widest text-lg font-mono px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-blue-500 font-bold"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {resetStep === 3 && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    New Secure Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(2)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save New Password</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {resetStep === 4 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Password Updated Successfully</h4>
                  <p className="text-xs text-slate-400 mt-1">{resetSuccessMessage}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    // auto login with new password
                    login(resetEmail, newPassword);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In Immediately</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
