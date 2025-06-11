
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img 
              src="/lovable-uploads/d62bdfd0-6fc8-4075-ac93-580e7557f424.png" 
              alt="Tikatu" 
              className="h-8 mb-4 brightness-0 invert"
            />
            <p className="text-gray-400">
              Plataforma de monitoramento da qualidade da água para gestão ambiental eficiente.
            </p>
          </div>
          
          <div className="pr-2">
            <h3 className="text-sm font-semibold mb-4">Apoio à Pesquisa</h3>
            <div className="text-gray-400 space-y-2">
              <p className="text-sm">
                <strong className="text-white">Pesquisador:</strong><br />
                Vinicius Saraiva Santos
              </p>
              <p className="text-sm">
                <strong className="text-white">Orientador:</strong><br />
                Prof. Dr. Fabricio Berton Zanchi
              </p>
              <div className="mt-3">
                <img 
                  src="/lovable-uploads/ba62473f-93be-4e42-a08f-85d6defbfa2d.png" 
                  alt="Laboratório de Ecohidrologia" 
                  className="h-16 w-auto"
                />
              </div>
            </div>
          </div>
          
          <div className="px-1">
            <h3 className="text-sm font-semibold mb-4">Programas de Pós-Graduação</h3>
            <div className="bg-gray-600 rounded-lg p-6 space-y-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/f92e4bde-3d5e-4274-8d75-1859012aca2f.png" 
                  alt="PPGCTA IFBA/UFSB" 
                  className="h-12 w-auto flex-shrink-0"
                />
                <div className="text-xs text-gray-300 min-w-0 flex-1">
                  <p className="font-medium">Mestrado em</p>
                  <p className="leading-tight">Ciências Ambientais</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/76fd71ac-b435-4850-b3af-208f6e3685e6.png" 
                  alt="PPG Biossistemas" 
                  className="h-12 w-auto flex-shrink-0"
                />
                <div className="text-xs text-gray-300 min-w-0 flex-1">
                  <p className="font-medium">Doutorado em</p>
                  <p className="leading-tight">Biossistemas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pl-2">
            <h3 className="text-sm font-semibold mb-4">Apoio Financeiro</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/4e3a4cd5-6228-4ae2-870d-9a968af40af2.png" 
                  alt="CAPES" 
                  className="h-12 w-auto"
                />
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/b06bdb32-1be3-43fc-b690-65d15f8806a4.png" 
                  alt="CNPq" 
                  className="h-12 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Tikatu. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
