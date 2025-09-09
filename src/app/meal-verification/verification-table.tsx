
'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, HelpCircle, Edit } from 'lucide-react';
import type { Student, Class, MealVerification } from '@/types';
import { ManualVerifyDialog } from './manual-verify-dialog';

type VerificationTableProps = {
  students: Student[];
  verificationMap: Map<string, MealVerification>;
  classes: Class[];
  onManualVerify: (data: Omit<MealVerification, 'id' | 'verifiedBy' | 'verifiedAt'>) => Promise<boolean>;
  selectedDate: string;
  loading: boolean;
};

export function VerificationTable({
  students,
  verificationMap,
  classes,
  onManualVerify,
  selectedDate,
  loading,
}: VerificationTableProps) {
  
  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} - Sec. ${cls.section}` : 'Unknown Class';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Present Students ({selectedDate})</CardTitle>
        <CardDescription>
          List of all students marked as present or late today. Total: {students.length}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-center">Verification Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-10 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No students were marked as present on this date.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const verification = verificationMap.get(student.id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={student.avatar}
                              alt={student.name}
                              data-ai-hint="person portrait"
                            />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {getClassName(student.classId)}
                      </TableCell>
                      <TableCell className="text-center">
                        {verification ? (
                           <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                  <Badge variant="default" className="cursor-help bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Verified
                                  </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                    Verified {formatDistanceToNow(new Date(verification.verifiedAt), { addSuffix: true })}
                                    <br/>
                                    Source: {verification.source.toUpperCase()}
                                    {verification.note && <br/>}
                                    {verification.note && `Note: ${verification.note}`}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                           <Badge variant="secondary">
                            <HelpCircle className="h-3.5 w-3.5 mr-1" />
                            Pending
                           </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ManualVerifyDialog 
                          student={student} 
                          onVerify={onManualVerify}
                          selectedDate={selectedDate}
                          disabled={!!verification}
                        >
                            <Button variant="ghost" size="sm" disabled={!!verification}>
                                <Edit className="h-4 w-4 mr-2" />
                                Manual
                            </Button>
                        </ManualVerifyDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

