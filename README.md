```markdown
# Samskruthi-Sahachari – Karnataka Heritage Platform

Samskruthi-Sahachari is a comprehensive digital platform dedicated to promoting and managing Karnataka's rich cultural and natural heritage. It connects tourists, heritage enthusiasts, local enterprises, and service providers through an intuitive web application. The platform enables discovery of heritage sites, booking of tours and experiences, communication between users, and AI-powered assistance for personalized recommendations.

---

## ✨ Features

- **Heritage Discovery** – Browse and search heritage sites across Karnataka (temples, forts, palaces, wildlife sanctuaries, UNESCO sites, etc.).
- **Interactive Map** – Visualize sites on a map with filters by category (heritage, nature, culture, fort, temple, palace, beach, wildlife, UNESCO).
- **User Roles** – Support for regular users, enterprise partners, sellers, and influencers with role-specific dashboards.
- **Booking System** – Book tickets for sites, add‑on products (e.g., water sports, plantation stays), and apply promo codes.
- **Reviews & Ratings** – Share experiences and read reviews from other visitors.
- **Wishlist & Favorites** – Save sites for future visits.
- **Real‑time Messaging** – Communicate with site operators, sellers, or support.
- **AI Assistant** – Get personalized recommendations and answers using Groq AI, integrated with real-time site and ticket data.
- **Promo Codes** – Apply discount codes during checkout.
- **Seller / Enterprise Dashboard** – Manage sites, products, bookings, and analytics.
- **Influencer Integration** – Special dashboards for content creators.
- **Responsive UI** – Modern, mobile-friendly design with dark/light theme support.

---

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express** – REST API server
- **PostgreSQL** – Primary database
- **Sequelize** – ORM for data modelling
- **JWT** – Authentication & authorization
- **bcrypt** – Password hashing
- **Multer** – File uploads (site images, product thumbnails)
- **Groq SDK** – AI assistant integration

### Frontend
- **Next.js 16** (React framework) with App Router
- **TypeScript** – Type safety
- **Tailwind CSS** – Styling
- **Framer Motion** – Animations
- **Context API** – State management (theme, user)
- **Axios** – API client with interceptors
- **React Hook Form** – Form handling
- **Next/Image** – Optimized image loading with local fallbacks

### DevOps & Tools
- **Git** – Version control
- **GitHub** – Repository hosting
- **Postman** – API testing (optional)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14+)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RakshithaNagaraju74/Samskruthi-Sahachari.git
   cd Samskruthi-Sahachari
   ```

2. **Backend setup**
   ```bash
   cd samskruti-backend
   npm install
   ```
   - Create a PostgreSQL database (e.g., `samskruthi_db`).
   - Create a `.env` file in `samskruti-backend` (see [Environment Variables](#environment-variables)).
   - *Note:* Sequelize will automatically create tables on first run if sync is enabled.

3. **Frontend setup**
   ```bash
   cd ../samskruti-frontend
   npm install
   ```
   - Create a `.env.local` file in `samskruti-frontend` with the backend URL.

### Environment Variables

#### Backend `.env`
```env
PORT=5000
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:3000
```

#### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Project

1. **Start the backend server**
   ```bash
   cd samskruti-backend
   npm run dev   # or npm start
   ```
   The API will be available at `http://localhost:5000`.

2. **Start the frontend development server**
   ```bash
   cd samskruti-frontend
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
samskruthi-sahachari/
├── samskruti-backend/               # Node.js backend
│   ├── src/
│   │   ├── controllers/              # Route handlers
│   │   ├── models/                    # Sequelize models
│   │   ├── routes/                     # Express routes
│   │   ├── middlewares/                # Auth, upload, etc.
│   │   ├── services/                    # Business logic (Groq, etc.)
│   │   ├── utils/                       # Helper functions
│   │   └── exports/                      # Data exports (optional)
│   ├── uploads/                          # User uploaded files
│   ├── server.js                          # Entry point
│   ├── package.json
│   └── .env
│
└── samskruti-frontend/               # Next.js frontend
    ├── public/
    │   ├── images/                     # Static images (placeholders, local site images)
    │   └── ...
    ├── src/
    │   ├── app/                         # App Router pages
    │   │   ├── auth/                     # Login/Register
    │   │   ├── dashboard/                 # User dashboard
    │   │   ├── enterprise/                 # Enterprise panel
    │   │   ├── seller/                     # Seller panel
    │   │   ├── admin/                      # Admin panel (optional)
    │   │   ├── preferences/                # User preferences
    │   │   ├── products/                    # Product listing
    │   │   └── ...
    │   ├── components/                    # Reusable UI components
    │   ├── contexts/                       # React Context (theme, user)
    │   ├── services/                        # API service wrappers
    │   └── styles/                          # Global styles
    ├── package.json
    └── .env.local
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

For questions or support, please reach out to the project maintainer:

- **Rakshitha Nagaraju** – [GitHub](https://github.com/RakshithaNagaraju74)
- Project Repository: [Samskruthi-Sahachari](https://github.com/RakshithaNagaraju74/Samskruthi-Sahachari)

---

*Discover the heritage of Karnataka with Samskruthi-Sahachari!* 🌄🏛️🐘
```
