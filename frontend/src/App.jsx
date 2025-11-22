// import React, { useState, useEffect, useCallback } from 'react';
// import { Zap, Trash2, BarChart2, CornerDownRight } from 'react-feather';
// import { useClientRouter } from './router'; // your existing client router
// import { SERVER_ORIGIN, REDIRECT_BASE_PATH } from './config';

// // Helper function with retry
// const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const res = await fetch(url, options);
//       return res;
//     } catch (err) {
//       if (i < retries - 1) await new Promise(r => setTimeout(r, backoff * (i + 1)));
//       else throw err;
//     }
//   }
// };

// // Dashboard Component
// const Dashboard = ({ links, isLoading, error, fetchLinks, navigate }) => {
//   const [newUrl, setNewUrl] = useState('');
//   const [creating, setCreating] = useState(false);
//   const [createError, setCreateError] = useState(null);

//   const handleCreate = async () => {
//     if (!newUrl) return;
//     setCreating(true);
//     setCreateError(null);
//     try {
//       const res = await fetchWithRetry(`${SERVER_ORIGIN}/api/links`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ targetUrl: newUrl }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Failed to create link');
//       setNewUrl('');
//       fetchLinks();
//     } catch (err) {
//       setCreateError(err.message);
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleDelete = async (code) => {
//     if (!confirm(`Delete link /${code}?`)) return;
//     try {
//       const res = await fetchWithRetry(`${SERVER_ORIGIN}/api/links/${code}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete');
//       fetchLinks();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
//         <Zap className="w-8 h-8 mr-2 text-indigo-600" /> Dashboard
//       </h1>

//       <div className="mb-6">
//         <input
//           type="url"
//           placeholder="Enter target URL"
//           value={newUrl}
//           onChange={(e) => setNewUrl(e.target.value)}
//           className="p-2 border rounded w-full md:w-1/2 mr-2"
//         />
//         <button
//           onClick={handleCreate}
//           disabled={creating}
//           className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//         >
//           {creating ? 'Creating...' : 'Create'}
//         </button>
//         {createError && <p className="text-red-500 mt-2">{createError}</p>}
//       </div>

//       {isLoading && <p className="text-indigo-600">Loading links...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {!isLoading && !error && links.length === 0 && <p>No links found.</p>}

//       {links.length > 0 && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white shadow rounded">
//             <thead>
//               <tr>
//                 <th className="px-4 py-2 text-left">Short Code</th>
//                 <th className="px-4 py-2 text-left">Target URL</th>
//                 <th className="px-4 py-2 text-left">Clicks</th>
//                 <th className="px-4 py-2">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {links.map((link) => (
//                 <tr key={link.shortCode} className="border-t">
//                   <td className="px-4 py-2 font-mono text-indigo-600">/{link.shortCode}</td>
//                   <td className="px-4 py-2 break-all">{link.targetUrl}</td>
//                   <td className="px-4 py-2">{link.totalClicks}</td>
//                   <td className="px-4 py-2 flex space-x-2">
//                     <button onClick={() => navigate(`/code/${link.shortCode}`)} className="text-green-600 hover:text-green-800">
//                       Stats
//                     </button>
//                     <button onClick={() => handleDelete(link.shortCode)} className="text-red-500 hover:text-red-700">
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// // Stats Page Component
// const StatsPage = ({ code, navigate }) => {
//   const [stats, setStats] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const res = await fetchWithRetry(`${SERVER_ORIGIN}/api/links/${code}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
//         setStats(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchStats();
//   }, [code]);

//   const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : 'N/A');

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       <button onClick={() => navigate('/')} className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center">
//         <CornerDownRight className="w-4 h-4 mr-2 rotate-180" /> Back
//       </button>

//       {isLoading && <p>Loading stats...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {stats && (
//         <div className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <h2 className="font-bold text-lg">Target URL</h2>
//             <p className="break-all">{stats.targetUrl}</p>
//           </div>
//           <div>
//             <h2 className="font-bold text-lg">Total Clicks</h2>
//             <p>{stats.totalClicks}</p>
//           </div>
//           <div>
//             <h2 className="font-bold text-lg">Short Code</h2>
//             <p className="font-mono">{stats.shortCode}</p>
//           </div>
//           <div>
//             <h2 className="font-bold text-lg">Created At</h2>
//             <p>{formatDate(stats.createdAt)}</p>
//           </div>
//           <div>
//             <h2 className="font-bold text-lg">Last Clicked</h2>
//             <p>{formatDate(stats.lastClicked)}</p>
//           </div>
//           <div>
//             <h2 className="font-bold text-lg">Full Link</h2>
//             <a href={`${SERVER_ORIGIN}${REDIRECT_BASE_PATH}${stats.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline break-all">
//               {SERVER_ORIGIN}{REDIRECT_BASE_PATH}{stats.shortCode}
//             </a>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Main App
// const App = () => {
//   const { path, navigate } = useClientRouter();
//   const [links, setLinks] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchLinks = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetchWithRetry(`${SERVER_ORIGIN}/api/links`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Failed to fetch links');
//       data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setLinks(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchLinks();
//   }, [fetchLinks]);

//   const renderContent = () => {
//     const parts = path.split('/').filter(Boolean);
//     if (parts.length === 0 || path === '/') {
//       return <Dashboard links={links} isLoading={isLoading} error={error} fetchLinks={fetchLinks} navigate={navigate} />;
//     }
//     if (parts.length === 2 && parts[0] === 'code') {
//       return <StatsPage code={parts[1]} navigate={navigate} />;
//     }
//     return <div className="text-center p-8">404: Page Not Found</div>;
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 font-sans antialiased">
//       <header className="bg-white shadow p-4 flex justify-between items-center">
//         <h1 onClick={() => navigate('/')} className="text-2xl font-bold text-indigo-600 cursor-pointer flex items-center">
//           <Zap className="w-6 h-6 mr-1" /> TinyLink
//         </h1>
//       </header>
//       <main className="p-4">{renderContent()}</main>
//     </div>
//   );
// };

// export default App;




// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Clipboard, Trash2, BarChart2, CornerDownRight, XCircle, Zap } from 'lucide-react';
import { SERVER_ORIGIN } from './config';

const API_BASE = `${SERVER_ORIGIN}/api/links`;
const REDIRECT_BASE_PATH = '/';

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if ([400, 404, 409].includes(response.status)) {
        const errorBody = await response.json().catch(() => ({ error: `Server responded with ${response.status}` }));
        throw new Error(errorBody.error || `HTTP error! Status: ${response.status}`);
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    } catch (err) {
      lastError = err;
      await new Promise(res => setTimeout(res, 2 ** i * 1000));
    }
  }
  throw lastError;
};

const useClientRouter = () => {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);
  const navigate = useCallback(newPath => {
    window.history.pushState({}, '', `${window.location.origin}${newPath}`);
    setPath(newPath);
  }, []);
  return { path, navigate };
};

const CreateLink = ({ onLinkCreated }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidUrl = useMemo(() => targetUrl.startsWith('http'), [targetUrl]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValidUrl) return;
    setIsLoading(true);
    try {
      const res = await fetchWithRetry(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Link created! /${data.shortCode}`);
        setTargetUrl('');
        onLinkCreated();
      } else {
        toast.error(data.error || 'Failed to create link');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl mx-auto mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center">
        <CornerDownRight className="w-5 h-5 mr-2 text-indigo-500" /> Create New TinyLink
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="url"
            placeholder="https://..."
            value={targetUrl}
            onChange={e => setTargetUrl(e.target.value)}
            required
            className={`mt-1 block w-full p-3 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${!isValidUrl && targetUrl ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        <button
          type="submit"
          disabled={!isValidUrl || isLoading}
          className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Shorten URL'}
        </button>
      </form>
    </div>
  );
};

const Dashboard = ({ links, isLoading, fetchLinks, navigate }) => {
  const [deleteStatus, setDeleteStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const filteredLinks = useMemo(() => links.filter(link =>
    link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.targetUrl.toLowerCase().includes(searchTerm.toLowerCase())
  ), [links, searchTerm]);

  const handleCopy = code => {
    navigator.clipboard.writeText(`${SERVER_ORIGIN}${REDIRECT_BASE_PATH}${code}`);
    toast.success(`Copied /${code} to clipboard!`);
  };

  const handleDelete = async code => {
    if (!window.confirm(`Delete /${code}?`)) return;
    setDeleteStatus(prev => ({ ...prev, [code]: 'loading' }));
    try {
      await fetchWithRetry(`${API_BASE}/${code}`, { method: 'DELETE' });
      setDeleteStatus(prev => ({ ...prev, [code]: 'success' }));
      toast.success(`Deleted /${code}`);
      fetchLinks();
    } catch (err) {
      setDeleteStatus(prev => ({ ...prev, [code]: 'error' }));
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <CreateLink onLinkCreated={fetchLinks} />
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-center">All TinyLinks</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-4 w-full p-2 border rounded-lg"
        />
        {isLoading ? (
          <p className="text-center text-indigo-600">Loading links...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Short Code</th>
                  <th className="px-4 py-2 text-left">Target URL</th>
                  <th className="px-4 py-2 text-left">Clicks</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLinks.map(link => (
                  <tr key={link.shortCode} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-indigo-600 font-mono">
                      <a href={`${SERVER_ORIGIN}${REDIRECT_BASE_PATH}${link.shortCode}`} target="_blank" rel="noopener noreferrer">
                        /{link.shortCode}
                      </a>
                    </td>
                    <td className="px-4 py-2 truncate max-w-xs">{link.targetUrl}</td>
                    <td className="px-4 py-2 font-semibold">{link.totalClicks}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleCopy(link.shortCode)} title="Copy">
                        <Clipboard className="w-5 h-5 text-gray-500 hover:text-indigo-600" />
                      </button>
                      <button onClick={() => navigate(`/code/${link.shortCode}`)} title="Stats">
                        <BarChart2 className="w-5 h-5 text-gray-500 hover:text-green-600" />
                      </button>
                      <button onClick={() => handleDelete(link.shortCode)} disabled={deleteStatus[link.shortCode] === 'loading'} title="Delete">
                        {deleteStatus[link.shortCode] === 'loading' ? '...' : <Trash2 className="w-5 h-5 text-red-600" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLinks.length === 0 && <p className="text-center mt-4 text-gray-500">No links found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const StatsPage = ({ code, navigate }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetchWithRetry(`${API_BASE}/${code}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [code]);

  if (isLoading) return <p className="text-center mt-8">Loading stats...</p>;
  if (!stats) return <p className="text-center mt-8 text-red-600">No stats found.</p>;

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <button onClick={() => navigate('/')} className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center mx-auto">
        <CornerDownRight className="w-4 h-4 mr-2 rotate-180" /> Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Stats for /{stats.shortCode}</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
        <div className="text-indigo-600 font-mono text-lg break-all">{stats.targetUrl}</div>
        <div className="text-2xl font-extrabold text-green-600">Total Clicks: {stats.totalClicks}</div>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div>Created At: {new Date(stats.createdAt).toLocaleString()}</div>
          <div>Last Clicked: {stats.lastClicked ? new Date(stats.lastClicked).toLocaleString() : 'Never'}</div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { path, navigate } = useClientRouter();
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry(API_BASE);
      const data = await res.json();
      setLinks(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const renderContent = () => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return <Dashboard links={links} isLoading={isLoading} fetchLinks={fetchLinks} navigate={navigate} />;
    if (parts.length === 2 && parts[0] === 'code') return <StatsPage code={parts[1]} navigate={navigate} />;
    return <p className="text-center mt-8 text-red-600">404 - Page Not Found</p>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <ToastContainer position="top-right" />
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-600 flex items-center"><Zap className="w-8 h-8 mr-2" />TinyLink</h1>
      </header>
      <main className="w-full flex-1">{renderContent()}</main>
      <footer className="mt-8 text-sm text-gray-500">TinyLink | Backend: Express + MySQL | Frontend: React/Tailwind</footer>
    </div>
  );
};

export default App;
