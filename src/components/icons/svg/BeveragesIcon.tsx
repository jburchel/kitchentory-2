import React from 'react'
import { IconProps } from './ProduceIcon'

/**
 * Cup/beverage icon representing beverages category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const BeveragesIcon: React.FC<IconProps> = ({ 
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
      {/* Cup body */}
      <path
        d="M5 11V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cup rim */}
      <path
        d="M3 11H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cup handle */}
      <path
        d="M21 13C22.1 13 23 13.9 23 15V17C23 18.1 22.1 19 21 19H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Steam lines */}
      <path
        d="M9 7V4M12 8V3M15 7V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Liquid level */}
      <path
        d="M6 15H18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default BeveragesIcon