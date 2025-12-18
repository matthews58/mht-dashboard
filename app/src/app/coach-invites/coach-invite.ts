export interface CoachInvite {
  player: string;
  email: string;
  team: string;
  status: 'Pending' | 'Accepted';
  invitedAt: string;
  acceptedAt?: string;
}
