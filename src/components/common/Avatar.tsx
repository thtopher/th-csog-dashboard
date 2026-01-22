'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { EXECUTIVE_PHOTOS, EXECUTIVE_INITIALS, EXECUTIVE_COLORS, USER_PHOTOS } from '@/config/executives';

interface AvatarProps {
  /** Executive ID (e.g., 'exec-ceo') */
  executiveId?: string;
  /** User email (for non-executive users) */
  email?: string;
  /** User name (for generating initials fallback) */
  name?: string;
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const sizePx = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/**
 * Avatar component that displays executive headshots with face-centering,
 * falling back to colored initials when no photo is available.
 */
export function Avatar({ executiveId, email, name, size = 'md', className }: AvatarProps) {
  // Get photo URL - check executive photos first, then user photos
  const photoUrl = executiveId
    ? EXECUTIVE_PHOTOS[executiveId]
    : email
      ? USER_PHOTOS[email]
      : undefined;

  // Get initials - from executive config or derive from name
  const initials = executiveId
    ? EXECUTIVE_INITIALS[executiveId]
    : name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?';

  // Get background color for fallback
  const bgColor = executiveId
    ? EXECUTIVE_COLORS[executiveId] || '#6b7280'
    : '#374151';

  if (photoUrl) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden shrink-0',
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={photoUrl}
          alt={name || 'User avatar'}
          width={sizePx[size]}
          height={sizePx[size]}
          className="object-cover w-full h-full"
          style={{
            // Face-centering: most headshots have faces in upper-center
            // 20% from top works well for typical professional headshots
            objectPosition: 'center 20%'
          }}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-semibold shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
