import React from 'react'
import { IconProps } from './ProduceIcon'

/**
 * Cleaning spray icon representing household items category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const HouseholdIcon: React.FC<IconProps> = ({ 
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
      {/* Spray bottle body */}
      <path
        d="M6 10V18C6 19.1 6.9 20 8 20H14C15.1 20 16 19.1 16 18V10C16 8.9 15.1 8 14 8H8C6.9 8 6 8.9 6 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spray nozzle */}
      <path
        d="M16 12H18C19.1 12 20 11.1 20 10V8C20 6.9 19.1 6 18 6H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Trigger */}
      <path
        d="M16 10C16 10 17 11 17 12C17 13 16 14 16 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spray mist */}
      <path
        d="M20 8L22 6M21 10L23 8M20 6L22 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Liquid level */}
      <path
        d="M8 14H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default HouseholdIcon