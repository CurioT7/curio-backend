# Curio Backend

This is a Reddit Clone project.

## Installation

Follow these steps to get your development environment running:

1. Clone the repository:

   ````bash
   git clone https://example.com/your-repository
   cd your-repository
   ````

2. Install NPM packages:

   ````bash
   npm install
   
   ````

4. Create a `.env` file in the root directory of the project and update it with your credentials:
   ```plaintext
   PORT=3000
   MONGODB_URI=<Your MongoDB URI>
   JWT_SECRET=<Your JWT Secret>
   EMAIL=<Your Email>
   APP_PASSWORD=<Your App Password>
   GOOGLE_CLIENT_ID=<Your Google Client ID>
   GOOGLE_CLIENT_SECRET=<Your Google Client Secret>
   VITE_SERVER_HOST=http://localhost:3000
   VITE_FRONTEND_HOST=http://localhost:5173
   BUCKET_NAME=<Your Bucket Name>
   BUCKET_REGION=<Your Bucket Region>
   ACCESS_KEY=<Your Access Key>
   SECRET_ACCESS_KEY=<Your Secret Access Key>
   ```

## Running the application

To run the application, follow these steps:

1. Start the server:
   ```bash
   npm start
   ```

   This command will connect to your MongoDB database and start the server on the defined `PORT`. The console will log `Server running on port <PORT>` when the server is running.

2. Access the application at `http://localhost:<PORT>` or as defined in your `.env` file's `VITE_SERVER_HOST`.

## Seeding the Database

If you need to seed your database with initial data:

1. Run the server with the seeding option:
   ```bash
   npm start --seed
   ```

   Make sure your `.env` file has `SEED_DB=true` to enable database seeding.


## Environment Variables:
- **PORT**: Specify the port number that the server will listen to.
- **MONGODB_URI**: The URI for connecting to MongoDB.
- **JWT_SECRET**: Secret key used for JSON Web Token (JWT) encryption.
- **EMAIL**: Email address used for sending notifications or alerts.
- **APP_PASSWORD**: Password or access token for the specified email account.
- **GOOGLE_CLIENT_ID**: Client ID for Google OAuth authentication.
- **GOOGLE_CLIENT_SECRET**: Client secret for Google OAuth authentication.

## Commands:
- **npm test**: Run all unit tests.
- **npm run dev**: Run the project using Nodemon for automatic reloading during development.
- **npm start**: Run the project using Node.js. Use this command in production or when Nodemon is not needed.


