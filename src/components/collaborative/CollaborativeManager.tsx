import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wifi,
  WifiOff,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageCircle,
  Edit,
  Eye,
  GitMerge,
  RefreshCw,
  Shield,
  Zap
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaborative } from '@/contexts/CollaborativeContext';
import { Article } from '@/types';
import { toast } from 'sonner';

interface ConflictResolution {
  id: string;
  articleId: string;
  section: 'title' | 'content' | 'excerpt';
  conflicts: {
    user1: {
      id: string;
      name: string;
      version: string;
      timestamp: Date;
    };
    user2: {
      id: string;
      name: string;
      version: string;
      timestamp: Date;
    };
  };
  resolution?: 'accept_user1' | 'accept_user2' | 'merge' | 'custom';
  resolvedBy?: string;
  resolvedAt?: Date;
  status: 'pending' | 'resolved' | 'escalated';
}

interface ConnectionMetrics {
  status: 'connected' | 'disconnected' | 'reconnecting';
  latency: number;
  messagesPerSecond: number;
  lastHeartbeat: Date;
  sessionDuration: number;
}

interface CollaborativeManagerProps {
  article?: Article;
  onConflictResolved?: (resolution: ConflictResolution) => void;
}

export function CollaborativeManager({ article, onConflictResolved }: CollaborativeManagerProps) {
  const { user } = useAuth();
  const { participants, currentSession, isConnected } = useCollaborative();
  const [conflicts, setConflicts] = useKV<ConflictResolution[]>('sabq-conflicts', []);
  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics>({
    status: 'connected',
    latency: 45,
    messagesPerSecond: 0,
    lastHeartbeat: new Date(),
    sessionDuration: 0
  });
  const [selectedConflict, setSelectedConflict] = useState<ConflictResolution | null>(null);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [customResolution, setCustomResolution] = useState('');

  // Simulate real-time WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate connection metrics
      setConnectionMetrics(prev => ({
        ...prev,
        latency: 40 + Math.random() * 20, // 40-60ms
        messagesPerSecond: Math.random() * 10,
        lastHeartbeat: new Date(),
        sessionDuration: prev.sessionDuration + 1
      }));

      // Simulate occasional conflicts
      if (Math.random() < 0.02 && article) { // 2% chance per second
        simulateConflict();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [article]);

  // Simulate conflict detection
  const simulateConflict = () => {
    if (!article || !user) return;

    const conflictSections = ['title', 'content', 'excerpt'] as const;
    const section = conflictSections[Math.floor(Math.random() * conflictSections.length)];
    
    // Mock other user making conflicting changes
    const otherUsers = participants.filter(p => p.id !== user.id);
    if (otherUsers.length === 0) return;

    const otherUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];

    const newConflict: ConflictResolution = {
      id: `conflict_${Date.now()}`,
      articleId: article.id,
      section,
      conflicts: {
        user1: {
          id: user.id,
          name: user.login || 'أنت',
          version: `نص محدث من ${user.login}`,
          timestamp: new Date()
        },
        user2: {
          id: otherUser.id,
          name: otherUser.name,
          version: `نص محدث من ${otherUser.name}`,
          timestamp: new Date(Date.now() - 2000) // 2 seconds ago
        }
      },
      status: 'pending'
    };

    setConflicts(current => [newConflict, ...current]);
    toast.error(`تعارض في ${section === 'title' ? 'العنوان' : section === 'content' ? 'المحتوى' : 'المقتطف'} مع ${otherUser.name}`);
  };

  // Enhanced conflict resolution with AI assistance
  const resolveWithAI = async (conflict: ConflictResolution) => {
    try {
      const prompt = spark.llmPrompt`You are resolving a collaborative editing conflict in an Arabic news article. Two users have made different changes to the same section.

Article Section: ${conflict.section}
User 1 (${conflict.conflicts.user1.name}): "${conflict.conflicts.user1.version}"
User 2 (${conflict.conflicts.user2.name}): "${conflict.conflicts.user2.version}"

Analyze both versions and provide:
1. A merged version that incorporates the best elements from both
2. Explanation of changes made
3. Confidence score (0-100)

Consider:
- Arabic language accuracy and style
- Journalistic quality and readability
- Factual accuracy and completeness
- Maintaining the original intent

Return JSON format:
{
  "mergedVersion": "the merged text",
  "explanation": "explanation in Arabic",
  "confidence": 85,
  "recommendedAction": "merge|accept_user1|accept_user2"
}`;

      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const aiResolution = JSON.parse(result);

      setCustomResolution(aiResolution.mergedVersion);
      
      toast.success(`الذكاء الاصطناعي اقترح حلاً بثقة ${aiResolution.confidence}%`);
      return aiResolution;

    } catch (error) {
      console.error('Error resolving conflict with AI:', error);
      toast.error('حدث خطأ في الحل الذكي');
      return null;
    }
  };

  // Handle conflict resolution
  const handleResolveConflict = (conflict: ConflictResolution, resolution: ConflictResolution['resolution'], customText?: string) => {
    if (!user) return;

    const resolvedConflict: ConflictResolution = {
      ...conflict,
      resolution,
      resolvedBy: user.id,
      resolvedAt: new Date(),
      status: 'resolved'
    };

    setConflicts(current => 
      current.map(c => c.id === conflict.id ? resolvedConflict : c)
    );

    onConflictResolved?.(resolvedConflict);
    setIsConflictDialogOpen(false);
    setSelectedConflict(null);
    setCustomResolution('');

    toast.success('تم حل التعارض بنجاح');
  };

  // Connection status indicator
  const getConnectionStatus = () => {
    if (!isConnected) {
      return { color: 'red', text: 'منقطع', icon: WifiOff };
    }
    
    if (connectionMetrics.latency > 100) {
      return { color: 'yellow', text: 'بطيء', icon: Wifi };
    }
    
    return { color: 'green', text: 'متصل', icon: Wifi };
  };

  const connectionStatus = getConnectionStatus();
  const pendingConflicts = conflicts.filter(c => c.status === 'pending');

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة التعاون المباشر</h1>
          <p className="text-muted-foreground">مراقبة وحل تعارضات التحرير المتزامن</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <connectionStatus.icon size={20} style={{ color: connectionStatus.color }} />
            حالة الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: connectionStatus.color }}>
                {connectionStatus.text}
              </p>
              <p className="text-sm text-muted-foreground">الحالة</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(connectionMetrics.latency)}ms</p>
              <p className="text-sm text-muted-foreground">زمن الاستجابة</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(connectionMetrics.messagesPerSecond)}</p>
              <p className="text-sm text-muted-foreground">رسائل/ثانية</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(connectionMetrics.sessionDuration / 60)}</p>
              <p className="text-sm text-muted-foreground">دقائق الجلسة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            المشاركون النشطون ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center gap-2 p-2 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{participant.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                    {participant.isTyping && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Edit size={10} />
                        يكتب...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Conflicts */}
      {pendingConflicts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle size={20} />
              تعارضات تحتاج حل ({pendingConflicts.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              هناك تعديلات متضاربة تحتاج لمراجعة وحل فوري
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingConflicts.map(conflict => (
                <div key={conflict.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div>
                    <p className="font-medium">
                      تعارض في {conflict.section === 'title' ? 'العنوان' : conflict.section === 'content' ? 'المحتوى' : 'المقتطف'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      بين {conflict.conflicts.user1.name} و {conflict.conflicts.user2.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conflict.conflicts.user2.timestamp.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedConflict(conflict);
                        setIsConflictDialogOpen(true);
                      }}
                    >
                      <GitMerge size={14} className="ml-1" />
                      حل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflict Resolution Dialog */}
      <Dialog open={isConflictDialogOpen} onOpenChange={setIsConflictDialogOpen}>
        <DialogContent className="max-w-4xl" dir="rtl">
          {selectedConflict && (
            <>
              <DialogHeader>
                <DialogTitle>حل التعارض في {selectedConflict.section}</DialogTitle>
                <DialogDescription>
                  اختر الإصدار المناسب أو ادمج التغييرات
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* User Versions Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                          {selectedConflict.conflicts.user1.name.charAt(0)}
                        </div>
                        إصدار {selectedConflict.conflicts.user1.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        {selectedConflict.conflicts.user1.version}
                      </div>
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => handleResolveConflict(selectedConflict, 'accept_user1')}
                      >
                        اختيار هذا الإصدار
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                          {selectedConflict.conflicts.user2.name.charAt(0)}
                        </div>
                        إصدار {selectedConflict.conflicts.user2.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                        {selectedConflict.conflicts.user2.version}
                      </div>
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => handleResolveConflict(selectedConflict, 'accept_user2')}
                      >
                        اختيار هذا الإصدار
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Resolution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap size={16} />
                      حل ذكي مقترح
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => resolveWithAI(selectedConflict)}
                      className="w-full"
                    >
                      <Shield size={16} className="ml-2" />
                      اطلب مساعدة الذكاء الاصطناعي
                    </Button>
                    
                    {customResolution && (
                      <div>
                        <Textarea
                          value={customResolution}
                          onChange={(e) => setCustomResolution(e.target.value)}
                          placeholder="النص المدموج..."
                          rows={4}
                        />
                        <Button
                          className="mt-2 w-full"
                          onClick={() => handleResolveConflict(selectedConflict, 'custom', customResolution)}
                        >
                          استخدام الحل المخصص
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsConflictDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button
                    onClick={() => handleResolveConflict(selectedConflict, 'merge')}
                    variant="outline"
                  >
                    <GitMerge size={16} className="ml-2" />
                    دمج يدوي
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Recent Resolutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} />
            التعارضات المحلولة مؤخراً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {conflicts
              .filter(c => c.status === 'resolved')
              .slice(0, 5)
              .map(conflict => (
                <div key={conflict.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">
                      {conflict.section} - {conflict.resolution === 'merge' ? 'دمج' : 
                       conflict.resolution === 'accept_user1' ? `قبول ${conflict.conflicts.user1.name}` :
                       `قبول ${conflict.conflicts.user2.name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      حلها {conflict.resolvedBy} في {conflict.resolvedAt?.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  
                  <Badge variant="outline" className="text-green-600">
                    محلول
                  </Badge>
                </div>
              ))}
            
            {conflicts.filter(c => c.status === 'resolved').length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                لا توجد تعارضات محلولة بعد
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}