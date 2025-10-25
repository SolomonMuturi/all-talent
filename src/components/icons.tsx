import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="hsl(var(--primary))" stroke="none" />
      <path d="M2 17l10 5 10-5" fill="hsl(var(--primary) / 0.5)" stroke="none" />
      <path d="M2 12l10 5 10-5" fill="hsl(var(--primary) / 0.75)" stroke="none" />
      <path d="M12 22V12" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" />
      <path d="M22 7v10" stroke="hsl(var(--primary-foreground) / 0.5)" strokeWidth="1.5" />
      <path d="M2 7v10" stroke="hsl(var(--primary-foreground) / 0.5)" strokeWidth="1.5" />
      <path d="M7 4.5v3" stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
      <path d="M17 4.5v3" stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
      <text
        x="12"
        y="13"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="hsl(var(--primary-foreground))"
        fontSize="10"
        fontWeight="bold"
        className="font-headline"
      >
        T
      </text>
    </svg>
  );
}
