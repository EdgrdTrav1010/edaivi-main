# EdAiVi Studio

EdAiVi Studio is a comprehensive AI-powered multimedia platform for creating, editing, and sharing audio, video, and 3D content.

## Features

- **Audio Production**: Create, edit, and enhance audio with AI-powered tools
- **Video Production**: Edit videos with AI assistance and advanced effects
- **3D Avatar Creation**: Generate and customize 3D avatars for various applications
- **3D Scene Design**: Create immersive 3D environments and scenes
- **Live Streaming**: Stream your content with interactive features
- **AI-Powered Tools**: Leverage various AI models for content generation and enhancement
- **Collaboration**: Work together with team members in real-time
- **Cloud Storage**: Store and access your projects from anywhere

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **AI & Machine Learning**: TensorFlow.js
- **3D Rendering**: Three.js
- **Authentication**: JWT
- **Storage**: Local filesystem, AWS S3 (production)
- **Frontend**: React (in separate repository)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/edaivi/edaivi-studio.git
   cd edaivi-studio
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

4. Set up the database:
   ```
   npm run setup:db
   ```

5. Set up the storage system:
   ```
   npm run setup:storage
   ```

6. Start the development server:
   ```
   npm run dev
   ```

### Running with Frontend

To run both the backend and frontend together:

1. Clone the frontend repository (separate repository)
2. Install frontend dependencies
3. Run the combined development environment:
   ```
   npm run dev:all
   ```

## Project Structure

```
edaivi-studio/
├── client/                  # Simple client for testing
├── frontend/                # Frontend application (submodule)
├── models/                  # Database models
│   ├── User.js
│   ├── AudioProject.js
│   ├── VideoProject.js
│   ├── Avatar3D.js
│   ├── Scene3D.js
│   ├── StreamSession.js
│   └── AIModel.js
├── routes/                  # API routes
│   ├── auth.js
│   ├── audio.js
│   ├── video.js
│   ├── avatar.js
│   ├── scene.js
│   ├── stream.js
│   └── ai.js
├── scripts/                 # Utility scripts
│   ├── setup-db.js
│   └── setup-storage.js
├── storage/                 # File storage (created by setup-storage.js)
├── public/                  # Public assets
├── server.js                # Main server file
├── package.json
└── .env                     # Environment variables (create from .env.example)
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Audio Projects

- `GET /api/audio` - Get all audio projects
- `POST /api/audio` - Create a new audio project
- `GET /api/audio/:id` - Get a specific audio project
- `PUT /api/audio/:id` - Update an audio project
- `DELETE /api/audio/:id` - Delete an audio project
- `POST /api/audio/:id/tracks` - Add a track to an audio project
- `PUT /api/audio/:id/tracks/:trackId` - Update a track
- `DELETE /api/audio/:id/tracks/:trackId` - Remove a track
- `POST /api/audio/:id/export` - Export audio project
- `POST /api/audio/:id/collaborators` - Add a collaborator
- `DELETE /api/audio/:id/collaborators/:userId` - Remove a collaborator

### AI Models

- `GET /api/ai/models` - Get all available AI models
- `GET /api/ai/models/:id` - Get a specific AI model
- `POST /api/ai/generate/text` - Generate text
- `POST /api/ai/generate/image` - Generate image
- `POST /api/ai/generate/audio` - Generate audio
- `GET /api/ai/credits` - Get user AI credits
- `POST /api/ai/credits/purchase` - Purchase AI credits

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for AI models
- TensorFlow.js team
- Three.js community
- MongoDB team
- Express.js contributors
