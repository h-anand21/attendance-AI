
'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useTeachers } from '@/hooks/use-teachers';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, UserPlus, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const teacherFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  contact: z.string().min(10, { message: 'Please enter a valid contact number.' }),
  subjects: z.array(z.string()).min(1, { message: 'At least one subject is required.' }),
});

export function TeacherRegistrationClient() {
  const { toast } = useToast();
  const { teachers, addTeacher, loading } = useTeachers();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');

  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      email: '',
      contact: '',
      subjects: [],
    },
  });

  const setupCamera = useCallback(async () => {
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
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof teacherFormSchema>) => {
    if (!capturedImage) {
      toast({
        variant: 'destructive',
        title: 'No Photo Captured',
        description: 'Please capture a photo for the teacher.',
      });
      return;
    }

    setIsSubmitting(true);
    await addTeacher({ ...values, avatar: capturedImage });
    toast({
      title: 'Teacher Registered',
      description: `${values.name} has been successfully registered.`,
    });
    form.reset();
    setCurrentSubject('');
    setCapturedImage(null);
    setIsSubmitting(false);
  };
  
  const handleSubjectKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && currentSubject) {
      e.preventDefault();
      const newSubjects = [...form.getValues('subjects'), currentSubject.trim()];
      form.setValue('subjects', newSubjects);
      setCurrentSubject('');
    }
  };
  
  const removeSubject = (subjectToRemove: string) => {
    const newSubjects = form.getValues('subjects').filter(s => s !== subjectToRemove);
    form.setValue('subjects', newSubjects);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Register New Teacher</CardTitle>
          <CardDescription>Fill in the details and capture a photo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative h-48 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
            {hasCameraPermission === undefined && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {capturedImage && (
              <div className="absolute inset-0">
                <img src={capturedImage} alt="Captured teacher" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleCapture} disabled={!hasCameraPermission} variant="outline" className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            {capturedImage ? 'Retake Photo' : 'Capture Photo'}
          </Button>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Jane Smith" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="e.g. j.smith@school.edu" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl><Input placeholder="e.g. 9876543210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects</FormLabel>
                    <FormControl>
                      <div>
                        <Input 
                          placeholder="Type a subject and press Enter" 
                          value={currentSubject}
                          onChange={(e) => setCurrentSubject(e.target.value)}
                          onKeyDown={handleSubjectKeyDown}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((subject, index) => (
                            <Badge key={index} variant="secondary">
                              {subject}
                              <button type="button" onClick={() => removeSubject(subject)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting || !capturedImage}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Register Teacher
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Registered Teachers</CardTitle>
          <CardDescription>A list of all teachers in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Name & Contact</TableHead>
                  <TableHead>Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={teacher.avatar} alt={teacher.name} data-ai-hint="person portrait" />
                          <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        <p className="text-sm text-muted-foreground">{teacher.contact}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects?.map(subject => (
                            <Badge key={subject} variant="outline">{subject}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No teachers registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
