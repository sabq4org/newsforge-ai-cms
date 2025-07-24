import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useKV } from '@github/spark/hooks';
import {
  CollaborativeSession,
  CollaborativeUser,
  CollaborativeOperation,
  CollaborativeComment,
  CursorPosition,
  TextSelection,
  ConflictResolution
} from '@/types';

interface CollaborativeContextType {
  // Session management
  currentSession: CollaborativeSession | null;
  participants: CollaborativeUser[];
  isConnected: boolean;
  
  // Join/leave session
  joinSession: (articleId: string) => Promise<void>;
  leaveSession: () => void;
  
  // Real-time operations
  sendOperation: (operation: Omit<CollaborativeOperation, 'id' | 'sessionId' | 'userId' | 'timestamp' | 'appliedBy'>) => void;
  applyOperation: (operation: CollaborativeOperation) => void;
  
  // Cursor and selection tracking
  updateCursor: (position: CursorPosition) => void;
  updateSelection: (selection: TextSelection | null) => void;
  
  // Comments and suggestions
  addComment: (comment: Omit<CollaborativeComment, 'id' | 'sessionId' | 'author' | 'createdAt' | 'updatedAt'>) => void;
  resolveComment: (commentId: string) => void;
  getComments: () => CollaborativeComment[];
  
  // Conflict resolution
  resolveConflict: (conflictId: string, resolution: any) => void;
  
  // Presence indicators
  setTypingStatus: (isTyping: boolean) => void;
  
  // Permissions
  checkPermission: (action: string, section?: string) => boolean;
}

const CollaborativeContext = createContext<CollaborativeContextType | undefined>(undefined);

// Mock WebSocket simulation using intervals and KV storage
export function CollaborativeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useKV<CollaborativeSession | null>('collaborative-session', null);
  const [participants, setParticipants] = useKV<CollaborativeUser[]>('session-participants', []);
  const [operations, setOperations] = useKV<CollaborativeOperation[]>('session-operations', []);
  const [comments, setComments] = useKV<CollaborativeComment[]>('session-comments', []);
  const [isConnected, setIsConnected] = useState(false);
  const [simulatedConnectionInterval, setSimulatedConnectionInterval] = useState<NodeJS.Timeout | null>(null);

  // User colors for collaborative sessions
  const userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const getCurrentUser = useCallback((): CollaborativeUser => {
    if (!user) throw new Error('User not authenticated');
    
    const participantIndex = participants.findIndex(p => p.id === user.id);
    const colorIndex = participantIndex >= 0 ? participantIndex : participants.length;
    
    return {
      id: user.id,
      name: user.name,
      nameAr: user.nameAr,
      avatar: user.avatar,
      role: user.role,
      color: userColors[colorIndex % userColors.length],
      isTyping: false,
      lastSeen: new Date(),
      connectionStatus: 'online'
    };
  }, [user, participants]);

  // Simulate real-time connection polling
  const startConnectionSimulation = useCallback(() => {
    if (simulatedConnectionInterval) return;
    
    const interval = setInterval(() => {
      // Simulate presence updates and operation syncing
      if (currentSession && user) {
        setParticipants(currentParticipants => 
          currentParticipants.map(p => 
            p.id === user.id 
              ? { ...p, lastSeen: new Date(), connectionStatus: 'online' as const }
              : p
          )
        );
      }
    }, 5000); // Update every 5 seconds

    setSimulatedConnectionInterval(interval);
  }, [currentSession, user, simulatedConnectionInterval]);

  const stopConnectionSimulation = useCallback(() => {
    if (simulatedConnectionInterval) {
      clearInterval(simulatedConnectionInterval);
      setSimulatedConnectionInterval(null);
    }
  }, [simulatedConnectionInterval]);

  const joinSession = useCallback(async (articleId: string) => {
    if (!user) return;

    const sessionId = `session_${articleId}`;
    const currentUser = getCurrentUser();

    // Create or join session
    const session: CollaborativeSession = {
      id: sessionId,
      articleId,
      participants: [currentUser],
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date(),
      lockTimeout: 300 // 5 minutes
    };

    setCurrentSession(session);
    
    // Add user to participants if not already present
    setParticipants(currentParticipants => {
      const existingIndex = currentParticipants.findIndex(p => p.id === user.id);
      if (existingIndex >= 0) {
        const updated = [...currentParticipants];
        updated[existingIndex] = currentUser;
        return updated;
      }
      return [...currentParticipants, currentUser];
    });

    setIsConnected(true);
    startConnectionSimulation();
  }, [user, getCurrentUser, startConnectionSimulation]);

  const leaveSession = useCallback(() => {
    if (!user || !currentSession) return;

    // Remove user from participants
    setParticipants(currentParticipants => 
      currentParticipants.filter(p => p.id !== user.id)
    );

    // If last participant, deactivate session
    setParticipants(currentParticipants => {
      if (currentParticipants.length <= 1) {
        setCurrentSession(null);
        setOperations([]);
      }
      return currentParticipants.filter(p => p.id !== user.id);
    });

    setIsConnected(false);
    stopConnectionSimulation();
  }, [user, currentSession, stopConnectionSimulation]);

  const sendOperation = useCallback((operationData: Omit<CollaborativeOperation, 'id' | 'sessionId' | 'userId' | 'timestamp' | 'appliedBy'>) => {
    if (!user || !currentSession) return;

    const operation: CollaborativeOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: currentSession.id,
      userId: user.id,
      timestamp: new Date(),
      appliedBy: [user.id],
      ...operationData
    };

    setOperations(currentOps => [...currentOps, operation]);
  }, [user, currentSession]);

  const applyOperation = useCallback((operation: CollaborativeOperation) => {
    // This would typically update the editor content
    // For now, we'll just track the operation
    setOperations(currentOps => {
      const existingIndex = currentOps.findIndex(op => op.id === operation.id);
      if (existingIndex >= 0) return currentOps;
      return [...currentOps, operation];
    });
  }, []);

  const updateCursor = useCallback((position: CursorPosition) => {
    if (!user) return;
    
    setParticipants(currentParticipants =>
      currentParticipants.map(p =>
        p.id === user.id ? { ...p, cursor: position, lastSeen: new Date() } : p
      )
    );
  }, [user]);

  const updateSelection = useCallback((selection: TextSelection | null) => {
    if (!user) return;
    
    setParticipants(currentParticipants =>
      currentParticipants.map(p =>
        p.id === user.id ? { ...p, selection, lastSeen: new Date() } : p
      )
    );
  }, [user]);

  const addComment = useCallback((commentData: Omit<CollaborativeComment, 'id' | 'sessionId' | 'author' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !currentSession) return;

    const comment: CollaborativeComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: currentSession.id,
      author: getCurrentUser(),
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      ...commentData
    };

    setComments(currentComments => [...currentComments, comment]);
  }, [user, currentSession, getCurrentUser]);

  const resolveComment = useCallback((commentId: string) => {
    if (!user) return;

    setComments(currentComments =>
      currentComments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              status: 'resolved' as const,
              resolvedBy: user.id,
              resolvedAt: new Date(),
              updatedAt: new Date()
            }
          : comment
      )
    );
  }, [user]);

  const getComments = useCallback(() => {
    return comments.filter(comment => 
      currentSession && comment.sessionId === currentSession.id
    );
  }, [comments, currentSession]);

  const resolveConflict = useCallback((conflictId: string, resolution: any) => {
    // Implementation for conflict resolution
    console.log('Resolving conflict:', conflictId, resolution);
  }, []);

  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!user) return;
    
    setParticipants(currentParticipants =>
      currentParticipants.map(p =>
        p.id === user.id ? { ...p, isTyping, lastSeen: new Date() } : p
      )
    );
  }, [user]);

  const checkPermission = useCallback((action: string, section?: string) => {
    // Basic permission check - in real implementation, this would check against user roles
    if (!user) return false;
    
    const adminRoles = ['admin', 'editor-in-chief'];
    const editorRoles = ['admin', 'editor-in-chief', 'section-editor'];
    
    switch (action) {
      case 'edit':
        return ['admin', 'editor-in-chief', 'section-editor', 'journalist'].includes(user.role);
      case 'comment':
        return true;
      case 'approve':
        return editorRoles.includes(user.role);
      case 'publish':
        return editorRoles.includes(user.role);
      case 'invite':
        return editorRoles.includes(user.role);
      default:
        return false;
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConnectionSimulation();
    };
  }, [stopConnectionSimulation]);

  const value: CollaborativeContextType = {
    currentSession,
    participants,
    isConnected,
    joinSession,
    leaveSession,
    sendOperation,
    applyOperation,
    updateCursor,
    updateSelection,
    addComment,
    resolveComment,
    getComments,
    resolveConflict,
    setTypingStatus,
    checkPermission
  };

  return (
    <CollaborativeContext.Provider value={value}>
      {children}
    </CollaborativeContext.Provider>
  );
}

export function useCollaborative() {
  const context = useContext(CollaborativeContext);
  if (context === undefined) {
    throw new Error('useCollaborative must be used within a CollaborativeProvider');
  }
  return context;
}