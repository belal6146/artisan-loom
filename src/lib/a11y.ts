export const motion = {
  hover: 'transition will-change-transform hover:-translate-y-0.5 motion-reduce:transform-none',
  tap: 'active:scale-95',
};

export const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export const skeleton = 'animate-pulse bg-muted rounded';

export const cardBase = 'rounded-2xl shadow-brand hover:shadow-cardHover transition-all will-change-transform';

export const empty = {
  container: 'text-center py-12 px-6 space-y-4',
  title: 'text-xl font-semibold text-muted-foreground',
  description: 'text-sm text-muted-foreground max-w-md mx-auto',
  actions: 'flex gap-2 justify-center mt-6'
};