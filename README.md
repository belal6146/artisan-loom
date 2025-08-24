# Artisan

A minimal, production-ready art platform connecting emerging artists worldwide.

## 🎨 About

Artisan is a sophisticated platform where artists can:
- **Discover** unique artworks from emerging creators
- **Connect** with like-minded artists and art enthusiasts  
- **Collaborate** on creative projects and commissions
- **Learn** through courses and workshops from professionals
- **Experience** galleries, competitions, and art events
- **Grow** their artistic practice and business

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript (strict mode)
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- TanStack Query for data fetching
- Zustand for state management
- Zod for validation
- React Hook Form for forms

**Architecture:**
- Feature-based folder structure
- SOLID/DRY/KISS principles
- Type-safe API layer
- Normalized data structures
- Error boundaries & toast notifications
- Accessibility-first design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── layout/         # Layout components
│   └── auth/           # Authentication components
├── pages/              # Route components
├── store/              # Zustand stores
├── lib/                # Utilities & services
│   ├── api-client.ts   # HTTP client
│   ├── env.ts          # Environment validation
│   ├── log.ts          # Structured logging
│   ├── storage.ts      # localStorage wrapper
│   └── normalizers.ts  # Data normalization
├── types.ts            # Core type definitions
└── schemas.ts          # Zod validation schemas
```

## 🔐 Environment Variables

Create a `.env.local` file:

```bash
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Artisan
VITE_APP_ENV=development
```

## 🎭 Demo Credentials

**Email:** `demo@artisan.app`  
**Password:** `password`

## 🏗 Architecture Principles

- **Small files** (<200 lines each)
- **Feature folders** over type folders
- **Composition** over inheritance
- **Type safety** with no `any` types
- **Accessibility** built-in from the start
- **Performance** optimized by default

## 🎨 Design System

The platform uses a sophisticated design system with:
- **Editorial aesthetic** - Clean, calm, and professional
- **Semantic color tokens** - HSL-based with light/dark modes
- **Typography scale** - Inter font with display/heading/body styles
- **Rounded corners** - Consistent 1rem radius (rounded-2xl)
- **Soft shadows** - Subtle depth without heaviness
- **Smooth animations** - Respects `prefers-reduced-motion`

## 🔒 Security & Quality

- **Input validation** with Zod schemas
- **Error boundaries** for graceful failures
- **XSS protection** via React's built-in escaping
- **Type safety** enforced at build time
- **ESLint + Prettier** for code quality
- **No secrets** in source code

## 🌐 API Integration

The frontend is designed to work with a Fastify backend providing:
- `/api/users` - User management
- `/api/artworks` - Artwork CRUD
- `/api/posts` - Social posts
- `/api/collaborations` - Project collaboration
- `/api/events` - Art events and experiences
- `/api/purchases` - Artwork transactions

Currently uses mock services for development.

## 🎯 Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA labels and descriptions
- Color contrast compliance
- Reduced motion support

## 📱 Responsive Design

Mobile-first responsive design with breakpoints:
- `sm`: 640px+
- `md`: 768px+  
- `lg`: 1024px+
- `xl`: 1280px+
- `2xl`: 1400px+

## 🚢 Deployment

The app is optimized for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **Any static hosting**

Build artifacts are generated in the `dist/` folder.

## 🤝 Contributing

1. Follow the established architecture patterns
2. Keep components under 200 lines
3. Use TypeScript strictly (no `any`)
4. Test your changes
5. Follow the design system
6. Ensure accessibility compliance

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for the creative community.