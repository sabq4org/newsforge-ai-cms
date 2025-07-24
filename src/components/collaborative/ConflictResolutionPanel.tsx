import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  GitMerge,
  Clock,
  Users,
  FileText
} from '@phosphor-icons/react';
import { ConflictResolution, CollaborativeUser } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ConflictData {
  id: string;
  field: 'title' | 'content' | 'excerpt' | 'tags' | 'category';
  user1: {
    user: CollaborativeUser;
    value: string;
    timestamp: Date;
  };
  user2: {
    user: CollaborativeUser;
    value: string;
    timestamp: Date;
  };
  status: 'pending' | 'resolved';
}

interface ConflictResolutionPanelProps {
  conflicts: ConflictData[];
  onResolveConflict: (conflictId: string, resolution: ConflictResolution) => void;
  className?: string;
}

export function ConflictResolutionPanel({ 
  conflicts, 
  onResolveConflict, 
  className 
}: ConflictResolutionPanelProps) {
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null);
  const [resolutionMethod, setResolutionMethod] = useState<'merge' | 'user1' | 'user2' | 'manual'>('merge');
  const [manualResolution, setManualResolution] = useState('');

  const pendingConflicts = conflicts.filter(c => c.status === 'pending');
  const resolvedConflicts = conflicts.filter(c => c.status === 'resolved');

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'title': return 'العنوان';
      case 'content': return 'المحتوى';
      case 'excerpt': return 'الملخص';
      case 'tags': return 'العلامات';
      case 'category': return 'الفئة';
      default: return field;
    }
  };

  const handleResolveConflict = () => {
    if (!selectedConflict) return;

    let resolvedValue: string;
    let resolutionType: 'merge' | 'overwrite' | 'manual';

    switch (resolutionMethod) {
      case 'user1':
        resolvedValue = selectedConflict.user1.value;
        resolutionType = 'overwrite';
        break;
      case 'user2':
        resolvedValue = selectedConflict.user2.value;
        resolutionType = 'overwrite';
        break;
      case 'manual':
        resolvedValue = manualResolution;
        resolutionType = 'manual';
        break;
      case 'merge':
      default:
        // Simple merge strategy - in practice this would be more sophisticated
        resolvedValue = `${selectedConflict.user1.value} ${selectedConflict.user2.value}`;
        resolutionType = 'merge';
        break;
    }

    const resolution: ConflictResolution = {
      id: `resolution_${Date.now()}`,
      type: resolutionType,
      field: selectedConflict.field,
      conflictingChanges: {
        user1: {
          userId: selectedConflict.user1.user.id,
          value: selectedConflict.user1.value,
          timestamp: selectedConflict.user1.timestamp
        },
        user2: {
          userId: selectedConflict.user2.user.id,
          value: selectedConflict.user2.value,
          timestamp: selectedConflict.user2.timestamp
        }
      },
      resolution: resolvedValue,
      resolvedBy: 'current-user', // In practice, this would be the actual user ID
      resolvedAt: new Date()
    };

    onResolveConflict(selectedConflict.id, resolution);
    setSelectedConflict(null);
    setManualResolution('');
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          حل التعارضات
          {pendingConflicts.length > 0 && (
            <Badge variant="destructive">
              {pendingConflicts.length} تعارض في الانتظار
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingConflicts.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              هناك تعارضات في التحرير تحتاج لحل. يرجى مراجعة التغييرات المتضاربة واختيار الحل المناسب.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conflicts List */}
          <div className="space-y-2">
            <h3 className="font-medium">التعارضات المعلقة</h3>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {pendingConflicts.map((conflict) => (
                  <ConflictItem
                    key={conflict.id}
                    conflict={conflict}
                    isSelected={selectedConflict?.id === conflict.id}
                    onClick={() => setSelectedConflict(conflict)}
                  />
                ))}
                {pendingConflicts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>لا توجد تعارضات معلقة</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Resolution Panel */}
          {selectedConflict && (
            <div className="space-y-4">
              <h3 className="font-medium">حل التعارض - {getFieldLabel(selectedConflict.field)}</h3>
              
              <div className="space-y-4">
                {/* User 1 Version */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedConflict.user1.user.color }}
                      />
                      <span className="font-medium">
                        {selectedConflict.user1.user.nameAr || selectedConflict.user1.user.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(selectedConflict.user1.timestamp, { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </span>
                  </div>
                  <div className="p-2 bg-muted rounded text-sm">
                    {selectedConflict.user1.value}
                  </div>
                  <Button
                    variant={resolutionMethod === 'user1' ? 'default' : 'outline'}
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setResolutionMethod('user1')}
                  >
                    اختيار هذا الإصدار
                  </Button>
                </div>

                {/* User 2 Version */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedConflict.user2.user.color }}
                      />
                      <span className="font-medium">
                        {selectedConflict.user2.user.nameAr || selectedConflict.user2.user.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(selectedConflict.user2.timestamp, { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </span>
                  </div>
                  <div className="p-2 bg-muted rounded text-sm">
                    {selectedConflict.user2.value}
                  </div>
                  <Button
                    variant={resolutionMethod === 'user2' ? 'default' : 'outline'}
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setResolutionMethod('user2')}
                  >
                    اختيار هذا الإصدار
                  </Button>
                </div>

                {/* Merge Option */}
                <div className="border rounded-lg p-3">
                  <Button
                    variant={resolutionMethod === 'merge' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => setResolutionMethod('merge')}
                  >
                    <GitMerge className="w-4 h-4 mr-2" />
                    دمج التغييرات
                  </Button>
                  {resolutionMethod === 'merge' && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      {selectedConflict.user1.value} {selectedConflict.user2.value}
                    </div>
                  )}
                </div>

                {/* Manual Resolution */}
                <div className="border rounded-lg p-3">
                  <Button
                    variant={resolutionMethod === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full mb-2"
                    onClick={() => setResolutionMethod('manual')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    حل يدوي
                  </Button>
                  {resolutionMethod === 'manual' && (
                    <textarea
                      className="w-full p-2 border rounded text-sm resize-none"
                      rows={3}
                      placeholder="اكتب الحل اليدوي هنا..."
                      value={manualResolution}
                      onChange={(e) => setManualResolution(e.target.value)}
                      style={{ direction: 'rtl' }}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleResolveConflict}
                    disabled={resolutionMethod === 'manual' && !manualResolution.trim()}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    تطبيق الحل
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedConflict(null)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resolved Conflicts History */}
        {resolvedConflicts.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">التعارضات المحلولة</h3>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {resolvedConflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-800"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        تم حل تعارض في {getFieldLabel(conflict.field)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ConflictItem({ 
  conflict, 
  isSelected, 
  onClick 
}: { 
  conflict: ConflictData; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'title': return 'العنوان';
      case 'content': return 'المحتوى';
      case 'excerpt': return 'الملخص';
      case 'tags': return 'العلامات';
      case 'category': return 'الفئة';
      default: return field;
    }
  };

  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span className="font-medium">{getFieldLabel(conflict.field)}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          معلق
        </Badge>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: conflict.user1.user.color }}
          />
          <span>{conflict.user1.user.nameAr || conflict.user1.user.name}</span>
          <span className="text-muted-foreground">vs</span>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: conflict.user2.user.color }}
          />
          <span>{conflict.user2.user.nameAr || conflict.user2.user.name}</span>
        </div>
      </div>
    </div>
  );
}