export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vertical: UserVertical | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'ANALYST' | 'WORKER';
export type UserVertical = 'MARKETING' | 'PRODUCT' | 'SALES' | 'ENGINEERING' | 'DESIGN' | 'OPERATIONS' | 'FINANCE' | 'HR' | 'LEGAL' | 'OTHER';

export type IdeaPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type IdeaPriorityColor = 'GREEN' | 'YELLOW' | 'RED';

export type IdeaStatus = 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IN_DEVELOPMENT' | 'LAUNCHED' | 'ARCHIVED' | 'AI_DELETION_REQUESTED' | 'DELETED_BY_AI';

export interface Idea {
  id: string;
  title: string;
  description: string;
  vertical: string;
  targetAudience: string;
  motivation?: string;
  launchLocation?: string;
  status: IdeaStatus;
  priority?: IdeaPriority;
  priorityColor?: IdeaPriorityColor;
  priorityScore?: number;
  strengths?: string;
  weaknesses?: string;
  developmentWays?: string;
  aiSummary?: string;
  aiStrengths?: string;
  aiWeaknesses?: string;
  aiDevelopment?: string;
  pdfUrl?: string;
  author: Pick<User, 'id' | 'name' | 'vertical' | 'email'>;
  reviewedBy?: Pick<User, 'id' | 'name'>;
  reviewedAt?: string;
  feedbacks: Feedback[];
  aiDeletion?: AIDeletion;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  ideaId: string;
  authorId: string;
  author: Pick<User, 'id' | 'name'>;
  type: 'POSITIVE' | 'NEGATIVE';
  content: string;
  marketingSuggestions?: string;
  negativeReason?: string;
  sentToAdmin: boolean;
  sentToVertical: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIDeletion {
  id: string;
  ideaId: string;
  requesterId: string;
  requester: Pick<User, 'id' | 'name'>;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  reviewedBy?: Pick<User, 'id' | 'name'>;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PostMortemStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PostMortem {
  id: string;
  title: string;
  type: string;
  status: PostMortemStatus;
  description: string;
  timeline?: string;
  rootCause?: string;
  lessonsLearned?: string;
  actionItems?: string;
  tags?: string[];
  authorId: string;
  author?: Pick<User, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postMortemId: string;
  content: string;
  authorId: string;
  author?: Pick<User, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface VerticalConfig {
  id: string;
  vertical: string;
  name: string;
  description?: string;
  values: string[];
  isActive: boolean;
}

export interface CompanyValue {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface VerticalBenchmark {
  id: string;
  vertical: UserVertical;
  period: string;
  metrics: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface MarketBenchmark {
  id: string;
  vertical: UserVertical;
  competitorName: string;
  period: string;
  metrics: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IdeaListQuery {
  status?: string;
  vertical?: string;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateIdeaDto {
  title: string;
  description: string;
  vertical: string;
  targetAudience: string;
  motivation?: string;
  launchLocation?: string;
}

export interface UpdateIdeaDto {
  title?: string;
  description?: string;
  vertical?: string;
  targetAudience?: string;
  motivation?: string;
  launchLocation?: string;
}

export interface ReviewIdeaDto {
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  strengths?: string;
  weaknesses?: string;
  developmentWays?: string;
}

export interface CreateFeedbackDto {
  type: 'POSITIVE' | 'NEGATIVE';
  content: string;
  marketingSuggestions?: string;
  negativeReason?: string;
}

export interface RequestAIDeletionDto {
  reason: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  vertical?: UserVertical;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: Array<{ id: string; name: string; order: number; color: string }>;
  isDefault?: boolean;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  company: { id: string; name: string };
  contact: { id: string; name: string; email: string };
  owner: { id: string; name: string };
  pipeline: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}