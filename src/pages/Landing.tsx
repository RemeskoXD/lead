import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Search, ShieldCheck, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Landing() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState<string[]>(['Internet']);
  const [currentPrice, setCurrentPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleService = (id: string) => {
    setServices(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    if (services.length === 0) {
      alert('Vyberte prosím alespoň jednu službu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, services: services.join(', '), currentPrice }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Něco se pokazilo. Zkuste to prosím znovu.');
      }
    } catch (err) {
      alert('Chyba připojení k serveru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <div className="text-2xl font-bold text-blue-800 tracking-tight">optivo</div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Copy */}
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight">
            PLATÍTE ZA INTERNET VÍC, NEŽ MUSÍTE?
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
            Najdeme pro vás ty <strong>nejlevnější služby v telekomunikacích</strong>. Ať už hledáte levný <strong>internet</strong>, <strong>televizi</strong> nebo výhodný <strong>tarif</strong>, srovnáme nabídky a ušetříme vám peníze.
          </p>
          
          <ul className="space-y-4 text-lg md:text-xl text-gray-700 font-medium">
            <li className="flex items-center gap-3">
              <Check className="text-green-600 w-6 h-6 flex-shrink-0" strokeWidth={3} />
              Ušetříme vám až 3 000 Kč ročně
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-green-600 w-6 h-6 flex-shrink-0" strokeWidth={3} />
              Zabere to 30 sekund
            </li>
          </ul>

          <div className="hidden md:block space-y-6 pt-8">
            <div className="flex items-center gap-3 text-gray-600 font-medium">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Spolupracujeme se všemi operátory
            </div>
            <div className="flex items-center gap-3 text-gray-600 font-medium">
              <Check className="w-5 h-5 text-blue-600" /> Zdarma a nezávazně
            </div>
            <div className="flex items-center gap-3 text-gray-600 font-medium">
              <Users className="w-5 h-5 text-blue-600" /> Už 12 000+ spokojených klientů
            </div>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="relative">
          {/* Decorative background shape */}
          <div className="absolute -inset-4 bg-blue-100/50 rounded-3xl transform rotate-3 -z-10"></div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 relative z-10">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Děkujeme!</h2>
                <p className="text-gray-600">Vaše poptávka byla úspěšně odeslána. Brzy se vám ozveme s lepší nabídkou.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Odeslat další poptávku
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
                  Zjistěte, kolik můžete ušetřit
                </h2>

                <div className="space-y-5">
                  {/* Current Price */}
                  <div>
                    <label htmlFor="currentPrice" className="block text-base font-bold text-gray-800 mb-2">
                      Kolik platíte měsíčně?
                    </label>
                    <input
                      id="currentPrice"
                      type="text"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      placeholder="Např. 600 Kč"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Service Selection */}
                  <div className="bg-gray-100 p-1 rounded-lg flex flex-col sm:flex-row gap-1 text-sm font-medium">
                    {[
                      { id: 'Internet', label: 'Internet', price: 'od 199 Kč' },
                      { id: 'TV', label: 'TV', price: 'od 299 Kč' },
                      { id: 'Tarify', label: 'Tarify', price: 'od 349 Kč' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleService(type.id)}
                        className={cn(
                          "flex-1 py-3 px-2 rounded-md transition-all flex flex-col items-center justify-center gap-1",
                          services.includes(type.id) 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                        )}
                      >
                        <span className="font-bold">{type.label}</span>
                        <span className={cn(
                          "text-xs opacity-80",
                          services.includes(type.id) ? "text-blue-100" : "text-gray-500"
                        )}>{type.price}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Vaše jméno
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Např. Jan Novák"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefonní číslo
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+420 123 456 789"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-lg bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-lg shadow-lg shadow-green-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Odesílám...' : 'Zjistit lepší tarif'}
                </button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Odesláním souhlasíte se <Link to="/ochrana-osobnich-udaju" target="_blank" className="underline hover:text-gray-800 transition-colors">zpracováním osobních údajů</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Benefits (Visible only on small screens) */}
      <div className="md:hidden px-4 pb-12 space-y-4">
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <ShieldCheck className="w-5 h-5 text-blue-600" /> Spolupracujeme se všemi operátory
        </div>
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <Check className="w-5 h-5 text-blue-600" /> Zdarma a nezávazně
        </div>
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <Users className="w-5 h-5 text-blue-600" /> Už 12 000+ spokojených klientů
        </div>
      </div>

      {/* SEO Text Section */}
      <section className="bg-gray-100 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-gray-700 mb-2">Levné služby v telekomunikacích</h2>
          <p>
            Specializujeme se na vyhledávání těch nejvýhodnějších nabídek na trhu. Pokud hledáte <strong>levný internet</strong> na doma, <strong>levnou televizi</strong> se spoustou programů nebo ten <strong>nejlevnější mobilní tarif</strong>, jste na správném místě. Spolupracujeme s velkými operátory i lokálními a zahraničními poskytovateli, abychom vám zajistili skutečně levné služby v telekomunikacích na míru vašim potřebám. Neplaťte zbytečně víc, než musíte.
          </p>
        </div>
      </section>

      {/* Footer / Logos */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-400 font-bold uppercase tracking-wider text-sm md:text-base">
          <div className="hover:text-gray-600 transition-colors cursor-default">Operátoři</div>
          <div className="hover:text-gray-600 transition-colors cursor-default">Lokální poskytovatelé</div>
          <div className="hover:text-gray-600 transition-colors cursor-default">Zahraniční poskytovatelé</div>
        </div>
      </footer>
    </div>
  );
}
