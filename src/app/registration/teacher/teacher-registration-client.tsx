
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useTeachers } from '@/hooks/use-teachers';
import { useClasses } from '@/hooks/use-classes';
import type { Class } from '@/types';

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
import { Camera, UserPlus, Loader2, X, Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

const teacherFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  contact: z.string().min(10, { message: 'Please enter a valid contact number.' }),
  classIds: z.array(z.string()).min(1, { message: 'At least one class must be assigned.' }),
});

export function TeacherRegistrationClient() {
  const { toast } = useToast();
  const { teachers, addTeacher, loading: teachersLoading } = useTeachers();
  const { classes, loading: classesLoading } = useClasses();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);


  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      email: '',
      contact: '',
      classIds: [],
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
    setCapturedImage(null);
    setIsSubmitting(false);
  };
  
  const loading = teachersLoading || classesLoading;

  const getClassLabel = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo ? `${classInfo.name} - Sec. ${classInfo.section}` : classId;
  }

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
                  <div className="futuristic-input-container">
                    <div className="futuristic-input-wrapper">
                      <FormControl>
                        <Input placeholder="e.g. Jane Smith" {...field} className="futuristic-input w-full" />
                      </FormControl>
                    </div>
                    <div className="futuristic-input-glow" />
                    <div className="futuristic-input-dark-border" />
                    <div className="futuristic-input-white-border" />
                    <div className="futuristic-input-border" />
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                   <div className="futuristic-input-container">
                    <div className="futuristic-input-wrapper">
                      <FormControl>
                        <Input placeholder="e.g. j.smith@school.edu" {...field} className="futuristic-input w-full" />
                      </FormControl>
                    </div>
                    <div className="futuristic-input-glow" />
                    <div className="futuristic-input-dark-border" />
                    <div className="futuristic-input-white-border" />
                    <div className="futuristic-input-border" />
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                   <div className="futuristic-input-container">
                    <div className="futuristic-input-wrapper">
                      <FormControl>
                        <Input placeholder="e.g. 9876543210" {...field} className="futuristic-input w-full" />
                      </FormControl>
                    </div>
                    <div className="futuristic-input-glow" />
                    <div className="futuristic-input-dark-border" />
                    <div className="futuristic-input-white-border" />
                    <div className="futuristic-input-border" />
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="classIds"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Assign Classes</FormLabel>
                    <div className="futuristic-input-container">
                      <div className="futuristic-input-wrapper w-full">
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                    "futuristic-input w-full justify-between h-auto min-h-12 py-2 px-3",
                                    !field.value.length && "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex gap-1 flex-wrap">
                                    {field.value.length > 0 ? (
                                        classes
                                        .filter((cls) => field.value.includes(cls.id))
                                        .map((cls) => (
                                            <Badge
                                                variant="secondary"
                                                key={cls.id}
                                                className="mr-1 mb-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    field.onChange(field.value.filter(v => v !== cls.id));
                                                }}
                                            >
                                                {getClassLabel(cls.id)}
                                                <X className="ml-1 h-3 w-3" />
                                            </Badge>
                                        ))
                                    ) : (
                                        "Select classes to assign"
                                    )}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search classes..." />
                                    <CommandList>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        <CommandGroup>
                                        {classes.map((cls) => (
                                            <CommandItem
                                            key={cls.id}
                                            onSelect={() => {
                                                const currentValues = field.value || [];
                                                const isSelected = currentValues.includes(cls.id);
                                                if (isSelected) {
                                                    field.onChange(currentValues.filter(v => v !== cls.id));
                                                } else {
                                                    field.onChange([...currentValues, cls.id]);
                                                }
                                            }}
                                            >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                (field.value || []).includes(cls.id)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                            />
                                            {getClassLabel(cls.id)}
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                      </div>
                      <div className="futuristic-input-glow" />
                      <div className="futuristic-input-dark-border" />
                      <div className="futuristic-input-white-border" />
                      <div className="futuristic-input-border" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="futuristic-input-container w-full pt-2">
                  <div className="futuristic-input-wrapper w-full">
                      <Button type="submit" className="w-full futuristic-input" disabled={isSubmitting || !capturedImage || classes.length === 0}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        Register Teacher
                      </Button>
                  </div>
                  <div className="futuristic-input-glow" />
                  <div className="futuristic-input-dark-border" />
                  <div className="futuristic-input-white-border" />
                  <div className="futuristic-input-border" />
              </div>
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
                  <TableHead>Assigned Classes</TableHead>
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
                          {teacher.classIds?.map(classId => {
                             return (
                                <Badge key={classId} variant="outline">{getClassLabel(classId)}</Badge>
                             )
                          })}
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
