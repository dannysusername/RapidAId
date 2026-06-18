# RapidAid 

A React-based frontend for the Rapid Aid Matcher disaster relief application. This application allows users to submit aid requests and responders to view and coordinate relief efforts.

## Features

- **Submit Aid Requests**: Users can submit requests with their location and aid needs
- **Responder Dashboard**: View categorized aid requests with filtering, sorting, and status management
- **Request Status System**: Track requests through unclaimed → claimed → completed workflow
- **AI-Powered Categorization**: Google Gemini categorizes requests into one or more of Food, Water, Shelter, Medical, Other
- **Shared Data**: Requests are stored in a hosted Supabase (Postgres) database and shared across all users
- **Status-based Analytics**: Dashboard shows response progress and completion metrics
- **Mobile-Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean Component Architecture**: Reusable, maintainable React components

## Technology Stack

- **Framework**: React 19 with functional components and hooks
- **Routing**: React Router v7
- **Backend / Data**: Supabase (hosted Postgres) via `@supabase/supabase-js`, with Row-Level Security
- **AI**: Google Gemini (`gemini-3.1-flash-lite`) via `@google/generative-ai`, called from the browser
- **Styling**: Plain CSS, one file per component
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.jsx        # Navigation header
│   ├── Header.css
│   ├── RequestForm.jsx   # AI-powered request submission form with Gemini integration
│   ├── RequestForm.css
│   ├── RequestList.jsx   # List of aid requests with filtering
│   ├── RequestList.css
│   ├── RequestCard.jsx   # Individual request display with status actions
│   ├── RequestCard.css
│   ├── CategoryBadge.jsx # Category display badge (medical, food, shelter, water, other)
│   ├── CategoryBadge.css
│   ├── StatusBadge.jsx   # Request status badge (unclaimed/claimed/completed)
│   └── StatusBadge.css
├── pages/                # Page components
│   ├── SubmitRequestPage.jsx    # Submit request page with AI categorization
│   ├── SubmitRequestPage.css
│   ├── DashboardPage.jsx        # Responder dashboard with status analytics
│   └── DashboardPage.css
├── services/            # Business logic and API integration
|   ├── databaseService.js   # Supabase CRUD for requests
|   ├── supabaseClient.js    # Shared Supabase client
│   └── geminiService.js     # Gemini AI service for request categorization
├── assets/              # Static assets
│   ├── logo.png
│   └── react.svg
├── App.jsx              # Main app component with routing
├── App.css
├── index.css            # Global styles
└── main.jsx             # App entry point
```

## Key Components

### RequestForm.jsx
- **Primary Function**: AI-powered request submission with real-time categorization
- **Integration**: Direct Gemini 2.0 Flash API integration (no server required)
- **Features**: Form validation, error handling, console logging for testing
- **Output**: Processes requests with AI categorization and timestamps

### GeminiService.js
- **Primary Function**: Manages Gemini AI API communication and request processing
- **Features**: Environment variable configuration, error handling, fallback categorization
- **Categories**: Automatically categorizes into medical, food, shelter, water, or other
- **Testing**: Comprehensive console logging for development and debugging

### Component Architecture
- **Self-contained**: Each component manages its own state and styling
- **Reusable**: Badge components for categories and status indicators
- **Responsive**: Mobile-first design with CSS Grid and Flexbox
- **Accessible**: Semantic HTML structure with proper ARIA labels

## Getting Started

### Prerequisites

- Node.js (version 18 or higher; 22.x recommended)
- npm
- A Supabase project (for the shared database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Shellhacks_2025
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:

   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the project root with:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     VITE_SUPABASE_URL=https://pjjsasukxjafqrgnmzpe.supabase.co
     VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
     ```
   - The Supabase URL and publishable (anon) key are safe to expose in the browser; Row-Level
     Security protects the data. `.env` is gitignored.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## AI Integration

This application uses **Google Gemini** (`gemini-3.1-flash-lite`) for real-time request categorization directly in the frontend.

### How It Works

1. **Form Submission**: Users submit aid requests through the form
2. **AI Processing**: Gemini analyzes the request text in real-time
3. **Categorization**: AI assigns one or more categories to the request
4. **Persistence**: The categorized request is saved to the shared Supabase database
5. **Console Output**: Detailed processing information is logged to the browser console for debugging

### Request Data Structure

A stored request looks like this (the database generates `id` and the timestamps):

```json
{
  "id": "9b2c…-uuid",
  "name": "John Doe",
  "location": "123 Main St, City, State",
  "request_text": "Need food and water for family of 4",
  "categories": ["food", "water"],
  "status": "unclaimed",
  "created_at": "2026-06-18T15:30:45.123Z",
  "updated_at": "2026-06-18T15:30:45.123Z"
}
```

### Field Descriptions

- **`id`**: Database-generated UUID
- **`name`**: Requester's name (optional, defaults to "Anonymous")
- **`location`**: Required location information
- **`request_text`**: Required description of aid needed
- **`categories`**: Array of AI-generated categories (food, water, shelter, medical, other)
- **`status`**: "unclaimed" for new requests (workflow: unclaimed → claimed → completed)
- **`created_at`** / **`updated_at`**: ISO timestamps managed by the database

### AI Categories

Gemini AI classifies requests into these categories:
- **`food`** - Food and nutrition needs
- **`water`** - Clean water and hydration
- **`shelter`** - Housing and temporary shelter
- **`medical`** - Healthcare and medical supplies
- **`other`** - Everything else

## Component Documentation

### Header
Navigation component with links to Submit Request and Dashboard pages.

### RequestForm
Form component for submitting aid requests. Includes validation and loading states.
- Calls Gemini API directly to process requests in JSON formatW
- Handles form validation (required: location, request_text)
- Name field is optional

### RequestList  
Displays list of requests with filtering and sorting options.
- **Category Filter**: All, Food, Water, Shelter, Medical, Other
- **Status Filter**: All, Unclaimed, Claimed, Completed  
- **Sort Options**: Newest First, Oldest First
- Accepts `onStatusChange` callback for status updates

### RequestCard
Individual request display with category badges, timestamps, contact info, and status actions.
- Shows CategoryBadge and StatusBadge
- **Action Buttons**: 
  - Unclaimed requests: "Claim Request" button
  - Claimed requests: "Mark Complete" and "Unclaim" buttons  
  - Completed requests: "✓ Request fulfilled" indicator
- Calls `onStatusChange(requestId, newStatus)` when buttons are clicked

### CategoryBadge
Reusable badge component for displaying request categories with color coding:
- Food: Green
- Water: Blue  
- Shelter: Purple
- Medical: Red
- Other: Gray

### StatusBadge
New component for displaying request status with color coding:
- Unclaimed: Passive yellow
- Claimed: Light blue
- Completed: Green
- Unknown: Gray

### DashboardPage
Main dashboard with analytics and request management:
- **Response Status Statistics**: Shows unclaimed, claimed, completed counts and completion rate
- Handles status updates via `handleStatusChange()` function
- Persists status changes through `databaseService.updateRequestStatus()` → Supabase
- Includes dev controls ("Refresh Data", "Add Sample Data")

## Styling Approach

- Global styles in `index.css` for common elements (buttons, forms, containers)
- Component-specific CSS files for component styling
- Mobile-first responsive design using CSS Grid and Flexbox
- CSS custom properties for consistent colors and spacing

## Future Enhancements

- Map integration for location visualization
- Real-time updates using WebSockets
- User authentication and profiles
- Advanced filtering and search
- Multi-language support
- Offline support with service workers
- Push notifications for urgent requests

## Development Guidelines

1. **Component Organization**: Each component should have its own CSS file
2. **Responsive Design**: Test on mobile devices and use relative units
3. **Accessibility**: Include proper ARIA labels and semantic HTML
4. **Performance**: Lazy load components and optimize images
5. **Error Handling**: Implement proper error boundaries and user feedback

## Contributing

1. Follow the existing code style and component structure - Look at `RequestForm.jsx` (Gemini integration) and `DashboardPage.jsx`
2. Add CSS files for new components
3. Test responsive design on multiple screen sizes
4. Update documentation for new features

## Contributors

1. Alec Gomez - Frontend / DevOps
2. 
3. 
4. 
