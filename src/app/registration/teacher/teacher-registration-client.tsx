'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useTeachers } from '@/hooks/use-teachers';
import { useClasses } from '@/hooks/use-classes';

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
import { GlassBadge } from '@/components/ui/glass-badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const teacherFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Valid email required.' }),
  contact: z.string().min(10, { message: 'Contact number required.' }),
  classIds: z.array(z.string()).min(1, { message: 'Assign at least one class.' }),
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
        description: 'Teacher photo is required.',
      });
      return;
    }

    setIsSubmitting(true);
    await addTeacher({ ...values, avatar: capturedImage });
    toast({
      title: 'Teacher Registered',
      description: `${values.name} successfully registered.`,
    });
    form.reset();
    setCapturedImage(null);
    setIsSubmitting(false);
  };
  
  const loading = teachersLoading || classesLoading;

  const getClassLabel = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo ? `${classInfo.name} (Sec. ${classInfo.section})` : classId;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <GlassCard className="h-full">
          <GlassCardHeader>
            <GlassCardTitle>Register New Teacher</GlassCardTitle>
            <GlassCardDescription>Fill in the details and capture a photo.</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="space-y-6">
            <div className="relative h-48 w-full rounded-2xl bg-black/40 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
              <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
              {hasCameraPermission === undefined && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {capturedImage && (
                <div className="absolute inset-0">
                  <img src={capturedImage} alt="Teacher" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <GlassButton onClick={handleCapture} disabled={!hasCameraPermission} variant="outline" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              {capturedImage ? 'Retake Photo' : 'Capture Photo'}
            </GlassButton>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher Name</FormLabel>
                    <FormControl>
                      <GlassInput placeholder="e.g. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                     <FormControl>
                      <GlassInput placeholder="e.g. j.smith@school.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                     <FormControl>
                      <GlassInput placeholder="e.g. 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField
                  control={form.control}
                  name="classIds"
                  render={({ field }) => (
                      <FormItem className="flex flex-col">
                      <FormLabel>Assign Classes</FormLabel>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <GlassButton
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                    "w-full justify-between h-auto min-h-12 py-3 px-4 rounded-xl",
                                    !field.value.length && "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex gap-1 flex-wrap">
                                    {field.value.length > 0 ? (
                                        classes
                                        .filter((cls) => field.value.includes(cls.id))
                                        .map((cls) => (
                                            <GlassBadge
                                                variant="primary"
                                                key={cls.id}
                                                className="mr-1 mb-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    field.onChange(field.value.filter(v => v !== cls.id));
                                                }}
                                            >
                                                {getClassLabel(cls.id)}
                                                <X className="ml-1 h-3 w-3" />
                                            </GlassBadge>
                                        ))
                                    ) : (
                                        "Select classes"
                                    )}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </GlassButton>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 glass border-white/20">
                                <Command className="bg-transparent">
                                    <CommandInput placeholder="Search classes..." className="text-foreground" />
                                    <CommandList>
                                        <CommandEmpty>No results.</CommandEmpty>
                                        <CommandGroup>
                                        {classes.map((cls) => (
                                            <CommandItem
                                            key={cls.id}
                                            className="hover:bg-white/10"
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
                                                "mr-2 h-4 w-4 text-primary",
                                                (field.value || []).includes(cls.id) ? "opacity-100" : "opacity-0"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <GlassButton type="submit" variant="primary" className="w-full h-14 text-lg" disabled={isSubmitting || !capturedImage || classes.length === 0}>
                  {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <UserPlus className="mr-2 h-6 w-6" />}
                  Register Teacher
                </GlassButton>
              </form>
            </Form>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <GlassCard className="h-full">
          <GlassCardHeader>
            <GlassCardTitle>Registered Teachers</GlassCardTitle>
            <GlassCardDescription>List of all teachers in the system.</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-white/5">
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
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <TableRow key={teacher.id} className="hover:bg-white/5">
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={teacher.avatar} alt={teacher.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.email}</p>
                          <p className="text-xs text-muted-foreground">{teacher.contact}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.classIds?.map(classId => (
                               <GlassBadge key={classId} variant="outline" className="text-[10px]">{getClassLabel(classId)}</GlassBadge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No teachers registered.
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
  );
}