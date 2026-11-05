const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'To-Do List Backend API',
    version: '1.0.0',
    description: 'Secure REST API for user-specific task management'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      User: {
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string', format: 'email' } }
      },
      Task: {
        type: 'object',
        required: ['title'],
        properties: {
          id: { type: 'integer' }, title: { type: 'string', maxLength: 200 },
          description: { type: 'string', nullable: true }, status: { type: 'string', enum: ['pending', 'completed'] },
          due_date: { type: 'string', format: 'date-time', nullable: true },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          category: { type: 'string', nullable: true }, completed_at: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      TaskUpdate: {
        type: 'object',
        minProperties: 1,
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', nullable: true },
          due_date: { type: 'string', format: 'date-time', nullable: true },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          category: { type: 'string', nullable: true }
        }
      },
      Error: {
        type: 'object',
        properties: { success: { type: 'boolean', example: false }, message: { type: 'string' } }
      }
    }
  },
  security: [],
  paths: {
    '/api/auth/register': { post: { tags: ['Authentication'], summary: 'Register a user', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } } } } } }, responses: { 201: { description: 'User created' }, 409: { description: 'Email already registered' }, 422: { description: 'Validation failed' } } } },
    '/api/auth/login': { post: { tags: ['Authentication'], summary: 'Log in', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { 200: { description: 'JWT returned' }, 401: { description: 'Invalid credentials' }, 422: { description: 'Validation failed' } } } },
    '/api/auth/me': { get: { tags: ['Authentication'], summary: 'Get current user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Current user' }, 401: { description: 'Missing or invalid JWT' } } } },
    '/api/tasks': {
      get: { tags: ['Tasks'], summary: 'List owned tasks', security: [{ bearerAuth: [] }], parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } }, { name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'completed'] } }, { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } }, { name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'due_before', in: 'query', schema: { type: 'string', format: 'date-time' } }, { name: 'due_after', in: 'query', schema: { type: 'string', format: 'date-time' } }, { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['created_at', 'updated_at', 'due_date', 'title', 'priority'] } }, { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'] } }], responses: { 200: { description: 'Task collection and pagination' }, 401: { description: 'Unauthorized' }, 422: { description: 'Invalid query' } } },
      post: { tags: ['Tasks'], summary: 'Create task', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } }, responses: { 201: { description: 'Task created' }, 401: { description: 'Unauthorized' }, 422: { description: 'Validation failed' } } }
    },
    '/api/tasks/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }],
      get: { tags: ['Tasks'], summary: 'Get one owned task', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Task' }, 404: { description: 'Task not found' } } },
      patch: { tags: ['Tasks'], summary: 'Update owned task', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskUpdate' } } } }, responses: { 200: { description: 'Task updated' }, 404: { description: 'Task not found' }, 422: { description: 'Validation failed' } } },
      delete: { tags: ['Tasks'], summary: 'Delete owned task', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Task deleted' }, 404: { description: 'Task not found' } } }
    },
    '/api/tasks/{id}/status': {
      patch: { tags: ['Tasks'], summary: 'Change task status', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['pending', 'completed'] } } } } } }, responses: { 200: { description: 'Status changed' }, 404: { description: 'Task not found' }, 422: { description: 'Validation failed' } } }
    }
  }
};

module.exports = swaggerDefinition;
