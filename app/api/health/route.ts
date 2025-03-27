// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { checkDbConnection } from '../../../lib/db';

export const dynamic = 'force-dynamic'; // No caching for health checks

// This endpoint checks database connectivity and returns system status
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check DB connection
    const dbStatus = await checkDbConnection();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'unknown',
      database: dbStatus,
      memory: process.memoryUsage ? {
        rss: formatBytes(process.memoryUsage().rss),
        heapTotal: formatBytes(process.memoryUsage().heapTotal),
        heapUsed: formatBytes(process.memoryUsage().heapUsed),
      } : 'unavailable'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: (error as Error).message || 'Unknown error',
    }, { status: 500 });
  }
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}