export interface PlayerAssignment {
  playerId: string;
  playerName: string;
  videosAssigned: number;
  videosCompleted: number;
  correctPercent: number | null;
  details: PlayerAssignmentDetail[];
}

export interface PlayerAssignmentDetail {
  videoId: string;
  videoTitle: string;
  question: string;
  answer: string | null;
  isCorrect: boolean | null;
  submittedAt: string | null;
}
