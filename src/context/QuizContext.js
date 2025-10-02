import React, { createContext, useContext, useReducer } from 'react';

const QuizContext = createContext();

const initialState = {
  currentQuiz: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  isLoading: false,
  error: null,
  quizCompleted: false,
  selectedSubject: null,
  difficulty: 'medium',
  numberOfQuestions: 10
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_QUIZ':
      return {
        ...state,
        currentQuiz: action.payload,
        questions: action.payload.questions || [],
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        quizCompleted: false,
        isLoading: false,
        error: null
      };
    
    case 'SET_SUBJECT':
      return { ...state, selectedSubject: action.payload };
    
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    
    case 'SET_NUMBER_OF_QUESTIONS':
      return { ...state, numberOfQuestions: action.payload };
    
    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionIndex]: action.payload.answer
        }
      };
    
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1
      };
    
    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
      };
    
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        quizCompleted: true,
        score: action.payload.score
      };
    
    case 'RESET_QUIZ':
      return {
        ...initialState,
        selectedSubject: state.selectedSubject
      };
    
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const value = {
    ...state,
    dispatch
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
