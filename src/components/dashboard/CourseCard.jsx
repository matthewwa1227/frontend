import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../../utils/api';
import PixelButton from '../shared/PixelButton';
import { Book, Clock, Trophy, Star } from 'lucide-react';

export default function CourseCard({ course, enrolled, onUpdate }) {
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseAPI.enrollCourse(course._id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewCourse = () => {
    navigate(`/courses/${course._id}`);
  };

  return (
    <div className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel hover:shadow-pixel-lg transition-shadow">
      {/* Course Header */}
      <div className="bg-pixel-accent border-b-4 border-pixel-highlight p-4">
        <h3 className="font-pixel text-sm text-white mb-2">{course.title}</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-pixel-gold" />
            <span className="text-xs font-pixel text-pixel-gold">
              {course.difficulty || 'Beginner'}
            </span>
          </div>
        </div>
      </div>

      {/* Course Body */}
      <div className="p-4">
        <p className="text-xs font-mono text-gray-400 mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <Book className="w-4 h-4" />
              <span className="font-pixel">Quizzes</span>
            </div>
            <span className="font-mono text-white">{course.quizCount || 0}</span>
          </div>

          {enrolled && course.progress !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Trophy className="w-4 h-4" />
                <span className="font-pixel">Progress</span>
              </div>
              <span className="font-mono text-pixel-success">{course.progress}%</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="font-pixel">Duration</span>
            </div>
            <span className="font-mono text-white">{course.duration || '2 hrs'}</span>
          </div>
        </div>

        {/* Progress Bar for enrolled courses */}
        {enrolled && course.progress !== undefined && (
          <div className="mb-4">
            <div className="w-full h-4 bg-pixel-dark border-2 border-pixel-accent">
              <div 
                className="h-full bg-pixel-success border-r-2 border-pixel-dark transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        {enrolled ? (
          <PixelButton 
            onClick={handleViewCourse}
            variant="primary"
            className="w-full"
          >
            Continue Quest
          </PixelButton>
        ) : (
          <PixelButton 
            onClick={handleEnroll}
            disabled={enrolling}
            variant="success"
            className="w-full"
          >
            {enrolling ? 'Enrolling...' : 'Start Quest'}
          </PixelButton>
        )}
      </div>
    </div>
  );
}