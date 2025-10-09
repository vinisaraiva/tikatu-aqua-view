
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileTextIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterSection from '@/components/dashboard/FilterSection';
import RecentReadings from '@/components/dashboard/RecentReadings';
import AnomaliesChart from '@/components/dashboard/AnomaliesChart';
import ReportSection from '@/components/dashboard/ReportSection';
import ParameterChartsView from '@/components/dashboard/point/ParameterChartsView';
import { useCities, useRivers, usePoints } from '@/hooks/useGeographicData';
import { useReadings, useReadingValues } from '@/hooks/useReadingsData';
import { transformReadingsData } from '@/components/dashboard/ReadingsDataTransformer';

// Point View Wrapper Component
const PointViewWrapper = ({ 
  selectedState, 
  selectedCity, 
  selectedRiver, 
  selectedPoints, 
  selectedParameter,
  startDate,
  endDate 
}: {
  selectedState: string;
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  selectedParameter: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  // Fetch geographic data
  const { data: cities } = useCities(selectedState);
  const { data: rivers } = useRivers(
    cities?.find(city => city.name === selectedCity)?.id
  );
  const { data: points } = usePoints(
    rivers?.find(river => river.name === selectedRiver)?.id
  );

  // Get point IDs for selected points
  const selectedPointsData = points?.filter(point => 
    selectedPoints.includes(point.name)
  ) || [];
  const pointIds = selectedPointsData.map(point => point.id);

  // Fetch readings data
  const { data: readings = [], isLoading: isLoadingReadings } = useReadings(
    pointIds, 
    startDate, 
    endDate
  );
  const { data: readingValues = [], isLoading: isLoadingValues } = useReadingValues(
    readings.map(r => r.id)
  );

  // Transform data - for point view, we don't filter by parameter, we want all parameters
  const transformedReadings = transformReadingsData({
    readingValues,
    readings,
    selectedPointsData,
    parameter: '' // Empty parameter to get all parameters
  });

  if (!selectedCity || !selectedRiver || selectedPoints.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Selecione cidade, rio e pontos de coleta para visualizar os dados por ponto
      </div>
    );
  }

  if (isLoadingReadings || isLoadingValues) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando dados...
      </div>
    );
  }

  return (
    <ParameterChartsView
      readings={transformedReadings}
      selectedPoints={selectedPoints}
      city={selectedCity}
      river={selectedRiver}
    />
  );
};

const Dashboard = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRiver, setSelectedRiver] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [selectedParameter, setSelectedParameter] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('by-parameter');

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    console.log('Dashboard - Date change received:', { start, end });
    setStartDate(start);
    setEndDate(end);
  };

  // Fetch readings data for report generation
  const { data: cities } = useCities(selectedState);
  const { data: rivers } = useRivers(
    cities?.find(city => city.name === selectedCity)?.id
  );
  const { data: points } = usePoints(
    rivers?.find(river => river.name === selectedRiver)?.id
  );

  // Get point IDs for selected points
  const selectedPointsData = points?.filter(point => 
    selectedPoints.includes(point.name)
  ) || [];
  const pointIds = selectedPointsData.map(point => point.id);

  // Fetch readings data for report
  const { data: reportReadings = [] } = useReadings(
    pointIds, 
    startDate, 
    endDate
  );
  const { data: reportReadingValues = [] } = useReadingValues(
    reportReadings.map(r => r.id)
  );

  // Transform data for report - conditional parameter based on active tab
  const reportParameter = activeTab === 'by-point' ? '' : selectedParameter;
  const reportReadingsData = transformReadingsData({
    readingValues: reportReadingValues,
    readings: reportReadings,
    selectedPointsData,
    parameter: reportParameter
  }).map(reading => ({
    pointName: reading.point,
    value: reading.value,
    unit: reading.unit,
    conamaMin: reading.conamaMin,
    conamaMax: reading.conamaMax,
    date: reading.datetime,
    parameterCode: reading.parameter,
    parameterDescription: reading.parameter
  }));

  // Debug: Log current state
  console.log('Dashboard - Current state:', {
    selectedState,
    selectedCity,
    selectedRiver,
    selectedPoints,
    selectedParameter,
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
        {(startDate || endDate || selectedParameter || selectedPoints.length > 0 || selectedState || selectedCity) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Filtros ativos:</strong> 
              {selectedState && ` Estado: ${selectedState}`}
              {selectedCity && ` | Cidade: ${selectedCity}`}
              {startDate && ` | Data inicial: ${startDate.toLocaleDateString('pt-BR')}`}
              {endDate && startDate !== endDate && ` | Data final: ${endDate.toLocaleDateString('pt-BR')}`}
              {selectedPoints.length > 0 && ` | Pontos: ${selectedPoints.join(', ')}`}
              {selectedParameter && ` | Parâmetro: ${selectedParameter}`}
            </p>
          </div>
        )}

        {/* Filters */}
        <FilterSection
          selectedState={selectedState}
          selectedCity={selectedCity}
          selectedRiver={selectedRiver}
          selectedPoints={selectedPoints}
          selectedParameter={selectedParameter}
          onStateChange={setSelectedState}
          onCityChange={setSelectedCity}
          onRiverChange={setSelectedRiver}
          onPointsChange={setSelectedPoints}
          onParameterChange={setSelectedParameter}
          onDateChange={handleDateChange}
          showParametersFilter={activeTab === 'by-parameter' || activeTab === 'anomalies'}
        />

        {/* Main Content */}
        <Tabs defaultValue="by-parameter" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-3">
            <TabsTrigger value="by-parameter">Por Parâmetro</TabsTrigger>
            <TabsTrigger value="by-point">Por Ponto de Coleta</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
          </TabsList>

          <TabsContent value="by-parameter" className="space-y-6">
            <RecentReadings 
              city={selectedCity}
              river={selectedRiver}
              points={selectedPoints}
              parameter={selectedParameter}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="by-point" className="space-y-6">
            {selectedCity && selectedRiver && selectedPoints.length > 0 ? (
              <PointViewWrapper 
                selectedState={selectedState}
                selectedCity={selectedCity}
                selectedRiver={selectedRiver}
                selectedPoints={selectedPoints}
                selectedParameter={selectedParameter}
                startDate={startDate}
                endDate={endDate}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Visualização por Ponto de Coleta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Selecione cidade, rio e pontos de coleta para visualizar os dados
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            {selectedCity && selectedRiver && selectedPoints.length > 0 ? (
              <AnomaliesChart 
                city={selectedCity}
                river={selectedRiver}
                point={selectedPoints[0] || ''}
                parameters={selectedParameter ? [selectedParameter] : []}
                startDate={startDate}
                endDate={endDate}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Anomalias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Selecione cidade, rio e pontos de coleta para visualizar anomalias
                  </div>
                </CardContent>
              </Card>
            )}
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
                parameters={selectedParameter ? [selectedParameter] : []}
                startDate={startDate}
                endDate={endDate}
                selectedParameter={reportParameter}
                readingsData={reportReadingsData}
                activeTab={activeTab}
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
