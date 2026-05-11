import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ExecutiveOverview from '@/pages/ExecutiveOverview';
import PatientAcquisition from '@/pages/PatientAcquisition';
import Revenue from '@/pages/Revenue';
import SocialMedia from '@/pages/SocialMedia';
import PaidAds from '@/pages/PaidAds';
import StrategyNotes from '@/pages/StrategyNotes';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="overview" element={<ExecutiveOverview />} />
              <Route path="acquisition" element={<PatientAcquisition />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="social" element={<SocialMedia />} />
              <Route path="ads" element={<PaidAds />} />
              <Route path="strategy" element={<StrategyNotes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
