import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Globe,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Clock,
  Medal,
  Trophy,
  Activity
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { UserProfile, UserFilters, UserAnalytics } from '@/types/user-management';
import { UserTable } from './UserTable';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { ImportUsersModal } from './ImportUsersModal';
import { UserAnalyticsCard } from './UserAnalyticsCard';
import { UserFiltersPanel } from './UserFiltersPanel';

// Mock data for demonstration
const generateMockUsers = (): UserProfile[] => {
  const roles = ['regular', 'vip', 'media', 'admin'];
  const countries = ['السعودية', 'الإمارات', 'مصر', 'الأردن', 'لبنان', 'الكويت', 'قطر'];
  const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'أبها', 'تبوك'];
  const interests = ['تقنية', 'رياضة', 'سياسة', 'اقتصاد', 'ثقافة', 'صحة', 'سفر'];
  
  return Array.from({ length: 150 }, (_, i) => ({
    id: `user_${i + 1}`,
    name: `مستخدم ${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `+966${Math.floor(Math.random() * 1000000000)}`,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    country: countries[Math.floor(Math.random() * countries.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
    isVerified: Math.random() > 0.2,
    status: Math.random() > 0.95 ? 'banned' : (Math.random() > 0.9 ? 'inactive' : 'active'),
    role: roles[Math.floor(Math.random() * roles.length)] as any,
    tags: interests.slice(0, Math.floor(Math.random() * 3) + 1),
    joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastLogin: Math.random() > 0.1 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
    preferences: {
      language: 'ar',
      timezone: 'Asia/Riyadh',
      newsletter: Math.random() > 0.3,
      emailNotifications: Math.random() > 0.4,
      pushNotifications: Math.random() > 0.5,
      interests: interests.slice(0, Math.floor(Math.random() * 4) + 1),
      readingTime: ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)] as any
    },
    stats: {
      totalArticlesRead: Math.floor(Math.random() * 1000),
      totalTimeSpent: Math.floor(Math.random() * 10000),
      commentsCount: Math.floor(Math.random() * 50),
      likesCount: Math.floor(Math.random() * 200),
      sharesCount: Math.floor(Math.random() * 100),
      bookmarksCount: Math.floor(Math.random() * 80),
      currentStreak: Math.floor(Math.random() * 30),
      longestStreak: Math.floor(Math.random() * 100),
      averageReadingTime: Math.floor(Math.random() * 10) + 2,
      favoriteCategories: interests.slice(0, 3)
    },
    loyaltyInfo: {
      tier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)] as any,
      points: Math.floor(Math.random() * 5000),
      level: Math.floor(Math.random() * 20) + 1,
      badges: ['early_adopter', 'frequent_reader', 'social_sharer'].slice(0, Math.floor(Math.random() * 3)),
      achievements: ['first_article', 'weekly_reader', 'social_butterfly'].slice(0, Math.floor(Math.random() * 3))
    }
  }));
};

export function UserManagementDashboard() {
  const [users, setUsers] = useKV<UserProfile[]>('sabq-users', generateMockUsers());
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(users || []);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showImportUsers, setShowImportUsers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Calculate analytics
  const analytics: UserAnalytics = {
    totalUsers: users?.length || 0,
    activeUsers: users?.filter(u => u.lastLogin && u.lastLogin > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
    newUsersToday: users?.filter(u => u.joinedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0,
    unverifiedUsers: users?.filter(u => !u.isVerified).length || 0,
    bannedUsers: users?.filter(u => u.status === 'banned').length || 0,
    usersByCountry: {},
    usersByRole: {},
    userGrowth: [],
    engagementMetrics: {
      averageSessionTime: 12.5,
      averageArticlesPerUser: 45,
      retentionRate: 78.5
    }
  };

  // Apply filters and search
  useEffect(() => {
    if (!users) return;
    
    let filtered = [...users];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone?.includes(term) ||
        user.country?.toLowerCase().includes(term) ||
        user.city?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }
    if (filters.country) {
      filtered = filtered.filter(user => user.country === filters.country);
    }
    if (filters.gender) {
      filtered = filtered.filter(user => user.gender === filters.gender);
    }
    if (filters.isVerified !== undefined) {
      filtered = filtered.filter(user => user.isVerified === filters.isVerified);
    }
    if (filters.minArticlesRead) {
      filtered = filtered.filter(user => user.stats.totalArticlesRead >= filters.minArticlesRead!);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filters]);

  const handleUserAction = (action: string, userId: string) => {
    if (!users) return;
    
    setUsers(currentUsers => {
      if (!currentUsers) return currentUsers;
      
      return currentUsers.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'ban':
              return { ...user, status: 'banned' as const };
            case 'unban':
              return { ...user, status: 'active' as const };
            case 'verify':
              return { ...user, isVerified: true };
            case 'make-vip':
              return { ...user, role: 'vip' as const };
            case 'delete':
              return null;
            default:
              return user;
          }
        }
        return user;
      }).filter(Boolean) as UserProfile[];
    });

    toast.success(`تم ${action === 'ban' ? 'حظر' : action === 'unban' ? 'إلغاء حظر' : action === 'verify' ? 'تفعيل' : action === 'make-vip' ? 'ترقية' : 'حذف'} المستخدم`);
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('يرجى اختيار مستخدمين أولاً');
      return;
    }

    selectedUsers.forEach(userId => {
      handleUserAction(action, userId);
    });

    setSelectedUsers([]);
    toast.success(`تم تطبيق الإجراء على ${selectedUsers.length} مستخدم`);
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    const dataToExport = selectedUsers.length > 0 
      ? filteredUsers.filter(user => selectedUsers.includes(user.id))
      : filteredUsers;

    // In a real implementation, this would generate and download the file
    console.log('Exporting users:', dataToExport, 'format:', format);
    toast.success(`تم تصدير ${dataToExport.length} مستخدم بصيغة ${format.toUpperCase()}`);
  };

  const handleAddUser = (userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone,
      gender: userData.gender,
      country: userData.country,
      city: userData.city,
      isVerified: userData.isVerified || false,
      status: 'active',
      role: userData.role || 'regular',
      tags: userData.tags || [],
      joinedAt: new Date(),
      preferences: {
        language: 'ar',
        timezone: 'Asia/Riyadh',
        newsletter: true,
        emailNotifications: true,
        pushNotifications: true,
        interests: [],
        readingTime: 'evening'
      },
      stats: {
        totalArticlesRead: 0,
        totalTimeSpent: 0,
        commentsCount: 0,
        likesCount: 0,
        sharesCount: 0,
        bookmarksCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageReadingTime: 0,
        favoriteCategories: []
      }
    };

    setUsers(currentUsers => [...(currentUsers || []), newUser]);
    setShowAddUser(false);
    toast.success('تم إضافة المستخدم بنجاح');
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">إدارة أكثر من مليون مستخدم مسجل</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowImportUsers(true)} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            استيراد
          </Button>
          <Button onClick={() => setShowAddUser(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <UserAnalyticsCard
          title="إجمالي المستخدمين"
          value={analytics.totalUsers.toLocaleString()}
          icon={Users}
          color="blue"
        />
        <UserAnalyticsCard
          title="المستخدمون النشطون"
          value={analytics.activeUsers.toLocaleString()}
          subtitle="آخر 30 يوم"
          icon={UserCheck}
          color="green"
        />
        <UserAnalyticsCard
          title="مستخدمون جدد اليوم"
          value={analytics.newUsersToday.toLocaleString()}
          icon={UserPlus}
          color="purple"
        />
        <UserAnalyticsCard
          title="غير مفعّلين"
          value={analytics.unverifiedUsers.toLocaleString()}
          icon={Clock}
          color="orange"
        />
        <UserAnalyticsCard
          title="محظورين"
          value={analytics.bannedUsers.toLocaleString()}
          icon={UserX}
          color="red"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <Input
                id="search"
                placeholder="ابحث بالاسم، البريد، الهاتف، المدينة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              فلاتر متقدمة
            </Button>
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <Select onValueChange={handleBulkAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="إجراء جماعي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verify">تفعيل الكل</SelectItem>
                    <SelectItem value="ban">حظر الكل</SelectItem>
                    <SelectItem value="unban">إلغاء الحظر</SelectItem>
                    <SelectItem value="make-vip">ترقية لـ VIP</SelectItem>
                    <SelectItem value="delete">حذف الكل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2">
                <Download className="w-4 h-4" />
                تصدير CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')} className="gap-2">
                <Download className="w-4 h-4" />
                تصدير Excel
              </Button>
            </div>
          </div>

          {showFilters && (
            <UserFiltersPanel 
              filters={filters}
              onFiltersChange={setFilters}
              users={users || []}
            />
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onUserAction={handleUserAction}
        onUserSelect={(user) => {
          setSelectedUser(user);
          setShowUserDetails(true);
        }}
      />

      {/* Modals */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowUserDetails(false)}
          onUserUpdate={(updates) => {
            setUsers(currentUsers => 
              currentUsers?.map(u => u.id === selectedUser.id ? { ...u, ...updates } : u) || []
            );
            setSelectedUser({ ...selectedUser, ...updates });
          }}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onAddUser={handleAddUser}
        />
      )}

      {showImportUsers && (
        <ImportUsersModal
          onClose={() => setShowImportUsers(false)}
          onImport={(importedUsers) => {
            // Handle import logic
            console.log('Importing users:', importedUsers);
            toast.success(`تم استيراد ${importedUsers.length} مستخدم`);
          }}
        />
      )}
    </div>
  );
}