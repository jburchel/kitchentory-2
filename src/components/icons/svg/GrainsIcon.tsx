import React from 'react'
import { IconProps } from './ProduceIcon'

/**
 * Bread loaf icon representing grains and bakery category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const GrainsIcon: React.FC<IconProps> = ({ 
  className, 
  size = 24,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  role,
  ...props 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      role={role}
      {...props}
    >
      {/* Bread loaf body */}
      <path
        d="M4 12C4 8.5 6.5 6 12 6C17.5 6 20 8.5 20 12V16C20 18 18 20 16 20H8C6 20 4 18 4 16V12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bread scoring marks */}
      <path
        d="M8 10V18M12 10V18M16 10V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Top crust curve */}
      <path
        d="M6 12C8 10 10 9.5 12 9.5C14 9.5 16 10 18 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default GrainsIcon