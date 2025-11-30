import React from 'react';
import PixelCard from '../shared/PixelCard';
import { Trophy } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PixelCard title="Dashboard" icon="🎮">
        <p className="text-white font-pixel text-sm">
          Welcome to StudyQuest! Dashboard coming soon...
        </p>
      </PixelCard>
    </div>
  );
}