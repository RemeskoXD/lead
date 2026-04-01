import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Search, ShieldCheck, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Landing() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [services, setServices] = useState<string[]>(['Internet']);
  const [currentPrice, setCurrentPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calcMonthly, setCalcMonthly] = useState<number>(1500);

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
        body: JSON.stringify({ name, phone, email, services: services.join(', '), currentPrice }),
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <div className="text-2xl font-bold text-blue-800 tracking-tight">Optiva</div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Copy */}
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight">
            PLATÍTE ZA INTERNET VÍC, NEŽ MUSÍTE?
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
            Najdeme pro vás ty <strong>nejlevnější služby v telekomunikacích</strong>. Ať už hledáte levný <strong>internet</strong>, <strong>televizi</strong> nebo výhodný <strong>tarif</strong>, srovnáme nabídky a ušetříme vám peníze.
          </p>
          
          <div className="flex flex-col-reverse sm:flex-row items-center sm:items-end justify-between gap-6 sm:gap-8 pt-2 sm:pt-4">
            <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg md:text-xl text-gray-700 font-medium w-full sm:w-auto">
              <li className="flex items-center gap-3">
                <Check className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" strokeWidth={3} />
                Ušetříme vám až 3 000 Kč ročně
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" strokeWidth={3} />
                Zabere to 30 sekund
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" strokeWidth={2.5} />
                Spolupracujeme se všemi operátory
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" strokeWidth={3} />
                Zdarma a nezávazně
              </li>
              <li className="flex items-center gap-3">
                <Users className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" strokeWidth={2.5} />
                Už 12 000+ spokojených klientů
              </li>
            </ul>
            
            <img 
              src="https://web2.itnahodinu.cz/lead/sova.webp" 
              alt="Moudrá sova Optiva" 
              className="w-32 sm:w-48 lg:w-56 h-auto object-contain sm:-mr-8 lg:-mr-12 mb-4 sm:mb-0"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="relative">
          {/* Decorative background shape */}
          <div className="absolute -inset-4 bg-blue-100/50 rounded-3xl transform rotate-3 -z-10"></div>
          
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border border-gray-100 relative z-10">
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail (pro zaslání potvrzení)
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jan.novak@email.cz"
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



      {/* Sales Pitch & Calculator Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4">Proč si vybrat právě Optiva?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Nejsme jen další srovnávač. Jsme váš osobní vyjednavač ve světě telekomunikací. Získáme pro vás podmínky, na které byste sami nedosáhli.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Neveřejné nabídky</h3>
              <p className="text-gray-600">Máme přístup k exkluzivním tarifům a slevám, které operátoři běžně na svých webech nenabízejí.</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nezávislé srovnání</h3>
              <p className="text-gray-600">Nenadržujeme žádnému operátorovi. Vždy hledáme řešení, které je nejvýhodnější primárně pro vás.</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vše vyřídíme za vás</h3>
              <p className="text-gray-600">Od výpovědi u stávajícího poskytovatele až po hladký přechod k novému. Ušetříme vám čas i nervy.</p>
            </div>
          </div>

          {/* Calculator */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-6 sm:p-8 md:p-12 text-white flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Kalkulačka úspor</h3>
                <p className="text-blue-200 mb-8 text-base sm:text-lg">Spočítejte si, kolik peněz vám doslova protéká mezi prsty. Naši klienti průměrně ušetří 30 % ze svých stávajících výdajů.</p>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-2 gap-2 sm:gap-0">
                      <label className="font-medium text-blue-100">Vaše současná měsíční útrata</label>
                      <span className="font-bold text-xl">{calcMonthly} Kč</span>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max="5000" 
                      step="100"
                      value={calcMonthly}
                      onChange={(e) => setCalcMonthly(Number(e.target.value))}
                      className="w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer accent-green-400"
                    />
                    <div className="flex justify-between text-xs text-blue-300 mt-2">
                      <span>500 Kč</span>
                      <span>5 000 Kč</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-6 sm:space-y-8">
                  <div className="text-center p-5 sm:p-6 bg-green-50 rounded-2xl border border-green-100">
                    <div className="text-xs sm:text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Úspora za 1 rok</div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                      cca {Math.round(calcMonthly * 0.30 * 12).toLocaleString('cs-CZ')} Kč
                    </div>
                  </div>
                  
                  <div className="text-center p-5 sm:p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Úspora za 5 let</div>
                    <div className="text-4xl sm:text-5xl font-extrabold text-blue-900">
                      cca {Math.round(calcMonthly * 0.30 * 60).toLocaleString('cs-CZ')} Kč
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors shadow-lg shadow-blue-600/30"
                    >
                      Chci začít šetřit
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-3">
                      * Výpočet je pouze orientační simulace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
