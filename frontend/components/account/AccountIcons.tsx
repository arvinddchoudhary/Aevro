type AccountIconProps = {
  name:
    | 'address'
    | 'bag'
    | 'calendar'
    | 'card'
    | 'heart'
    | 'logout'
    | 'mail'
    | 'phone'
    | 'profile'
    | 'refresh'
    | 'search'
    | 'shield'
    | 'truck';
  className?: string;
};

export function AccountIcon({ name, className = 'h-5 w-5' }: AccountIconProps) {
  const shared = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.6,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  };

  switch (name) {
    case 'address':
      return (
        <svg {...shared}>
          <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
          <path d="M12 10.5h.01" />
        </svg>
      );
    case 'bag':
      return (
        <svg {...shared}>
          <path d="M6.5 8.5h11l1 12h-13l1-12Z" />
          <path d="M9 8.5a3 3 0 0 1 6 0" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...shared}>
          <path d="M7 3v3M17 3v3M4.5 8.5h15" />
          <path d="M6 5h12a2 2 0 0 1 2 2v11.5H4V7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'card':
      return (
        <svg {...shared}>
          <path d="M3.5 6.5h17v11h-17v-11Z" />
          <path d="M3.5 10h17M7 14.5h3" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...shared}>
          <path d="M20.5 8.8c0 5.4-8.5 10.2-8.5 10.2S3.5 14.2 3.5 8.8A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.5 1.6Z" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...shared}>
          <path d="M9 4.5H5.5v15H9" />
          <path d="M14 8l4 4-4 4M18 12H8.5" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...shared}>
          <path d="M4 6.5h16v11H4v-11Z" />
          <path d="m4 8 8 5.5L20 8" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...shared}>
          <path d="M8.2 4.5 10 8.4l-2 1.2c1 2.2 2.8 4 5 5l1.2-2 3.9 1.8-.6 3.1c-.2.8-.9 1.3-1.7 1.2C9.6 18 5.9 14.3 5.2 8.2c-.1-.8.4-1.5 1.2-1.7l1.8-.4Z" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...shared}>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...shared}>
          <path d="M20 7v5h-5" />
          <path d="M4 17v-5h5" />
          <path d="M18 10a6.5 6.5 0 0 0-11-3M6 14a6.5 6.5 0 0 0 11 3" />
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
          <path d="M9.5 12h5" />
        </svg>
      );
    case 'truck':
      return (
        <svg {...shared}>
          <path d="M3.5 7h11v8h-11V7Z" />
          <path d="M14.5 10h3l3 3v2h-6v-5Z" />
          <path d="M6.5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17.5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
      );
    default:
      return null;
  }
}
