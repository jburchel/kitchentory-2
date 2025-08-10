import React from 'react'
import { IconProps } from './ProduceIcon'

/**
 * Can/jar icon representing pantry staples category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const PantryIcon: React.FC<IconProps> = ({ 
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
      {/* Can body */}
      <path
        d="M6 6H18V18C18 19.1 17.1 20 16 20H8C6.9 20 6 19.1 6 18V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Can top ellipse */}
      <ellipse
        cx="12"
        cy="6"
        rx="6"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Can bottom edge indicator */}
      <path
        d="M6 18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Label lines */}
      <path
        d="M8 10H16M8 12H14M8 14H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default PantryIcon