import { apply, applyEach, disabled, min, minLength, readonly, required, schema, validate } from "@angular/forms/signals";
import { User } from "../users/user.service";

export interface VideoAssignmentsResponse {
  videos: VideoAssignment[];
}

export interface VideoAssignment {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  createdAt: string;
  playersAssigned: number;
  playersAnswered: number;
  correctPercent: number | null;
  details: VideoAssignmentDetail[];
  assignedPlayers: string[];
  managingCoaches: string[];
  startTime: number;
  endTime: number;
  quizQuestion: QuizQuestion;
}

export interface VideoAssignmentDetail {
  playerId: string;
  playerName: string;
  question: string;
  answer: string | null;
  isCorrect: boolean | null;
  submittedAt: string | null;
}

export interface VideoAssignmentRequest {
  managingCoaches: string[];
  title: string;
  file: File;
  videoFile?: number;
  startTime: number;
  endTime: number;
  description: string;
  quizQuestion: QuizQuestion;
  assignedPlayers: string[];
}

/** Video Assignment Form **/
export interface VideoAssignmentEntry {
  managingCoaches: User[];
  title: string;
  file: any;
  startTime: number;
  endTime: number;
  description: string;
  quizQuestion: QuizQuestion;
  assignedPlayers: User[];
}

export interface QuizQuestion {
  pauseTime: number;
  question: string;
  choices: QuizQuestionChoice[];
  explanation: string;
}

export interface QuizQuestionChoice {
  choiceText: string;
  isCorrect: boolean;
}

export const initialData: VideoAssignmentEntry = {
  managingCoaches: [],
  file: '',
  startTime: 0,
  endTime: NaN,
  title: '',
  description: '',
  quizQuestion: { pauseTime: NaN, question: '', choices: [{ choiceText: '', isCorrect: true }], explanation: '' },
  assignedPlayers: [],
};

export const videoAssignmentSchema = schema<VideoAssignmentEntry>((rootPath) => {
  minLength(rootPath.managingCoaches, 1, { message: 'At least one coach is required' });
  required(rootPath.file, { message: 'Video File is required' });
  required(rootPath.title, { message: 'Title is required' });
  required(rootPath.description, { message: 'Description is required' });
  required(rootPath.quizQuestion.pauseTime, { message: 'Pause time is required' });
  min(rootPath.quizQuestion.pauseTime, 0, { message: 'Pause time must be greater than 0' });
  required(rootPath.quizQuestion.question, { message: 'Quiz question is required' });
  minLength(rootPath.assignedPlayers, 1, { message: 'At least one player is required' });
});

export const readOnlyVideoAssignmentSchema = schema<VideoAssignmentEntry>((rootPath) => {
  minLength(rootPath.managingCoaches, 1, { message: 'At least one coach is required' });
  required(rootPath.file, { message: 'Video File is required' });
  required(rootPath.title, { message: 'test Title is required' });
  required(rootPath.description, { message: 'test Description is required' });
  apply(rootPath.quizQuestion, quizQuestionSchema);
  minLength(rootPath.assignedPlayers, 1, { message: 'At least one player is required' });
});

const quizQuestionSchema = schema<QuizQuestion>((rootPath) => {
  disabled(rootPath.pauseTime);
  disabled(rootPath.question);
  disabled(rootPath.explanation);
  applyEach(rootPath.choices, choiceSchema);
});

const choiceSchema = schema<QuizQuestionChoice>((rootPath) => {
  disabled(rootPath.choiceText);
  disabled(rootPath.isCorrect);
});