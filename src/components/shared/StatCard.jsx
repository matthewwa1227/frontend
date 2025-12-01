import React from 'react';

export default function StatCard({ icon: Icon, label, value, color = 'text-pixel-gold' }) {
  return (
    <div className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-pixel text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-pixel ${color}`}>{value}</p>
        </div>
        {Icon && <Icon className="w-8 h-8 text-pixel-accent" />}
      </div>
    </div>
  );
}