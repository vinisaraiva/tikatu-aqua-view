
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ScaleIcon, AlertTriangleIcon, AwardIcon, TestTube } from "lucide-react";
import { timelineEvents } from "@/data/events";

const EventTimeline = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredEvents = timelineEvents.filter(event => {
    if (!startDate && !endDate) return true;
    
    const eventDate = new Date(event.date);
    const filterStart = startDate ? new Date(startDate) : new Date('1900-01-01');
    const filterEnd = endDate ? new Date(endDate) : new Date('2100-12-31');
    
    return eventDate >= filterStart && eventDate <= filterEnd;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'legislation':
        return <ScaleIcon className="h-5 w-5 text-blue-600" />;
      case 'incident':
        return <AlertTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'achievement':
        return <AwardIcon className="h-5 w-5 text-green-600" />;
      case 'discovery':
        return <TestTube className="h-5 w-5 text-purple-600" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'legislation':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'incident':
        return "bg-red-100 text-red-800 border-red-200";
      case 'achievement':
        return "bg-green-100 text-green-800 border-green-200";
      case 'discovery':
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-teal-600" />
          Linha do Tempo - Eventos Ambientais
        </CardTitle>
        <p className="text-gray-600">
          Explore marcos importantes na história da gestão de recursos hídricos no Brasil
        </p>
        
        {/* Filtros de Data */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Data inicial
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Data final
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum evento encontrado para o período selecionado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event, index) => (
              <div key={index} className="relative flex gap-4">
                {/* Timeline line */}
                {index !== filteredEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                )}
                
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                  {getEventIcon(event.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1">
                          {event.title}
                        </h3>
                        <Badge className={getEventBadgeColor(event.type)}>
                          {event.type === 'legislation' && 'Legislação'}
                          {event.type === 'incident' && 'Incidente'}
                          {event.type === 'achievement' && 'Conquista'}
                          {event.type === 'discovery' && 'Descoberta'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <CalendarIcon className="h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {event.description}
                      </p>
                      
                      {event.mediaUrl && (
                        <div className="mt-3">
                          <img
                            src={event.mediaUrl}
                            alt={event.title}
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventTimeline;
