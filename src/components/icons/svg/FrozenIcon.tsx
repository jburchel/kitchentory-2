import React from 'react'
import { IconProps } from './ProduceIcon'

/**
 * Snowflake icon representing frozen foods category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const FrozenIcon: React.FC<IconProps> = ({ 
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
      {/* Main snowflake axes */}
      <path
        d="M12 2V22M6.34 6.34L17.66 17.66M17.66 6.34L6.34 17.66"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Snowflake branches - vertical */}
      <path
        d="M12 6L10 4M12 6L14 4M12 18L10 20M12 18L14 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Snowflake branches - diagonal left */}
      <path
        d="M9.17 9.17L7.76 7.76M9.17 9.17L7.76 10.58M14.83 14.83L16.24 16.24M14.83 14.83L16.24 13.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Snowflake branches - diagonal right */}
      <path
        d="M14.83 9.17L16.24 7.76M14.83 9.17L16.24 10.58M9.17 14.83L7.76 16.24M9.17 14.83L7.76 13.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default FrozenIcon