import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { 
  User, 
  Target, 
  BookOpen, 
  Calendar,
  Award,
  Clock,
  Star,
  Play,
  BarChart3
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const { user, quizHistory, totalQuizzes, averageScore, bestScore, favoriteSubject, clearQuizHistory } = useAuth();

  const getRecentQuizzes = () => {
    return quizHistory
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);
  };

  const getSubjectStats = () => {
    const stats = {};
    quizHistory.forEach(quiz => {
      if (!stats[quiz.subject]) {
        stats[quiz.subject] = {
          count: 0,
          totalScore: 0,
          bestScore: 0
        };
      }
      stats[quiz.subject].count++;
      stats[quiz.subject].totalScore += quiz.score;
      stats[quiz.subject].bestScore = Math.max(stats[quiz.subject].bestScore, quiz.score);
    });

    return Object.entries(stats).map(([subject, data]) => ({
      subject,
      count: data.count,
      averageScore: Math.round(data.totalScore / data.count),
      bestScore: data.bestScore
    })).sort((a, b) => b.count - a.count);
  };

  // Performance trend function removed - replaced with best score display

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const recentQuizzes = getRecentQuizzes();
  const subjectStats = getSubjectStats();

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header">
        <div className="welcome-section">
          <div className="user-avatar">
            <Avatar 
              src={user?.avatar} 
              alt={user?.name || 'User'} 
              size={80}
              forceInitials={true}
            />
          </div>
            <div className="welcome-content">
              <h1 className="welcome-title">Welcome back, {user?.name}!</h1>
              <p className="welcome-subtitle">Ready to continue your learning journey?</p>
            </div>
          </div>
          <div className="dashboard-actions">
            <Link to="/quiz-selection" className="btn btn-primary">
              <Play size={20} />
              Take New Quiz
            </Link>
            {totalQuizzes > 0 && (
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  if (window.confirm('This will clear all your quiz history. Are you sure?')) {
                    clearQuizHistory();
                  }
                }}
                style={{ fontSize: '0.875rem' }}
              >
                Clear Data
              </button>
            )}
            {/* Profile fix button removed - using simple initials only */}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon quizzes">
              <BookOpen />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalQuizzes}</div>
              <div className="stat-label">Quizzes Taken</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon score">
              <Target />
            </div>
            <div className="stat-content">
              <div className="stat-value">{averageScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon subject">
              <Star />
            </div>
            <div className="stat-content">
              <div className="stat-value">{favoriteSubject || 'None'}</div>
              <div className="stat-label">Favorite Subject</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon achievement">
              <Award />
            </div>
            <div className="stat-content">
              <div className="stat-value">{bestScore}%</div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon achievements">
              <Star />
            </div>
            <div className="stat-content">
              <div className="stat-value">0</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">
                <Clock className="section-icon" />
                Recent Activity
              </h2>
              <Link to="/history" className="section-link">View All</Link>
            </div>

            {recentQuizzes.length > 0 ? (
              <div className="recent-quizzes">
                {recentQuizzes.map((quiz, index) => (
                  <div key={index} className="quiz-item">
                    <div className="quiz-info">
                      <div className="quiz-subject">{quiz.subject}</div>
                      <div className="quiz-details">
                        {quiz.difficulty} • {quiz.totalQuestions} questions
                      </div>
                      <div className="quiz-date">{formatDate(quiz.completedAt)}</div>
                    </div>
                    <div className="quiz-score" style={{ color: getScoreColor(quiz.score) }}>
                      {quiz.score}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen className="empty-icon" />
                <p>No quizzes taken yet. Start your first quiz!</p>
                <Link to="/quiz-selection" className="btn btn-primary">
                  Take Your First Quiz
                </Link>
              </div>
            )}
          </div>

          {/* Subject Performance */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">
                <BarChart3 className="section-icon" />
                Subject Performance
              </h2>
            </div>

            {subjectStats.length > 0 ? (
              <div className="subject-stats">
                {subjectStats.map((stat, index) => (
                  <div key={index} className="subject-stat-item">
                    <div className="subject-info">
                      <div className="subject-name">{stat.subject}</div>
                      <div className="subject-details">
                        {stat.count} quiz{stat.count !== 1 ? 'es' : ''}
                      </div>
                    </div>
                    <div className="subject-scores">
                      <div className="score-item">
                        <span className="score-label">Avg:</span>
                        <span className="score-value" style={{ color: getScoreColor(stat.averageScore) }}>
                          {stat.averageScore}%
                        </span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">Best:</span>
                        <span className="score-value" style={{ color: getScoreColor(stat.bestScore) }}>
                          {stat.bestScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BarChart3 className="empty-icon" />
                <p>Take some quizzes to see your performance stats!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-grid">
            <Link to="/quiz-selection" className="action-card">
              <Play className="action-icon" />
              <h3>Take Quiz</h3>
              <p>Start a new quiz session</p>
            </Link>
            
            <Link to="/history" className="action-card">
              <Calendar className="action-icon" />
              <h3>View History</h3>
              <p>See all your past quizzes</p>
            </Link>
            
            <Link to="/profile" className="action-card">
              <User className="action-icon" />
              <h3>Edit Profile</h3>
              <p>Update your information</p>
            </Link>
            
            <Link to="/achievements" className="action-card">
              <Award className="action-icon" />
              <h3>Achievements</h3>
              <p>View your badges and milestones</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
