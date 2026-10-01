'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

type Part = 'h' | 'm';

interface CustomTimePickerProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  disabled?: boolean;
}

const pad = (n: number) => n.toString().padStart(2, '0');
const wrap = (n: number, max: number) => ((n % max) + max) % max;

function parse(value: string) {
  const [h, m] = (value || '07:30').split(':').map((x) => parseInt(x, 10));
  return { h: Number.isFinite(h) ? wrap(h, 24) : 7, m: Number.isFinite(m) ? wrap(m, 60) : 30 };
}

const themeStyles = {
  light: {
    shell: 'bg-[#fbf7ef] border-amber-200 shadow-[0_0_24px_-6px_rgba(245,158,11,0.45)]',
    text: 'text-stone-800',
    muted: 'text-stone-400 hover:text-amber-600',
    active: 'bg-amber-100 text-amber-700 ring-2 ring-amber-400 shadow-[0_0_16px_-2px_rgba(245,158,11,0.6)]',
    colon: 'text-amber-500',
  },
  dark: {
    shell: 'bg-slate-900 border-sky-500/40 shadow-[0_0_28px_-6px_rgba(56,189,248,0.55)]',
    text: 'text-slate-100',
    muted: 'text-slate-500 hover:text-sky-400',
    active: 'bg-sky-500/15 text-sky-300 ring-2 ring-sky-400 shadow-[0_0_18px_-2px_rgba(56,189,248,0.7)]',
    colon: 'text-yellow-300',
  },
  oled: {
    shell: 'bg-black border-[#f97316]/50 shadow-[0_0_30px_-6px_rgba(249,115,22,0.6)]',
    text: 'text-white',
    muted: 'text-neutral-600 hover:text-[#f97316]',
    active: 'bg-[#f97316]/15 text-[#f97316] ring-2 ring-[#f97316] shadow-[0_0_18px_-2px_rgba(249,115,22,0.75)]',
    colon: 'text-[#f97316]',
  },
} as const;

export function CustomTimePicker({ value, onChange, disabled }: CustomTimePickerProps) {
  const { theme } = useTheme();
  const s = themeStyles[theme] ?? themeStyles.light;
  const { h, m } = parse(value);
  const [active, setActive] = useState<Part | null>(null);
  const [bump, setBump] = useState<{ part: Part; dir: 1 | -1; key: number } | null>(null);

  const hRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<HTMLDivElement>(null);
  const touchY = useRef<number | null>(null);
  const latest = useRef({ h, m });
  latest.current = { h, m };

  const step = useCallback(
    (part: Part, dir: 1 | -1) => {
      if (disabled) return;
      const cur = latest.current;
      const nh = part === 'h' ? wrap(cur.h + dir, 24) : cur.h;
      const nm = part === 'm' ? wrap(cur.m + dir, 60) : cur.m;
      latest.current = { h: nh, m: nm };
      setActive(part);
      setBump({ part, dir, key: Date.now() });
      onChange(`${pad(nh)}:${pad(nm)}`);
    },
    [disabled, onChange]
  );

  // Non-passive wheel + touchmove listeners so page doesn't scroll while adjusting
  useEffect(() => {
    const attach = (el: HTMLDivElement | null, part: Part) => {
      if (!el) return () => {};
      let acc = 0;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        acc += e.deltaY;
        if (Math.abs(acc) >= 40) {
          step(part, acc < 0 ? 1 : -1); // scroll up => +1
          acc = 0;
        }
      };
      const onTouchStart = (e: TouchEvent) => {
        touchY.current = e.touches[0].clientY;
        setActive(part);
      };
      const onTouchMove = (e: TouchEvent) => {
        if (touchY.current === null) return;
        e.preventDefault();
        const y = e.touches[0].clientY;
        const diff = touchY.current - y; // positive = swipe up
        if (Math.abs(diff) >= 18) {
          step(part, diff > 0 ? 1 : -1);
          touchY.current = y;
        }
      };
      const onTouchEnd = () => (touchY.current = null);
      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd);
      return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
      };
    };
    const a = attach(hRef.current, 'h');
    const b = attach(mRef.current, 'm');
    return () => {
      a();
      b();
    };
  }, [step]);

  const onKey = (part: Part) => (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); step(part, 1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); step(part, -1); }
    if (e.key === 'ArrowRight' && part === 'h') mRef.current?.focus();
    if (e.key === 'ArrowLeft' && part === 'm') hRef.current?.focus();
  };

  const segment = (part: Part, val: number, ref: React.RefObject<HTMLDivElement>, label: string) => {
    const isActive = active === part;
    const anim = bump?.part === part ? bump : null;
    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          aria-label={`${label} +1`}
          disabled={disabled}
          onClick={() => step(part, 1)}
          className={cn('p-1 rounded-full transition-colors disabled:opacity-40', s.muted)}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div
          ref={ref}
          role="spinbutton"
          aria-label={label}
          aria-valuenow={val}
          aria-valuemin={0}
          aria-valuemax={part === 'h' ? 23 : 59}
          tabIndex={disabled ? -1 : 0}
          onClick={() => setActive(part)}
          onFocus={() => setActive(part)}
          onKeyDown={onKey(part)}
          className={cn(
            'relative w-[4.25rem] h-14 sm:w-20 sm:h-16 overflow-hidden rounded-full flex items-center justify-center',
            'cursor-ns-resize select-none touch-none outline-none transition-all duration-200',
            'font-mono text-3xl sm:text-4xl font-bold tabular-nums',
            isActive ? s.active : s.text,
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          <span
            key={anim?.key ?? 'static'}
            className="inline-block"
            style={
              anim
                ? { animation: `ctp-slide-${anim.dir > 0 ? 'up' : 'down'} 180ms ease-out` }
                : undefined
            }
          >
            {pad(val)}
          </span>
        </div>
        <button
          type="button"
          aria-label={`${label} -1`}
          disabled={disabled}
          onClick={() => step(part, -1)}
          className={cn('p-1 rounded-full transition-colors disabled:opacity-40', s.muted)}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes ctp-slide-up { from { transform: translateY(60%); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes ctp-slide-down { from { transform: translateY(-60%); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes ctp-blink { 0%,100% { opacity: 1 } 50% { opacity: .2 } }
      `}</style>
      <div
        className={cn(
          'mx-auto flex w-fit items-center gap-1 sm:gap-2 rounded-full border-2 px-4 sm:px-6 py-1 transition-colors duration-300',
          s.shell
        )}
        onMouseLeave={() => setActive(null)}
      >
        {segment('h', h, hRef, 'Часы')}
        <span
          className={cn('font-mono text-3xl sm:text-4xl font-bold pb-1', s.colon)}
          style={{ animation: 'ctp-blink 1.2s steps(1) infinite' }}
        >
          :
        </span>
        {segment('m', m, mRef, 'Минуты')}
      </div>
    </>
  );
}
