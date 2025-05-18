import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../api/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string) => {
        console.log('Setting auth state:', { user, token });
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        console.log('Clearing auth state');
        set({ user: null, token: null, isAuthenticated: false });
      },

      initialize: () => {
        try {
          const stored = localStorage.getItem('auth-storage');
          console.log('Initializing from storage:', stored);
          
          if (stored) {
            const { state } = JSON.parse(stored);
            console.log('Parsed state:', state);
            
            // Only update if we have valid data
            if (state.user && state.token) {
              console.log('Setting state from storage');
              set({ 
                user: state.user, 
                token: state.token, 
                isAuthenticated: true 
              });
            } else {
              console.log('Invalid stored state, keeping current state');
            }
          } else {
            console.log('No stored state found');
          }
        } catch (error) {
          console.error('Error initializing auth store:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 