/**
 * Kitchentory Brand Component Examples
 * Ready-to-use React components implementing the brand system
 */

import React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// BUTTON COMPONENTS
// =============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const BrandButton: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-brand-gradient hover:shadow-brand-lg text-white border-none',
    secondary: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-primary-800',
    ghost: 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };

  return (
    <button
      className={cn(
        'font-medium transition-all duration-200 focus-brand touch-target',
        'hover:transform hover:-translate-y-0.5',
        'active:transform active:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// =============================================================================
// CARD COMPONENTS
// =============================================================================

interface InventoryCardProps {
  item: {
    name: string;
    quantity: number;
    unit: string;
    category?: string;
    expirationDate?: string;
    image?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onEdit, onDelete }) => {
  const isExpiringSoon = item.expirationDate && 
    new Date(item.expirationDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  
  const isExpired = item.expirationDate && 
    new Date(item.expirationDate) < new Date();

  const getCategoryColor = (category?: string) => {
    const colors = {
      'produce': 'text-category-produce',
      'protein': 'text-category-protein', 
      'dairy': 'text-category-dairy',
      'grains': 'text-category-grains',
      'beverages': 'text-category-beverages',
      'frozen': 'text-category-frozen',
      'pantry': 'text-category-pantry',
      'household': 'text-category-household'
    };
    return colors[category?.toLowerCase() as keyof typeof colors] || 'text-muted-foreground';
  };

  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-4',
      'hover:border-primary-400 hover:shadow-card-hover',
      'transition-all duration-200',
      'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'
    )}>
      {/* Item Header */}
      <div className="flex items-center gap-3 mb-3">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            'bg-secondary',
            getCategoryColor(item.category)
          )}>
            📦
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {item.quantity} {item.unit}
            </span>
            {item.category && (
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                'bg-secondary text-secondary-foreground'
              )}>
                {item.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expiration Status */}
      {item.expirationDate && (
        <div className={cn(
          'flex items-center gap-1 text-sm mb-3',
          isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : 'text-success'
        )}>
          <span>{isExpired ? '❌' : isExpiringSoon ? '⚠️' : '✅'}</span>
          <span>
            {isExpired 
              ? 'Expired' 
              : isExpiringSoon 
                ? 'Expires soon' 
                : `Expires ${new Date(item.expirationDate).toLocaleDateString()}`
            }
          </span>
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-3 border-t border-border">
          {onEdit && (
            <BrandButton 
              variant="ghost" 
              size="sm" 
              onClick={onEdit}
              aria-label={`Edit ${item.name}`}
            >
              ✏️ Edit
            </BrandButton>
          )}
          {onDelete && (
            <BrandButton 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="text-error hover:text-error hover:bg-error/10"
              aria-label={`Delete ${item.name}`}
            >
              🗑️ Delete
            </BrandButton>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// STATS CARD
// =============================================================================

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral',
  icon 
}) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-error', 
    neutral: 'text-muted-foreground'
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: ''
  };

  return (
    <div className={cn(
      'bg-gradient-to-br from-card to-secondary/50',
      'border border-border rounded-2xl p-6',
      'hover:shadow-elevated transition-all duration-300',
      'hover:transform hover:-translate-y-1'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        {icon && <div className="text-primary-500">{icon}</div>}
      </div>
      
      <div className="text-3xl font-bold text-primary-500 mb-2">
        {value}
      </div>
      
      {subtitle && (
        <div className={cn('flex items-center gap-1 text-sm', trendColors[trend])}>
          {trendIcons[trend] && <span>{trendIcons[trend]}</span>}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SEARCH BAR
// =============================================================================

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showClear?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  className, 
  onClear, 
  showClear, 
  ...props 
}) => {
  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        className={cn(
          'w-full pl-12 pr-12 py-4 text-base',
          'bg-background border-2 border-border rounded-xl',
          'focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20',
          'transition-all duration-200',
          'placeholder:text-muted-foreground',
          className
        )}
        placeholder="Search products or scan barcode..."
        {...props}
      />

      {/* Clear Button */}
      {showClear && onClear && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'absolute right-4 top-1/2 transform -translate-y-1/2',
            'p-1 rounded-full hover:bg-secondary',
            'text-muted-foreground hover:text-foreground',
            'transition-colors duration-200'
          )}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

// =============================================================================
// ALERT COMPONENTS
// =============================================================================

interface AlertProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ variant, title, children, onClose }) => {
  const variants = {
    success: {
      bg: 'bg-success-light border-success-border',
      text: 'text-success',
      icon: '✅'
    },
    warning: {
      bg: 'bg-warning-light border-warning-border', 
      text: 'text-warning',
      icon: '⚠️'
    },
    error: {
      bg: 'bg-error-light border-error-border',
      text: 'text-error', 
      icon: '❌'
    },
    info: {
      bg: 'bg-info-light border-info-border',
      text: 'text-info',
      icon: 'ℹ️'
    }
  };

  const config = variants[variant];

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl border',
      config.bg
    )}>
      {/* Icon */}
      <div className="flex-shrink-0 text-lg">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('font-semibold mb-1', config.text)}>
            {title}
          </h4>
        )}
        <div className={cn('text-sm leading-relaxed', config.text)}>
          {children}
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'flex-shrink-0 p-1 rounded-md',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors duration-200',
            config.text
          )}
          aria-label="Close alert"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

// =============================================================================
// CATEGORY BADGE
// =============================================================================

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const getCategoryIcon = (cat: string) => {
    const icons = {
      'produce': '🥕',
      'protein': '🥩', 
      'dairy': '🥛',
      'grains': '🍞',
      'beverages': '🥤',
      'frozen': '❄️',
      'pantry': '🥫',
      'household': '🧽'
    };
    return icons[cat.toLowerCase() as keyof typeof icons] || '📦';
  };

  const getCategoryColor = (cat: string) => {
    const colors = {
      'produce': 'text-category-produce bg-category-produce/10',
      'protein': 'text-category-protein bg-category-protein/10',
      'dairy': 'text-category-dairy bg-category-dairy/10', 
      'grains': 'text-category-grains bg-category-grains/10',
      'beverages': 'text-category-beverages bg-category-beverages/10',
      'frozen': 'text-category-frozen bg-category-frozen/10',
      'pantry': 'text-category-pantry bg-category-pantry/10',
      'household': 'text-category-household bg-category-household/10'
    };
    return colors[cat.toLowerCase() as keyof typeof colors] || 'text-muted-foreground bg-secondary';
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      getCategoryColor(category),
      sizes[size]
    )}>
      <span>{getCategoryIcon(category)}</span>
      <span className="capitalize">{category}</span>
    </span>
  );
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

export const BrandShowcase: React.FC = () => {
  const sampleItem = {
    name: "Organic Bananas",
    quantity: 6,
    unit: "pieces", 
    category: "produce",
    expirationDate: "2024-08-15",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&h=100&fit=crop"
  };

  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">
        Kitchentory Brand Components
      </h1>
      
      {/* Buttons */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <BrandButton variant="primary">Add to Inventory</BrandButton>
          <BrandButton variant="secondary">Cancel</BrandButton>
          <BrandButton variant="ghost">Learn More</BrandButton>
        </div>
      </section>

      {/* Stats Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Items"
            value={47}
            subtitle="3 added today"
            trend="up"
            icon="📦"
          />
          <StatsCard
            title="Expiring Soon"
            value={3}
            subtitle="Check expiration dates"
            trend="neutral"
            icon="⚠️"
          />
          <StatsCard
            title="Money Saved"
            value="$127"
            subtitle="This month"
            trend="up"
            icon="💰"
          />
        </div>
      </section>

      {/* Inventory Card */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Inventory Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InventoryCard 
            item={sampleItem}
            onEdit={() => console.log('Edit clicked')}
            onDelete={() => console.log('Delete clicked')}
          />
        </div>
      </section>

      {/* Search */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Search</h2>
        <SearchBar 
          showClear={true}
          onClear={() => console.log('Clear search')}
        />
      </section>

      {/* Alerts */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Alerts</h2>
        <div className="space-y-4">
          <Alert variant="success" title="Item Added">
            Successfully added bananas to your inventory!
          </Alert>
          <Alert variant="warning" title="Expiring Soon">
            3 items in your inventory will expire within 2 days.
          </Alert>
          <Alert variant="error" title="Scan Failed">
            Unable to read barcode. Try manual entry instead.
          </Alert>
        </div>
      </section>

      {/* Category Badges */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Category Badges</h2>
        <div className="flex flex-wrap gap-3">
          {['produce', 'protein', 'dairy', 'grains', 'beverages', 'frozen', 'pantry', 'household'].map(category => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default BrandShowcase;