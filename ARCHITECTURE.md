# FreeCoin: Mining Empire - Architecture Documentation

## Project Overview

FreeCoin: Mining Empire is a production-ready Telegram Mini App built with Next.js 15, React 19, TypeScript, and Supabase. The architecture is designed to scale to millions of users while maintaining clean code organization and developer experience.

## Folder Structure

```
c:\click/
├── app/                      # Next.js App Router pages
│   ├── friends/             # Friends page
│   ├── inventory/           # Inventory page
│   ├── leaderboard/         # Leaderboard page
│   ├── mining/              # Mining page
│   ├── profile/             # Profile page
│   ├── settings/            # Settings page
│   ├── tasks/               # Tasks page
│   ├── upgrades/            # Upgrades page
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles with cyberpunk theme
├── components/              # Reusable React components
│   ├── providers/          # Context providers
│   │   └── TelegramProvider.tsx
│   └── ui/                  # UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Dialog.tsx
│       ├── Loader.tsx
│       ├── Modal.tsx
│       ├── PageLayout.tsx
│       ├── Toast.tsx
│       └── BottomNavigation.tsx
├── features/                # Feature-based modules (future)
├── hooks/                   # Custom React hooks (future)
├── lib/                     # Core library utilities
│   ├── env.ts              # Environment variable validation
│   ├── supabase.ts         # Supabase client configuration
│   └── telegram.ts         # Telegram Mini App initialization
├── services/               # External service integrations (future)
├── store/                  # State management (future)
├── types/                  # TypeScript type definitions (future)
├── utils/                  # Utility functions (future)
├── public/                 # Static assets
├── .env.example           # Environment variables template
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore patterns
├── .gitignore             # Git ignore patterns
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── next.config.ts         # Next.js configuration
```

## Folder Explanations

### `/app` - Next.js App Router
Contains all application pages using Next.js 15 App Router. Each folder represents a route, with `page.tsx` being the page component. This structure enables:
- File-based routing
- Server and client components
- Streaming and suspense
- Optimized static generation

### `/components` - Reusable Components
Holds all React components organized by purpose:
- **`providers/`**: Context providers that wrap the application (Telegram initialization)
- **`ui/`**: Reusable UI primitives that can be composed to build complex interfaces

### `/features` - Feature-Based Modules (Future)
Reserved for feature-based architecture. Each feature will contain its own components, hooks, and logic. This enables:
- Clear separation of concerns
- Easy feature toggling
- Independent testing
- Scalable team collaboration

### `/hooks` - Custom React Hooks (Future)
Custom React hooks for reusable stateful logic. Examples:
- `useMining` - Mining game logic
- `useUser` - User data management
- `useAuth` - Authentication logic

### `/lib` - Core Library
Contains core utilities and configurations:
- **`env.ts`**: Zod-based environment variable validation for type safety
- **`supabase.ts`**: Supabase client singleton for database operations
- **`telegram.ts`**: Telegram Mini App SDK initialization

### `/services` - External Services (Future)
API integrations and external service clients:
- Telegram bot API
- Payment gateways
- Analytics services
- Notification services

### `/store` - State Management (Future)
Global state management using Zustand or similar:
- User state
- Game state
- UI state

### `/types` - TypeScript Definitions (Future)
Shared TypeScript types and interfaces:
- User types
- Game types
- API response types

### `/utils` - Utility Functions (Future)
Pure utility functions:
- Formatting helpers
- Validation helpers
- Calculation helpers

## Architecture Decisions

### 1. Feature-Based Architecture
**Why**: Feature-based architecture scales better than technical layering for large applications. It enables:
- Independent feature development
- Clear ownership boundaries
- Easier code navigation
- Better testability

### 2. TypeScript Strict Mode
**Why**: Type safety at compile time prevents runtime errors and improves developer experience:
- Catches bugs early
- Better IDE autocomplete
- Self-documenting code
- Safer refactoring

### 3. Environment Variable Validation with Zod
**Why**: Runtime validation ensures environment variables are correct before the app starts:
- Prevents deployment with missing config
- Type-safe environment access
- Clear error messages
- Single source of truth for env schema

### 4. Reusable UI Components
**Why**: Building a design system from components ensures:
- Consistent UI across the app
- Faster development
- Easy theming
- Better maintainability

### 5. Premium Dark Cyberpunk UI
**Why**: Telegram Mini Apps benefit from:
- Dark theme (reduces battery usage)
- Neon accents (modern, gaming aesthetic)
- Glassmorphism (depth and hierarchy)
- Mobile-first design (Telegram is mobile-only)

### 6. Path Aliases
**Why**: Absolute imports improve code readability:
- No relative import hell (`../../../components`)
- Clear module origins
- Easier refactoring
- Better IDE support

### 7. Supabase Client Singleton
**Why**: Single Supabase instance ensures:
- Connection pooling
- Consistent configuration
- Efficient resource usage
- Easy testing with mocks

### 8. Telegram Mini App Initialization
**Why**: Proper initialization ensures:
- Full viewport usage
- Theme integration
- Back button support
- Native feel

## Scaling to Millions of Users

### Database Architecture (Supabase)
- **Row-Level Security**: Protect user data at the database level
- **Connection Pooling**: Supabase manages database connections efficiently
- **Edge Functions**: Serverless functions for complex operations
- **Real-time Subscriptions**: Efficient real-time updates

### Performance Optimization
- **Static Generation**: Pages are pre-rendered where possible
- **Code Splitting**: Automatic code splitting by Next.js
- **Image Optimization**: Next.js Image component for optimized images
- **Caching Strategy**: Supabase caching + CDN

### State Management
- **Server State**: Supabase queries with React Query (future)
- **Client State**: Zustand for ephemeral UI state
- **Optimistic Updates**: Improve perceived performance

### API Design
- **RESTful Design**: Clear, predictable API endpoints
- **Pagination**: Efficient data loading for large datasets
- **Rate Limiting**: Supabase provides built-in rate limiting
- **Webhooks**: Real-time event handling

### Monitoring & Analytics
- **Error Tracking**: Sentry integration (future)
- **Performance Monitoring**: Vercel Analytics (future)
- **User Analytics**: Custom analytics (future)

### Infrastructure
- **Vercel Deployment**: Edge network for global performance
- **CDN**: Static assets served from edge
- **Database Replication**: Supabase handles read replicas
- **Auto-scaling**: Serverless functions scale automatically

### Code Organization for Teams
- **Feature Boundaries**: Clear ownership per feature
- **Code Review Process**: PRs enforce quality
- **CI/CD Pipeline**: Automated testing and deployment
- **Documentation**: Inline documentation + architecture docs

## Future Enhancements

### Authentication
- Telegram OAuth integration
- Session management
- Protected routes

### Game Logic
- Mining mechanics
- Upgrade system
- Task system
- Inventory management
- Leaderboard

### Real-time Features
- Live coin updates
- Multiplayer events
- Chat system
- Notifications

### Monetization
- In-app purchases
- Subscription tiers
- Ad integration

## Development Guidelines

### Adding New Features
1. Create feature folder in `/features`
2. Add components, hooks, and types within the feature
3. Export from feature index
4. Import using path aliases

### Adding New UI Components
1. Add to `/components/ui`
2. Follow existing patterns
3. Use TypeScript strictly
4. Add Framer Motion animations

### Adding New Pages
1. Create folder in `/app`
2. Add `page.tsx`
3. Use `PageLayout` component
4. Add navigation to `BottomNavigation`

### Environment Variables
1. Add to `.env.example`
2. Update schema in `lib/env.ts`
3. Use via `env.VARIABLE_NAME`

## Conclusion

This architecture provides a solid foundation for building a scalable Telegram Mini App that can grow from thousands to millions of users. The clean separation of concerns, type safety, and modern tooling ensure maintainability and developer productivity while the infrastructure choices enable horizontal scaling.
