const API_BASE_URL = 'https://taletrail-backend.onrender.com/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    type: string;
    details: string;
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(data: { email: string; password: string; fullName: string; username: string }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Book endpoints
  async getBooks(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<any[]>(`/book${query}`);
  }

  async getBook(id: string) {
    return this.request<any>(`/book/${id}`);
  }

  async getBooksByAuthor(authorId: string) {
    return this.request<any[]>(`/book/by-author/${authorId}`);
  }

  // User book endpoints
  async getMyBooks() {
    return this.request<any[]>('/userbook/my-books');
  }

  async addBookToLibrary(data: { bookId: string; readingStatus: number; progress: number }) {
    return this.request('/userbook', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBookStatus(bookId: string, data: { readingStatus: number; progress: number }) {
    return this.request(`/userbook/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeBookFromLibrary(bookId: string) {
    return this.request(`/userbook/${bookId}`, {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async getBookReviews(bookId: string) {
    return this.request<any[]>(`/review/book/${bookId}`);
  }

  async createReview(data: { bookId: string; rating: number; content: string }) {
    return this.request<any>('/review', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReview(id: string, data: { rating: number; content: string }) {
    return this.request(`/review/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/review/${id}`, {
      method: 'DELETE',
    });
  }

  // Blog endpoints
  async getBlogs(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.request<any[]>(`/blog${query}`);
  }

  async getBlog(id: string) {
    return this.request(`/blog/${id}`);
  }

  async createBlog(data: { title: string; content: string }) {
    return this.request('/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlog(id: string, data: { title: string; content: string }) {
    return this.request(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBlog(id: string) {
    return this.request(`/blog/${id}`, {
      method: 'DELETE',
    });
  }

  // Blog like endpoints
  async likeBlog(blogId: string) {
    return this.request(`/blog-like/${blogId}`, {
      method: 'POST',
    });
  }

  async unlikeBlog(blogId: string) {
    return this.request(`/blog-like/${blogId}`, {
      method: 'DELETE',
    });
  }

  // User profile endpoints
  async getMyProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data: { fullName: string; username: string; bio?: string; avatarUrl?: string }) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPublicProfile(username: string) {
    return this.request(`/profile/${username}`);
  }

  // Author endpoints
  async getAuthors() {
    return this.request('/author');
  }

  async getAuthor(id: string) {
    return this.request(`/author/${id}`);
  }

  // Publisher endpoints
  async getPublishers() {
    return this.request('/publisher');
  }

  async getPublisher(id: string) {
    return this.request(`/publisher/${id}`);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Reading status constants
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