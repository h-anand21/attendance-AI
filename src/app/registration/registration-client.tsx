
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStudents } from '@/hooks/use-students';
import { useClasses } from '@/hooks/use-classes';
import { useToast } from '@/hooks/use-toast';
import type { Student, Class } from '@/types';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Camera, UserPlus, Loader2, PlusCircle, QrCodeIcon } from 'lucide-react';
import { CreateClassDialog } from '../(dashboard)/dashboard/create-class-dialog';

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


  const studentForm = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      classId: '',
    },
  });

  useEffect(() => {
    // Set initial selected class when classes load for the first time
    if (classes.length > 0 && !selectedClass) {
      const latestClass = [...classes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      setSelectedClass(latestClass.id);
    }
  }, [classes, selectedClass]);


  useEffect(() => {
    // Sync selected class with the form
    if (selectedClass) {
      studentForm.setValue('classId', selectedClass);
    }
  }, [selectedClass, studentForm]);


  const setupCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
       console.error("Camera not supported on this browser");
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
      // Turn off camera when component unmounts
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
        // Flip the image horizontally for a mirror effect
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
        setTimeout(() => setHighlightedStudentId(null), 3000); // Highlight for 3 seconds
    } else {
         toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: 'Could not register the student. Please try again.',
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

  useEffect(() => {
      // When classes list updates (e.g., a new class is added),
      // select the most recently created one.
      if (classes.length > 0) {
        const sortedClasses = [...classes].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latestClass = sortedClasses[0];
        if (latestClass.id !== selectedClass) {
            setSelectedClass(latestClass.id);
        }
      }
  }, [classes]);


  const currentStudents = studentsByClass[selectedClass] || [];
  const loading = studentsLoading || classesLoading;

  const handleShowQrCode = (student: Student) => {
    setSelectedStudentForQr(student);
    setQrCodeModalOpen(true);
  };

  return (
    <>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Register New Student</CardTitle>
            <CardDescription>
              Fill in the details and capture a photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative h-48 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                className="w-full aspect-video rounded-md transform -scale-x-100"
                autoPlay
                muted
                playsInline
              />
              {hasCameraPermission === undefined && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className='ml-2'>Starting camera...</p>
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
              <Alert variant="destructive">
                 <Camera className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings to use this feature.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                className="w-full"
                onClick={handleCapture}
                disabled={!hasCameraPermission}
                variant="outline"
              >
                <Camera className="mr-2 h-4 w-4" />
                {capturedImage ? 'Retake Photo' : 'Capture Photo'}
              </Button>
            </div>

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
                        <Input placeholder="e.g. John Doe" {...field} />
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
                            <SelectTrigger>
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                {c.name} - Section {c.section}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <CreateClassDialog onClassCreate={onClassCreate}>
                            <Button type="button" variant="outline" size="icon" aria-label="Create new class">
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </CreateClassDialog>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !capturedImage || classes.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Register Student
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="lg:col-span-2" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <CardTitle>Registered Students</CardTitle>
                <CardDescription>
                  Showing students in the selected class.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={classes.length === 0}
                >
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Select a class to view" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - Section {c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
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
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        ref={student.id === highlightedStudentId ? newStudentRowRef : null}
                        className={student.id === highlightedStudentId ? 'bg-primary/10 transition-colors duration-1000 ease-out' : ''}
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
                        <TableCell className="text-muted-foreground">
                          {student.id}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleShowQrCode(student)} disabled={!student.qrCode}>
                             <QrCodeIcon className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center">
                        {classes.length === 0
                          ? 'Create a class to begin registering students.'
                          : 'No students registered for this class yet.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    <Dialog open={isQrCodeModalOpen} onOpenChange={setQrCodeModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>QR Code for {selectedStudentForQr?.name}</DialogTitle>
            </DialogHeader>
            {selectedStudentForQr?.qrCode ? (
                <div className="flex flex-col items-center justify-center p-4 gap-4">
                    <img src={selectedStudentForQr.qrCode} alt={`QR Code for ${selectedStudentForQr.name}`} className="w-64 h-64 rounded-lg shadow-md" />
                    <Button onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedStudentForQr.qrCode!;
                        link.download = `QR_Code_${selectedStudentForQr.name.replace(/\s/g, '_')}.jpeg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}>
                        Download QR Code
                    </Button>
                </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p>Generating QR Code...</p>
              </div>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}

    