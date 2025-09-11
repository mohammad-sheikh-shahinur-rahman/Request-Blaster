import { RequestBlaster } from '@/components/features/request-blaster/request-blaster';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <RequestBlaster />
      </main>
    </div>
  );
}
