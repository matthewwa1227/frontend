import React, { useState } from 'react';

function TestAnimation() {
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen bg-pixel-bg p-8">
      <button
        onClick={() => {
          setShow(false);
          setTimeout(() => setShow(true), 50);
        }}
        className="bg-pixel-gold text-white px-6 py-3 font-pixel text-sm hover:bg-pixel-highlight transition-colors"
      >
        Test Achievement
      </button>

      {show && (
        <div className="fixed top-20 right-8 animate-slide-in-right">
          <div className="bg-pixel-primary border-4 border-pixel-gold p-6 shadow-pixel-lg">
            <p className="text-pixel-gold font-pixel text-xs mb-2">
              🏆 ACHIEVEMENT UNLOCKED
            </p>
            <p className="text-white font-pixel text-xs">
              Animation Tester
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestAnimation;