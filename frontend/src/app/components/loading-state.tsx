import { Skeleton } from '@/app/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

export function LoadingCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LoadingKanban() {
  return (
    <div className="flex gap-4 p-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="flex-shrink-0 w-80">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function LoadingChart() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <LoadingCards />
    </div>
  );
}
