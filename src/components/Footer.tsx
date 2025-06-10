
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          
          <div>
            <h3 className="font-semibold mb-4">Apoio à Pesquisa</h3>
            <div className="text-gray-400 space-y-2">
              <p className="text-sm">
                <strong className="text-white">Pesquisador:</strong><br />
                Vinicius Saraiva Santos
              </p>
              <p className="text-sm">
                <strong className="text-white">Orientador:</strong><br />
                Prof. Dr. Fabricio Berton Zanchi
              </p>
              <p className="text-sm">
                <strong className="text-white">Laboratório:</strong><br />
                LabHidrometeo
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Programas de Pós-Graduação</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/f92e4bde-3d5e-4274-8d75-1859012aca2f.png" 
                  alt="PPGCTA IFBA/UFSB" 
                  className="h-12 w-auto"
                />
                <div className="text-xs text-gray-400">
                  <p>Mestrado em</p>
                  <p>Ciências Ambientais</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/76fd71ac-b435-4850-b3af-208f6e3685e6.png" 
                  alt="PPG Biossistemas" 
                  className="h-12 w-auto"
                />
                <div className="text-xs text-gray-400">
                  <p>Doutorado em</p>
                  <p>Biossistemas</p>
                </div>
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
