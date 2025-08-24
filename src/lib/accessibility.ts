// Accessibility utilities for production-ready app
export const a11y = {
  // Ensure keyboard navigation works
  handleKeyPress: (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  },

  // Check if images have proper attributes
  validateImage: (img: HTMLImageElement) => {
    const issues: string[] = [];
    
    if (!img.alt) issues.push('Missing alt attribute');
    if (!img.width || !img.height) issues.push('Missing width/height');
    if (!img.loading) issues.push('Consider adding loading="lazy"');
    
    return issues;
  },

  // Generate accessible IDs
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
};