import React from 'react'

export interface IconProps {
  className?: string
  size?: number | string
  'aria-hidden'?: boolean
  'aria-label'?: string
  role?: string
}

/**
 * Carrot icon representing fruits and vegetables category
 * Following brandbook specifications: 24x24px grid, 2px stroke weight, outlined style
 */
export const ProduceIcon: React.FC<IconProps> = ({ 
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
      {/* Carrot body */}
      <path
        d="M8 17L16 9M8 17C8 17 11 19 14 16C17 13 15 10 15 10M8 17L5 20M16 9C16 9 19 6 16 3C13 0 10 2 10 2M16 9L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Carrot texture lines */}
      <path
        d="M10 15L12 13M12 17L14 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default ProduceIcon