import { useState, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  X
} from '@phosphor-icons/react';
import { ImportedUser } from '@/types/user-management';
import { toast } from 'sonner';

interface ImportUsersModalProps {
  onClose: () => void;
  onImport: (users: ImportedUser[]) => void;
}

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export function ImportUsersModal({ onClose, onImport }: ImportUsersModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [parsedUsers, setParsedUsers] = useState<ImportedUser[]>([]);
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    autoVerify: false,
    skipErrors: true
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast.error('نوع الملف غير مدعوم. يرجى رفع ملف CSV أو Excel');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

    parseFile(file);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const users = parseCSV(text);
        setParsedUsers(users);
        setStep('preview');
      } catch (error) {
        toast.error('خطأ في قراءة الملف. تأكد من صيغة البيانات');
      }
    };

    reader.readAsText(file);
  };

  const parseCSV = (text: string): ImportedUser[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('الملف فارغ أو لا يحتوي على بيانات');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const users: ImportedUser[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const user: ImportedUser = {
        name: '',
        email: ''
      };

      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'name':
          case 'الاسم':
            user.name = value;
            break;
          case 'email':
          case 'البريد':
          case 'بريد':
            user.email = value;
            break;
          case 'phone':
          case 'هاتف':
          case 'رقم':
            user.phone = value;
            break;
          case 'gender':
          case 'جنس':
            user.gender = value;
            break;
          case 'country':
          case 'دولة':
            user.country = value;
            break;
          case 'city':
          case 'مدينة':
            user.city = value;
            break;
          case 'role':
          case 'نوع':
            user.role = value;
            break;
          case 'tags':
          case 'وسوم':
            user.tags = value ? value.split(';') : [];
            break;
        }
      });

      if (user.name && user.email) {
        users.push(user);
      }
    }

    return users;
  };

  const validateUsers = () => {
    return parsedUsers.filter(user => {
      const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);
      return user.name.trim() && hasValidEmail;
    });
  };

  const handleImport = async () => {
    setStep('importing');
    const validUsers = validateUsers();
    
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      setImportProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const result: ImportResult = {
      total: parsedUsers.length,
      successful: validUsers.length,
      failed: parsedUsers.length - validUsers.length,
      errors: []
    };

    if (result.failed > 0) {
      result.errors.push(`${result.failed} مستخدم لم يتم استيرادهم بسبب بيانات غير صحيحة`);
    }

    setImportResult(result);
    setStep('complete');
    
    if (validUsers.length > 0) {
      onImport(validUsers);
    }
  };

  const downloadTemplate = () => {
    const template = `name,email,phone,gender,country,city,role,tags
محمد أحمد,mohamed@example.com,+966501234567,male,السعودية,الرياض,regular,تقنية;رياضة
فاطمة سالم,fatima@example.com,+966509876543,female,السعودية,جدة,vip,ثقافة;صحة`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">اسحب الملف هنا أو</h3>
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="mb-4"
        >
          اختر ملف
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        <p className="text-sm text-gray-500">
          صيغ مدعومة: CSV, Excel (.xlsx, .xls)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          الحد الأقصى لحجم الملف: 10 ميجابايت
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            قالب الاستيراد
          </CardTitle>
          <CardDescription>
            حمّل قالب CSV لمعرفة التنسيق المطلوب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download className="w-4 h-4" />
            تحميل القالب
          </Button>
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-2">الحقول المطلوبة:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>name (الاسم) - مطلوب</li>
              <li>email (البريد الإلكتروني) - مطلوب</li>
              <li>phone (رقم الهاتف) - اختياري</li>
              <li>gender (الجنس: male/female/not-specified) - اختياري</li>
              <li>country (الدولة) - اختياري</li>
              <li>city (المدينة) - اختياري</li>
              <li>role (النوع: regular/vip/media/admin) - اختياري</li>
              <li>tags (الوسوم مفصولة بـ ;) - اختياري</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewStep = () => {
    const validUsers = validateUsers();
    const invalidUsers = parsedUsers.length - validUsers.length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">معاينة البيانات</h3>
            <p className="text-sm text-gray-600">
              تم العثور على {parsedUsers.length} مستخدم
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              {validUsers.length} صحيح
            </Badge>
            {invalidUsers > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                {invalidUsers} خطأ
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>خيارات الاستيراد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="updateExisting"
                checked={importOptions.updateExisting}
                onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, updateExisting: checked as boolean }))}
              />
              <label htmlFor="updateExisting" className="text-sm">
                تحديث المستخدمين الموجودين (بناءً على البريد الإلكتروني)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoVerify"
                checked={importOptions.autoVerify}
                onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, autoVerify: checked as boolean }))}
              />
              <label htmlFor="autoVerify" className="text-sm">
                تفعيل جميع الحسابات المستوردة تلقائياً
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipErrors"
                checked={importOptions.skipErrors}
                onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, skipErrors: checked as boolean }))}
              />
              <label htmlFor="skipErrors" className="text-sm">
                تجاهل الصفوف التي تحتوي على أخطاء
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="border rounded-lg max-h-64 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحالة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الدولة</TableHead>
                <TableHead>النوع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedUsers.slice(0, 10).map((user, index) => {
                const isValid = user.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{user.country || '-'}</TableCell>
                    <TableCell>{user.role || 'regular'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {parsedUsers.length > 10 && (
            <div className="p-4 text-center text-sm text-gray-500">
              وأكثر من {parsedUsers.length - 10} مستخدم آخر...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Upload className="w-8 h-8 text-primary animate-bounce" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">جاري الاستيراد...</h3>
        <p className="text-sm text-gray-600 mb-4">
          يتم استيراد {parsedUsers.length} مستخدم
        </p>
        <Progress value={importProgress} className="w-full max-w-md mx-auto" />
        <p className="text-xs text-gray-500 mt-2">{importProgress}%</p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-2">تم الاستيراد بنجاح!</h3>
        {importResult && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              تم استيراد {importResult.successful} من أصل {importResult.total} مستخدم
            </p>
            {importResult.failed > 0 && (
              <p className="text-sm text-red-600">
                فشل في استيراد {importResult.failed} مستخدم
              </p>
            )}
            {importResult.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg text-right">
                <h4 className="text-sm font-medium text-red-800 mb-2">الأخطاء:</h4>
                <ul className="text-xs text-red-600 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            استيراد المستخدمين
          </DialogTitle>
          <DialogDescription>
            استيراد قائمة المستخدمين من ملف CSV أو Excel
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          )}
          
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                رجوع
              </Button>
              <Button onClick={handleImport} disabled={validateUsers().length === 0}>
                استيراد {validateUsers().length} مستخدم
              </Button>
            </>
          )}
          
          {step === 'complete' && (
            <Button onClick={onClose}>
              إغلاق
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}