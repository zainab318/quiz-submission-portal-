import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { 
  Calculator, 
  Atom, 
  Clock, 
  BookOpen, 
  Globe, 
  Palette,
  Music,
  Code,
  Heart,
  Briefcase,
  Play,
  Settings
} from 'lucide-react';
import './QuizSelection.css';

function QuizSelection() {
  const navigate = useNavigate();
  const { dispatch, difficulty, numberOfQuestions } = useQuiz();
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: <Calculator />, color: '#3b82f6' },
    { id: 'science', name: 'Science', icon: <Atom />, color: '#10b981' },
    { id: 'history', name: 'History', icon: <Clock />, color: '#f59e0b' },
    { id: 'literature', name: 'Literature', icon: <BookOpen />, color: '#ef4444' },
    { id: 'geography', name: 'Geography', icon: <Globe />, color: '#06b6d4' },
    { id: 'art', name: 'Art', icon: <Palette />, color: '#8b5cf6' },
    { id: 'music', name: 'Music', icon: <Music />, color: '#ec4899' },
    { id: 'programming', name: 'Programming', icon: <Code />, color: '#6366f1' },
    { id: 'biology', name: 'Biology', icon: <Heart />, color: '#84cc16' },
    { id: 'business', name: 'Business', icon: <Briefcase />, color: '#f97316' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Basic concepts and simple questions' },
    { value: 'medium', label: 'Medium', description: 'Moderate difficulty with some challenges' },
    { value: 'hard', label: 'Hard', description: 'Advanced topics and complex problems' }
  ];

  const questionCounts = [5, 10, 15, 20];

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    dispatch({ type: 'SET_SUBJECT', payload: subject });
  };

  const handleDifficultyChange = (newDifficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: newDifficulty });
  };

  const handleQuestionCountChange = (count) => {
    dispatch({ type: 'SET_NUMBER_OF_QUESTIONS', payload: count });
  };

  const handleStartQuiz = () => {
    if (selectedSubject) {
      navigate(`/quiz/${selectedSubject.id}`);
    }
  };

  return (
    <div className="quiz-selection">
      <div className="container">
        <div className="selection-header">
          <h1 className="selection-title">Choose Your Quiz</h1>
          <p className="selection-description">
            Select a subject and customize your learning experience
          </p>
        </div>

        {/* Subject Selection */}
        <section className="selection-section">
          <h2 className="section-title">
            <BookOpen className="section-icon" />
            Select Subject
          </h2>
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`subject-card ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
                onClick={() => handleSubjectSelect(subject)}
                style={{ '--subject-color': subject.color }}
              >
                <div className="subject-icon" style={{ color: subject.color }}>
                  {subject.icon}
                </div>
                <h3 className="subject-name">{subject.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz Settings */}
        <section className="selection-section">
          <h2 className="section-title">
            <Settings className="section-icon" />
            Quiz Settings
          </h2>
          
          <div className="settings-grid">
            {/* Difficulty Selection */}
            <div className="setting-group">
              <h3 className="setting-title">Difficulty Level</h3>
              <div className="difficulty-options">
                {difficulties.map((diff) => (
                  <div
                    key={diff.value}
                    className={`difficulty-option ${difficulty === diff.value ? 'selected' : ''}`}
                    onClick={() => handleDifficultyChange(diff.value)}
                  >
                    <div className="difficulty-header">
                      <span className="difficulty-label">{diff.label}</span>
                      <div className={`difficulty-indicator ${diff.value}`}>
                        {diff.value === 'easy' && '●○○'}
                        {diff.value === 'medium' && '●●○'}
                        {diff.value === 'hard' && '●●●'}
                      </div>
                    </div>
                    <p className="difficulty-description">{diff.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Count Selection */}
            <div className="setting-group">
              <h3 className="setting-title">Number of Questions</h3>
              <div className="question-count-options">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    className={`count-option ${numberOfQuestions === count ? 'selected' : ''}`}
                    onClick={() => handleQuestionCountChange(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Start Quiz Button */}
        <div className="start-quiz-section">
          <button
            className={`btn btn-primary btn-large start-quiz-btn ${!selectedSubject ? 'disabled' : ''}`}
            onClick={handleStartQuiz}
            disabled={!selectedSubject}
          >
            <Play size={20} />
            Start Quiz
            {selectedSubject && (
              <span className="quiz-info">
                {selectedSubject.name} • {difficulty} • {numberOfQuestions} questions
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizSelection;
