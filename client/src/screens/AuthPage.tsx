import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Mail, MessageCircle, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Logo } from '../components/UI';
import { useApp } from '../store';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const { session, backendConfigured, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from || '/';

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setPendingConfirmationEmail('');
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
    if (mode === 'signup' && !/^[A-Za-z0-9_.]{3,24}$/.test(username)) {
      setError('Username must be 3–24 letters, numbers, underscores, or dots.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username, display_name: name.trim() || username },
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
      setError(cause instanceof Error ? cause.message : 'Authentication failed. Please try again.');
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
      setError(cause instanceof Error ? cause.message : 'Could not resend the confirmation email.');
    } finally {
      setBusy(false);
    }
  };

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
            <div className="auth-float-card auth-float-community"><span className="auth-avatars"><img src="/images/grace.webp" alt="" /><img src="/images/david.webp" alt="" /><img src="/images/theo.webp" alt="" /></span><span><strong>Find your circle</strong><small>People who get you.</small></span><Users size={17} />
            </div>
          </div>
          <div className="auth-showcase-foot"><span>Real people. Brighter conversations.</span><span className="auth-showcase-dots"><i /><i /><i /></span></div>
        </section>

        <section className="auth-form-wrap" aria-labelledby="auth-title">
          <div className="auth-form-heading">
            <span className="auth-form-mark"><LockKeyhole size={18} /></span>
            <span className="auth-kicker">YOUR COMMUNITY IS HERE</span>
            <h2 id="auth-title">{mode === 'signin' ? 'Welcome back' : 'Join the conversation'}</h2>
            <p>{mode === 'signin' ? 'Sign in to catch up with your people.' : 'Create your account and make it yours.'}</p>
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
              {mode === 'signup' && <>
                <label className="auth-field-label">Display name
                  <span className="auth-field"><UserRound size={17} /><input value={name} onChange={event => setName(event.target.value)} placeholder="Your name" maxLength={40} autoComplete="name" required /></span>
                </label>
                <label className="auth-field-label">Username
                  <span className="auth-field"><span className="auth-at">@</span><input value={username} onChange={event => setUsername(event.target.value.replace(/[^A-Za-z0-9_.]/g, ''))} placeholder="yourname" maxLength={24} autoComplete="username" required /></span>
                </label>
              </>}
              <label className="auth-field-label">Email address
                <span className="auth-field"><Mail size={17} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span>
              </label>
              <label className="auth-field-label">Password
                <span className="auth-field"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder={mode === 'signin' ? 'Enter your password' : 'At least 8 characters'} required /><button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
              </label>

              {mode === 'signin' && <Link className="auth-forgot-link" to="/reset-password">Forgot password?</Link>}
              {error && <p className="auth-feedback auth-feedback-error" role="alert">{error}</p>}
              {message && <p className="auth-feedback auth-feedback-success" role="status">{message}</p>}

              {pendingConfirmationEmail && <button className="auth-resend-link" type="button" onClick={() => void resendConfirmation()} disabled={busy}>Resend confirmation email</button>}

              <button className="auth-primary-button" type="submit" disabled={busy || !backendConfigured}>
                {busy ? 'Please wait…' : mode === 'signin' ? 'Log in' : 'Create account'} <ArrowRight size={17} />
              </button>
            </form>
          )}

          {!session && <>
            <div className="auth-account-switch">
              {mode === 'signin' ? <>Don’t have an account? <button type="button" onClick={() => switchMode('signup')}>Sign up</button></> : <>Already a member? <button type="button" onClick={() => switchMode('signin')}>Log in</button></>}
            </div>
            <p className="auth-security-note"><ShieldCheck size={15} /> Your password stays private. Chatra never sees or stores it.</p>
          </>}
        </section>
      </div>

      <footer className="auth-footer"><span>© 2026 Chatra</span><span><Link to="/about">About</Link><Link to="/privacy-policy">Privacy</Link><Link to="/help">Help</Link></span><span>Made for connection.</span></footer>
    </main>
  );
}
