import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger API documentation setup for Payload CMS.
 */
const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Payload CMS API',
      version: '1.0.0',
      description: 'API documentation for the Payload CMS application',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Adjust the URL based on your server setup
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/api/**/*.ts', './src/api/**/*.js'], // Path to the API files to generate docs from
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs)); // Swagger UI at /api-docs
};
