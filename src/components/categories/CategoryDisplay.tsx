import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface CategoryDisplayProps {
  category: Category;
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showIcon?: boolean;
  showColor?: boolean;
  className?: string;
  clickable?: boolean;
  onClick?: (category: Category) => void;
}

export function CategoryDisplay({ 
  category, 
  variant = 'default',
  showIcon = true,
  showColor = true,
  className,
  clickable = false,
  onClick
}: CategoryDisplayProps) {
  const { language } = useAuth();
  const isArabic = language.code === 'ar';

  const displayName = isArabic 
    ? category.nameAr || category.name 
    : category.nameEn || category.name;

  const baseClasses = cn(
    "inline-flex items-center gap-1.5",
    clickable && "cursor-pointer hover:opacity-80 transition-opacity",
    className
  );

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(category);
    }
  };

  switch (variant) {
    case 'compact':
      return (
        <div className={cn(baseClasses, "text-xs")} onClick={handleClick}>
          {showIcon && category.icon && (
            <span className="text-xs">{category.icon}</span>
          )}
          {showColor && (
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          )}
          <span className="font-medium">{displayName}</span>
        </div>
      );

    case 'detailed':
      return (
        <div className={cn(baseClasses, "flex-col items-start gap-1")} onClick={handleClick}>
          <div className="flex items-center gap-2">
            {showIcon && category.icon && (
              <span className="text-lg">{category.icon}</span>
            )}
            <h3 className="font-semibold">{displayName}</h3>
            {showColor && (
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            )}
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
          {category.nameEn && isArabic && (
            <span className="text-xs text-muted-foreground font-mono">
              {category.nameEn}
            </span>
          )}
        </div>
      );

    case 'card':
      return (
        <div 
          className={cn(
            baseClasses,
            "p-3 border rounded-lg bg-card hover:shadow-md transition-shadow",
            clickable && "hover:border-primary/30"
          )}
          onClick={handleClick}
        >
          <div className="flex items-center gap-3 w-full">
            {showIcon && category.icon && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                <span className="text-xl">{category.icon}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{displayName}</h4>
                {showColor && (
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <Badge 
          variant="outline" 
          className={cn(
            baseClasses,
            "border-2 text-xs font-medium px-2 py-1"
          )}
          style={{ 
            borderColor: showColor ? category.color : undefined,
            color: showColor ? category.color : undefined,
            backgroundColor: showColor ? `${category.color}10` : undefined
          }}
          onClick={handleClick}
        >
          {showIcon && category.icon && (
            <span className="text-xs">{category.icon}</span>
          )}
          <span>{displayName}</span>
        </Badge>
      );
  }
}

interface CategoryListProps {
  categories: Category[];
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showIcon?: boolean;
  showColor?: boolean;
  className?: string;
  clickable?: boolean;
  onCategoryClick?: (category: Category) => void;
  columns?: 1 | 2 | 3 | 4;
  sortBy?: 'order' | 'name' | 'usage';
}

export function CategoryList({
  categories,
  variant = 'default',
  showIcon = true,
  showColor = true,
  className,
  clickable = false,
  onCategoryClick,
  columns = 1,
  sortBy = 'order'
}: CategoryListProps) {
  const sortedCategories = [...categories].sort((a, b) => {
    switch (sortBy) {
      case 'order':
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'usage':
        // Could be extended to sort by actual usage metrics
        return (b.sortOrder || 0) - (a.sortOrder || 0);
      default:
        return 0;
    }
  });

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (variant === 'card') {
    return (
      <div className={cn(`grid gap-3 ${gridClasses[columns]}`, className)}>
        {sortedCategories.map((category) => (
          <CategoryDisplay
            key={category.id}
            category={category}
            variant={variant}
            showIcon={showIcon}
            showColor={showColor}
            clickable={clickable}
            onClick={onCategoryClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {sortedCategories.map((category) => (
        <CategoryDisplay
          key={category.id}
          category={category}
          variant={variant}
          showIcon={showIcon}
          showColor={showColor}
          clickable={clickable}
          onClick={onCategoryClick}
        />
      ))}
    </div>
  );
}