'use client';

import { teamMembers as initialTeamMembers, type TeamMember } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const { toast } = useToast();

  const handleRoleChange = (memberId: number, newRole: TeamMember['role']) => {
    // In a real app, this would be a server action.
    // We simulate an optimistic update.
    const originalTeamMembers = [...teamMembers];
    const updatedTeamMembers = teamMembers.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    );
    setTeamMembers(updatedTeamMembers);

    const updatedMember = updatedTeamMembers.find(m => m.id === memberId);
    toast({
        title: "Role Updated",
        description: `${updatedMember?.name}'s role has been changed to ${newRole}.`
    });

    // Example of reverting on failure
    // fakeApiCall().catch(() => {
    //   setTeamMembers(originalTeamMembers);
    //   toast({ variant: 'destructive', title: "Update Failed", description: "Could not update user role." });
    // });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Team Members</CardTitle>
        <CardDescription>
          Invite and manage roles for your academy staff.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="w-[120px]">
                <Select
                  value={member.role}
                  onValueChange={(value: TeamMember['role']) => handleRoleChange(member.id, value)}
                >
                  <SelectTrigger aria-label={`Role for ${member.name}`}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Scout">Scout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
