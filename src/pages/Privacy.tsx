import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Zpracování osobních údajů</h1>
        
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Ochrana vašeho soukromí je pro nás důležitá. Vaše osobní údaje (jméno a telefonní číslo) zpracováváme výhradně za účelem vyřízení vaší poptávky.
          </p>
          <p className="font-medium text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
            Budeme vás kontaktovat na základě vyplněného formuláře, abychom s vámi společně vymysleli levnější cestu a našli ty nejvýhodnější služby.
          </p>
          <p>
            Vaše údaje bezpečně uchováváme a nepředáváme je žádným třetím stranám bez vašeho výslovného souhlasu.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link to="/" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
            &larr; Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  );
}
