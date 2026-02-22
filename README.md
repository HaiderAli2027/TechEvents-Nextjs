# 🎯 TechEvents - Event Discovery & Booking Platform

A modern, full-stack web application for discovering, exploring, and booking technology events such as hackathons, conferences, and tech meetups.

## ✨ Features

- **Event Discovery**: Browse and search through curated tech events
- **Event Details**: View comprehensive event information including agenda, organizers, and tags
- **Smart Booking**: Book events with email validation and preventing duplicate bookings
- **Similar Events**: AI-powered similar event recommendations based on tags
- **Analytics Tracking**: PostHog integration for user behavior tracking
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Type Safety**: Full TypeScript support for reliability

## 🛠️ Tech Stack

| Layer         | Technology   | Version |
| ------------- | ------------ | ------- |
| **Frontend**  | Next.js      | 16.1.6  |
| **Language**  | TypeScript   | 5.x     |
| **Styling**   | Tailwind CSS | Latest  |
| **Database**  | MongoDB      | 6.x+    |
| **ODM**       | Mongoose     | 8.x     |
| **Analytics** | PostHog      | Latest  |
| **Media**     | Cloudinary   | v2      |
| **Runtime**   | Node.js      | 18+     |

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account for image uploads
- PostHog account for analytics

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd techevents
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/techevents

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
techevents/
├── app/                           # Next.js App Router
│   ├── api/                       # API routes
│   │   └── events/               # Event endpoints
│   ├── events/                   # Event pages
│   │   └── [slug]/              # Dynamic event detail page
│   ├── layout.tsx                # Root layout (Server Component)
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                    # React components
│   ├── EventCard.tsx             # Event listing card
│   ├── Navbar.tsx                # Navigation bar
│   └── BookEvent.tsx             # Booking form
├── database/                      # Database models
│   ├── event.model.ts            # Event schema
│   ├── booking.model.ts          # Booking schema
│   └── index.ts                  # Model exports
├── lib/                           # Utilities
│   ├── mongodb.ts                # DB connection
│   ├── utils.ts                  # Helper functions
│   ├── constants.ts              # Global constants
│   └── actions/                  # Server Actions
│       ├── event.actions.ts
│       └── booking.actions.ts
├── public/                        # Static assets
│   ├── icons/
│   └── images/
├── instrumentation-client.ts     # PostHog setup
└── package.json
```

## 🔌 API Endpoints

### Events

#### Get All Events

```http
GET /api/events
```

**Response:**

```json
{
  "message": "Events fetched successfully",
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "TechConf 2024",
      "slug": "techconf-2024",
      "description": "Annual tech conference",
      "date": "2024-03-15",
      "time": "09:00",
      "location": "New York, NY",
      "mode": "hybrid"
    }
  ],
  "count": 1
}
```

#### Get Event by Slug

```http
GET /api/events/[slug]
```

**Response:**

```json
{
  "message": "Event fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "TechConf 2024",
    "slug": "techconf-2024",
    "description": "Full event description",
    "agenda": ["Opening remarks", "Keynote", "Workshops"],
    "tags": ["conference", "networking", "learning"],
    "organizer": "Tech Community",
    "date": "2024-03-15",
    "time": "09:00"
  }
}
```

#### Create Event

```http
POST /api/events
Content-Type: multipart/form-data

{
  "title": "TechConf 2024",
  "description": "Event description",
  "date": "2024-03-15",
  "time": "09:00",
  "location": "New York, NY",
  "mode": "hybrid",
  "agenda": "[\"Opening\", \"Keynote\"]",
  "tags": "[\"conference\", \"tech\"]",
  "image": <file>
}
```

### Bookings

#### Create Booking

```http
POST /api/bookings (Server Action)

{
  "eventId": "507f1f77bcf86cd799439011",
  "email": "user@example.com"
}
```

## 🗄️ Database Schemas

### Event Model

```typescript
interface IEvent {
  title: string
  slug: string (unique, auto-generated)
  description: string
  overview?: string
  image: string (Cloudinary URL)
  venue: string
  location: string
  date: Date
  time: string
  mode: "online" | "hybrid" | "in-person"
  audience: string[]
  agenda: string[]
  organizer: string
  tags: string[]
}
```

### Booking Model

```typescript
interface IBooking {
  eventId: ObjectId (ref to Event)
  email: string (RFC 5322 validated)
  createdAt: Date
  updatedAt: Date
}
```

## 📊 Development Features

### Mongoose Connection Pooling

- Max pool size: 10 connections
- Socket timeout: 45 seconds
- Buffers disabled for production

### Data Serialization

- All Mongoose documents converted to plain objects (`.lean()`)
- ObjectIds & Dates stringified for Client Component compatibility
- Prevents hydration mismatches

### Error Handling

- Comprehensive try-catch blocks in all API routes
- Validation errors return 400 status
- Server errors return 500 status with descriptive messages
- Console logging for debugging

## 🚢 Building for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Pre-deployment Checklist

- ✅ All environment variables configured
- ✅ MongoDB connection pooling optimized
- ✅ PostHog analytics configured
- ✅ Cloudinary image hosting set up
- ✅ CORS headers configured if needed
- ✅ Error logging implemented
- ✅ Rate limiting considered for APIs

## 🔧 Troubleshooting

### "MONGODB_URI not set"

Ensure `.env.local` contains `MONGODB_URI` with valid MongoDB connection string.

### "Duplicate booking" error

Email + Event combination must be unique. Clear database or use different email.

### "Cloudinary upload failed"

Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_API_KEY` are correct.

### Image URL not loading

Check Cloudinary URL format and that image was successfully uploaded.

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and test thoroughly
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Create Pull Request

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

Developed at National Textile University - Web Development Program

## 🤝 Support

For issues or questions, please create an issue in the repository.

---

**Note:** This is a learning project. For production use, add authentication, rate limiting, and additional security measures.
