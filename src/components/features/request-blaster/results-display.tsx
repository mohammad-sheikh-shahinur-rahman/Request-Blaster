import { RequestResult } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, ServerCrash } from 'lucide-react';

interface ResultsDisplayProps {
  results: RequestResult[];
}

function getStatusVariant(status: number): 'destructive' | 'secondary' | 'default' {
  if (status >= 200 && status < 300) return 'default';
  if (status >= 400 || status === 0) return 'destructive';
  return 'secondary';
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>The results of your sent requests will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <ServerCrash className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No requests sent yet. Configure and blast!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Showing {results.length} results from the last blast.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <Accordion type="multiple" className="w-full space-y-2">
            {results.map((result, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                 <Card className="overflow-hidden bg-card/50">
                    <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]]:bg-accent/10">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-sm text-muted-foreground">#{index + 1}</span>
                                {result.status >= 200 && result.status < 300 ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                )}
                                <span className="font-semibold">{result.error || result.statusText}</span>
                            </div>
                            <Badge variant={getStatusVariant(result.status)}>{result.status}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="bg-muted/50 p-4 border-t">
                            <h4 className="font-semibold mb-2 text-sm">Response Body:</h4>
                            <pre className="text-xs p-3 bg-background rounded-md overflow-x-auto font-code">{result.error ? result.error : (result.body || "Empty response body")}</pre>
                        </div>
                    </AccordionContent>
                 </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
