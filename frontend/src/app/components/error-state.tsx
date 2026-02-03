import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading this page. Please try again.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="container max-w-2xl py-16">
      <Card className="border-destructive/50">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="size-12 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {message}
              </p>
            </div>
            
            {onRetry && (
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
