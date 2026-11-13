import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CircleAlert, LoaderCircle, ShieldCheck } from 'lucide-react';
import type { EmailOtpType } from '@supabase/supabase-js';
import { Logo } from '../components/UI';
import { supabase } from '../lib/supabase';

type ConfirmationState = 'checking' | 'confirmed' | 'error';
const emailTypes: EmailOtpType[] = ['signup', 'email', 'magiclink', 'invite', 'recovery', 'email_change'];

export default function AuthConfirmation() {
  const [state, setState] = useState<ConfirmationState>('checking');
  const [detail, setDetail] = useState('We’re securely confirming your email address.');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;
    let hasCompleted = false;
    const complete = () => {
      if (!active || hasCompleted) return;
      hasCompleted = true;
      setState('confirmed');
      setDetail('Your email is confirmed. Taking you to your Chatra home…');
      redirectTimer = setTimeout(() => navigate('/', { replace: true }), 1500);
    };

    if (!supabase) {
      setState('error');
      setDetail('Email confirmation is unavailable right now. Please return to sign in and try again.');
      return () => { active = false; };
    }
    const client = supabase;

    const { data: { subscription } } = client.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') complete();
    });

    const confirm = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      const emailType = params.get('type') as EmailOtpType | null;

      if (tokenHash && emailType && emailTypes.includes(emailType)) {
        const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: emailType });
        if (error) throw error;
        complete();
        return;
      }

      const urlError = params.get('error_description') || new URLSearchParams(window.location.hash.slice(1)).get('error_description');
      if (urlError) throw new Error(urlError.replaceAll('+', ' '));

      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data.session) complete();
      else throw new Error('This confirmation link may have expired or already been used. Request a fresh email and open its link on this device.');
    };

    void confirm().catch(cause => {
      if (!active) return;
      setState('error');
      setDetail(cause instanceof Error ? cause.message : 'We couldn’t confirm this email. Please request a new confirmation link.');
    });

    return () => {
      active = false;
      if (redirectTimer) clearTimeout(redirectTimer);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <main className="chatra-auth-page auth-confirm-page">
      <header className="auth-topbar"><Link to="/login" aria-label="Chatra sign in"><Logo /></Link></header>
      <section className="auth-confirm-card" aria-live="polite">
        <span className={`auth-confirm-icon ${state === 'error' ? 'is-error' : ''} ${state === 'checking' ? 'is-checking' : ''}`}>
          {state === 'checking' ? <LoaderCircle size={28} /> : state === 'confirmed' ? <Check size={29} /> : <CircleAlert size={27} />}
        </span>
        <span className="auth-kicker">CHATRA ACCOUNT</span>
        <h1>{state === 'checking' ? 'Verifying your email' : state === 'confirmed' ? 'You’re all set' : 'We couldn’t verify that link'}</h1>
        <p>{detail}</p>
        {state === 'checking' && <div className="auth-confirm-progress"><span /></div>}
        {state === 'error' && <Link className="auth-primary-button" to="/login">Back to sign in <ArrowRight size={17} /></Link>}
        {state === 'confirmed' && <p className="auth-confirm-safe"><ShieldCheck size={15} /> Your account is now ready to use.</p>}
      </section>
      <footer className="auth-footer"><span>© 2026 Chatra</span><span><Link to="/about">About</Link><Link to="/privacy-policy">Privacy</Link><Link to="/help">Help</Link></span><span>Made for connection.</span></footer>
    </main>
  );
}
