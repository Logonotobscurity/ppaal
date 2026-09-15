import { useEffect, useState } from 'react';

/**
 * @hook useAccessibility
 * @description Monitors and reports accessibility violations using axe-core
 * @pattern Custom Hook Pattern
 */
export function useAccessibility() {
  const [violations, setViolations] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const runAxe = async () => {
      try {
        const axe = await import('@axe-core/react');
        const React = await import('react');
        const ReactDOM = await import('react-dom/client');

        // @ts-ignore - axe types may not be available
        axe.default(React, ReactDOM, 1000, {
          rules: [
            { id: 'color-contrast', enabled: true },
            { id: 'button-name', enabled: true },
            { id: 'html-has-lang', enabled: true },
            { id: 'image-alt', enabled: true },
            { id: 'label', enabled: true },
            { id: 'link-name', enabled: true },
          ],
        });
      } catch (error) {
        console.warn('axe-core not available in production:', error);
      }
    };

    runAxe();
  }, []);

  /**
   * Manually trigger accessibility check
   * Returns array of violations
   */
  const checkAccessibility = async () => {
    setIsRunning(true);
    try {
      // @ts-ignore - axe is injected globally by the hook
      if (window.axe) {
        // @ts-ignore
        const results = await window.axe.run();
        setViolations(results.violations);
        return results.violations;
      }
      return [];
    } catch (error) {
      console.error('Accessibility check failed:', error);
      return [];
    } finally {
      setIsRunning(false);
    }
  };

  return {
    violations,
    isRunning,
    checkAccessibility,
    hasCriticalViolations: violations.some(v => v.impact === 'critical' || v.impact === 'serious'),
  };
}
