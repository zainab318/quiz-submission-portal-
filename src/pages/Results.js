import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Home,
  BookOpen,
  Award
} from 'lucide-react';
import './Results.css';

function Results() {
  const navigate = useNavigate();
  const { 
    questions, 
    answers, 
    score, 
    selectedSubject, 
    difficulty,
    quizCompleted,
    dispatch 
  } = useQuiz();
  
  const { isAuthenticated, addQuizResult } = useAuth();

  // Save quiz result to history when component mounts (only once)
  useEffect(() => {
    if (quizCompleted && questions.length > 0 && isAuthenticated) {
      const quizResult = {
        subject: selectedSubject?.name || selectedSubject?.id || 'Unknown',
        difficulty,
        totalQuestions: questions.length,
        score,
        correctAnswers: Object.keys(answers).filter(
          (questionIndex) => answers[questionIndex] === questions[questionIndex].correctAnswer
        ).length,
        completedAt: new Date().toISOString(),
        questions: questions.map((q, index) => ({
          question: q.question,
          userAnswer: answers[index],
          correctAnswer: q.correctAnswer,
          isCorrect: answers[index] === q.correctAnswer
        }))
      };
      
      addQuizResult(quizResult);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizCompleted]); // Only run when quiz is completed, not on every render

  if (!quizCompleted || !questions.length) {
    return (
      <div className="results-error">
        <div className="container">
          <div className="error-content">
            <Trophy className="error-icon" />
            <h2>No Quiz Results Found</h2>
            <p>Please complete a quiz first to see your results.</p>
            <Link to="/quiz-selection" className="btn btn-primary">
              Take a Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const correctAnswers = Object.keys(answers).filter(
    (questionIndex) => answers[questionIndex] === questions[questionIndex].correctAnswer
  ).length;

  const totalQuestions = questions.length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return { title: 'Outstanding!', message: 'You have excellent mastery of this subject!' };
    if (score >= 80) return { title: 'Great Job!', message: 'You have a strong understanding of the material.' };
    if (score >= 70) return { title: 'Good Work!', message: 'You have a good grasp of the concepts.' };
    if (score >= 60) return { title: 'Keep Practicing!', message: 'You\'re on the right track, but there\'s room for improvement.' };
    return { title: 'Keep Learning!', message: 'Don\'t give up! Review the material and try again.' };
  };

  const handleRetakeQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    navigate(`/quiz/${selectedSubject.id}`);
  };

  const handleNewQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    navigate('/quiz-selection');
  };

  const scoreMessage = getScoreMessage(score);

  return (
    <div className="results">
      <div className="container">
        {/* Results Header */}
        <div className="results-header">
          <div className="score-circle" style={{ '--score-color': getScoreColor(score) }}>
            <div className="score-value">{score}%</div>
            <div className="score-label">Score</div>
          </div>
          <div className="score-message">
            <h1 className="score-title">{scoreMessage.title}</h1>
            <p className="score-description">{scoreMessage.message}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-section">
          <h2 className="section-title">Quiz Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon correct">
                <CheckCircle />
              </div>
              <div className="stat-content">
                <div className="stat-value">{correctAnswers}</div>
                <div className="stat-label">Correct</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon incorrect">
                <XCircle />
              </div>
              <div className="stat-content">
                <div className="stat-value">{incorrectAnswers}</div>
                <div className="stat-label">Incorrect</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon accuracy">
                <Target />
              </div>
              <div className="stat-content">
                <div className="stat-value">{accuracy}%</div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon total">
                <BookOpen />
              </div>
              <div className="stat-content">
                <div className="stat-value">{totalQuestions}</div>
                <div className="stat-label">Total Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="quiz-info-section">
          <div className="quiz-info-card">
            <h3>Quiz Details</h3>
            <div className="quiz-details">
              <div className="detail-item">
                <span className="detail-label">Subject:</span>
                <span className="detail-value">{selectedSubject?.name || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Difficulty:</span>
                <span className="detail-value difficulty-badge" data-difficulty={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Questions:</span>
                <span className="detail-value">{totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="review-section">
          <h2 className="section-title">Question Review</h2>
          <div className="questions-review">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} className={`review-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-header">
                    <span className="question-number">Question {index + 1}</span>
                    <div className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                  </div>
                  
                  <div className="question-content">
                    <h4 className="review-question">{question.question}</h4>
                    
                    <div className="answer-comparison">
                      <div className="answer-item">
                        <span className="answer-label">Your Answer:</span>
                        <span className={`answer-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {question.options.find(opt => opt.startsWith(userAnswer)) || 'Not answered'}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="answer-item">
                          <span className="answer-label">Correct Answer:</span>
                          <span className="answer-value correct">
                            {question.options.find(opt => opt.startsWith(question.correctAnswer))}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="explanation">
                      <span className="explanation-label">Explanation:</span>
                      <p className="explanation-text">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="results-actions">
          <button className="btn btn-primary" onClick={handleRetakeQuiz}>
            <RotateCcw size={20} />
            Retake Quiz
          </button>
          <button className="btn btn-secondary" onClick={handleNewQuiz}>
            <BookOpen size={20} />
            Try Different Subject
          </button>
          <Link to="/" className="btn btn-outline">
            <Home size={20} />
            Back to Home
          </Link>
        </div>

        {/* Performance Badge */}
        {score >= 80 && (
          <div className="achievement-badge">
            <Award className="achievement-icon" />
            <div className="achievement-content">
              <h3>Achievement Unlocked!</h3>
              <p>You scored {score}% - Excellent performance!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
