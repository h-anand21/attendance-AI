'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStudents } from '@/hooks/use-students';
import { useClasses } from '@/hooks/use-classes';
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/types';
import { motion } from 'framer-motion';

import { GlassButton } from '@/components/ui/glass-button';
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card';
import { GlassInput } from '@/components/ui/glass-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, UserPlus, Loader2, PlusCircle, QrCodeIcon, Search } from 'lucide-react';
import { CreateClassDialog } from '../(dashboard)/dashboard/create-class-dialog';
import { cn } from '@/lib/utils';

const studentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  classId: z.string({ required_error: 'Please select a class.' }),
});

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function RegistrationClient() {
  const { toast } = useToast();
  const { studentsByClass, addStudent, loading: studentsLoading } = useStudents();
  const { classes, addClass, loading: classesLoading } = useClasses();

  const videoRef = useRef<HTMLVideoElement>(null);
  const newStudentRowRef = useRef<HTMLTableRowElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  const studentForm = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      classId: '',
    },
  });

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      const sortedClasses = [...classes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSelectedClass(sortedClasses[0].id);
    }
  }, [classes, selectedClass]);


  useEffect(() => {
    if (selectedClass) {
      studentForm.setValue('classId', selectedClass);
    }
  }, [selectedClass, studentForm]);


  const setupCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
       setHasCameraPermission(false);
       return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  }, []);

  useEffect(() => {
    setupCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setupCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const onStudentSubmit = async (values: z.infer<typeof studentFormSchema>) => {
    if (!capturedImage) {
      toast({
        variant: 'destructive',
        title: 'No Photo Captured',
        description: 'Please capture a photo for the student.',
      });
      return;
    }

    setIsSubmitting(true);
    const newStudentId = await addStudent({ name: values.name, avatar: capturedImage }, values.classId);

    if (newStudentId) {
        toast({
            title: 'Student Registered',
            description: `${values.name} has been added to the class.`,
        });
        studentForm.reset();
        studentForm.setValue('classId', values.classId);
        setCapturedImage(null);
        setHighlightedStudentId(newStudentId);
        setTimeout(() => setHighlightedStudentId(null), 3000);
    } else {
         toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: 'Could not register the student.',
        });
    }
    setIsSubmitting(false);
  };
  
  useEffect(() => {
    if(highlightedStudentId && newStudentRowRef.current) {
        newStudentRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center'});
    }
  }, [highlightedStudentId]);

  const onClassCreate = async (newClassData: {name: string, section: string}) => {
     await addClass(newClassData);
  }

  const filteredStudents = useMemo(() => {
    const studentsInSelectedClass = studentsByClass[selectedClass] || [];
    if (!searchQuery) {
      return studentsInSelectedClass;
    }
    return studentsInSelectedClass.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentsByClass, selectedClass, searchQuery]);


  const loading = studentsLoading || classesLoading;

  const handleShowQrCode = (student: Student) => {
    setSelectedStudentForQr(student);
    setQrCodeModalOpen(true);
  };

  return (
    <>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Register New Student</GlassCardTitle>
            <GlassCardDescription>
              Fill in the details and capture a photo.
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="space-y-6">
            <div className="relative h-48 w-full rounded-2xl bg-black/40 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
              <video
                ref={videoRef}
                className="w-full aspect-video rounded-md transform -scale-x-100"
                autoPlay
                muted
                playsInline
              />
              {hasCameraPermission === undefined && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className='ml-2 text-sm text-primary font-medium'>Starting camera...</p>
                </div>
              )}
              {capturedImage && (
                <div className="absolute inset-0">
                  <img
                    src={capturedImage}
                    alt="Captured student"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {hasCameraPermission === false && (
              <Alert variant="destructive" className="glass border-destructive/50">
                 <Camera className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings.
                </AlertDescription>
              </Alert>
            )}

            <GlassButton
              className="w-full"
              onClick={handleCapture}
              disabled={!hasCameraPermission}
              variant="outline"
            >
              <Camera className="mr-2 h-4 w-4" />
              {capturedImage ? 'Retake Photo' : 'Capture Photo'}
            </GlassButton>

            <Form {...studentForm}>
              <form
                onSubmit={studentForm.handleSubmit(onStudentSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={studentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <GlassInput placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={studentForm.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                       <div className="flex gap-2">
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={classes.length === 0}
                        >
                            <FormControl>
                              <SelectTrigger className="glass h-12 rounded-xl border-white/10">
                                  <SelectValue placeholder="Select a class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass">
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                {c.name} - Section {c.section}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <CreateClassDialog onClassCreate={onClassCreate}>
                            <GlassButton type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0">
                                <PlusCircle className="h-5 w-5" />
                            </GlassButton>
                        </CreateClassDialog>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full h-14 text-lg"
                  disabled={isSubmitting || !capturedImage || classes.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-6 w-6" />
                  )}
                  Register Student
                </GlassButton>
              </form>
            </Form>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      <motion.div className="lg:col-span-2" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
        <GlassCard>
          <GlassCardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <GlassCardTitle>Registered Students</GlassCardTitle>
                <GlassCardDescription>
                  Manage and view student records.
                </GlassCardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <GlassInput
                        type="search"
                        placeholder="Search..."
                        className="pl-10 h-10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={classes.length === 0}
                >
                  <SelectTrigger className="w-full sm:w-[200px] glass h-10 rounded-xl border-white/10">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} (Sec. {c.section})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead className="text-right">QR Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        ref={student.id === highlightedStudentId ? newStudentRowRef : null}
                        className={cn(
                          'transition-colors duration-1000 ease-out hover:bg-white/5',
                          student.id === highlightedStudentId ? 'bg-primary/20' : ''
                        )}
                      >
                        <TableCell>
                          <Avatar>
                            <AvatarImage
                              src={student.avatar}
                              alt={student.name}
                              data-ai-hint="person portrait"
                            />
                            <AvatarFallback>
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs uppercase">
                          {student.id}
                        </TableCell>
                        <TableCell className="text-right">
                          <GlassButton variant="ghost" size="icon" onClick={() => handleShowQrCode(student)} disabled={!student.qrCode}>
                             <QrCodeIcon className="h-5 w-5" />
                          </GlassButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                        {searchQuery ? `No results for "${searchQuery}".` : 'No students found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
    <Dialog open={isQrCodeModalOpen} onOpenChange={setQrCodeModalOpen}>
        <DialogContent className="glass border-white/20">
            <DialogHeader>
                <DialogTitle>QR Code for {selectedStudentForQr?.name}</DialogTitle>
            </DialogHeader>
            {selectedStudentForQr?.qrCode ? (
                <div className="flex flex-col items-center justify-center p-4 gap-6">
                    <img src={selectedStudentForQr.qrCode} alt="QR Code" className="w-64 h-64 rounded-2xl shadow-2xl border-4 border-white/20" />
                    <GlassButton variant="primary" className="w-full" onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedStudentForQr.qrCode!;
                        link.download = `QR_${selectedStudentForQr.name.replace(/\s/g, '_')}.jpeg`;
                        link.click();
                    }}>
                        Download QR Code
                    </GlassButton>
                </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-primary">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <p>Generating...</p>
              </div>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}