import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProbeApiDocs() {
  const [testApiKey, setTestApiKey] = useState('');
  const [testResponse, setTestResponse] = useState<string>('');
  const [testLoading, setTestLoading] = useState(false);
  const { toast } = useToast();

  const apiUrl = `${window.location.origin}/functions/v1/probe-data`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.',
    });
  };

  const testApi = async () => {
    if (!testApiKey) {
      toast({
        title: 'Erro',
        description: 'Digite uma API Key para testar.',
        variant: 'destructive',
      });
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          point_id: 1,
          measured_at: new Date().toISOString(),
          parameters: {
            temperature: 25.3,
            ph: 7.2,
            dissolved_oxygen: 8.5,
            turbidity: 12.1
          },
          metadata: {
            probe_battery: 85,
            signal_strength: -65,
            firmware_version: "1.0.0"
          }
        })
      });

      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'API respondeu corretamente.',
        });
      } else {
        toast({
          title: 'Erro na API',
          description: `Status: ${response.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setTestResponse(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast({
        title: 'Erro',
        description: 'Falha ao conectar com a API.',
        variant: 'destructive',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const curlExample = `curl -X POST "${apiUrl}" \\
  -H "Authorization: Bearer SUA_API_KEY_AQUI" \\
  -H "Content-Type: application/json" \\
  -d '{
    "point_id": 1,
    "measured_at": "2025-01-21T14:30:00Z",
    "parameters": {
      "temperature": 25.3,
      "ph": 7.2,
      "dissolved_oxygen": 8.5,
      "turbidity": 12.1
    },
    "metadata": {
      "probe_battery": 85,
      "signal_strength": -65,
      "firmware_version": "1.0.0"
    }
  }'`;

  const pythonExample = `import requests
import json
from datetime import datetime

# Configuração
api_url = "${apiUrl}"
api_key = "SUA_API_KEY_AQUI"

# Dados da leitura
data = {
    "point_id": 1,
    "measured_at": datetime.now().isoformat() + "Z",
    "parameters": {
        "temperature": 25.3,
        "ph": 7.2,
        "dissolved_oxygen": 8.5,
        "turbidity": 12.1
    },
    "metadata": {
        "probe_battery": 85,
        "signal_strength": -65,
        "firmware_version": "1.0.0"
    }
}

# Enviar dados
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(api_url, headers=headers, json=data)

if response.status_code == 200:
    print("Dados enviados com sucesso!")
    print(response.json())
else:
    print(f"Erro: {response.status_code}")
    print(response.text)`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentação da API para Sondas</h1>
        <p className="text-muted-foreground">
          Guia completo para configurar e enviar dados automaticamente das sondas
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta API foi desenvolvida para ser simples de usar. Siga este guia passo a passo para configurar sua sonda.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="authentication">Autenticação</TabsTrigger>
          <TabsTrigger value="format">Formato dos Dados</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="test">Testar API</TabsTrigger>
          <TabsTrigger value="troubleshooting">Problemas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
              <CardDescription>
                A API recebe dados das sondas automaticamente e os armazena no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">1️⃣</div>
                  <h3 className="font-semibold">Cadastre a Sonda</h3>
                  <p className="text-sm text-muted-foreground">
                    Registre a sonda no sistema admin e obtenha a API Key
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">2️⃣</div>
                  <h3 className="font-semibold">Configure a Sonda</h3>
                  <p className="text-sm text-muted-foreground">
                    Programe a sonda para enviar dados para nossa API
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">3️⃣</div>
                  <h3 className="font-semibold">Monitore</h3>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe as leituras no dashboard em tempo real
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Informações Técnicas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Badge variant="outline">Endpoint</Badge>
                    <p className="mt-1 font-mono text-xs bg-muted p-2 rounded">
                      POST {apiUrl}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline">Formato</Badge>
                    <p className="mt-1">JSON via HTTP POST</p>
                  </div>
                  <div>
                    <Badge variant="outline">Autenticação</Badge>
                    <p className="mt-1">API Key no header Authorization</p>
                  </div>
                  <div>
                    <Badge variant="outline">Rate Limit</Badge>
                    <p className="mt-1">1 request por minuto por sonda</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação</CardTitle>
              <CardDescription>
                Como usar a API Key para autenticar sua sonda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Cada sonda tem uma API Key única. Mantenha-a segura!
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Como obter a API Key:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Acesse o painel administrativo</li>
                  <li>Vá em "Gerenciar Voluntários"</li>
                  <li>Clique em "Novo Voluntário"</li>
                  <li>Selecione "Automático (Sonda)" como tipo</li>
                  <li>Preencha os dados da sonda e salve</li>
                  <li>A API Key será gerada automaticamente</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Como usar no header HTTP:</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  Authorization: Bearer SUA_API_KEY_AQUI
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  A API Key nunca expira, mas pode ser regenerada pelo administrador se necessário.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="format">
          <Card>
            <CardHeader>
              <CardTitle>Formato dos Dados</CardTitle>
              <CardDescription>
                Estrutura JSON que deve ser enviada pela sonda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Estrutura do JSON:</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`{
  "point_id": 1,                     // ID do ponto de coleta (obrigatório)
  "measured_at": "2025-01-21T14:30:00Z", // Timestamp ISO 8601 (obrigatório)
  "parameters": {                    // Parâmetros medidos (obrigatório)
    "temperature": 25.3,             // Temperatura (°C)
    "ph": 7.2,                       // pH
    "dissolved_oxygen": 8.5,         // Oxigênio Dissolvido (mg/L)
    "turbidity": 12.1                // Turbidez (NTU)
  },
  "metadata": {                      // Metadados opcionais
    "probe_battery": 85,             // Bateria da sonda (%)
    "signal_strength": -65,          // Força do sinal (dBm)
    "firmware_version": "1.0.0"      // Versão do firmware
  }
}`}
                  </pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-green-600">✅ Campos Obrigatórios</h5>
                    <ul className="text-sm space-y-1 mt-2">
                      <li><code>point_id</code> - Número do ponto</li>
                      <li><code>measured_at</code> - Data/hora da medição</li>
                      <li><code>parameters</code> - Pelo menos 1 parâmetro</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-600">📋 Campos Opcionais</h5>
                    <ul className="text-sm space-y-1 mt-2">
                      <li><code>metadata</code> - Informações da sonda</li>
                      <li>Qualquer campo dentro de metadata</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Parâmetros Aceitos:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {[
                      'temperature', 'ph', 'dissolved_oxygen', 'turbidity',
                      'conductivity', 'total_dissolved_solids', 'nitrate', 'phosphate'
                    ].map(param => (
                      <Badge key={param} variant="secondary">{param}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Exemplo cURL
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(curlExample)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                  {curlExample}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Exemplo Python
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(pythonExample)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {pythonExample}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Testar API</CardTitle>
              <CardDescription>
                Use este formulário para testar se sua API Key funciona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">API Key da Sonda:</label>
                <Input
                  placeholder="Cole sua API Key aqui..."
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                />
              </div>

              <Button onClick={testApi} disabled={testLoading} className="w-full">
                {testLoading ? 'Testando...' : 'Testar API'}
              </Button>

              {testResponse && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Resposta da API:</label>
                  <Textarea
                    value={testResponse}
                    readOnly
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Problemas Comuns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-600">Erro 401: API Key inválida</h4>
                    <p className="text-sm">
                      • Verifique se a API Key está correta<br/>
                      • Confirme se a sonda está ativa no sistema<br/>
                      • Verifique se o header Authorization está correto
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-yellow-600">Erro 403: Acesso negado</h4>
                    <p className="text-sm">
                      • A sonda não tem acesso a este ponto de coleta<br/>
                      • Verifique o point_id no JSON<br/>
                      • Contate o administrador para verificar as permissões
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-600">Erro 422: Dados inválidos</h4>
                    <p className="text-sm">
                      • Verifique se todos os campos obrigatórios estão presentes<br/>
                      • Confirme o formato do timestamp (ISO 8601)<br/>
                      • Verifique se os valores dos parâmetros são números
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-600">Dicas para Desenvolvimento</h4>
                    <p className="text-sm">
                      • Use logs para acompanhar as respostas da API<br/>
                      • Implemente retry automático para falhas temporárias<br/>
                      • Monitore a bateria e conectividade da sonda<br/>
                      • Teste com dados simulados antes da instalação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suporte Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Se você continuar enfrentando problemas, entre em contato com nossa equipe técnica
                  com as seguintes informações:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Código da sonda</li>
                  <li>• Mensagem de erro completa</li>
                  <li>• Exemplo dos dados que está tentando enviar</li>
                  <li>• Logs da sonda (se disponível)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}