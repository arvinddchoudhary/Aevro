type AdminIconProps = {
  name:
    | 'arrow'
    | 'bag'
    | 'box'
    | 'calendar'
    | 'chevron'
    | 'dashboard'
    | 'home'
    | 'logout'
    | 'plus'
    | 'product'
    | 'search'
    | 'shield'
    | 'upload'
    | 'users';
  className?: string;
};

export function AdminIcon({ name, className = 'h-5 w-5' }: AdminIconProps) {
  const shared = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.55,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  };

  switch (name) {
    case 'arrow':
      return (
        <svg {...shared}>
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      );
    case 'bag':
      return (
        <svg {...shared}>
          <path d="M6.5 8.5h11l1 12h-13l1-12Z" />
          <path d="M9 8.5a3 3 0 0 1 6 0" />
        </svg>
      );
    case 'box':
      return (
        <svg {...shared}>
          <path d="m12 3 7 4-7 4-7-4 7-4Z" />
          <path d="M5 7v8l7 4 7-4V7" />
          <path d="M12 11v8" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...shared}>
          <path d="M7 3v3M17 3v3M4.5 8.5h15" />
          <path d="M6 5h12a2 2 0 0 1 2 2v11.5H4V7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'chevron':
      return (
        <svg {...shared}>
          <path d="m9 5 7 7-7 7" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg {...shared}>
          <path d="M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h6v6h-6v-6Z" />
        </svg>
      );
    case 'home':
      return (
        <svg {...shared}>
          <path d="m4 11 8-7 8 7" />
          <path d="M6.5 10v9h11v-9M10 19v-5h4v5" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...shared}>
          <path d="M9 4.5H5.5v15H9" />
          <path d="M14 8l4 4-4 4M18 12H8.5" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...shared}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'product':
      return (
        <svg {...shared}>
          <path d="m4.5 12 7.8-7.8h5.2v5.2L9.7 17.2 4.5 12Z" />
          <path d="M15 6.7h.01" />
        </svg>
      );
    case 'search':
      return (
        <svg {...shared}>
          <path d="M10.8 17.1a6.3 6.3 0 1 0 0-12.6 6.3 6.3 0 0 0 0 12.6Z" />
          <path d="m15.5 15.5 4 4" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...shared}>
          <path d="M12 3.5 19 6v5.2c0 4.2-2.6 7.3-7 9.3-4.4-2-7-5.1-7-9.3V6l7-2.5Z" />
          <path d="m9.5 12 1.7 1.7 3.5-3.5" />
        </svg>
      );
    case 'upload':
      return (
        <svg {...shared}>
          <path d="M12 16V5" />
          <path d="m8 9 4-4 4 4" />
          <path d="M5 15.5v3h14v-3" />
        </svg>
      );
    case 'users':
      return (
        <svg {...shared}>
          <path d="M9.5 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M3.5 20a6 6 0 0 1 12 0" />
          <path d="M16 8a3 3 0 0 1 0 6M18 20a5 5 0 0 0-2-4" />
        </svg>
      );
    default:
      return null;
  }
}
