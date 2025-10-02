import React, { useState } from 'react';

function Avatar({ src, alt, size = 80, className = '', forceInitials = false }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate initials avatar (purple background)
  const generateInitialsAvatar = (name) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <div 
        className={`avatar-initials ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: Math.max(size * 0.35, 14),
          fontWeight: '600',
          border: '4px solid #7c3aed',
          fontFamily: 'Inter, sans-serif',
          lineHeight: '1'
        }}
      >
        {initials}
      </div>
    );
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If forceInitials is true or no src provided, show initials
  if (forceInitials || !src) {
    return generateInitialsAvatar(alt || 'User');
  }

  // If image failed to load, show initials
  if (imageError) {
    return generateInitialsAvatar(alt || 'User');
  }

  // Show image with loading state
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {isLoading && (
        <div 
          className="avatar-loading"
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #e5e7eb'
          }}
        >
          <div 
            style={{
              width: size * 0.3,
              height: size * 0.3,
              border: '2px solid #7c3aed',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '4px solid #7c3aed',
          display: isLoading ? 'none' : 'block'
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
}

export default Avatar;