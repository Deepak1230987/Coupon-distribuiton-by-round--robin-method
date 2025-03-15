# Coupon Distribution Application - Technical Documentation

## 1. System Architecture

### 1.1 Frontend (React.js)

- **Framework**: React.js with Vite
- **Styling**: TailwindCSS with custom animations
- **State Management**: React Hooks and Context API
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

### 1.2 Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## 2. Key Features

### 2.1 Public Features

- Coupon claiming system with IP-based restrictions
- 24-hour cooldown period per IP
- Real-time coupon availability check
- Session-based tracking using client-side generated session IDs

### 2.2 Admin Features

- Secure admin authentication system
- Coupon management (Create, Update, View)
- Claims monitoring
- Coupon activation/deactivation
- Detailed claim history with IP tracking

## 3. Component Structure

### 3.1 Pages

1. **ClaimPage (`/client/src/pages/ClaimPage.jsx`)**

   - Public interface for claiming coupons
   - Displays available coupon count
   - Handles session management
   - Shows claim instructions and cooldown rules

2. **AdminDashboard (`/client/src/pages/AdminDashboard.jsx`)**
   - Protected admin interface
   - Features:
     - Coupon creation form
     - Recent claims table
     - Available coupons management
     - Logout functionality

### 3.2 Components

1. **ClaimCoupon (`/client/src/components/ClaimCoupon.jsx`)**

   - Handles coupon claim requests
   - Displays claim status and results
   - Error handling with toast notifications

2. **Navbar (`/client/src/components/Navbar.jsx`)**

   - Application navigation
   - Theme toggle (Dark/Light mode)
   - Admin login link

3. **ProtectedRoute (`/client/src/components/ProtectedRoute.jsx`)**
   - Authentication wrapper
   - Redirects unauthorized users
   - Session validation

## 4. API Services

### 4.1 Authentication Endpoints

```javascript
POST / api / auth / signup; // Admin registration
POST / api / auth / login; // Admin login
POST / api / auth / logout; // Admin logout
```

### 4.2 Admin Endpoints

```javascript
GET    /api/admin/coupons      // List all coupons
POST   /api/admin/coupons      // Create new coupon
PUT    /api/admin/coupons/:id  // Update coupon status
GET    /api/admin/claims       // Get claim history
```

### 4.3 Public Endpoints

```javascript
GET / api / coupons / available; // Check available coupons
POST / api / coupons / claim; // Claim a coupon
```

## 5. Data Models

### 5.1 Coupon Model

```javascript
{
  code: String,          // Unique coupon code
  description: String,   // Coupon description
  expiryDate: Date,     // Expiration date
  isActive: Boolean,    // Coupon status
  claimedBy: [{         // Claim history
    ip: String,         // Claimer's IP
    claimedAt: Date     // Claim timestamp
  }]
}
```

## 6. Security Features

### 6.1 Authentication

- JWT-based authentication for admin routes
- Secure password hashing
- Session management with HTTP-only cookies

### 6.2 Rate Limiting

- IP-based cooldown period (24 hours)
- Request rate limiting
- Session tracking for claim prevention

### 6.3 Data Protection

- Password redaction in logs
- Secure headers implementation
- CORS configuration

## 7. UI/UX Features

### 7.1 Theme System

- Dark/Light mode support
- Smooth transitions
- Responsive design
- Gradient animations

### 7.2 Notifications

- Toast notifications for all actions
- Unique IDs to prevent duplicates
- Context-aware styling
- Clear error messages

### 7.3 Form Validation

- Real-time input validation
- Clear error feedback
- Required field checking
- Date validation for expiry

## 8. Error Handling

### 8.1 Frontend

- Axios interceptors for global error handling
- Toast notifications for user feedback
- Graceful degradation
- Network error handling

### 8.2 Backend

- Global error middleware
- Structured error responses
- Validation error handling
- Status code standardization

## 9. Performance Optimizations

### 9.1 Frontend

- Lazy loading of components
- Optimized re-renders
- Debounced API calls
- Efficient state management

### 9.2 Backend

- Database indexing
- Query optimization
- Caching strategies
- Response compression

## 10. Development Guidelines

### 10.1 Code Style

- ESLint configuration
- Prettier formatting
- Component structure
- File naming conventions

### 10.2 Best Practices

- Component composition
- Error boundary implementation
- PropTypes validation
- Documentation standards

## 11. Environment Configuration

### 11.1 Frontend Variables

```env
VITE_API_URI=<backend_url>
```

### 11.2 Backend Variables

```env
PORT=<port_number>
MONGODB_URI=<mongodb_connection_string>
JWT_SECRET=<jwt_secret_key>
```

## 12. Deployment

### 12.1 Frontend

- Platform: Vercel/Netlify
- Build command: `npm run build`
- Output directory: `dist`

### 12.2 Backend

- Platform: Render.com
- Environment: Node.js
- Start command: `npm start`
