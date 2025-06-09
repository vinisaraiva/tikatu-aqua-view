
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CameraIcon, 
  MapPinIcon, 
  SendIcon, 
  EyeIcon,
  AlertCircleIcon,
  CheckCircleIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Observation {
  id: string;
  location: string;
  description: string;
  category: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  date: string;
  status: 'pending' | 'verified' | 'invalid';
}

const CitizenForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    category: "pollution",
    image: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  // Mock observations data - in a real app this would come from Supabase
  const [observations] = useState<Observation[]>([
    {
      id: "1",
      location: "Rio Caí, Nova Hartz",
      description: "Observei uma espuma branca na superfície da água e um odor forte. Possível contaminação por detergentes.",
      category: "pollution",
      latitude: -29.5875,
      longitude: -50.9233,
      date: "2024-01-15",
      status: "verified"
    },
    {
      id: "2", 
      location: "Arroio Dilúvio, Porto Alegre",
      description: "Mortandade de peixes pequenos observada nas margens. Água com coloração escura.",
      category: "biodiversity",
      latitude: -30.0346,
      longitude: -51.2177,
      date: "2024-01-12",
      status: "pending"
    },
    {
      id: "3",
      location: "Rio dos Sinos, São Leopoldo", 
      description: "Aumento na população de aves aquáticas. Água aparenta estar mais limpa que no mês passado.",
      category: "biodiversity",
      latitude: -29.7604,
      longitude: -51.1419,
      date: "2024-01-10",
      status: "verified"
    }
  ]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Localização obtida",
            description: "Sua localização foi capturada com sucesso!"
          });
        },
        (error) => {
          toast({
            title: "Erro de localização",
            description: "Não foi possível obter sua localização. Insira manualmente.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Observação enviada!",
        description: "Sua contribuição foi registrada e será analisada pela nossa equipe."
      });

      // Reset form
      setFormData({
        location: "",
        description: "",
        category: "pollution",
        image: null
      });
      setCurrentLocation(null);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      pollution: "Poluição",
      biodiversity: "Biodiversidade", 
      quality: "Qualidade da Água",
      infrastructure: "Infraestrutura"
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      pollution: "bg-red-100 text-red-800 border-red-200",
      biodiversity: "bg-green-100 text-green-800 border-green-200",
      quality: "bg-blue-100 text-blue-800 border-blue-200",
      infrastructure: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircleIcon className="h-4 w-4 text-yellow-600" />;
      case 'invalid':
        return <AlertCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <EyeIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-teal-600" />
            Citizen Science - Reporte uma Observação
          </CardTitle>
          <p className="text-gray-600">
            Ajude a monitorar a qualidade da água reportando suas observações de campo
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Local da Observação</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Ex: Rio dos Sinos, São Leopoldo"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={getCurrentLocation}
                    title="Usar localização atual"
                  >
                    <MapPinIcon className="h-4 w-4" />
                  </Button>
                </div>
                {currentLocation && (
                  <p className="text-sm text-green-600">
                    Coordenadas: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="pollution">Poluição</option>
                  <option value="biodiversity">Biodiversidade</option>
                  <option value="quality">Qualidade da Água</option>
                  <option value="infrastructure">Infraestrutura</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Observação</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o que você observou..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Foto (Opcional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                />
                <CameraIcon className="h-5 w-5 text-gray-400" />
              </div>
              {formData.image && (
                <p className="text-sm text-green-600">
                  Arquivo selecionado: {formData.image.name}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Enviar Observação
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Observations List */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Observações da Comunidade</CardTitle>
          <p className="text-gray-600">
            Veja o que outros cidadãos observaram em suas regiões
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {observations.map((obs) => (
              <Card key={obs.id} className="border-l-4 border-l-teal-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{obs.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(obs.status)}
                      <Badge className={getCategoryColor(obs.category)}>
                        {getCategoryLabel(obs.category)}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{obs.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(obs.date).toLocaleDateString('pt-BR')}</span>
                    <span>
                      Status: {obs.status === 'verified' && 'Verificado'}
                      {obs.status === 'pending' && 'Em análise'}
                      {obs.status === 'invalid' && 'Inválido'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenForm;
