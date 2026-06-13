import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3, Users, Eye, Clock, MapPin } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useAnalytics, formatDuration } from '@/hooks/admin/useAnalytics';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PERIODS = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
];

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 173 58% 39%))',
  'hsl(var(--chart-3, 197 37% 24%))',
  'hsl(var(--chart-4, 43 74% 66%))',
  'hsl(var(--chart-5, 27 87% 67%))',
  'hsl(var(--muted-foreground))',
];

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
    {message}
  </div>
);

const AnalyticsPage = () => {
  const [days, setDays] = useState(7);
  const { data, isLoading, isError } = useAnalytics(days);

  const summaryCards = [
    {
      title: 'Visualizações',
      value: data?.summary.totalViews ?? 0,
      icon: Eye,
      description: 'Total de páginas vistas',
    },
    {
      title: 'Visitantes únicos',
      value: data?.summary.uniqueVisitors ?? 0,
      icon: Users,
      description: 'Sessões distintas',
    },
    {
      title: 'Duração média',
      value: formatDuration(data?.summary.avgDurationSeconds ?? 0),
      icon: Clock,
      description: 'Tempo médio por página',
    },
    {
      title: 'Página principal',
      value: data?.summary.topPath ?? '—',
      icon: BarChart3,
      description: 'Mais acessada no período',
      small: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Relatório de Acessos</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe como está o uso do site
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.days}
              variant={days === p.days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState message="Não foi possível carregar os dados de acesso." />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cartões de resumo */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={card.small ? 'text-lg font-bold truncate' : 'text-2xl font-bold'}
                    title={String(card.value)}
                  >
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Visitas por dia */}
          <Card>
            <CardHeader>
              <CardTitle>Visitas por dia</CardTitle>
              <CardDescription>Visualizações e visitantes únicos no período</CardDescription>
            </CardHeader>
            <CardContent>
              {!data || data.total === 0 ? (
                <EmptyState message="Ainda não há dados de acesso para este período." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      name="Visualizações"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      name="Visitantes"
                      stroke={PIE_COLORS[1]}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top páginas */}
            <Card>
              <CardHeader>
                <CardTitle>Páginas mais acessadas</CardTitle>
              </CardHeader>
              <CardContent>
                {!data || data.topPages.length === 0 ? (
                  <EmptyState message="Sem dados de páginas." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.topPages} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Bar dataKey="value" name="Visitas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Dispositivos */}
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                {!data || data.devices.length === 0 ? (
                  <EmptyState message="Sem dados de dispositivos." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.devices}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {data.devices.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Navegadores */}
            <Card>
              <CardHeader>
                <CardTitle>Navegadores</CardTitle>
              </CardHeader>
              <CardContent>
                {!data || data.browsers.length === 0 ? (
                  <EmptyState message="Sem dados de navegadores." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.browsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Bar dataKey="value" name="Visitas" fill={PIE_COLORS[1]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Localidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localidades
                </CardTitle>
                <CardDescription>Origem aproximada dos acessos</CardDescription>
              </CardHeader>
              <CardContent>
                {!data || data.locations.length === 0 ? (
                  <EmptyState message="Sem dados de localização." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>País</TableHead>
                        <TableHead>Região</TableHead>
                        <TableHead className="text-right">Visitas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.locations.map((loc, i) => (
                        <TableRow key={i}>
                          <TableCell>{loc.country}</TableCell>
                          <TableCell className="text-muted-foreground">{loc.region || '—'}</TableCell>
                          <TableCell className="text-right font-medium">{loc.views}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
