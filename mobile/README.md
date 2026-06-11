# Summer Project App - Mobile v3.0

A React Native mobile application for discovering, tracking, and completing summer projects. Built with Expo for iOS and Android deployment.

## Features

### 1. Project Discovery
- Browse 100+ curated summer projects
- Filter by category, difficulty, and interests
- Search projects by title and description
- View detailed project information with requirements

### 2. Project Management
- Start and track project progress
- Update completion percentage
- Mark projects as complete
- Save favorite projects for quick access

### 3. Progress Tracking
- Visual progress bars for each project
- Statistics dashboard with completion metrics
- Track time spent and budget used
- View project timeline

### 4. Reviews & Ratings
- Rate completed projects (1-5 stars)
- Write detailed reviews and experiences
- View your review history
- Contribute to community feedback

### 5. Achievements
- 8 unlockable achievements
- Track achievement progress
- Earn badges for milestones
- Share achievements with friends

### 6. Offline-First Architecture
- All data stored locally with AsyncStorage
- Works completely offline
- Sync queue for backend integration
- Automatic conflict resolution

### 7. Notifications
- Local push notifications for reminders
- Achievement unlock notifications
- Progress milestone notifications
- Customizable quiet hours

## Project Structure

```
mobile/
├── App.jsx                 # Main entry point with navigation
├── app.json               # Expo configuration
├── eas.json              # Expo build configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
│
├── context/
│   └── AppProvider.jsx   # Global app context with state management
│
├── screens/
│   ├── HomeScreen.jsx              # Project discovery
│   ├── ProjectDetailScreen.jsx     # Project details & actions
│   ├── ProgressScreen.jsx          # Progress tracking
│   ├── ProfileScreen.jsx           # User profile & achievements
│   └── SettingsScreen.jsx          # App settings
│
├── utils/
│   ├── storage.js        # AsyncStorage wrapper & offline queue
│   └── notifications.js  # Notification management
│
├── data/
│   └── projects.json     # Project database
│
├── types/
│   └── index.ts         # TypeScript type definitions
│
└── README.md            # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS/Android emulator or physical device

### Installation

```bash
cd mobile
npm install
```

### Development

#### Start the development server
```bash
npm start
```

#### Run on iOS
```bash
npm run ios
```

#### Run on Android
```bash
npm run android
```

#### Run on Web
```bash
npm run web
```

### Building for Production

#### Using EAS (Recommended)
```bash
npm run build
```

#### Web Export
```bash
npm run build-web
```

## Key Components

### App Provider Context
Centralized state management for:
- User authentication (anonymous/email)
- Project favorites
- Project progress tracking
- Reviews and ratings
- Offline sync queue
- User statistics

### Storage Management
- **AsyncStorage**: Persistent local storage
- **Offline Queue**: Queue for failed sync operations
- **Cache System**: TTL-based caching for performance

### Navigation Structure
```
Root (Tab Navigator)
├── Home Stack
│   ├── HomeScreen (Project Discovery)
│   └── ProjectDetailScreen (Project Details)
├── ProgressScreen (Tracking)
├── ProfileScreen (User Stats & Achievements)
└── SettingsScreen (App Settings)
```

## Data Models

### Project
```typescript
{
  id: string
  title: string
  category: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  budget: number
  timeWeeks: number
  requiredSkills: string[]
  interests: string[]
  partsNeeded: string[]
  // ... more fields
}
```

### ProjectProgress
```typescript
{
  status: 'in-progress' | 'completed' | null
  completionPercentage: number
  startedAt?: string
  completedAt?: string
  updatedAt?: string
}
```

### Achievement
```typescript
{
  id: string
  name: string
  description: string
  icon: string  // emoji
}
```

## Achievements System

1. **Getting Started** - Start your first project
2. **Project Explorer** - Start 5 projects
3. **Project Master** - Complete your first project
4. **Builder** - Complete 5 projects
5. **Collector** - Save 5 favorite projects
6. **Critic** - Review 3 projects
7. **Legend** - Complete 10 projects
8. **Consistent** - Maintain a 7-day streak

## Notifications

### Local Notifications
- Project reminders
- Achievement unlocked
- Milestone reached
- Streak notifications

### Customization
Settings → Notifications to enable/disable:
- Push notifications
- Email notifications
- Quiet hours

## Offline-First Design

### How It Works
1. All data stored locally on device
2. Changes queued for sync when offline
3. Automatic sync when connection restored
4. Conflict-free data merging

### Sync Queue Operations
```javascript
// Add to queue
await addToSyncQueue({ type: 'progress', data: {...} })

// Process queue (auto-syncs when online)
await processSyncQueue()
```

## Performance Optimizations

- **Lazy Loading**: Screens load on demand
- **Image Caching**: Project images cached locally
- **Pagination**: Large lists paginated for smooth scrolling
- **Memoization**: React hooks optimized with useMemo/useCallback

## Security

### Data Protection
- No sensitive data stored in plain text
- AsyncStorage encryption (platform-dependent)
- User device ID for tracking (no PII)

### Privacy
- Offline-first: No required backend connection
- Anonymous usage supported
- Data export available in Settings
- Clear all data option available

## Future Enhancements

### Phase 2
- Cloud backup with Supabase
- User authentication
- Social features (share, collaborate)
- Project templates

### Phase 3
- AI-powered project recommendations
- Team collaboration
- In-app messaging
- Advanced analytics

## API Integration Points

When backend is ready, modify:
1. `context/AppProvider.jsx` - Add auth endpoints
2. `utils/storage.js` - Implement real sync logic
3. Add API service layer in `utils/api.js`

Example:
```javascript
// utils/api.js
export const api = {
  sync: async (data) => {
    return fetch('/api/sync', { method: 'POST', body: JSON.stringify(data) })
  },
  // ... more endpoints
}
```

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Android emulator not found
```bash
npm run android -- --device
```

### Port 19000 already in use
```bash
expo start -p 19001
```

### Clear all data
Settings → Danger Zone → Clear All Data

## Browser Support

- iOS 13+
- Android 7+
- Web (modern browsers)

## License

MIT License - See LICENSE file for details

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: [Link to repo]
- Email: support@summerprojectapp.com
- Feedback: feedback@summerprojectapp.com

## Changelog

### v3.0.0 (Current)
- Initial mobile app release
- Offline-first architecture
- Project discovery and tracking
- Achievements system
- Local notifications
- Profile and progress tracking

### v2.0.0
- Web app version
- Basic project browsing

### v1.0.0
- MVP release

---

Built with ❤️ for summer builders everywhere.
