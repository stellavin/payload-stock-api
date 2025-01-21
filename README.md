# Stock Data API with Payload CMS

A robust API service built with Payload CMS that fetches historical stock data and sends email reports. The service validates company symbols against NASDAQ listings and uses the Yahoo Finance API for historical data.

## Features

- Historical stock data retrieval
- Automated email reports with CSV attachments
- NASDAQ symbol validation
- Real-time request status tracking
- OpenAPI (Swagger) documentation
- Docker support
- Comprehensive test coverage

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Docker and Docker Compose (optional)
- RapidAPI Key (for Yahoo Finance API)
- SMTP Server credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/stellavin/payload-stock-api.git
cd payload-stock-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file check the email I sent it has the env credentials:
```env
DATABASE_URI=
PAYLOAD_SECRET=
RAPID_API_KEY=
API_HOST=
RAPID_API_URL=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=
SMTP_FROM=
CLIENT_ID=
REFRESH_TOKEN=
REDIRECT_URL=
ACCESS_TOKEN=
NASDAQ_API=''
```

## Running the Application

### Using Docker

1. Build and start the containers:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000/admin`

### Without Docker

1. Start MongoDB locally

2. Run the development server:
```bash
npm run dev
```

## API Documentation

The API documentation is available at `http://localhost:3000/api-docs` when running the server.

### Example Request

```bash
curl -X POST http://localhost:3000/api/stock-requests \
  -H "Content-Type: application/json" \
  -d '{
    "companySymbol": "AAPL",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "email": "user@example.com"
  }'
```

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── collections/          # Payload CMS collections
│   └── StockRequests.ts
├── services/           # Business logic services
│   ├── emailService.ts
│   └── stockService.ts
├── utils/              # Utility functions
│   ├── validators.ts
│   └── csvHelper.ts
├── payload.config.ts   # Payload CMS configuration
└── server.ts          # Express server setup
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm test`: Run test suite
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/stock-requests | Create a new stock data request |
| GET | /api/stock-requests/{id} | Get status of a request |
| GET | /api/stock-symbols | Get available stock symbols |

## Input Validation

- Company Symbol: Must be a valid NASDAQ symbol
- Start Date: Required, format YYYY-MM-DD, must be before or equal to End Date
- End Date: Required, format YYYY-MM-DD, must be after or equal to Start Date
- Email: Required, must be a valid email format

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "companySymbol",
      "message": "Invalid company symbol"
    }
  ]
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Payload CMS](https://payloadcms.com/)
- [Yahoo Finance API](https://rapidapi.com/apidojo/api/yh-finance)
- [NASDAQ Listings](https://datahub.io/core/nasdaq-listings)
