import { splitProps, type JSX } from 'solid-js';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-over text-white hover:bg-red-700 disabled:bg-red-300',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'class', 'children']);
  return (
    <button
      type="button"
      {...rest}
      class={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500
        disabled:cursor-not-allowed ${VARIANTS[local.variant ?? 'primary']} ${SIZES[local.size ?? 'md']} ${local.class ?? ''}`}
    >
      {local.children}
    </button>
  );
}
