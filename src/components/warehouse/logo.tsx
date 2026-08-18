/** StockNova mark: warehouse roof + box. */
export function StockNovaLogo({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="StockNova logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" opacity="0.14" />
      <path
        d="M8 17.5 20 9l12 8.5V31a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V17.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M15 32v-8h10v8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M15 28h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 24v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
