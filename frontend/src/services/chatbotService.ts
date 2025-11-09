import api from './api';

interface ChatError extends Error {
  response?: {
    status?: number;
    data?: any;
  };
  config?: {
    url?: string;
    method?: string;
    data?: any;
  };
}

export const chatWithBot = async (message: string, userId: string = 'U001') => {
  console.log('Sending chat request:', { message, userId });
  try {
    const response = await api.post('/api/v1/others/chat', { 
      message, 
      userId 
    });
    console.log('Chat response received:', response.data);
    return response.data;
  } catch (error: unknown) {
    const err = error as ChatError;
    console.error('Error in chatWithBot:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data
      }
    });
    throw error;
  }
};
