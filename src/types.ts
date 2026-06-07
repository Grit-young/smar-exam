export interface GradedQuestion {
  number: number;
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswer: string;
  score: number;
  concept: string;
  feedback: string;
}

export interface AnalysisResult {
  subject: string;
  grade: string;
  totalScore: number;
  maxScore: number;
  gradedQuestions: GradedQuestion[];
  weaknessAnalysis: string;
  studyDirections: string[];
  keyConceptsToReview: string[];
  comprehensiveFeedback: string;
}
