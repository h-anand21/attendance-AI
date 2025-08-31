
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import type { Class } from '@/types';

const classFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Class name must be at least 3 characters.' }),
  section: z.string().min(1, { message: 'Section is required.' }),
});

type CreateClassDialogProps = {
  children: React.ReactNode;
  onClassCreate: (newClassData: Omit<Class, 'id' | 'studentCount'>) => Promise<void>;
};

export function CreateClassDialog({ children, onClassCreate }: CreateClassDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const classForm = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      section: '',
    },
  });

  const onClassSubmit = async (values: z.infer<typeof classFormSchema>) => {
    await onClassCreate(values);
    classForm.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Enter the details for the new class.
          </DialogDescription>
        </DialogHeader>
        <Form {...classForm}>
          <form
            onSubmit={classForm.handleSubmit(onClassSubmit)}
            className="space-y-4"
          >
            <FormField
              control={classForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mathematics 101"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={classForm.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={classForm.formState.isSubmitting}
              >
                {classForm.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Class
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
