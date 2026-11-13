import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Heart, Info, LockKeyhole, Mail, MessageCircle, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Logo } from '../components/UI';
import { useApp } from '../store';
import { supabase } from '../lib/supabase';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const { session, backendConfigured, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from || '/';
  const usernameLooksValid = /^[A-Za-z0-9_.]{3,24}$/.test(username);
  const maxDay = birthMonth && birthYear
    ? new Date(Number(birthYear), Number(birthMonth), 0).getDate()
    : 31;
  const birthDays = Array.from({ length: maxDay }, (_, index) => index + 1);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMode(location.pathname === '/signup' ? 'signup' : 'signin');
  }, [location.pathname]);

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setPendingConfirmationEmail('');
    navigate(nextMode === 'signup' ? '/signup' : '/login');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setPendingConfirmationEmail('');
    if (!supabase) {
      setError('Chatra sign-in is temporarily unavailable. Please try again later.');
      return;
    }
    if (mode === 'signup') {
      if (!email.includes('@')) {
        setError('Mobile-number signup is not enabled for this Chatra project yet. Please use an email address.');
        return;
      }
      if (!/^[A-Za-z0-9_.]{3,24}$/.test(username)) {
        setError('Username must be 3–24 letters, numbers, underscores, or dots.');
        return;
      }
      if (!birthMonth || !birthDay || !birthYear) {
        setError('Choose your birthday to continue.');
        return;
      }
      const birthday = new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay));
      const ageLimit = new Date();
      ageLimit.setFullYear(ageLimit.getFullYear() - 13);
      if (birthday > ageLimit || birthday.getFullYear() !== Number(birthYear)) {
        setError('You need to be at least 13 to create a Chatra account.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const birthday = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username, display_name: name.trim() || username, birthday },
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          navigate(destination, { replace: true });
        } else {
          setPendingConfirmationEmail(email.trim());
          setMessage('Your account is ready. Confirm your email to finish signing in.');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) {
          if (authError.code === 'email_not_confirmed' || authError.message.toLowerCase().includes('email not confirmed')) {
            setPendingConfirmationEmail(email.trim());
            throw new Error('Please confirm your email address before signing in.');
          }
          throw authError;
        }
        navigate(destination, { replace: true });
      }
    } catch (cause) {
      const authMessage = cause instanceof Error ? cause.message : 'Authentication failed. Please try again.';
      if (/rate.?limit|email.*limit/i.test(authMessage)) {
        setError('Chatra has temporarily hit its email sending limit. Wait before trying again; the project’s default email service allows very few messages.');
      } else {
        setError(authMessage);
      }
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async () => {
    if (!supabase || !pendingConfirmationEmail) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: pendingConfirmationEmail });
      if (resendError) throw resendError;
      setMessage('A fresh confirmation link is on its way. Check your inbox and spam folder.');
    } catch (cause) {
      const authMessage = cause instanceof Error ? cause.message : 'Could not resend the confirmation email.';
      setError(/rate.?limit|email.*limit/i.test(authMessage)
        ? 'Chatra has temporarily hit its email sending limit. Wait before requesting another confirmation email.'
        : authMessage);
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'signup') {
    return (
      <main className="chatra-signup-page">
        <header className="chatra-signup-topbar">
          <Link to="/login" aria-label="Back to Chatra sign in"><ArrowLeft size={20} /><Logo /></Link>
          <span>A place for your people</span>
        </header>
        <section className="chatra-signup-content" aria-labelledby="signup-title">
          <div className="chatra-signup-intro">
            <span className="signup-kicker">YOUR COMMUNITY STARTS HERE</span>
            <h1 id="signup-title">Create your Chatra account</h1>
            <p>Join the conversations, creators, and communities you care about.</p>
          </div>

          {session ? (
            <div className="signup-connected"><span><ShieldCheck size={24} /></span><strong>You’re already signed in</strong><p>Your Chatra account is ready.</p><Link className="signup-submit" to="/">Continue to Chatra <ArrowRight size={17} /></Link></div>
          ) : (
            <form className="chatra-signup-form" onSubmit={submit}>
              {!backendConfigured && <div className="auth-warning" role="alert">Sign-up is temporarily unavailable. Please try again later.</div>}
              <label className="signup-field-label">Email or mobile number
                <span className="signup-field"><Mail size={17} /><input type="text" inputMode="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email or mobile number" autoComplete="email" required /></span>
              </label>
              <p className="signup-identifier-note">Use an email address to sign up. Mobile verification isn’t available yet.</p>
              <label className="signup-field-label">Password
                <span className="signup-field"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete="new-password" placeholder="At least 8 characters" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
              </label>
              <fieldset className="signup-birthday-fieldset">
                <legend>Birthday <span className="birthday-private" title="Your birthday is private"><Info size={14} /></span></legend>
                <div className="signup-birthday-selects">
                  <label><span className="sr-only">Birth month</span><select value={birthMonth} onChange={event => { setBirthMonth(event.target.value); setBirthDay(''); }} required><option value="">Month</option>{months.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select></label>
                  <label><span className="sr-only">Birth day</span><select value={birthDay} onChange={event => setBirthDay(event.target.value)} required><option value="">Day</option>{birthDays.map(day => <option value={day} key={day}>{day}</option>)}</select></label>
                  <label><span className="sr-only">Birth year</span><select value={birthYear} onChange={event => { setBirthYear(event.target.value); setBirthDay(''); }} required><option value="">Year</option>{Array.from({ length: 110 }, (_, index) => currentYear - 13 - index).map(year => <option key={year} value={year}>{year}</option>)}</select></label>
                </div>
                <small>Your birthday is kept private and helps us keep Chatra safe.</small>
              </fieldset>
              <label className="signup-field-label">Name
                <span className="signup-field"><UserRound size={17} /><input value={name} onChange={event => setName(event.target.value)} placeholder="Full name" autoComplete="name" maxLength={40} required /></span>
              </label>
              <label className="signup-field-label">Username
                <span className={`signup-field signup-username-field ${usernameLooksValid ? 'username-valid' : ''}`}><span className="signup-at">@</span><input value={username} onChange={event => setUsername(event.target.value.replace(/[^A-Za-z0-9_.]/g, ''))} placeholder="Choose a username" autoComplete="username" minLength={3} maxLength={24} required />{usernameLooksValid && <CheckCircle2 size={18} aria-label="Username format looks good" />}</span>
              </label>

              {error && <p className="auth-feedback auth-feedback-error" role="alert">{error}</p>}
              {message && <p className="auth-feedback auth-feedback-success" role="status">{message}</p>}
              {pendingConfirmationEmail && <button className="auth-resend-link" type="button" onClick={() => void resendConfirmation()} disabled={busy}>Resend confirmation email</button>}

              <div className="signup-legal-copy">
                <p>People who use Chatra may already be part of your communities. Your contact information is never shared without your permission.</p>
                <p>By selecting Create account, you agree to Chatra’s <Link to="/terms">Terms</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</p>
                <p>Your birthday is stored privately with your account and is not shown on your profile.</p>
              </div>
              <button className="signup-submit" type="submit" disabled={busy || !backendConfigured}>{busy ? 'Please wait…' : 'Submit'} <ArrowRight size={17} /></button>
              <button className="signup-existing-account" type="button" onClick={() => switchMode('signin')}>I already have an account</button>
            </form>
          )}
        </section>
        <footer className="signup-footer"><span>© 2026 Chatra</span><span><Link to="/about">About</Link><Link to="/privacy-policy">Privacy</Link><Link to="/help">Help</Link></span></footer>
      </main>
    );
  }

  return (
    <main className="chatra-auth-page">
      <header className="auth-topbar">
        <Link to="/login" aria-label="Chatra sign in"><Logo /></Link>
        <span className="auth-topbar-note">A more thoughtful place to connect</span>
      </header>

      <div className="auth-stage">
        <section className="auth-showcase" aria-label="Welcome to Chatra">
          <div className="auth-showcase-copy">
            <span className="auth-kicker"><span /> MADE FOR REAL CONNECTION</span>
            <h1>Make room for <span>your people.</span></h1>
            <p>Share everyday moments, find your community, and keep the conversations that matter close.</p>
          </div>

          <div className="auth-collage" aria-label="A glimpse of the Chatra community">
            <div className="auth-photo auth-photo-back auth-photo-city"><img src="/images/kigali.webp" alt="Kigali in the golden evening light" /></div>
            <div className="auth-photo auth-photo-back auth-photo-community"><img src="/images/meetup.webp" alt="Friends gathering and sharing ideas" /></div>
            <div className="auth-photo auth-photo-main"><img src="/images/amina.webp" alt="A creator sharing a moment with her community" /><span className="auth-photo-caption"><span><strong>Amina’s corner</strong><small>Design · Kigali</small></span><span className="auth-photo-heart"><Heart size={16} fill="currentColor" /></span></span></div>
            <div className="auth-float-card auth-float-note"><span className="auth-float-icon"><MessageCircle size={17} /></span><span><strong>Good conversations</strong><small>Start with a hello.</small></span></div>
            <div className="auth-float-card auth-float-community"><span className="auth-avatars"><img src="/images/grace.webp" alt="" /><img src="/images/david.webp" alt="" /><img src="/images/theo.webp" alt="" /></span><span><strong>Find your circle</strong><small>People who get you.</small></span><Users size={17} /></div>
          </div>
          <div className="auth-showcase-foot"><span>Real people. Brighter conversations.</span><span className="auth-showcase-dots"><i /><i /><i /></span></div>
        </section>

        <section className="auth-form-wrap" aria-labelledby="auth-title">
          <div className="auth-form-heading">
            <span className="auth-form-mark"><LockKeyhole size={18} /></span>
            <span className="auth-kicker">YOUR COMMUNITY IS HERE</span>
            <h2 id="auth-title">Welcome back</h2>
            <p>Sign in to catch up with your people.</p>
          </div>

          {!backendConfigured && <div className="auth-warning" role="alert">Sign-in is not configured yet. Please try again later.</div>}

          {session ? (
            <div className="auth-connected">
              <span className="auth-connected-icon"><ShieldCheck size={24} /></span>
              <strong>You’re signed in</strong>
              <p>Your Chatra account is connected.</p>
              <button className="auth-primary-button" onClick={() => navigate('/')}>Continue to Chatra <ArrowRight size={17} /></button>
              <button className="auth-quiet-button" onClick={() => void signOut()}>Sign out</button>
            </div>
          ) : (
            <form className="chatra-auth-form" onSubmit={submit}>
              <label className="auth-field-label">Email address
                <span className="auth-field"><Mail size={17} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span>
              </label>
              <label className="auth-field-label">Password
                <span className="auth-field"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
              </label>
              <Link className="auth-forgot-link" to="/reset-password">Forgot password?</Link>
              {error && <p className="auth-feedback auth-feedback-error" role="alert">{error}</p>}
              {message && <p className="auth-feedback auth-feedback-success" role="status">{message}</p>}
              {pendingConfirmationEmail && <button className="auth-resend-link" type="button" onClick={() => void resendConfirmation()} disabled={busy}>Resend confirmation email</button>}
              <button className="auth-primary-button" type="submit" disabled={busy || !backendConfigured}>{busy ? 'Please wait…' : 'Log in'} <ArrowRight size={17} /></button>
            </form>
          )}

          {!session && <>
            <div className="auth-account-switch">Don’t have an account? <button type="button" onClick={() => switchMode('signup')}>Sign up</button></div>
            <p className="auth-security-note"><ShieldCheck size={15} /> Your password stays private. Chatra never sees or stores it.</p>
          </>}
        </section>
      </div>

      <footer className="auth-footer"><span>© 2026 Chatra</span><span><Link to="/about">About</Link><Link to="/privacy-policy">Privacy</Link><Link to="/help">Help</Link></span><span>Made for connection.</span></footer>
    </main>
  );
}
