import { useEffect, useState } from 'react';
import { Search, Lock, LogOut } from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  phone: string;
  service: string;
  current_price: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function Admin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchLeads(token);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        fetchLeads(data.token);
      } else {
        setLoginError('Špatné jméno nebo heslo.');
      }
    } catch (err) {
      setLoginError('Chyba připojení k serveru.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setLeads([]);
  };

  const fetchLeads = async (tokenOverride?: string) => {
    setLoading(true);
    const token = tokenOverride || localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      setError('Nepodařilo se načíst data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/leads/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      } else {
        alert('Nepodařilo se změnit status.');
      }
    } catch (err) {
      alert('Chyba připojení k serveru.');
    }
  };

  const handleNoteChange = async (id: number, newNote: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/leads/${id}/notes`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: newNote }),
      });
      
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        setLeads(leads.map(lead => lead.id === id ? { ...lead, notes: newNote } : lead));
      } else {
        alert('Nepodařilo se uložit poznámku.');
      }
    } catch (err) {
      alert('Chyba připojení k serveru.');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      lead.service.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hotovo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Nezvedá': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Storno': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Přihlášení do administrace</h1>
          
          {loginError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uživatelské jméno</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Přihlásit se
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administrace Leadů</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Hledat jméno, telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
              />
            </div>
            <button 
              onClick={() => fetchLeads()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Obnovit data
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Datum</th>
                  <th className="p-4 font-semibold">Jméno</th>
                  <th className="p-4 font-semibold">Telefon</th>
                  <th className="p-4 font-semibold">Služby</th>
                  <th className="p-4 font-semibold">Platí</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold w-64">Poznámka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Načítám data...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      {searchQuery ? 'Žádné leady neodpovídají hledání.' : 'Zatím nemáte žádné leady.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-500 text-sm">#{lead.id}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleString('cs-CZ')}
                      </td>
                      <td className="p-4 font-medium text-gray-900">{lead.name}</td>
                      <td className="p-4 text-gray-600 font-mono">{lead.phone}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.service.split(', ').map(s => (
                            <span key={s} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-gray-900 font-medium">
                        {lead.current_price && lead.current_price !== 'Nezadáno' ? lead.current_price : '-'}
                      </td>
                      <td className="p-4">
                        <select
                          value={lead.status || 'Nové'}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`text-sm font-medium rounded-full px-3 py-1 border outline-none cursor-pointer appearance-none ${getStatusColor(lead.status || 'Nové')}`}
                        >
                          <option value="Nové">Nové</option>
                          <option value="Hotovo">Hotovo</option>
                          <option value="Nezvedá">Nezvedá</option>
                          <option value="Storno">Storno</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <textarea
                          defaultValue={lead.notes || ''}
                          onBlur={(e) => handleNoteChange(lead.id, e.target.value)}
                          placeholder="Přidat poznámku..."
                          className="w-full text-sm p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[40px] bg-gray-50 focus:bg-white transition-colors"
                          rows={2}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
