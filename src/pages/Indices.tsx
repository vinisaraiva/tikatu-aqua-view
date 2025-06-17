
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DropletsIcon, WavesIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterSection from '@/components/dashboard/FilterSection';
import IqaIndice from '@/components/indices/IqaIndice';
import IetIndice from '@/components/indices/IetIndice';

const Indices = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRiver, setSelectedRiver] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [selectedParameter, setSelectedParameter] = useState(''); // Changed from array to single string
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activeIndex, setActiveIndex] = useState<'iqa' | 'iet' | null>(null);

  // Limpar cidade, rio, pontos e parâmetros quando o estado mudar
  useEffect(() => {
    if (selectedState !== '' && selectedCity !== '') {
      console.log('Indices - Estado mudou, limpando filtros');
      setSelectedCity('');
      setSelectedRiver('');
      setSelectedPoints([]);
      setSelectedParameter(''); // Clear single parameter
    }
  }, [selectedState]);

  // Limpar rio, pontos e parâmetros quando a cidade mudar
  useEffect(() => {
    if (selectedCity && selectedRiver) {
      console.log('Indices - Cidade mudou, limpando rio e filtros');
      setSelectedRiver('');
      setSelectedPoints([]);
      setSelectedParameter(''); // Clear single parameter
    }
  }, [selectedCity]);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    console.log('Indices - Date filter changed:', { start, end });
    setStartDate(start);
    setEndDate(end);
  };

  const handleStateChange = (state: string) => {
    console.log('Indices - Estado mudou:', state);
    setSelectedState(state);
  };

  const handleRiverChange = (river: string) => {
    console.log('Indices - Rio mudou:', river);
    setSelectedRiver(river);
    // Os pontos e parâmetros serão limpos automaticamente pelo FilterSection
  };

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
            Selecione um índice para monitoramento e análise detalhada
          </p>
        </div>

        {/* Index Selection Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            variant={activeIndex === 'iqa' ? 'default' : 'outline'}
            size="lg"
            className="h-32 flex flex-col items-center justify-center space-y-2"
            onClick={() => setActiveIndex('iqa')}
          >
            <DropletsIcon className="h-8 w-8" />
            <div className="text-center">
              <div className="text-lg font-semibold">IQA</div>
              <div className="text-sm opacity-80">Índice de Qualidade da Água</div>
            </div>
          </Button>

          <Button
            variant={activeIndex === 'iet' ? 'default' : 'outline'}
            size="lg"
            className="h-32 flex flex-col items-center justify-center space-y-2"
            onClick={() => setActiveIndex('iet')}
          >
            <WavesIcon className="h-8 w-8" />
            <div className="text-center">
              <div className="text-lg font-semibold">IET</div>
              <div className="text-sm opacity-80">Índice do Estado Trófico</div>
            </div>
          </Button>
        </div>

        {/* Filters - Only show if an index is selected, without parameters filter */}
        {activeIndex && (
          <FilterSection
            selectedState={selectedState}
            selectedCity={selectedCity}
            selectedRiver={selectedRiver}
            selectedPoints={selectedPoints}
            selectedParameter={selectedParameter} // Updated prop
            onStateChange={handleStateChange}
            onCityChange={setSelectedCity}
            onRiverChange={handleRiverChange}
            onPointsChange={setSelectedPoints}
            onParameterChange={setSelectedParameter} // Updated prop
            onDateChange={handleDateChange}
            showParametersFilter={false}
          />
        )}

        {/* Index Content */}
        {activeIndex === 'iqa' && (
          <IqaIndice
            selectedCity={selectedCity}
            selectedRiver={selectedRiver}
            selectedPoints={selectedPoints}
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {activeIndex === 'iet' && (
          <IetIndice
            selectedCity={selectedCity}
            selectedRiver={selectedRiver}
            selectedPoints={selectedPoints}
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {/* No Selection State */}
        {!activeIndex && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Selecione um índice acima para começar o monitoramento</p>
            <p className="text-sm text-gray-400">Cada índice possui metodologia e cálculos específicos</p>
          </div>
        )}

        {/* No Filters Selected */}
        {activeIndex && (!selectedCity || !selectedRiver || selectedPoints.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">Complete os filtros acima para visualizar os dados do {activeIndex.toUpperCase()}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Indices;
