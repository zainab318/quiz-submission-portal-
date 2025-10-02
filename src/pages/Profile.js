import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Shield,
  Award,
  BarChart3
} from 'lucide-react';
import './Profile.css';

function Profile() {
  const { user, updateProfile, quizHistory, totalQuizzes, averageScore } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    level: user?.level || 'Beginner'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      level: user?.level || 'Beginner'
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      case 'expert': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (totalQuizzes >= 1) {
      achievements.push({ name: 'First Quiz', description: 'Completed your first quiz', icon: '🎯' });
    }
    if (totalQuizzes >= 10) {
      achievements.push({ name: 'Quiz Master', description: 'Completed 10 quizzes', icon: '🏆' });
    }
    if (averageScore >= 80) {
      achievements.push({ name: 'High Achiever', description: 'Maintained 80%+ average', icon: '⭐' });
    }
    if (averageScore >= 90) {
      achievements.push({ name: 'Excellence', description: 'Maintained 90%+ average', icon: '💎' });
    }
    if (totalQuizzes >= 25) {
      achievements.push({ name: 'Dedicated Learner', description: 'Completed 25 quizzes', icon: '🔥' });
    }
    
    return achievements;
  };

  const achievements = getAchievements();

  return (
    <div className="profile">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <Avatar 
                src={user?.avatar} 
                alt={user?.name}
                size={120}
                forceInitials={true}
                className="profile-avatar"
              />
              {/* Avatar editing removed - using purple initials only */}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user?.name}</h1>
              <div className="profile-level" style={{ color: getLevelColor(user?.level || 'Beginner') }}>
                <Shield size={16} />
                {user?.level || 'Beginner'}
              </div>
              <div className="profile-join-date">
                <Calendar size={16} />
                Member since {formatDate(user?.joinDate)}
              </div>
            </div>
          </div>
          
          <button 
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <Edit3 size={18} />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Details */}
          <div className="profile-section">
            <h2 className="section-title">
              <User className="section-icon" />
              Profile Information
            </h2>
            
            <div className="profile-form">
              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="form-display">{user?.name}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={18} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="form-display">{user?.email}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Shield size={18} />
                  Skill Level
                </label>
                {isEditing ? (
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                ) : (
                  <div className="form-display" style={{ color: getLevelColor(user?.level || 'Beginner') }}>
                    {user?.level || 'Beginner'}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button className="btn btn-outline" onClick={handleCancel}>
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="profile-section">
            <h2 className="section-title">
              <BarChart3 className="section-icon" />
              Learning Statistics
            </h2>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{totalQuizzes}</div>
                <div className="stat-label">Total Quizzes</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{averageScore}%</div>
                <div className="stat-label">Average Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{quizHistory.length > 0 ? Math.max(...quizHistory.map(q => q.score)) : 0}%</div>
                <div className="stat-label">Best Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{achievements.length}</div>
                <div className="stat-label">Achievements</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="profile-section">
            <h2 className="section-title">
              <Award className="section-icon" />
              Achievements
            </h2>
            
            {achievements.length > 0 ? (
              <div className="achievements-grid">
                {achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-content">
                      <h3 className="achievement-name">{achievement.name}</h3>
                      <p className="achievement-description">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-achievements">
                <Award className="empty-icon" />
                <p>Complete quizzes to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
