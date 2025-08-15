import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Waves, MapPin, Activity, Users, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: citiesCount },
        { count: riversCount },
        { count: pointsCount },
        { count: readingsCount },
        { count: volunteersCount },
        { count: newsCount },
      ] = await Promise.all([
        supabase.from('cities').select('*', { count: 'exact', head: true }),
        supabase.from('rivers').select('*', { count: 'exact', head: true }),
        supabase.from('points').select('*', { count: 'exact', head: true }),
        supabase.from('readings').select('*', { count: 'exact', head: true }),
        supabase.from('volunteers').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
      ]);

      return {
        cities: citiesCount || 0,
        rivers: riversCount || 0,
        points: pointsCount || 0,
        readings: readingsCount || 0,
        volunteers: volunteersCount || 0,
        news: newsCount || 0,
      };
    },
  });

  const statCards = [
    {
      title: 'Cidades',
      value: stats?.cities || 0,
      icon: Building2,
      description: 'Cidades cadastradas',
    },
    {
      title: 'Rios',
      value: stats?.rivers || 0,
      icon: Waves,
      description: 'Rios monitorados',
    },
    {
      title: 'Pontos de Coleta',
      value: stats?.points || 0,
      icon: MapPin,
      description: 'Pontos de monitoramento',
    },
    {
      title: 'Leituras',
      value: stats?.readings || 0,
      icon: Activity,
      description: 'Leituras registradas',
    },
    {
      title: 'Voluntários',
      value: stats?.volunteers || 0,
      icon: Users,
      description: 'Voluntários cadastrados',
    },
    {
      title: 'Notícias',
      value: stats?.news || 0,
      icon: FileText,
      description: 'Notícias publicadas',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de monitoramento
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Leituras</CardTitle>
            <CardDescription>
              Resumo das últimas leituras registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas Ativos</CardTitle>
            <CardDescription>
              Monitoramento de alertas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;