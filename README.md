# CINEA - Cinema Ticket Sales Frontend

Frontend Vue 3 application for CINEA cinema ticket sales platform.

## 📋 Project Overview

A modern, responsive Vue 3 SPA (Single Page Application) that allows users to:
- Browse available movies and cinema screenings
- Select seats for movie functions
- Purchase tickets online
- Manage purchased tickets
- Create and manage user accounts

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Update `.env` with backend API URL:**
```
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

4. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The compiled files will be in the `dist/` directory.

## 📁 Project Structure

```
cinea-frontend/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── Navbar.vue       # Navigation bar with auth
│   │   ├── Footer.vue       # Application footer
│   │   ├── Cart.vue         # Shopping cart component
│   │   ├── MovieCard.vue    # Movie display card
│   │   └── ScreeningCard.vue # Screening display card
│   ├── views/               # Page components
│   │   ├── Home.vue         # Homepage with featured movies
│   │   ├── Movies.vue       # Movies listing with filters
│   │   ├── MovieDetail.vue  # Single movie details
│   │   ├── Booking.vue      # Interactive seat selection
│   │   ├── Checkout.vue     # Payment form
│   │   ├── Confirmation.vue # Purchase confirmation
│   │   ├── MyTickets.vue    # User's purchased tickets
│   │   ├── Login.vue        # User login
│   │   ├── Register.vue     # User registration
│   │   └── NotFound.vue     # 404 page
│   ├── stores/              # Pinia state management
│   │   ├── authStore.js     # Authentication state
│   │   └── cartStore.js     # Shopping cart state
│   ├── services/            # API communication
│   │   ├── api.js           # Axios instance with interceptors
│   │   └── ticketService.js # API service methods
│   ├── router/              # Vue Router configuration
│   │   └── index.js         # Route definitions
│   ├── App.vue              # Root component
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔧 Configuration

### Vite Configuration (`vite.config.js`)

- Development server runs on port 3000
- API proxy configured to forward `/api` requests to backend
- Hot Module Replacement (HMR) enabled for development

### Environment Variables

Available in `.env`:

```
VITE_API_URL=http://localhost:8000      # Backend API URL
VITE_API_TIMEOUT=30000                  # Request timeout in ms
```

## 🎨 Features

### User Features
- **Browse Movies**: View all available movies with filters (genre, cinema)
- **View Screenings**: See available screenings for each movie by date and time
- **Seat Selection**: Interactive seat map with visual feedback (available/selected/occupied/VIP)
- **Shopping Cart**: Add/remove seats, real-time price calculation
- **Checkout**: Secure payment form with validation
- **Ticket Management**: View purchased tickets, download, cancel
- **User Accounts**: Create account, login, logout, view profile

### Technical Features
- **Responsive Design**: Mobile-first design works on all screen sizes
- **Dark Theme**: Modern dark UI with purple accent colors
- **State Management**: Pinia stores for authentication and shopping cart
- **Client-side Routing**: Vue Router with protected routes
- **API Integration**: Axios with request/response interceptors
- **Form Validation**: Input validation and error handling
- **Loading States**: Loading indicators for async operations

## 🔐 Authentication

The application uses token-based authentication:

1. User logs in → Receives JWT token
2. Token stored in localStorage
3. Token included in all API requests via `Authorization: Bearer` header
4. Protected routes require authentication
5. Token automatically removed on logout

### Protected Routes
- `/booking/:id` - Seat selection
- `/checkout` - Payment form
- `/my-tickets` - User's tickets

## 🛒 Shopping Cart

The cart store (`cartStore.js`) manages:
- Selected seats for current session
- Seat information (cinema, room, seat number)
- Price calculation with VIP multipliers
- Persistent state with reactive updates

## 🎫 Pricing

- **Base Price**: €8.00 per ticket
- **VIP Seats**: +€3.00

Example:
- 3 Standard seats: €24.00
- 2 Standard + 1 VIP: €19.00

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px

## 🚦 API Integration

The frontend connects to the Laravel backend at `/api` endpoints:

### Key Endpoints
- `GET /api/movies` - Get all movies
- `GET /api/movies/{id}` - Get movie details
- `GET /api/cinemas` - Get all cinemas
- `GET /api/screenings/{id}` - Get screening details
- `GET /api/screenings/{id}/available-seats` - Get available seats
- `POST /api/tickets` - Create tickets
- `GET /api/user/tickets` - Get user's tickets
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## 📦 Dependencies

### Core Dependencies
- **Vue 3** (3.3.0) - Progressive JavaScript framework
- **Vue Router** (4.2.0) - Official router for Vue.js
- **Pinia** (2.1.0) - State management library
- **Axios** (1.5.0) - HTTP client
- **date-fns** (2.30.0) - Date utility library

### Dev Dependencies
- **Vite** (4.5.0) - Next generation build tool
- **SASS** (1.68.0) - CSS preprocessor
- **@vueuse/core** (10.5.0) - Vue composition utilities

## 🧪 Testing

Tests can be added using Jest or Vitest. Structure:
```
tests/
├── unit/
├── components/
└── views/
```

## 📚 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🎯 Future Enhancements

- [ ] Email ticket delivery with PDF generation
- [ ] QR code generation for tickets
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Advanced search and filtering
- [ ] Movie reviews and ratings
- [ ] Booking history and analytics
- [ ] Admin dashboard (separate app)
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Push notifications for new releases

## 🐛 Troubleshooting

### CORS Issues
If API requests are blocked:
- Check backend CORS configuration
- Verify `VITE_API_URL` in `.env`
- Ensure backend is running

### Port Already in Use
If port 3000 is occupied:
```bash
npm run dev -- --host 127.0.0.1 --port 3001
```

### Build Errors
Clear dependencies and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 License

Proprietary - CINEA 2025

## 👥 Support

For support, contact: `info@cinea.es`

---

**Built with Vue 3 and Vite** ⚡️
