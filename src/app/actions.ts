'use server';

import { intelligentRateLimiter, IntelligentRateLimiterInput, IntelligentRateLimiterOutput } from '@/ai/flows/intelligent-rate-limiter';
import { z } from 'zod';

const RequestSchema = z.object({
  url: z.string().url(),
  numRequests: z.coerce.number().int().min(1).max(500), // Safety limit
  headers: z.string(),
  cookies: z.string(),
  data: z.string(),
  mobile: z.string().optional(), // For dynamic data payload
});

type RequestPayload = z.infer<typeof RequestSchema>;

export interface RequestResult {
  status: number;
  statusText: string;
  body: string;
  error?: string;
}

function parseAndValidateJson(jsonString: string, fieldName: string) {
  if (!jsonString.trim()) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON in ${fieldName}: ${(error as Error).message}`);
  }
}

export async function sendRequestsAction(payload: RequestPayload): Promise<RequestResult[]> {
  const validation = RequestSchema.safeParse(payload);
  if (!validation.success) {
    const errorMessages = validation.error.flatten().fieldErrors;
    const errorMessage = Object.entries(errorMessages).map(([key, value]) => `${key}: ${value}`).join(', ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }

  const { url, numRequests, mobile } = validation.data;

  try {
    const headers = parseAndValidateJson(validation.data.headers, 'Headers');
    const cookiesObj = parseAndValidateJson(validation.data.cookies, 'Cookies');
    let dataObj = parseAndValidateJson(validation.data.data, 'Data');
    
    if (mobile && dataObj.mobile) {
      dataObj.mobile = mobile;
    }

    const cookieString = Object.entries(cookiesObj)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const requestPromises = Array.from({ length: numRequests }, (_, i) => {
      const body = new URLSearchParams(dataObj).toString();

      return fetch(url, {
        method: 'POST',
        headers: { ...headers, 'Cookie': cookieString },
        body: body,
        cache: 'no-store',
      }).then(async (res) => {
        const responseBody = await res.text();
        return {
          status: res.status,
          statusText: res.statusText,
          body: responseBody,
        };
      }).catch((err) => {
        return {
          status: 0,
          statusText: 'Fetch Error',
          body: '',
          error: (err as Error).message,
        };
      });
    });

    const results = await Promise.allSettled(requestPromises);

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        status: 0,
        statusText: 'Client-side Error',
        body: '',
        error: 'Request failed to execute.',
      };
    });
  } catch (error) {
    return [{
      status: 0,
      statusText: 'Setup Error',
      body: '',
      error: (error as Error).message,
    }];
  }
}

export async function getRateLimitAction(payload: RequestPayload): Promise<IntelligentRateLimiterOutput & { error?: string }> {
  const validation = RequestSchema.safeParse(payload);
   if (!validation.success) {
    const errorMessages = validation.error.flatten().fieldErrors;
    const errorMessage = Object.entries(errorMessages).map(([key, value]) => `${key}: ${value}`).join(', ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }
  
  const { url, numRequests, mobile } = validation.data;

  try {
    const headers = parseAndValidateJson(validation.data.headers, 'Headers');
    const cookies = parseAndValidateJson(validation.data.cookies, 'Cookies');
    let data = parseAndValidateJson(validation.data.data, 'Data');

    if (mobile && data.mobile) {
      data.mobile = mobile;
    }

    const aiInput: IntelligentRateLimiterInput = {
      url,
      numRequests,
      headers,
      cookies,
      data,
    };
    
    const result = await intelligentRateLimiter(aiInput);
    return result;

  } catch (error) {
    return {
      rateLimitInfo: {
        maxRequestsPerMinute: 0,
        retryAfterSeconds: 0,
        isRateLimited: true,
      },
      success: false,
      error: (error as Error).message,
    };
  }
}
