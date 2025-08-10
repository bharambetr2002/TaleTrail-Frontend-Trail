// API Response Types matching backend DTOs

export interface AuthorResponseDTO {
  id: string;
  name: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  bookCount: number;
}

export interface PublisherResponseDTO {
  id: string;
  name: string;
  description?: string;
  address?: string;
  foundedYear?: number;
  bookCount: number;
}

export interface BookResponseDTO {
  id: string;
  title: string;
  description?: string;
  language?: string;
  coverImageUrl?: string;
  publicationYear?: number;
  publisherId?: string;
  publisherName?: string;
  authors: AuthorResponseDTO[];
}

export interface UserBookResponseDTO {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  readingStatus: ReadingStatus;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  addedAt: string;
}

export interface ReviewResponseDTO {
  id: string;
  userId: string;
  username: string;
  bookId: string;
  bookTitle: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface BlogResponseDTO {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  fullName: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Reading Status (fixed to match backend)
export const READING_STATUS = {
  TO_READ: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  DROPPED: 3,
} as const;

export const READING_STATUS_LABELS = {
  [READING_STATUS.TO_READ]: 'To Read',
  [READING_STATUS.IN_PROGRESS]: 'Reading',
  [READING_STATUS.COMPLETED]: 'Completed',
  [READING_STATUS.DROPPED]: 'Dropped',
} as const;

export type ReadingStatus = typeof READING_STATUS[keyof typeof READING_STATUS];