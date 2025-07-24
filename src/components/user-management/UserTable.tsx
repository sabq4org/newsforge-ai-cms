import { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye,
  Edit,
  Ban,
  UserCheck,
  Crown,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Shield
} from '@phosphor-icons/react';
import { UserProfile } from '@/types/user-management';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface UserTableProps {
  users: UserProfile[];
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  onUserAction: (action: string, userId: string) => void;
  onUserSelect: (user: UserProfile) => void;
}

export function UserTable({ 
  users, 
  selectedUsers, 
  onSelectionChange, 
  onUserAction, 
  onUserSelect 
}: UserTableProps) {
  const [sortField, setSortField] = useState<keyof UserProfile>('joinedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof UserProfile) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal instanceof Date && bVal instanceof Date) {
      return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(users.map(user => user.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary', 
      banned: 'destructive',
      pending: 'outline'
    };
    
    const labels = {
      active: 'نشط',
      inactive: 'غير نشط',
      banned: 'محظور',
      pending: 'في الانتظار'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      regular: 'outline',
      vip: 'default',
      media: 'secondary',
      admin: 'destructive',
      moderator: 'secondary'
    };
    
    const labels = {
      regular: 'عادي',
      vip: 'VIP',
      media: 'إعلامي',
      admin: 'مدير',
      moderator: 'مشرف'
    };

    return (
      <Badge variant={variants[role as keyof typeof variants] as any}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '👤';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>قائمة المستخدمين ({users.length})</span>
          {selectedUsers.length > 0 && (
            <Badge variant="secondary">
              تم اختيار {selectedUsers.length} مستخدم
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 min-w-[200px]"
                  onClick={() => handleSort('name')}
                >
                  المستخدم
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('email')}
                >
                  البريد الإلكتروني
                </TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('joinedAt')}
                >
                  تاريخ التسجيل
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('lastLogin')}
                >
                  آخر دخول
                </TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الإحصائيات</TableHead>
                <TableHead className="w-12">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-lg">{getGenderIcon(user.gender)}</span>
                          {!user.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              غير مفعّل
                            </Badge>
                          )}
                          {user.isVerified && (
                            <UserCheck className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{user.phone}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.country && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {user.country}
                        </div>
                      )}
                      {user.city && (
                        <div className="text-xs text-muted-foreground mr-4">
                          {user.city}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {formatDistanceToNow(user.joinedAt, { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span>
                          {formatDistanceToNow(user.lastLogin, { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">لم يدخل بعد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role)}
                      {user.role === 'vip' && <Crown className="w-4 h-4 text-yellow-500" />}
                      {user.role === 'admin' && <Shield className="w-4 h-4 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div>📖 {user.stats.totalArticlesRead} مقال</div>
                      <div>💬 {user.stats.commentsCount} تعليق</div>
                      <div>❤️ {user.stats.likesCount} إعجاب</div>
                      {user.loyaltyInfo && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {user.loyaltyInfo.points} نقطة
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onUserSelect(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUserAction('edit', user.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          تعديل
                        </DropdownMenuItem>
                        {!user.isVerified && (
                          <DropdownMenuItem onClick={() => onUserAction('verify', user.id)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            تفعيل الحساب
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'vip' && (
                          <DropdownMenuItem onClick={() => onUserAction('make-vip', user.id)}>
                            <Crown className="w-4 h-4 mr-2" />
                            ترقية لـ VIP
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {user.status !== 'banned' ? (
                          <DropdownMenuItem 
                            onClick={() => onUserAction('ban', user.id)}
                            className="text-red-600"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            حظر المستخدم
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => onUserAction('unban', user.id)}
                            className="text-green-600"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            إلغاء الحظر
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onUserAction('delete', user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          حذف المستخدم
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}