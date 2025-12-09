describe('API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Exports', () => {
    it('should have apiClient and fetcher exports', async () => {
      // Clear the require cache and reimport
      delete require.cache[require.resolve('@guildr/lib/api')];
      const api = require('@guildr/lib/api');
      
      expect(api).toHaveProperty('apiClient');
      expect(api).toHaveProperty('fetcher');
    });

    it('apiClient should be defined', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      expect(apiClient).toBeDefined();
    });

    it('fetcher should be a function', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { fetcher } = require('@guildr/lib/api');
      
      expect(typeof fetcher).toBe('function');
    });
  });

  describe('API Client', () => {
    it('should have axios methods', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      // Check that apiClient has the expected methods
      expect(typeof apiClient.get).toBe('function');
      expect(typeof apiClient.post).toBe('function');
      expect(typeof apiClient.put).toBe('function');
      expect(typeof apiClient.delete).toBe('function');
    });

    it('should have defaults property', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      expect(apiClient.defaults).toBeDefined();
    });

    it('should have baseURL configured', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      expect(apiClient.defaults.baseURL).toBeDefined();
      expect(typeof apiClient.defaults.baseURL).toBe('string');
    });

    it('should have Content-Type header', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      expect(apiClient.defaults.headers).toBeDefined();
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('baseURL should contain localhost or API endpoint', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      const baseURL = apiClient.defaults.baseURL;
      expect(baseURL).toMatch(/(localhost|api)/);
    });
  });

  describe('Fetcher Function', () => {
    it('fetcher should be an async function', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { fetcher } = require('@guildr/lib/api');
      
      expect(fetcher.constructor.name).toBe('AsyncFunction');
    });

    it('fetcher should accept URL parameter', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { fetcher } = require('@guildr/lib/api');
      
      expect(fetcher.length).toBeGreaterThanOrEqual(1);
    });

    it('fetcher should exist and be callable', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { fetcher } = require('@guildr/lib/api');
      
      expect(typeof fetcher).toBe('function');
      expect(fetcher.name).toBe('fetcher');
    });
  });

  describe('HTTP Methods Available', () => {
    it('apiClient.get should exist', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      expect(apiClient.get).toBeDefined();
    });

    it('apiClient.post should exist', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      expect(apiClient.post).toBeDefined();
    });

    it('apiClient.put should exist', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      expect(apiClient.put).toBeDefined();
    });

    it('apiClient.delete should exist', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      expect(apiClient.delete).toBeDefined();
    });
  });

  describe('Configuration Structure', () => {
    it('apiClient should have defaults.headers', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      expect('headers' in apiClient.defaults).toBe(true);
    });

    it('apiClient.defaults.headers should have Content-Type', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      expect('Content-Type' in apiClient.defaults.headers).toBe(true);
    });

    it('Content-Type header should be json', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      const contentType = apiClient.defaults.headers['Content-Type'];
      expect(contentType).toMatch(/json/i);
    });
  });

  describe('Module Integrity', () => {
    it('should export both apiClient and fetcher', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const mod = require('@guildr/lib/api');
      
      const hasApiClient = 'apiClient' in mod;
      const hasFetcher = 'fetcher' in mod;
      
      expect(hasApiClient && hasFetcher).toBe(true);
    });

    it('apiClient should be callable', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { apiClient } = require('@guildr/lib/api');
      
      // axios.create() returns a function with methods attached
      expect(typeof apiClient).toBe('function');
    });

    it('fetcher should be a function', async () => {
      delete require.cache[require.resolve('@guildr/lib/api')];
      const { fetcher } = require('@guildr/lib/api');
      
      expect(typeof fetcher).toBe('function');
    });
  });
});
