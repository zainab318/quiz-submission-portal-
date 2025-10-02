import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { quizCrew } from '../services/crewAI';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Brain,
  RotateCcw
} from 'lucide-react';
import './Quiz.css';

function Quiz() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { 
    questions, 
    currentQuestionIndex, 
    answers, 
    difficulty, 
    numberOfQuestions,
    isLoading,
    dispatch 
  } = useQuiz();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    // Always generate a new quiz when subject, difficulty, or numberOfQuestions change
    generateQuiz();
  }, [subject, difficulty, numberOfQuestions]);

  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining]);

  const generateQuiz = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const quiz = await quizCrew.generateQuiz(subject, difficulty, numberOfQuestions);
      dispatch({ type: 'SET_QUIZ', payload: quiz });
      
      // Set timer based on difficulty and number of questions
      const timePerQuestion = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 90 : 120;
      setTimeRemaining(numberOfQuestions * timePerQuestion);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate quiz. Please try again.' });
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answer) => {
    dispatch({
      type: 'ANSWER_QUESTION',
      payload: {
        questionIndex: currentQuestionIndex,
        answer: answer
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch({ type: 'NEXT_QUESTION' });
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch({ type: 'PREVIOUS_QUESTION' });
    }
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    dispatch({ type: 'COMPLETE_QUIZ', payload: { score } });
    navigate('/results');
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="quiz-loading">
        <div className="container">
          <div className="loading-content">
            <Brain className="loading-icon" />
            <h2>Generating Your Quiz</h2>
            <p>Our AI is creating personalized questions for you...</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="quiz-error">
        <div className="container">
          <div className="error-content">
            <AlertCircle className="error-icon" />
            <h2>Unable to Load Quiz</h2>
            <p>We couldn't generate your quiz. Please try again.</p>
            <button className="btn btn-primary" onClick={generateQuiz}>
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="quiz-intro">
        <div className="container">
          <div className="intro-content">
            <h1 className="intro-title">Ready to Start?</h1>
            <div className="quiz-info">
              <div className="info-item">
                <span className="info-label">Subject:</span>
                <span className="info-value">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Difficulty:</span>
                <span className="info-value">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Questions:</span>
                <span className="info-value">{questions.length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Time Limit:</span>
                <span className="info-value">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-large" onClick={handleStartQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="container">
        {/* Quiz Header */}
        <div className="quiz-header">
          <div className="quiz-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          <div className="quiz-timer">
            <Clock size={20} />
            <span className={timeRemaining < 300 ? 'time-warning' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="question-section">
          <div className="question-card">
            <div className="question-header">
              <span className="question-topic">{currentQuestion.topic}</span>
              <span className="question-difficulty">{currentQuestion.difficulty}</span>
            </div>
            <h2 className="question-text">{currentQuestion.question}</h2>
            
            <div className="options-list">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = option.charAt(0);
                const isSelected = currentAnswer === optionLetter;
                
                return (
                  <button
                    key={index}
                    className={`option-button ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(optionLetter)}
                  >
                    <div className="option-indicator">
                      {isSelected && <CheckCircle size={20} />}
                    </div>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <div className="question-indicators">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`question-indicator ${
                  index === currentQuestionIndex ? 'current' : ''
                } ${answers[index] ? 'answered' : ''}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          <button
            className="btn btn-primary"
            onClick={handleNextQuestion}
            disabled={!currentAnswer}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
