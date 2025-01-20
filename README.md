# Stock Data API with Payload CMS

A robust API service built with Payload CMS and Node.js that fetches historical stock data and sends email reports. The service validates company symbols against NASDAQ listings and uses the Yahoo Finance API for historical data.

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
git clone https://github.com/yourusername/stock-data-api.git
cd stock-data-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/stock-app
PAYLOAD_SECRET=your-secret-key
RAPID_API_KEY=your-rapidapi-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@example.com
```

## Running the Application

### Using Docker

1. Build and start the containers:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

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
├── endpoints/           # Custom API endpoints
│   └── stockData.ts
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

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| PAYLOAD_SECRET | Secret key for Payload CMS | Yes |
| RAPID_API_KEY | RapidAPI key for Yahoo Finance | Yes |
| SMTP_HOST | SMTP server host | Yes |
| SMTP_PORT | SMTP server port | Yes |
| SMTP_USER | SMTP username | Yes |
| SMTP_PASS | SMTP password | Yes |
| SMTP_FROM | Sender email address | Yes |

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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
