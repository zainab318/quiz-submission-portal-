import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  quizHistory: [],
  totalQuizzes: 0,
  averageScore: 0,
  bestScore: 0,
  favoriteSubject: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN':
      const userData = {
        ...action.payload,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('quizPortalUser', JSON.stringify(userData));
      return {
        ...state,
        user: userData,
        isAuthenticated: true,
        isLoading: false
      };
    
    case 'LOGOUT':
      localStorage.removeItem('quizPortalUser');
      // Don't remove quizHistory - it should persist per user
      return {
        ...initialState,
        isLoading: false
      };
    
    case 'LOAD_USER':
      const loadedHistory = action.payload.quizHistory || [];
      const loadedTotalQuizzes = loadedHistory.length;
      const loadedAverageScore = loadedTotalQuizzes > 0 
        ? Math.round(loadedHistory.reduce((sum, quiz) => sum + quiz.score, 0) / loadedTotalQuizzes)
        : 0;
      const loadedBestScore = loadedTotalQuizzes > 0
        ? Math.max(...loadedHistory.map(quiz => quiz.score))
        : 0;
      
      // Find favorite subject
      const loadedSubjectCounts = {};
      loadedHistory.forEach(quiz => {
        loadedSubjectCounts[quiz.subject] = (loadedSubjectCounts[quiz.subject] || 0) + 1;
      });
      const loadedFavoriteSubject = Object.keys(loadedSubjectCounts).length > 0 
        ? Object.keys(loadedSubjectCounts).reduce((a, b) => 
            loadedSubjectCounts[a] > loadedSubjectCounts[b] ? a : b
          )
        : null;
      
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        quizHistory: loadedHistory,
        totalQuizzes: loadedTotalQuizzes,
        averageScore: loadedAverageScore,
        bestScore: loadedBestScore,
        favoriteSubject: loadedFavoriteSubject,
        isLoading: false
      };
    
    case 'ADD_QUIZ_RESULT':
      // Check if this quiz result already exists to prevent duplicates
      const isDuplicate = state.quizHistory.some(quiz => 
        quiz.completedAt === action.payload.completedAt &&
        quiz.subject === action.payload.subject &&
        quiz.score === action.payload.score
      );
      
      if (isDuplicate) {
        return state; // Don't add duplicate
      }
      
      const newHistory = [...state.quizHistory, action.payload];
      // Store quiz history per user
      const userEmail = state.user?.email;
      if (userEmail) {
        localStorage.setItem(`quizHistory_${userEmail}`, JSON.stringify(newHistory));
      }
      
      // Calculate statistics
      const totalQuizzes = newHistory.length;
      const averageScore = Math.round(
        newHistory.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes
      );
      const bestScore = Math.max(...newHistory.map(quiz => quiz.score));
      
      // Find favorite subject
      const subjectCounts = {};
      newHistory.forEach(quiz => {
        subjectCounts[quiz.subject] = (subjectCounts[quiz.subject] || 0) + 1;
      });
      const favoriteSubject = Object.keys(subjectCounts).length > 0 
        ? Object.keys(subjectCounts).reduce((a, b) => 
            subjectCounts[a] > subjectCounts[b] ? a : b
          )
        : null;
      
      return {
        ...state,
        quizHistory: newHistory,
        totalQuizzes,
        averageScore,
        bestScore,
        favoriteSubject
      };
    
    case 'UPDATE_PROFILE':
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem('quizPortalUser', JSON.stringify(updatedUser));
      
      // Also update in the users database
      const existingUsers = JSON.parse(localStorage.getItem('quizPortalUsers') || '{}');
      if (updatedUser.email && existingUsers[updatedUser.email]) {
        existingUsers[updatedUser.email] = updatedUser;
        localStorage.setItem('quizPortalUsers', JSON.stringify(existingUsers));
      }
      
      return {
        ...state,
        user: updatedUser
      };
    
    case 'CLEAR_QUIZ_HISTORY':
      // Clear quiz history for current user only
      const currentUserEmail = state.user?.email;
      if (currentUserEmail) {
        localStorage.removeItem(`quizHistory_${currentUserEmail}`);
      }
      return {
        ...state,
        quizHistory: [],
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        favoriteSubject: null
      };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Load user data from localStorage on app start
    const loadUserData = () => {
      try {
        const savedUser = localStorage.getItem('quizPortalUser');
        const user = savedUser ? JSON.parse(savedUser) : null;
        
        // Load user-specific quiz history
        let quizHistory = [];
        if (user?.email) {
          const savedHistory = localStorage.getItem(`quizHistory_${user.email}`);
          quizHistory = savedHistory ? JSON.parse(savedHistory) : [];
        }
        
        dispatch({ 
          type: 'LOAD_USER', 
          payload: { user, quizHistory } 
        });
        
        // If we have history, calculate stats
        if (quizHistory.length > 0) {
          const totalQuizzes = quizHistory.length;
          const averageScore = Math.round(
            quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes
          );
          
          const subjectCounts = {};
          quizHistory.forEach(quiz => {
            subjectCounts[quiz.subject] = (subjectCounts[quiz.subject] || 0) + 1;
          });
          const favoriteSubject = Object.keys(subjectCounts).reduce((a, b) => 
            subjectCounts[a] > subjectCounts[b] ? a : b
          );
          
          dispatch({
            type: 'LOAD_USER',
            payload: {
              user,
              quizHistory,
              totalQuizzes,
              averageScore,
              favoriteSubject
            }
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUserData();
  }, []);

  const login = (userData) => {
    dispatch({ type: 'LOGIN', payload: userData });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addQuizResult = (quizResult) => {
    dispatch({ type: 'ADD_QUIZ_RESULT', payload: quizResult });
  };

  const updateProfile = (profileData) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
  };

  const clearQuizHistory = () => {
    dispatch({ type: 'CLEAR_QUIZ_HISTORY' });
  };

  const value = {
    ...state,
    login,
    logout,
    addQuizResult,
    updateProfile,
    clearQuizHistory,
    dispatch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
