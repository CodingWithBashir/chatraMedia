import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode, ButtonHTMLAttributes, ImgHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, MoreHorizontal, Check, Users } from 'lucide-react';
import { getPerson } from '../data';

export function Logo({ compact = false }: { compact?: boolean }) {
  return <span className="brand"><svg viewBox="0 0 42 42" aria-hidden="true"><path fill="currentColor" d="M9 3h25a7 7 0 0 1 7 7v17a7 7 0 0 1-7 7H18L7 41v-8a7 7 0 0 1-5-7V10a7 7 0 0 1 7-7Z"/></svg>{!compact && <span>Chatra</span>}</span>;
}
export function Avatar({ src, alt = '', size = 44, online, ring, className = '', ...props }: { src?: string; alt?: string; size?: number; online?: boolean; ring?: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'size'>) {
  return <span className={`avatar ${ring ? 'story-ring' : ''} ${className}`} style={{ width: size, height: size, '--ring-color': ring || 'var(--accent)' } as React.CSSProperties}><img src={src || '/images/bashir-profile.webp'} alt={alt} width={size} height={size} {...props} />{online && <span className="online-dot" />}</span>;
}
export function PersonAvatar({ id, size = 44, online = false }: { id: string; size?: number; online?: boolean }) {
  const person = getPerson(id);
  return <Avatar src={person.avatar} alt={person.name} size={size} online={online} />;
}
export function GroupAvatar({ size = 44 }: { size?: number }) {
  return <span className="group-avatar" style={{ width: size, height: size }}><Users size={size * 0.48} strokeWidth={1.5} /></span>;
}
export function IconButton({ label, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button type="button" className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}
export function SearchInput({ value, onChange, placeholder = 'Search Chatra...', className = '', ...props }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string; onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>; 'aria-label'?: string }) {
  return <div className={`search-input ${className}`}><Search size={19} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={props['aria-label'] || placeholder} onKeyDown={props.onKeyDown} />{value && <IconButton label="Clear search" onClick={() => onChange('')}><X size={16} /></IconButton>}</div>;
}
export function Tabs({ items, value, onChange, className = '' }: { items: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void; className?: string }) {
  return <div className={`tabs ${className}`} role="tablist">{items.map(item => <button key={item.id} type="button" role="tab" aria-selected={value === item.id} className={value === item.id ? 'active' : ''} onClick={() => onChange(item.id)}>{item.label}{item.count !== undefined && <span className="tab-count">{item.count}</span>}</button>)}</div>;
}
export function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" className={`toggle ${checked ? 'on' : ''}`} role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}><span>{checked && <Check size={11} strokeWidth={3} />}</span></button>;
}
export function Modal({ title, children, onClose, className = '', wide = false }: { title: string; children: ReactNode; onClose: () => void; className?: string; wide?: boolean }) {
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      const el = dialog.current?.querySelector<HTMLElement>('[data-autofocus], textarea, input:not([type="file"]), button');
      el?.focus();
    }, 30);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]):not([type="file"]), textarea, select, [tabindex="0"]') || []).filter(el => el.offsetParent !== null);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { clearTimeout(timer); document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, []);
  return createPortal(<div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`modal ${wide ? 'modal-wide' : ''} ${className}`}><header className="modal-header"><h2 id={titleId}>{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={21} /></IconButton></header>{children}</div></div>, document.body);
}
export function EmptyState({ icon, title, description, children }: { icon?: ReactNode; title: string; description: string; children?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon || <Search size={32} />}</div><h2>{title}</h2><p>{description}</p>{children}</div>;
}
export function Menu({ items, label = 'More options', children }: { items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[]; label?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key); };
  }, [open]);
  return <div className="menu-wrapper" ref={ref}><IconButton label={label} aria-expanded={open} onClick={() => setOpen(!open)}>{children || <MoreHorizontal size={21} />}</IconButton>{open && <div className="dropdown-menu" role="menu">{items.map(item => <button role="menuitem" key={item.label} className={item.danger ? 'danger-text' : ''} onClick={() => { setOpen(false); item.onClick(); }}>{item.icon}{item.label}</button>)}</div>}</div>;
}
export function CoverArt() {
  const id = useId().replace(/:/g, '');
  return <svg className="cover-art" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#07515b"/><stop offset=".55" stopColor="#087e83"/><stop offset="1" stopColor="#28d9ca"/></linearGradient><linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#0c6973"/><stop offset=".6" stopColor="#12b5ad"/><stop offset="1" stopColor="#35e2cf"/></linearGradient><linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#06333f"/><stop offset="1" stopColor="#08232f"/></linearGradient></defs><rect width="1000" height="300" fill="#073440"/><path d="M-80 40C160-100 310 310 590 175S850-90 1080-20V330H-80Z" fill={`url(#${id}a)`}/><path d="M-70 95C170-60 325 315 620 170S855-15 1040 0C820 40 825 170 635 231S190 20-70 155Z" fill={`url(#${id}b)`}/><path d="M-40 155C200 15 360 365 675 221S900 75 1050 91V340H-40Z" fill={`url(#${id}c)`}/><path d="M-30 235C210 95 390 370 705 260S915 162 1040 170V340H-30Z" fill="#0b4350" opacity=".65"/></svg>;
}
export function PageHeading({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="page-heading-actions">{children}</div>}</div>;
}