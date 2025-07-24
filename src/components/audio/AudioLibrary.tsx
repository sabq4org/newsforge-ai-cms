import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  Pause,
  Download,
  Share,
  Trash,
  Edit,
  Copy,
  Folder,
  FolderOpen,
  FileAudio,
  Microphone,
  Waveform,
  Timer,
  Calendar,
  User,
  Tag,
  MagnifyingGlass,
  SortAscending,
  SortDescending,
  GridFour,
  List,
  Plus,
  Upload,
  Export,
  Archive,
  Star,
  StarFill,
  Eye,
  EyeSlash,
  Lock,
  LockOpen
} from '@phosphor-icons/react';
import { AudioProject, AudioSegment, Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AudioLibraryProps {
  onEditProject?: (project: AudioProject) => void;
  onCreateProject?: (article?: Article) => void;
}

interface AudioFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  createdAt: Date;
  projectCount: number;
  isPublic: boolean;
  color?: string;
}

const AUDIO_CATEGORIES = [
  { id: 'news', name: 'الأخبار', nameEn: 'News' },
  { id: 'sports', name: 'الرياضة', nameEn: 'Sports' },
  { id: 'business', name: 'الأعمال', nameEn: 'Business' },
  { id: 'technology', name: 'التكنولوجيا', nameEn: 'Technology' },
  { id: 'opinion', name: 'الرأي', nameEn: 'Opinion' },
  { id: 'culture', name: 'الثقافة', nameEn: 'Culture' }
];

const SORT_OPTIONS = [
  { id: 'newest', name: 'الأحدث', nameEn: 'Newest First' },
  { id: 'oldest', name: 'الأقدم', nameEn: 'Oldest First' },
  { id: 'title', name: 'الاسم', nameEn: 'Title' },
  { id: 'duration', name: 'المدة', nameEn: 'Duration' },
  { id: 'status', name: 'الحالة', nameEn: 'Status' }
];

export function AudioLibrary({ onEditProject, onCreateProject }: AudioLibraryProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useKV<AudioProject[]>('sabq-audio-projects', []);
  const [folders, setFolders] = useKV<AudioFolder[]>('sabq-audio-folders', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [playingSegment, setPlayingSegment] = useState<string | null>(null);
  const [bulkOperation, setBulkOperation] = useState<'move' | 'delete' | 'export' | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !project.article.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (selectedCategory !== 'all' && project.article.category?.id !== selectedCategory) {
        return false;
      }
      
      if (selectedStatus !== 'all' && project.status !== selectedStatus) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.name.localeCompare(b.name, 'ar');
        case 'duration':
          const aDuration = a.segments.reduce((sum, seg) => sum + seg.duration, 0);
          const bDuration = b.segments.reduce((sum, seg) => sum + seg.duration, 0);
          return bDuration - aDuration;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Calculate total duration of a project
  const calculateProjectDuration = (project: AudioProject) => {
    return project.segments.reduce((total, segment) => 
      total + segment.duration + segment.pause.before + segment.pause.after, 0
    );
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/pause audio
  const togglePlayback = (project: AudioProject, segmentId?: string) => {
    if (currentlyPlaying === project.id && playingSegment === segmentId) {
      setCurrentlyPlaying(null);
      setPlayingSegment(null);
      audioRef.current?.pause();
    } else {
      setCurrentlyPlaying(project.id);
      setPlayingSegment(segmentId || null);
      
      // In real implementation, would load and play actual audio
      toast.info(`تشغيل: ${project.name}`);
    }
  };

  // Delete project
  const deleteProject = (projectId: string) => {
    setProjects(current => current.filter(p => p.id !== projectId));
    toast.success('تم حذف المشروع');
  };

  // Duplicate project
  const duplicateProject = (project: AudioProject) => {
    const duplicated: AudioProject = {
      ...project,
      id: `project_${Date.now()}`,
      name: `نسخة من ${project.name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      outputUrl: undefined
    };
    
    setProjects(current => [duplicated, ...current]);
    toast.success('تم نسخ المشروع');
  };

  // Create new folder
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: AudioFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      parentId: selectedFolder || undefined,
      path: selectedFolder ? `${selectedFolder}/${newFolderName}` : newFolderName,
      createdAt: new Date(),
      projectCount: 0,
      isPublic: false
    };
    
    setFolders(current => [...current, newFolder]);
    setNewFolderName('');
    setIsCreatingFolder(false);
    toast.success('تم إنشاء المجلد');
  };

  // Bulk operations
  const executeBulkOperation = async () => {
    if (!bulkOperation || selectedProjects.length === 0) return;
    
    switch (bulkOperation) {
      case 'delete':
        setProjects(current => current.filter(p => !selectedProjects.includes(p.id)));
        toast.success(`تم حذف ${selectedProjects.length} مشروع`);
        break;
      case 'export':
        // In real implementation, would export selected projects
        toast.success(`تم تصدير ${selectedProjects.length} مشروع`);
        break;
      case 'move':
        // In real implementation, would move to selected folder
        toast.success(`تم نقل ${selectedProjects.length} مشروع`);
        break;
    }
    
    setSelectedProjects([]);
    setBulkOperation(null);
  };

  // Get status badge
  const getStatusBadge = (status: AudioProject['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">مكتمل</Badge>;
      case 'processing':
        return <Badge variant="secondary">قيد المعالجة</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      default:
        return <Badge variant="outline">مسودة</Badge>;
    }
  };

  // Render project card
  const renderProjectCard = (project: AudioProject) => {
    const duration = calculateProjectDuration(project);
    const isPlaying = currentlyPlaying === project.id;
    const isSelected = selectedProjects.includes(project.id);
    
    return (
      <Card 
        key={project.id} 
        className={`group hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => {
          if (selectedProjects.length > 0) {
            setSelectedProjects(current => 
              current.includes(project.id) 
                ? current.filter(id => id !== project.id)
                : [...current, project.id]
            );
          }
        }}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-2">{project.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {project.article.title}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayback(project);
                  }}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Eye size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{project.name}</DialogTitle>
                      <DialogDescription>تفاصيل المشروع الصوتي</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>الحالة</Label>
                          <div className="mt-1">{getStatusBadge(project.status)}</div>
                        </div>
                        <div>
                          <Label>المدة الإجمالية</Label>
                          <p className="mt-1">{formatDuration(duration)}</p>
                        </div>
                        <div>
                          <Label>عدد الأجزاء</Label>
                          <p className="mt-1">{project.segments.length} جزء</p>
                        </div>
                        <div>
                          <Label>تاريخ الإنشاء</Label>
                          <p className="mt-1">{new Date(project.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label>الأجزاء</Label>
                        <ScrollArea className="h-32 mt-2 border rounded-md p-2">
                          <div className="space-y-1">
                            {project.segments.map((segment, index) => (
                              <div key={segment.id} className="flex items-center justify-between text-xs">
                                <span>{index + 1}. {segment.type === 'text' ? segment.text.substring(0, 30) + '...' : segment.type}</span>
                                <span>{formatDuration(segment.duration)}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => onEditProject?.(project)}
                          className="flex-1"
                        >
                          <Edit className="ml-2" size={14} />
                          تحرير
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => duplicateProject(project)}
                        >
                          <Copy size={14} />
                        </Button>
                        {project.outputUrl && (
                          <Button variant="outline">
                            <Download size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Waveform visualization (simplified) */}
            <div className="h-8 bg-muted rounded flex items-end gap-1 px-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary/60 rounded-sm flex-1"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {getStatusBadge(project.status)}
                <Badge variant="outline">
                  {project.article.category?.name || 'عام'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer size={12} />
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Share size={12} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Star size={12} />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProject?.(project);
                  }}
                >
                  <Edit size={12} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                >
                  <Trash size={12} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render project list item
  const renderProjectListItem = (project: AudioProject) => {
    const duration = calculateProjectDuration(project);
    const isPlaying = currentlyPlaying === project.id;
    const isSelected = selectedProjects.includes(project.id);
    
    return (
      <div 
        key={project.id}
        className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => {
          if (selectedProjects.length > 0) {
            setSelectedProjects(current => 
              current.includes(project.id) 
                ? current.filter(id => id !== project.id)
                : [...current, project.id]
            );
          }
        }}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="rounded"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback(project);
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{project.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{project.article.title}</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Timer size={12} />
            <span>{formatDuration(duration)}</span>
          </div>
          
          {getStatusBadge(project.status)}
          
          <Badge variant="outline">
            {project.article.category?.name || 'عام'}
          </Badge>
          
          <span className="text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString('ar-SA')}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditProject?.(project);
            }}
          >
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <Share size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteProject(project.id);
            }}
          >
            <Trash size={14} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مكتبة البودكاست</h1>
          <p className="text-muted-foreground">
            إدارة جميع المشاريع الصوتية ({filteredProjects.length} مشروع)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onCreateProject?.()}>
            <Plus className="ml-2" size={16} />
            مشروع جديد
          </Button>
          
          {selectedProjects.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Archive className="ml-2" size={16} />
                  عمليات متعددة ({selectedProjects.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>عمليات متعددة</DialogTitle>
                  <DialogDescription>
                    تم تحديد {selectedProjects.length} مشروع
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setBulkOperation('move')}
                    >
                      <Folder className="ml-2" size={16} />
                      نقل إلى مجلد
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setBulkOperation('export')}
                    >
                      <Export className="ml-2" size={16} />
                      تصدير المحدد
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => setBulkOperation('delete')}
                    >
                      <Trash className="ml-2" size={16} />
                      حذف المحدد
                    </Button>
                  </div>
                  
                  {bulkOperation && (
                    <div className="flex gap-2">
                      <Button onClick={executeBulkOperation}>
                        تنفيذ
                      </Button>
                      <Button variant="outline" onClick={() => setBulkOperation(null)}>
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              <Label>البحث</Label>
              <div className="relative">
                <MagnifyingGlass className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في المشاريع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div>
              <Label>التصنيف</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {AUDIO_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>الحالة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>ترتيب</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>العرض</Label>
              <div className="flex items-center gap-1 mt-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <GridFour size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileAudio size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإنشاء مشروع بودكاست جديد من المقالات
            </p>
            <Button onClick={() => onCreateProject?.()}>
              <Plus className="ml-2" size={16} />
              إنشاء مشروع جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map(renderProjectCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(renderProjectListItem)}
            </div>
          )}
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}