import request from 'supertest';
import express from 'express';
import axios from 'axios';
import apiRoutes from '../routes/api.routes';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
};

describe('API Routes', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe('POST /api/users', () => {
    it('should route to DashboardController.createUser', async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockedAxios.post.mockResolvedValue({ data: mockUserData });

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUserData);
    });

    it('should return 400 for missing email on users route', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test User' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept POST requests at /api/users', async () => {
      const mockUserData = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      mockedAxios.post.mockResolvedValue({ data: mockUserData });

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/dashboard/:portfolioId', () => {
    it('should route to DashboardController.getDashboard', async () => {
      const mockDashboardData = {
        portfolio: { id: 'portfolio-123', totalValue: 500000 },
        market: { indices: { NIFTY_50: { value: 19500 } } },
        lastUpdated: new Date().toISOString(),
      };

      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: { id: 'portfolio-123', totalValue: 500000 } });
        }
        return Promise.resolve({ data: { indices: { NIFTY_50: { value: 19500 } } } });
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('portfolio');
      expect(response.body).toHaveProperty('market');
      expect(response.body).toHaveProperty('lastUpdated');
    });

    it('should accept GET requests at /api/dashboard/:portfolioId', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: {} });
        }
        return Promise.resolve({ data: {} });
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(200);
    });

    it('should handle portfolio ID in route parameter', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: {} });
        }
        return Promise.resolve({ data: {} });
      });

      const portfolioIds = ['portfolio-123', 'portfolio-456', 'user-789-portfolio'];

      for (const portfolioId of portfolioIds) {
        jest.clearAllMocks();
        mockedAxios.get.mockImplementation((url: string) => {
          if (url.includes('portfolio')) {
            return Promise.resolve({ data: {} });
          }
          return Promise.resolve({ data: {} });
        });

        const response = await request(app).get(`/api/dashboard/${portfolioId}`);
        expect(response.status).toBe(200);
      }
    });

    it('should return error for invalid portfolio ID', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Portfolio not found' },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      const response = await request(app).get('/api/dashboard/invalid-id');

      expect(response.status).toBe(404);
    });
  });

  describe('Route Configuration', () => {
    it('should handle requests with base /api path', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      });

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' });

      expect(response.status).toBe(201);
    });

    it('should support multiple routes in the same module', async () => {
      const mockUserData = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      mockedAxios.post.mockResolvedValue({ data: mockUserData });
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: {} });
        }
        return Promise.resolve({ data: {} });
      });

      const postResponse = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' });

      const getResponse = await request(app).get('/api/dashboard/portfolio-123');

      expect(postResponse.status).toBe(201);
      expect(getResponse.status).toBe(200);
    });

    it('should return appropriate HTTP methods', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      });

      // POST should work
      const postResponse = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' });
      expect(postResponse.status).toBe(201);

      // GET on users endpoint should fail (not defined)
      const getResponse = await request(app).get('/api/users');
      expect(getResponse.status).toBe(404);
    });

    it('should properly export router', () => {
      expect(apiRoutes).toBeDefined();
      expect(typeof apiRoutes.post).toBe('function');
      expect(typeof apiRoutes.get).toBe('function');
    });
  });

  describe('Request/Response Handling', () => {
    it('should handle JSON request bodies', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      });

      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', name: 'Test User' });

      expect(response.status).toBe(201);
    });

    it('should handle JSON response bodies', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      });

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' });

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return correct status codes', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      });

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' });

      expect(response.status).toBe(201);
      expect([200, 201, 400, 404, 500]).toContain(response.status);
    });
  });
});
