
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileTextIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterSection from '@/components/dashboard/FilterSection';
import RecentReadings from '@/components/dashboard/RecentReadings';
import AnomaliesChart from '@/components/dashboard/AnomaliesChart';
import ReportSection from '@/components/dashboard/ReportSection';
import CollectionPointsMap from '@/components/dashboard/CollectionPointsMap';

const Dashboard = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRiver, setSelectedRiver] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    console.log('Dashboard - Date change received:', { start, end });
    setStartDate(start);
    setEndDate(end);
  };

  // Debug: Log current state
  console.log('Dashboard - Current state:', {
    selectedCity,
    selectedRiver,
    selectedPoints,
    selectedParameters,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString()
  });

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

        {/* Debug info */}
        {(startDate || endDate || selectedParameters.length > 0 || selectedPoints.length > 0) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Filtros ativos:</strong> 
              {startDate && ` Data inicial: ${startDate.toLocaleDateString('pt-BR')}`}
              {endDate && startDate !== endDate && ` | Data final: ${endDate.toLocaleDateString('pt-BR')}`}
              {selectedPoints.length > 0 && ` | Pontos: ${selectedPoints.join(', ')}`}
              {selectedParameters.length > 0 && ` | Parâmetros: ${selectedParameters.join(', ')}`}
            </p>
          </div>
        )}

        {/* Filters */}
        <FilterSection
          selectedCity={selectedCity}
          selectedRiver={selectedRiver}
          selectedPoints={selectedPoints}
          selectedParameters={selectedParameters}
          onCityChange={setSelectedCity}
          onRiverChange={setSelectedRiver}
          onPointsChange={setSelectedPoints}
          onParametersChange={setSelectedParameters}
          onDateChange={handleDateChange}
        />

        {/* Map Section - Único mapa */}
        {selectedCity && selectedRiver && selectedPoints.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Mapa dos Pontos de Coleta</h2>
            <CollectionPointsMap 
              selectedPoints={selectedPoints}
              city={selectedCity}
              river={selectedRiver}
            />
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="readings" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-2">
            <TabsTrigger value="readings">Leituras Recentes</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
          </TabsList>

          <TabsContent value="readings" className="space-y-6">
            <RecentReadings 
              city={selectedCity}
              river={selectedRiver}
              points={selectedPoints}
              parameters={selectedParameters}
              startDate={startDate}
              endDate={endDate}
              hideMap={true}
            />
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            <AnomaliesChart 
              city={selectedCity}
              river={selectedRiver}
              point={selectedPoints[0] || ''}
              parameters={selectedParameters}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>
        </Tabs>

        {/* Generate Report Button */}
        <div className="flex justify-center pt-6">
          <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="flex items-center gap-2"
                disabled={!selectedCity || !selectedRiver || selectedPoints.length === 0}
              >
                <FileTextIcon className="h-5 w-5" />
                Gerar Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Relatório de Qualidade da Água</DialogTitle>
              </DialogHeader>
              <ReportSection 
                city={selectedCity}
                river={selectedRiver}
                points={selectedPoints}
                parameters={selectedParameters}
                startDate={startDate}
                endDate={endDate}
              />
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
