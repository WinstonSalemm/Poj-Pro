import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/redis';

export const runtime = 'nodejs';

interface WebVitalData {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  url: string;
  userAgent: string;
  timestamp: number;
  connectionType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WebVitalData = await request.json();
    const { name, value, url, timestamp, rating, connectionType } = body;

    // Log performance metrics with more detail
    console.log(`📊 Web Vital: ${name} = ${value}ms (${rating}) at ${url} [${connectionType}]`);

    // Cache metrics for analysis (aggregate by hour)
    const hourKey = Math.floor(timestamp / (1000 * 60 * 60));
    const cacheKey = `vitals:${name}:${hourKey}`;
    
    try {
      const raw = await cacheGet(cacheKey);
      const existing: WebVitalData[] = raw ? JSON.parse(raw) : [];
      existing.push(body);
      await cacheSet(cacheKey, JSON.stringify(existing), 86400); // 24 hours TTL
    } catch (cacheError) {
      console.warn('Failed to cache web vitals:', cacheError);
    }

    // Alert on poor performance
    if (rating === 'poor') {
      console.warn(`🚨 Poor performance detected: ${name} = ${value}ms at ${url}`);
    }

    // Store critical metrics in separate cache for dashboard
    if (['LCP', 'FID', 'CLS', 'INP'].includes(name)) {
      const dashboardKey = `vitals:dashboard:${name}`;
      const dashboardData = {
        value,
        rating,
        timestamp,
        url: new URL(url).pathname,
      };
      
      try {
        await cacheSet(dashboardKey, JSON.stringify(dashboardData), 3600); // 1 hour TTL
      } catch (dashboardError) {
        console.warn('Failed to cache dashboard metrics:', dashboardError);
      }
    }

    return NextResponse.json({ 
      success: true,
      cached: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to process web vitals:', error);
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    );
  }
}
