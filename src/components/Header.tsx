
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MenuIcon, XIcon } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-teal-600">
            Tikatu
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-teal-600 transition-colors">
              Início
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-teal-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/indices" className="text-gray-700 hover:text-teal-600 transition-colors">
              Índices
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-teal-600 transition-colors">
              Sobre
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-teal-600 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-teal-600 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/indices" 
                className="text-gray-700 hover:text-teal-600 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Índices
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-teal-600 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
