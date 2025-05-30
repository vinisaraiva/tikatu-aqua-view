
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterSection from '@/components/dashboard/FilterSection';
import OverviewCards from '@/components/indices/OverviewCards';
import IndicesMap from '@/components/indices/IndicesMap';
import IqaTab from '@/components/indices/IqaTab';
import IetTab from '@/components/indices/IetTab';
import { Skeleton } from '@/components/ui/skeleton';

interface IndicesData {
  iqa: number;
  iet: number;
  history: { date: string; iqa: number; iet: number }[];
  coords: { lat: number; lng: number };
}

const useIndices = (city: string, river: string, point: string) => {
  return useQuery({
    queryKey: ['indices', city, river, point],
    queryFn: async (): Promise<IndicesData> => {
      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        iqa: 78,
        iet: 45,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          iqa: Math.floor(Math.random() * 40) + 60,
          iet: Math.floor(Math.random() * 30) + 30
        })),
        coords: { lat: -23.5505, lng: -46.6333 }
      };
    },
    enabled: !!(city && river && point)
  });
};

const Indices = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRiver, setSelectedRiver] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  const { data, isLoading, error } = useIndices(selectedCity, selectedRiver, selectedPoints[0] || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Índices</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Índices de Qualidade da Água
          </h1>
          <p className="text-gray-600">
            Monitore os índices IQA e IET em tempo real
          </p>
        </div>

        {/* Filters */}
        <FilterSection
          selectedCity={selectedCity}
          selectedRiver={selectedRiver}
          selectedPoints={selectedPoints}
          onCityChange={setSelectedCity}
          onRiverChange={setSelectedRiver}
          onPointsChange={setSelectedPoints}
          onDateChange={() => {}} // Not needed for this page
          showDateFilter={false}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-80" />
            <Skeleton className="h-96" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Erro ao carregar dados dos índices</p>
            <p className="text-gray-500">Verifique os filtros selecionados e tente novamente</p>
          </div>
        )}

        {/* Content */}
        {data && !isLoading && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <OverviewCards iqa={data.iqa} iet={data.iet} />

            {/* Map */}
            <IndicesMap 
              coords={data.coords} 
              pointName={selectedPoints[0] || ''} 
            />

            {/* Tabs */}
            <Tabs defaultValue="iqa" className="space-y-6">
              <TabsList className="grid w-full lg:w-auto grid-cols-2">
                <TabsTrigger value="iqa">IQA</TabsTrigger>
                <TabsTrigger value="iet">IET</TabsTrigger>
              </TabsList>

              <TabsContent value="iqa">
                <IqaTab history={data.history} />
              </TabsContent>

              <TabsContent value="iet">
                <IetTab history={data.history} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* No Selection State */}
        {!selectedCity || !selectedRiver || selectedPoints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Selecione uma cidade, rio e ponto de coleta para visualizar os índices</p>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default Indices;
