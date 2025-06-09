
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { glossaryTerms } from "@/data/glossary";

const GlossaryAccordion = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTerms = glossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar termos do glossário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {filteredTerms.map((term, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              <span className="font-semibold text-teal-600">{term.term}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">{term.definition}</p>
                {term.mediaUrl && (
                  <div className="mt-3">
                    <img
                      src={term.mediaUrl}
                      alt={term.term}
                      className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filteredTerms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum termo encontrado para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default GlossaryAccordion;
