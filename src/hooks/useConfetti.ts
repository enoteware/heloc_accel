import { useCallback } from 'react';

export type ConfettiType = 'success' | 'savings' | 'celebration';

interface ConfettiOptions {
  type?: ConfettiType;
  origin?: { x: number; y: number };
}

export const useConfetti = () => {
  const triggerConfetti = useCallback((options: ConfettiOptions = {}) => {
    const { type = 'success', origin } = options;
    
    console.log('🎉 Triggering confetti:', { type, origin });
    
    // Dynamic import to ensure it only loads on client
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;

      // Create a canvas if one doesn't exist
      let canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10000';
        document.body.appendChild(canvas);
      }

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });

      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        disableForReducedMotion: true,
      };

      const configs = {
        success: {
          particleCount: 100,
          colors: ['#065f46', '#10b981', '#34d399'], // Green tones for success
          ...defaults,
        },
        savings: {
          particleCount: 150,
          colors: ['#f97316', '#fb923c', '#fdba74'], // Coral/orange tones from design system
          scalar: 1.2,
          ...defaults,
        },
        celebration: {
          particleCount: 200,
          colors: ['#065f46', '#10b981', '#f97316', '#fb923c', '#1e293b'], // Mix of brand colors
          scalar: 1.5,
          ...defaults,
        },
      };

      const config = configs[type];

      if (origin) {
        myConfetti({
          ...config,
          origin,
        });
      } else {
        // Multiple bursts for bigger celebration
        const count = type === 'celebration' ? 3 : 1;

        const fire = (particleRatio: number, opts: any) => {
          myConfetti({
            ...config,
            ...opts,
            particleCount: Math.floor(config.particleCount * particleRatio),
          });
        };

        if (count === 1) {
          fire(1, {
            spread: 26,
            startVelocity: 55,
          });
        } else {
          fire(0.25, {
            spread: 26,
            startVelocity: 55,
          });

          fire(0.2, {
            spread: 60,
          });

          fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
          });

          fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
          });

          fire(0.1, {
            spread: 120,
            startVelocity: 45,
          });
        }
      }
    }).catch((error) => {
      console.error('Failed to load confetti:', error);
    });
  }, []);

  return { triggerConfetti };
};