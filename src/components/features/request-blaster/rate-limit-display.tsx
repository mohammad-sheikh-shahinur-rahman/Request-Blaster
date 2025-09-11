import { IntelligentRateLimiterOutput } from '@/ai/flows/intelligent-rate-limiter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, Gauge, Timer, AlertCircle, Wand2 } from 'lucide-react';

interface RateLimitDisplayProps {
  info: (IntelligentRateLimiterOutput & { error?: string }) | null;
}

export function RateLimitDisplay({ info }: RateLimitDisplayProps) {
  if (!info) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Rate Limiter Analysis</CardTitle>
          <CardDescription>The results of the AI analysis will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No analysis performed yet. Configure and analyze!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Rate Limiter Analysis</CardTitle>
        <CardDescription>Learned rate limit information from the server.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!info.success && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>
              The AI could not determine the rate limit. This could be due to network issues, invalid configuration, or the server not providing standard rate limit headers.
              {info.error && <pre className="mt-2 text-xs font-code bg-destructive/20 p-2 rounded">{info.error}</pre>}
            </AlertDescription>
          </Alert>
        )}
        {info.success && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Max Requests/Minute</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{info.rateLimitInfo.maxRequestsPerMinute}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retry After (seconds)</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{info.rateLimitInfo.retryAfterSeconds}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Currently Rate Limited</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{info.rateLimitInfo.isRateLimited ? 'Yes' : 'No'}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
