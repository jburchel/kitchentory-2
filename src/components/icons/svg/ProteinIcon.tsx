import React from 'react'
import { IconProps } from './ProduceIcon'

/**
 * Meat/protein icon representing protein sources category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const ProteinIcon: React.FC<IconProps> = ({ 
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
      {/* Meat cut outline */}
      <path
        d="M6 8C6 6 7 4 9 3C10 2.5 11 2.5 12 2.5C13 2.5 14 2.5 15 3C17 4 18 6 18 8C18 10 18 14 18 16C18 18 17 20 15 21C14 21.5 13 21.5 12 21.5C11 21.5 10 21.5 9 21C7 20 6 18 6 16C6 14 6 10 6 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Meat marbling/texture */}
      <path
        d="M9 8C9 8 10 7 11 8C12 9 13 8 14 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 12C9 12 10 11 11 12C12 13 13 12 14 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 16C9 16 10 15 11 16C12 17 13 16 14 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default ProteinIcon