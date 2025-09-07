
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
import type { Notice } from '@/types';

const noticeFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Notice must be at least 5 characters.' })
    .max(200, { message: 'Notice must be less than 200 characters.' }),
});

type PublishNoticeDialogProps = {
  children: React.ReactNode;
  onPublish: (newNotice: Omit<Notice, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
};

export function PublishNoticeDialog({ children, onPublish }: PublishNoticeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof noticeFormSchema>>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof noticeFormSchema>) => {
    setIsSubmitting(true);
    await onPublish(values);
    form.reset();
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish New Notice</DialogTitle>
          <DialogDescription>
            Write your announcement below. It will be visible to all users on the dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notice</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. The school will be closed tomorrow due to heavy rain."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
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
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Publish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
