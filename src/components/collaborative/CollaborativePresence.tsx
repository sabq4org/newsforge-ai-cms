import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCollaborative } from '@/contexts/CollaborativeContext';
import { 
  Users, 
  MessageCircle, 
  Eye, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  UserPlus
} from '@phosphor-icons/react';
import { CollaborativeUser, CollaborativeComment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CollaborativePresenceProps {
  articleId: string;
  className?: string;
}

export function CollaborativePresence({ articleId, className }: CollaborativePresenceProps) {
  const { 
    participants, 
    isConnected, 
    joinSession, 
    leaveSession,
    currentSession,
    getComments,
    checkPermission
  } = useCollaborative();
  
  const [showParticipants, setShowParticipants] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const comments = getComments();
  
  useEffect(() => {
    if (articleId && !currentSession) {
      joinSession(articleId);
    }
    
    return () => {
      if (currentSession) {
        leaveSession();
      }
    };
  }, [articleId]);

  const activeParticipants = participants.filter(p => p.connectionStatus === 'online');
  const typingUsers = participants.filter(p => p.isTyping && p.connectionStatus === 'online');

  return (
    <TooltipProvider>
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                التعاون المباشر
              </span>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? 'متصل' : 'غير متصل'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="relative"
                >
                  <MessageCircle className="w-4 h-4" />
                  {comments.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                      {comments.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>التعليقات والملاحظات</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParticipants(!showParticipants)}
                >
                  <Users className="w-4 h-4" />
                  <span className="ml-1">{activeParticipants.length}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>المشاركون النشطون</TooltipContent>
            </Tooltip>
            
            {checkPermission('invite') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>دعوة مشاركين جدد</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Active Participants Avatars */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">المشاركون:</span>
          <div className="flex -space-x-2">
            {activeParticipants.slice(0, 5).map((participant) => (
              <Tooltip key={participant.id}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-background">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-xs" style={{ backgroundColor: participant.color }}>
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
                      style={{ 
                        backgroundColor: participant.connectionStatus === 'online' ? '#22c55e' : '#6b7280' 
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{participant.nameAr || participant.name}</p>
                    <p className="text-xs text-muted-foreground">{participant.role}</p>
                    <p className="text-xs">
                      آخر نشاط: {formatDistanceToNow(participant.lastSeen, { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
            {activeParticipants.length > 5 && (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                +{activeParticipants.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
            <Edit3 className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {typingUsers.length === 1 
                ? `${typingUsers[0].nameAr || typingUsers[0].name} يكتب...`
                : `${typingUsers.length} أشخاص يكتبون...`
              }
            </span>
          </div>
        )}

        {/* Participants Panel */}
        {showParticipants && (
          <div className="border rounded-lg p-3 mb-4">
            <h4 className="font-medium mb-3">جميع المشاركين</h4>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {participants.map((participant) => (
                  <ParticipantItem key={participant.id} participant={participant} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Comments Panel */}
        {showComments && (
          <div className="border rounded-lg p-3">
            <h4 className="font-medium mb-3">التعليقات والملاحظات</h4>
            <ScrollArea className="max-h-64">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد تعليقات بعد
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}

function ParticipantItem({ participant }: { participant: CollaborativeUser }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'away':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="w-6 h-6">
          <AvatarImage src={participant.avatar} />
          <AvatarFallback 
            className="text-xs"
            style={{ backgroundColor: participant.color }}
          >
            {participant.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{participant.nameAr || participant.name}</p>
          <p className="text-xs text-muted-foreground">{participant.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {participant.isTyping && (
          <Edit3 className="w-3 h-3 text-blue-600 animate-pulse" />
        )}
        {getStatusIcon(participant.connectionStatus)}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: CollaborativeComment }) {
  const { resolveComment, checkPermission } = useCollaborative();
  
  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'suggestion':
        return <Edit3 className="w-4 h-4 text-green-600" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'question':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getCommentIcon(comment.type)}
          <span className="text-sm font-medium">
            {comment.author.nameAr || comment.author.name}
          </span>
          <Badge variant="outline" className="text-xs">
            {comment.type === 'comment' ? 'تعليق' :
             comment.type === 'suggestion' ? 'اقتراح' :
             comment.type === 'approval' ? 'موافقة' : 'سؤال'}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ar })}
        </span>
      </div>
      
      <p className="text-sm">{comment.content}</p>
      
      {comment.position.selectedText && (
        <div className="p-2 bg-muted rounded text-xs">
          <span className="font-medium">النص المحدد: </span>
          <span className="italic">"{comment.position.selectedText}"</span>
        </div>
      )}
      
      {comment.status === 'open' && checkPermission('approve') && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => resolveComment(comment.id)}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            تم الحل
          </Button>
        </div>
      )}
      
      {comment.status === 'resolved' && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span>تم الحل</span>
        </div>
      )}
    </div>
  );
}