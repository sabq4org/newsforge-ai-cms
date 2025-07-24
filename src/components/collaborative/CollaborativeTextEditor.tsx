import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollaborative } from '@/contexts/CollaborativeContext';
import { 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle,
  Edit3,
  Eye,
  Lock,
  Unlock
} from '@phosphor-icons/react';
import { CursorPosition, TextSelection, CollaborativeOperation } from '@/types';
import debounce from 'lodash/debounce';

interface CollaborativeTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  section: 'title' | 'content' | 'excerpt';
  className?: string;
  rows?: number;
  maxLength?: number;
  label?: string;
  required?: boolean;
}

export function CollaborativeTextEditor({
  value,
  onChange,
  placeholder,
  section,
  className,
  rows = 4,
  maxLength,
  label,
  required
}: CollaborativeTextEditorProps) {
  const {
    participants,
    currentSession,
    sendOperation,
    updateCursor,
    updateSelection,
    setTypingStatus,
    addComment,
    checkPermission
  } = useCollaborative();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const [isLocked, setIsLocked] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [collaborativeSelections, setCollaborativeSelections] = useState<Map<string, TextSelection>>(new Map());

  // Permission check
  const canEdit = checkPermission('edit', section);
  const canComment = checkPermission('comment');

  // Debounced typing status update
  const debouncedSetTypingStatus = useCallback(
    debounce((isTyping: boolean) => setTypingStatus(isTyping), 500),
    [setTypingStatus]
  );

  // Handle text changes with collaborative operations
  const handleTextChange = useCallback((newValue: string) => {
    if (!canEdit || isLocked) return;

    const oldValue = localValue;
    setLocalValue(newValue);
    onChange(newValue);

    // Send collaborative operation
    if (currentSession && newValue !== oldValue) {
      const operation: Omit<CollaborativeOperation, 'id' | 'sessionId' | 'userId' | 'timestamp' | 'appliedBy'> = {
        type: newValue.length > oldValue.length ? 'insert' : 'delete',
        section,
        position: {
          index: 0, // In a real implementation, this would be the actual cursor position
          length: Math.abs(newValue.length - oldValue.length)
        },
        content: newValue.length > oldValue.length ? newValue.slice(oldValue.length) : undefined
      };

      sendOperation(operation);
      setTypingStatus(true);
      debouncedSetTypingStatus(false);
    }
  }, [canEdit, isLocked, localValue, onChange, currentSession, sendOperation, setTypingStatus, debouncedSetTypingStatus, section]);

  // Handle cursor position updates
  const handleCursorChange = useCallback(() => {
    if (!textareaRef.current) return;

    const { selectionStart } = textareaRef.current;
    const textBeforeCursor = localValue.substring(0, selectionStart);
    const lines = textBeforeCursor.split('\n');
    
    const position: CursorPosition = {
      line: lines.length - 1,
      column: lines[lines.length - 1].length,
      section
    };

    updateCursor(position);
  }, [localValue, updateCursor, section]);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return;

    const { selectionStart, selectionEnd } = textareaRef.current;
    
    if (selectionStart !== selectionEnd) {
      const selectedText = localValue.substring(selectionStart, selectionEnd);
      setSelectedText(selectedText);
      setSelectionRange({ start: selectionStart, end: selectionEnd });

      const startLines = localValue.substring(0, selectionStart).split('\n');
      const endLines = localValue.substring(0, selectionEnd).split('\n');

      const selection: TextSelection = {
        start: {
          line: startLines.length - 1,
          column: startLines[startLines.length - 1].length,
          section
        },
        end: {
          line: endLines.length - 1,
          column: endLines[endLines.length - 1].length,
          section
        },
        section
      };

      updateSelection(selection);
    } else {
      setSelectedText('');
      setSelectionRange(null);
      updateSelection(null);
    }
  }, [localValue, updateSelection, section]);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Track collaborative selections
  useEffect(() => {
    const selections = new Map<string, TextSelection>();
    participants.forEach(participant => {
      if (participant.selection && participant.selection.section === section) {
        selections.set(participant.id, participant.selection);
      }
    });
    setCollaborativeSelections(selections);
  }, [participants, section]);

  // Handle adding comments
  const handleAddComment = useCallback((commentText: string, type: 'comment' | 'suggestion' = 'comment') => {
    if (!canComment || !selectionRange) return;

    addComment({
      articleId: currentSession?.articleId || '',
      content: commentText,
      position: {
        section,
        startIndex: selectionRange.start,
        endIndex: selectionRange.end,
        selectedText
      },
      type,
      status: 'open',
      replies: []
    });

    setShowCommentDialog(false);
    setSelectedText('');
    setSelectionRange(null);
  }, [canComment, selectionRange, addComment, currentSession, section, selectedText]);

  // Get other users working on this section
  const otherUsers = participants.filter(p => 
    p.cursor?.section === section || p.selection?.section === section
  );

  const otherUsersTyping = participants.filter(p => 
    p.isTyping && (p.cursor?.section === section || p.selection?.section === section)
  );

  const InputComponent = rows > 1 ? Textarea : Input;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {/* Permission indicators */}
            {canEdit ? (
              <Badge variant="outline" className="text-xs">
                <Edit3 className="w-3 h-3 mr-1" />
                يمكن التحرير
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                للقراءة فقط
              </Badge>
            )}
            
            {/* Lock indicator */}
            {isLocked && (
              <Badge variant="destructive" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                مقفل
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <InputComponent
          ref={textareaRef}
          value={localValue}
          onChange={(e) => handleTextChange(e.target.value)}
          onSelect={handleTextSelection}
          onFocus={handleCursorChange}
          onClick={handleCursorChange}
          onKeyUp={handleCursorChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={!canEdit || isLocked}
          className={`${!canEdit || isLocked ? 'opacity-60' : ''} resize-none`}
          style={{ direction: 'rtl' }}
        />

        {/* Other users' cursors and selections overlay */}
        {otherUsers.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {otherUsers.map(user => (
              <div key={user.id} className="relative">
                {/* User cursor indicator */}
                {user.cursor && (
                  <div 
                    className="absolute w-px h-4 animate-pulse"
                    style={{ 
                      backgroundColor: user.color,
                      // Position would be calculated based on cursor position
                      top: '8px',
                      left: '8px'
                    }}
                  >
                    <div 
                      className="absolute -top-5 -left-2 px-1 py-0.5 text-xs text-white rounded text-nowrap"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.nameAr || user.name}
                    </div>
                  </div>
                )}
                
                {/* User selection highlight */}
                {user.selection && (
                  <div 
                    className="absolute rounded opacity-30"
                    style={{ 
                      backgroundColor: user.color,
                      // Position and size would be calculated based on selection
                      top: '8px',
                      left: '8px',
                      width: '100px',
                      height: '20px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons overlay */}
        {selectedText && canComment && (
          <div className="absolute top-2 left-2 flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCommentDialog(true)}
              className="text-xs h-6"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              تعليق
            </Button>
          </div>
        )}
      </div>

      {/* Character count */}
      {maxLength && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {localValue.length} / {maxLength}
          </span>
          {localValue.length > maxLength * 0.9 && (
            <span className="text-yellow-600">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              قارب على الحد الأقصى
            </span>
          )}
        </div>
      )}

      {/* Typing indicators */}
      {otherUsersTyping.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Edit3 className="w-3 h-3 animate-pulse" />
          <span>
            {otherUsersTyping.length === 1 
              ? `${otherUsersTyping[0].nameAr || otherUsersTyping[0].name} يكتب في ${
                  section === 'title' ? 'العنوان' : 
                  section === 'content' ? 'المحتوى' : 'الملخص'
                }...`
              : `${otherUsersTyping.length} أشخاص يكتبون في ${
                  section === 'title' ? 'العنوان' : 
                  section === 'content' ? 'المحتوى' : 'الملخص'
                }...`
            }
          </span>
        </div>
      )}

      {/* Comment dialog */}
      {showCommentDialog && (
        <Card className="p-4 mt-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">إضافة تعليق</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentDialog(false)}
              >
                ×
              </Button>
            </div>
            
            {selectedText && (
              <div className="p-2 bg-muted rounded text-sm">
                <span className="font-medium">النص المحدد: </span>
                <span className="italic">"{selectedText}"</span>
              </div>
            )}
            
            <Textarea
              placeholder="اكتب تعليقك هنا..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddComment(e.currentTarget.value);
                }
              }}
            />
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommentDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                  if (textarea?.value.trim()) {
                    handleAddComment(textarea.value.trim());
                  }
                }}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                إضافة تعليق
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}