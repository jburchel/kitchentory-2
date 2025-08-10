import React from 'react'
import { IconProps } from './ProduceIcon'

/**
 * Milk glass icon representing dairy products category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const DairyIcon: React.FC<IconProps> = ({ 
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
      {/* Milk glass body */}
      <path
        d="M8 21H16C17.1 21 18 20.1 18 19V8L16.5 3H7.5L6 8V19C6 20.1 6.9 21 8 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glass rim */}
      <path
        d="M6 8H18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Milk level */}
      <path
        d="M7.5 12H16.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Milk wave */}
      <path
        d="M7.5 12C8.5 13 9.5 11 10.5 12C11.5 13 12.5 11 13.5 12C14.5 13 15.5 11 16.5 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default DairyIcon