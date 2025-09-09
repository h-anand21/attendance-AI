
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import type { Student, MealVerification } from '@/types';
import { useToast } from '@/hooks/use-toast';

const manualVerifySchema = z.object({
  note: z
    .string()
    .min(10, { message: 'Reason must be at least 10 characters.' })
    .max(200, { message: 'Reason must be less than 200 characters.' }),
});

type ManualVerifyDialogProps = {
  children: React.ReactNode;
  student: Student;
  selectedDate: string;
  disabled: boolean;
  onVerify: (data: Omit<MealVerification, 'id' | 'verifiedBy' | 'verifiedAt'>) => Promise<boolean>;
};

export function ManualVerifyDialog({ children, student, selectedDate, disabled, onVerify }: ManualVerifyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof manualVerifySchema>>({
    resolver: zodResolver(manualVerifySchema),
    defaultValues: {
      note: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof manualVerifySchema>) => {
    setIsSubmitting(true);
    const success = await onVerify({
        studentId: student.id,
        date: selectedDate,
        source: 'manual',
        note: values.note
    });

    if (success) {
      form.reset();
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild disabled={disabled}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Meal Verification</DialogTitle>
          <DialogDescription>
            You are manually verifying a meal for <strong>{student.name}</strong>. Please provide a reason for this override.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Manual Verification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Student lost their QR card, technical issue with scanner."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" type="button">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Verification
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

