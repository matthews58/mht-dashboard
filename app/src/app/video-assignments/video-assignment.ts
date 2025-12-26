import { required, schema } from "@angular/forms/signals";

export interface VideoAssignmentsResponse {
  videos: VideoAssignment[];
}

export interface VideoAssignment {
  videoId: string;
  title: string;
  createdAt: string;
  playersAssigned: number;
  playersAnswered: number;
  correctPercent: number | null;
  details: VideoAssignmentDetail[];
}

export interface VideoAssignmentDetail {
  playerId: string;
  playerName: string;
  question: string;
  answer: string | null;
  isCorrect: boolean | null;
  submittedAt: string | null;
}

/** Video Assignment Form **/
export interface VideoAssignmentEntry {
  // TODO add quiz questions
  url: string;
  title: string;
  description: string;
  assignedPlayers: string[];
  managingCoaches: string[];
}

export const initialData: VideoAssignmentEntry = {
  url: '',
  title: '',
  description: '',
  assignedPlayers: [],
  managingCoaches: [],
};

export const videoAssignmentSchema = schema<VideoAssignmentEntry>((rootPath) => {
  required(rootPath.url, { message: 'URL is required' });
  required(rootPath.title, { message: 'Title is required' });
  required(rootPath.description, { message: 'Description is required' });
});