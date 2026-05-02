# SAT Math Ranked

SAT Math Ranked is an infinite-scroll SAT math practice app that chooses the best problems for students to solve based on their strengths and weaknesses. Users can solve SAT math problems on real SAT topics, track their progress, and improve their rating on an ELO-based scoring system. The app calculates an ELO score for each topic, and personalizes practice by recommending problems around the user's topic ELOs, focusing primarily on their weaknesses.

Traditionally, students spend countless hours scrolling through long problem banks that don't tailor to their personal needs. Ultimately, students end up spending too much time on their strengths, solving problems that are either too easy or too difficult, and lack structured practice that scales with their improvement. SAT Math Ranked provides a streamlined system that nicely presents problems tailored to the user's strengths and weaknesses, and provides immediate visual feedback when a user solves a problem.

## Features

- **Personalized Practice**: Solve problems tailored to your skill level with topic-specific ELO ratings.
- **Progress Tracking**: Monitor your streaks, history, and improvement over time.
- **Starred Problems**: Save and revisit challenging problems for focused review.


## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Docker)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, KaTeX (for math rendering)
- **Authentication**: Google OAuth, JWT

## Quick Setup

Follow these steps to get the application running locally on your machine.

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/satmathranked.git
cd satmathranked
```

### 2. Set Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables. Create a `.env` file in the `backend` directory with the following:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/satmathranked"
   JWT_SECRET="your-jwt-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   FRONTEND_URL="http://localhost:5173"
   PORT=8080
   ```
   Replace the placeholders with your actual database credentials and Google OAuth details.

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. Build and start the backend:
   ```bash
   npm run build
   npm start
   ```
   For development, use `npm run dev` instead.

### 3. Set Up the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173` to access the app.

### 4. Access the Application

- Backend API will be running on `http://localhost:8080`
- Frontend will be running on `http://localhost:5173`

## Usage

1. **Sign Up/Login**: Use Google OAuth to create an account or log in.
2. **Start Practicing**: Browse problems by topic or difficulty and start solving.
3. **Track Progress**: View your ELO rating, streaks, and problem history on your profile.
4. **Star Problems**: Mark difficult problems to review later.
5. **Compete**: Check rankings to see how you stack up against other users.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the maintainers.