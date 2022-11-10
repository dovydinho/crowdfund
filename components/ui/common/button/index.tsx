export default function Button({
  name,
  className,
  ...rest
}: {
  name: string;
  className?: string;
  [x: string]: any;
}): JSX.Element {
  return (
    <button
      {...rest}
      className={`bg-gray-100/10 hover:bg-gray-100/20 py-2 px-8 transition-all border border-gray-100/5 rounded-lg ${className}`}
    >
      {name}
    </button>
  );
}

export function DangerButton({
  name,
  className,
  ...rest
}: {
  name: string;
  className?: string;
  [x: string]: any;
}): JSX.Element {
  return (
    <button
      {...rest}
      className={`bg-red-500/50 hover:bg-red-500/70 py-2 px-8 transition-all border border-red-500/60 rounded-lg ${className}`}
    >
      {name}
    </button>
  );
}

export function LoadingButton({
  name,
  className,
  ...rest
}: {
  name: string;
  className?: string;
  [x: string]: any;
}): JSX.Element {
  return (
    <button
      {...rest}
      className={`bg-gray-100/10 hover:bg-gray-100/20 py-2 px-8 transition-all border border-gray-100/5 rounded-lg ${className}`}
    >
      <span className="flex items-center justify-center">
        <svg className="animate-spin rounded-full border-t-transparent border-4 h-5 w-5 mr-3" />
        {name}
      </span>
    </button>
  );
}
