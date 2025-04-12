import { apiRequest } from "./queryClient";

interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiRequest('POST', '/api/login', { email, password });
  return response.json();
};

export const register = async (formData: FormData): Promise<AuthResponse> => {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  
  return response.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await apiRequest('POST', '/api/logout');
  return response.json();
};

export const getCurrentUser = async (): Promise<AuthResponse['user'] | null> => {
  try {
    const response = await fetch('/api/user', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    return null;
  }
};
