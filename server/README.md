# Backend Server

Local backend server files for data persistence.

## Installation

```bash
cd server
npm install
```

## Running

```bash
npm start        # Production
npm run dev      # Development with nodemon
```

## API Endpoints

- `GET /api/data` - Get all data
- `POST /api/data` - Save all data
- `POST /api/reset` - Reset to test data
- `GET /api/health` - Health check
