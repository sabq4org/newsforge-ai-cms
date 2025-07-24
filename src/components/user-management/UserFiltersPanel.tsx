import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from '@phosphor-icons/react';
import { UserFilters, UserProfile } from '@/types/user-management';

interface UserFiltersPanelProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  users: UserProfile[];
}

export function UserFiltersPanel({ filters, onFiltersChange, users }: UserFiltersPanelProps) {
  // Extract unique values for filter options
  const countries = [...new Set(users.map(u => u.country).filter(Boolean))];
  const cities = [...new Set(users.map(u => u.city).filter(Boolean))];
  const tags = [...new Set(users.flatMap(u => u.tags))];
  const interests = [...new Set(users.flatMap(u => u.preferences.interests))];

  const updateFilter = (key: keyof UserFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && v !== null && v !== '' && 
    (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">الفلاتر المتقدمة</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} فلتر نشط
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          مسح الكل
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>الحالة</Label>
          <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
              <SelectItem value="banned">محظور</SelectItem>
              <SelectItem value="pending">في الانتظار</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <Label>نوع الحساب</Label>
          <Select value={filters.role || ''} onValueChange={(value) => updateFilter('role', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الأنواع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الأنواع</SelectItem>
              <SelectItem value="regular">عادي</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="media">إعلامي</SelectItem>
              <SelectItem value="admin">مدير</SelectItem>
              <SelectItem value="moderator">مشرف</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Country Filter */}
        <div className="space-y-2">
          <Label>الدولة</Label>
          <Select value={filters.country || ''} onValueChange={(value) => updateFilter('country', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الدول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الدول</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country!}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className="space-y-2">
          <Label>الجنس</Label>
          <Select value={filters.gender || ''} onValueChange={(value) => updateFilter('gender', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
              <SelectItem value="not-specified">غير محدد</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Verification Status */}
        <div className="space-y-2">
          <Label>حالة التفعيل</Label>
          <Select 
            value={filters.isVerified === undefined ? '' : filters.isVerified.toString()} 
            onValueChange={(value) => updateFilter('isVerified', value === '' ? undefined : value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="true">مفعّل</SelectItem>
              <SelectItem value="false">غير مفعّل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Articles Read */}
        <div className="space-y-2">
          <Label>الحد الأدنى للمقالات المقروءة</Label>
          <Input
            type="number"
            placeholder="0"
            value={filters.minArticlesRead || ''}
            onChange={(e) => updateFilter('minArticlesRead', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <Label>المدينة</Label>
          <Select value={filters.city || ''} onValueChange={(value) => updateFilter('city', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="جميع المدن" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع المدن</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city!}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>تاريخ التسجيل</Label>
          <div className="flex gap-2">
            <DatePicker
              value={filters.joinedAfter}
              onChange={(date) => updateFilter('joinedAfter', date)}
              placeholder="من"
            />
            <DatePicker
              value={filters.joinedBefore}
              onChange={(date) => updateFilter('joinedBefore', date)}
              placeholder="إلى"
            />
          </div>
        </div>

        {/* Last Login Range */}
        <div className="space-y-2">
          <Label>آخر دخول</Label>
          <div className="flex gap-2">
            <DatePicker
              value={filters.lastLoginAfter}
              onChange={(date) => updateFilter('lastLoginAfter', date)}
              placeholder="من"
            />
            <DatePicker
              value={filters.lastLoginBefore}
              onChange={(date) => updateFilter('lastLoginBefore', date)}
              placeholder="إلى"
            />
          </div>
        </div>
      </div>

      {/* Tags and Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>الوسوم</Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {tags.map(tag => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={filters.tags?.includes(tag) || false}
                  onCheckedChange={(checked) => {
                    const currentTags = filters.tags || [];
                    if (checked) {
                      updateFilter('tags', [...currentTags, tag]);
                    } else {
                      updateFilter('tags', currentTags.filter(t => t !== tag));
                    }
                  }}
                />
                <Label htmlFor={`tag-${tag}`} className="text-sm">
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>الاهتمامات</Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {interests.map(interest => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={`interest-${interest}`}
                  checked={filters.interests?.includes(interest) || false}
                  onCheckedChange={(checked) => {
                    const currentInterests = filters.interests || [];
                    if (checked) {
                      updateFilter('interests', [...currentInterests, interest]);
                    } else {
                      updateFilter('interests', currentInterests.filter(i => i !== interest));
                    }
                  }}
                />
                <Label htmlFor={`interest-${interest}`} className="text-sm">
                  {interest}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}