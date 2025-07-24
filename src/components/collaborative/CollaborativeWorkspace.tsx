import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCollaborative } from '@/contexts/CollaborativeContext';
import { 
  Activity, 
  Edit3, 
  MessageCircle, 
  FileText,
  Clock,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  Settings
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'edit' | 'comment' | 'join' | 'leave' | 'save' | 'conflict' | 'resolve';
  userId: string;
  userName: string;
  userNameAr?: string;
  userColor: string;
  section?: 'title' | 'content' | 'excerpt';
  description: string;
  descriptionAr: string;
  timestamp: Date;
}

interface CollaborativeWorkspaceProps {
  articleId: string;
  className?: string;
}

export function CollaborativeWorkspace({ articleId, className }: CollaborativeWorkspaceProps) {
  const { 
    participants, 
    currentSession, 
    isConnected,
    getComments,
    checkPermission
  } = useCollaborative();
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const comments = getComments();
  const activeParticipants = participants.filter(p => p.connectionStatus === 'online');
  
  // Mock activities for demonstration
  useEffect(() => {
    if (currentSession) {
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'join',
          userId: 'user1',
          userName: 'أحمد محمد',
          userNameAr: 'أحمد محمد',
          userColor: '#FF6B6B',
          description: 'joined the editing session',
          descriptionAr: 'انضم لجلسة التحرير',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: '2',
          type: 'edit',
          userId: 'user2',
          userName: 'سارة أحمد',
          userNameAr: 'سارة أحمد',
          userColor: '#4ECDC4',
          section: 'title',
          description: 'edited the title',
          descriptionAr: 'حررت العنوان',
          timestamp: new Date(Date.now() - 3 * 60 * 1000)
        },
        {
          id: '3',
          type: 'comment',
          userId: 'user3',
          userName: 'محمد علي',
          userNameAr: 'محمد علي',
          userColor: '#45B7D1',
          section: 'content',
          description: 'added a comment on content',
          descriptionAr: 'أضاف تعليقاً على المحتوى',
          timestamp: new Date(Date.now() - 2 * 60 * 1000)
        }
      ];
      setActivities(mockActivities);
    }
  }, [currentSession]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'join':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'leave':
        return <Users className="w-4 h-4 text-red-600" />;
      case 'save':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'conflict':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'resolve':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSectionLabel = (section?: string) => {
    switch (section) {
      case 'title': return 'العنوان';
      case 'content': return 'المحتوى';
      case 'excerpt': return 'الملخص';
      default: return '';
    }
  };

  if (!currentSession) {
    return null;
  }

  return (
    <Card className={className}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-medium">مساحة العمل التعاونية</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? 'متصل' : 'غير متصل'}
            </Badge>
            {checkPermission('invite') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold text-primary">{activeParticipants.length}</div>
            <div className="text-xs text-muted-foreground">مشارك نشط</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">{comments.length}</div>
            <div className="text-xs text-muted-foreground">تعليق</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">{activities.length}</div>
            <div className="text-xs text-muted-foreground">نشاط</div>
          </div>
        </div>

        <Separator />

        {/* Active Participants */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            المشاركون النشطون
          </h4>
          <div className="space-y-2">
            {activeParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback 
                    className="text-xs"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {participant.nameAr || participant.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{participant.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  {participant.isTyping && (
                    <Edit3 className="w-3 h-3 text-blue-600 animate-pulse" />
                  )}
                  {participant.cursor && (
                    <Eye className="w-3 h-3 text-gray-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            النشاط الأخير
          </h4>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${activity.userColor}20` }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-medium">{activity.userNameAr || activity.userName}</span>
                      <span className="text-muted-foreground">{activity.descriptionAr}</span>
                      {activity.section && (
                        <Badge variant="outline" className="text-xs">
                          {getSectionLabel(activity.section)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(activity.timestamp, { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا يوجد نشاط حديث</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Session Settings */}
        {showSettings && checkPermission('invite') && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">إعدادات الجلسة</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  دعوة مشاركين جدد
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  إعدادات الصلاحيات
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  تصدير سجل النشاط
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}