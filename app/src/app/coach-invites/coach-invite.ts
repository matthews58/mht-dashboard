export interface CoachInvite {
  id: string;
  player: string;
  email: string;
  team: string;
  status: 'Pending' | 'Accepted';
  invitedAt: string;
  acceptedAt?: string;
}

export interface SendCoachInviteRequest {
  teamId: string;
  invites: Invite[]; 
}

export interface Invite {
  player?: string;
  email: string;
}

export type SendCoachInviteResponse = Partial<CoachInvite & { success: boolean, error: string }>;
