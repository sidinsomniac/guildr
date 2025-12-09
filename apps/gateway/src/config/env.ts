import dotenv from 'dotenv';
dotenv.config();

interface AppConfig {
  PORTFOLIO_SERVICE_URL: string;
  MARKET_SERVICE_URL: string;
  NODE_ENV: string;
  PORT: number;
}

const getEnvVariable = (key: string, fallback?: string): string => {
  const value = process.env[key];
  
  if (!value) {
    if (fallback) {
      console.warn(`⚠️  Environment variable ${key} not set, using fallback: ${fallback}`);
      return fallback;
    }
    throw new Error(`❌ Required environment variable ${key} is not defined`);
  }
  
  return value;
};

export const config: AppConfig = {
  PORTFOLIO_SERVICE_URL: getEnvVariable(
    'PORTFOLIO_SERVICE_URL',
    'http://localhost:3001/api/v1'
  ),
  MARKET_SERVICE_URL: getEnvVariable(
    'MARKET_SERVICE_URL',
    'http://localhost:3002/api/v1'
  ),
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
};

if (config.NODE_ENV === 'development') {
  console.log('✅ Configuration loaded:');
  console.log(`   Portfolio Service: ${config.PORTFOLIO_SERVICE_URL}`);
  console.log(`   Market Service: ${config.MARKET_SERVICE_URL}`);
}
