
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterSection from '@/components/dashboard/FilterSection';
import RecentReadings from '@/components/dashboard/RecentReadings';
import AnomaliesChart from '@/components/dashboard/AnomaliesChart';
import ReportSection from '@/components/dashboard/ReportSection';

const Dashboard = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRiver, setSelectedRiver] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard de Monitoramento
          </h1>
          <p className="text-gray-600">
            Visualize dados de qualidade da água em tempo real
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
        />

        {/* Main Content */}
        <Tabs defaultValue="readings" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-3">
            <TabsTrigger value="readings">Leituras Recentes</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
            <TabsTrigger value="report">Relatório</TabsTrigger>
          </TabsList>

          <TabsContent value="readings" className="space-y-6">
            <RecentReadings 
              city={selectedCity}
              river={selectedRiver}
              points={selectedPoints}
            />
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            <AnomaliesChart 
              city={selectedCity}
              river={selectedRiver}
              point={selectedPoints[0] || ''}
            />
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <ReportSection 
              city={selectedCity}
              river={selectedRiver}
              points={selectedPoints}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
