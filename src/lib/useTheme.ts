import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    const applyTheme = async () => {
      type LandingPayload = {
        content?: unknown;
        primary_color?: string;
        secondary_color?: string;
      };

      let data: LandingPayload | null = null;
      try {
        const response = await fetch('/api/landing');
        if (response.ok) {
          data = (await response.json()) as LandingPayload;
        }
      } catch {
        /* network error or abort — fall through to defaults / cache */
      }

      let primaryColor = '#800020';
      let secondaryColor = '#ffd700';

      if (data) {
        try {
          if (data.content && typeof data.content === 'string') {
            const content = JSON.parse(data.content) as {
              primary_color?: string;
              secondary_color?: string;
            };
            if (content.primary_color) primaryColor = content.primary_color;
            if (content.secondary_color) secondaryColor = content.secondary_color;
          } else if (data.primary_color) {
            primaryColor = data.primary_color;
            secondaryColor = data.secondary_color || secondaryColor;
          }
        } catch {
          /* ignore malformed JSON */
        }
      }

      const root = document.documentElement;
      if (!data) {
        const storedPrimary = localStorage.getItem('theme_primary');
        const storedSecondary = localStorage.getItem('theme_secondary');
        if (storedPrimary && storedSecondary) {
          primaryColor = storedPrimary;
          secondaryColor = storedSecondary;
        }
      }

      root.style.setProperty('--primary-color', primaryColor);
      root.style.setProperty('--secondary-color', secondaryColor);
      localStorage.setItem('theme_primary', primaryColor);
      localStorage.setItem('theme_secondary', secondaryColor);
    };
    
    applyTheme();
  }, []);
};

/**
 * Get current theme colors (for components that need them as values, not CSS vars)
 */
export const getThemeColors = () => {
  const root = document.documentElement;
  const primary = getComputedStyle(root).getPropertyValue('--primary-color').trim();
  const secondary = getComputedStyle(root).getPropertyValue('--secondary-color').trim();
  
  return {
    primary: primary || '#800020',
    secondary: secondary || '#ffd700',
  };
};
