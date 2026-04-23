import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, PanelLeft, MessageSquare, Send, Zap, Bot, Database, Code, Shield, Brain, Globe, ChevronDown, Paperclip, ArrowUp, FileUp, HardDrive, Image as ImageIcon, Laptop, FileText, Check, User, Trash2, Download, BarChart2, Table, ImagePlus, Square } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

const DEFAULT_NEWS = [
  "México alcanzó cifra récord de producción automotriz en 2026.",
  "Estrategia: El sector se mueve hacia los Software-Defined Vehicles (SDVs).",
  "Tecnología: Los Smart Tires con IoT ya son prioridad para flotas logísticas.",
  "Dato Curioso: Michelin produjo su primera llanta para bicicleta en 1891.",
  "Logística: El 88% de las exportaciones automotrices de México van a Norteamérica."
];




const MessageDataViewer = ({ registros, tiempos, sql_query, total_registros }) => {
  const [activeView, setActiveView] = useState('table');
  const chartContainerRef = useRef(null);

  if (!registros || registros.length === 0) return null;

  const downloadCSV = async () => {
    if (sql_query && total_registros > registros.length) {
      try {
        const resp = await fetch('http://localhost:8000/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: sql_query })
        });
        if (!resp.ok) throw new Error("Fallo la exportación completa");
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_nieto_completo_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (err) {
        console.warn("Exportación completa desde BD falló, usando fallback local", err);
      }
    }

    // Exportación local (fallback o si registros es pequeño)
    const keys = Object.keys(registros[0]);
    const csvContent = [
      keys.join(','),
      ...registros.map(row => keys.map(k => {
        const val = row[k] === null ? '' : String(row[k]);
        return val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');

    // El prefijo \ufeff (BOM) ayuda a que Excel reconozca el UTF-8
    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `datos_nieto_muestreado_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPNG = () => {
    if (!chartContainerRef.current) return;
    const svgElement = chartContainerRef.current.querySelector('svg');
    if (!svgElement) {
      console.error("No se encontró el elemento SVG de la gráfica");
      return;
    }

    try {
      const scale = 3; // Renderizado HD a 3x
      const rect = svgElement.getBoundingClientRect();
      const clone = svgElement.cloneNode(true);

      // Forzar el viewBox para evitar cortes y escalar vectorialmente antes de rasterizar
      if (!clone.getAttribute('viewBox')) {
        clone.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      }

      clone.setAttribute('width', rect.width * scale);
      clone.setAttribute('height', rect.height * scale);
      clone.style.backgroundColor = '#ffffff';

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clone);
      if (!svgString.includes('xmlns=')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Dibujamos usando las dimensiones HD definidas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `grafica_nieto_HD_${Date.now()}.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (error) {
      console.error("Error convirtiendo SVG a PNG HD:", error);
    }
  };

  let stringKey = null;
  let numberKey = null;

  if (registros.length > 0) {
    const sample = registros.find(r => r);
    if (sample) {
      for (const key of Object.keys(sample)) {
        if (typeof sample[key] === 'string' && !stringKey) stringKey = key;
        if (typeof sample[key] === 'number' && !numberKey) numberKey = key;
      }
    }
  }

  const canChart = stringKey && numberKey && registros.length > 1;

  return (
    <div className="mt-4 glass-card overflow-hidden animate-in fade-in duration-300">
      <div className="px-4 py-3 border-b border-black/10 flex justify-between items-center flex-wrap gap-2">
        <div className="flex bg-black/5 p-1 rounded-lg">
          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeView === 'table' ? 'bg-black/10 text-cyan-400 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Table className="w-3.5 h-3.5" /> Tabla
          </button>
          {canChart && (
            <button
              onClick={() => setActiveView('chart')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeView === 'chart' ? 'bg-black/10 text-cyan-400 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Gráfica
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-[11px] font-medium text-slate-500 hidden sm:flex">
            {tiempos && <span>IA: {tiempos.ia_segundos}s</span>}
            {tiempos && <span>DB: {tiempos.bd_segundos}s</span>}
            <span>Filas: {total_registros && total_registros > registros.length ? `${total_registros} (Top ${registros.length})` : registros.length}</span>
          </div>
          <div className="w-px h-4 bg-black/10 hidden sm:block"></div>
          {activeView === 'table' ? (
            <button onClick={downloadCSV} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-cyan-400 transition-colors bg-black/5 border border-black/10 hover:border-cyan-400/30 px-2.5 py-1.5 rounded-lg shadow-sm group">
              <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              CSV
            </button>
          ) : (
            <button onClick={downloadPNG} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-cyan-400 transition-colors bg-black/5 border border-black/10 hover:border-cyan-400/30 px-2.5 py-1.5 rounded-lg shadow-sm group">
              <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              PNG
            </button>
          )}
        </div>
      </div>

      <div className="bg-transparent relative">
        {activeView === 'table' ? (
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-black/5 text-slate-600 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  {Object.keys(registros[0]).map((k) => (
                    <th key={k} className="px-4 py-3 font-semibold border-b border-black/10 whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registros.slice(0, 50).map((fila, idx) => (
                  <tr key={idx} className="hover:bg-black/5 transition-colors">
                    {Object.values(fila).map((val, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-700 max-w-[200px] truncate">
                        {val === null ? <span className="text-slate-500 italic">null</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full h-[350px] p-6 pr-8 bg-transparent" ref={chartContainerRef}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registros.slice(0, 30)} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={stringKey} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey={numberKey} fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const OrbisStatusBubble = ({ isLoading, newsIndex, newsData }) => {
  if (!isLoading) return null;

  return (
    <div className="flex flex-col items-start gap-1 px-5 py-3 glass-card animate-in slide-in-from-left-4 duration-500 max-w-[350px]">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Pensando...</span>
      </div>
      <div className="min-h-[32px] flex items-center">
        <p className="text-[11px] leading-tight text-rainbow transition-opacity duration-500">
          {newsData[newsIndex]}
        </p>
      </div>
    </div>
  );
};

const OrbisFace = ({ emotion, size = 'large' }) => {
  const isSmall = size === 'small';

  // Determine which video to play based on emotion state (added ?v=2 to clear browser cache)
  const videoFile = emotion === 'idle' ? '/orbis-idle.webm?v=2' : '/orbis-thinking.webm?v=2';

  const getAnimationClass = () => {
    switch (emotion) {
      case 'idle': return 'animate-floating';
      case 'error':
      case 'sad': return 'grayscale opacity-80 scale-95';
      default: return 'scale-[1.05] drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]';
    }
  };

  return (
    <div className={`relative flex items-center justify-center transition-all duration-500 ease-in-out ${isSmall ? 'w-14 h-14' : 'w-48 h-48 mb-6'} ${getAnimationClass()}`}>
      
      {/* Circular Avatar Container */}
      <div className={`relative w-full h-full rounded-full overflow-hidden ${isSmall ? 'border-[3px]' : 'border-[6px]'} border-white bg-white shadow-[0_10px_25px_rgba(0,0,0,0.15)] z-10 flex items-center justify-center ring-4 ring-slate-100/50`}>
        
        {/* Inner shadow for slight depth */}
        <div className="absolute inset-0 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] rounded-full z-10 pointer-events-none"></div>

        {/* The Video */}
        <video 
          key={videoFile}
          src={videoFile} 
          autoPlay 
          loop 
          muted 
          playsInline
          className={`w-full h-full object-cover object-center ${isSmall ? 'scale-[1.4]' : 'scale-[1.25]'} z-0 pointer-events-none`}
        />
      </div>

    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [emotion, setEmotion] = useState('idle');
  const typingTimeoutRef = useRef(null);

  const [showHerramientas, setShowHerramientas] = useState(false);
  const [showModelos, setShowModelos] = useState(false);
  const [deepThink, setDeepThink] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [modeloActual, setModeloActual] = useState('Razonamiento');
  const [newsIndex, setNewsIndex] = useState(0);
  const [newsData, setNewsData] = useState(DEFAULT_NEWS);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const resp = await fetch('http://localhost:8000/api/news');
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.length > 0) setNewsData(data);
        }
      } catch (err) {
        console.warn("No se pudieron cargar noticias dinámicas, usando fallback.");
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setNewsIndex(prev => (prev + 1) % newsData.length);
      }, 15000);
    } else {
      setNewsIndex(prev => Math.floor(Math.random() * newsData.length));
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatNieto_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const herramientasRef = useRef(null);
  const modelosRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (herramientasRef.current && !herramientasRef.current.contains(event.target)) setShowHerramientas(false);
      if (modelosRef.current && !modelosRef.current.contains(event.target)) setShowModelos(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('chatNieto_history', JSON.stringify(chatHistory));
    } catch (e) {
      console.warn("Storage quota exceeded. No se pudo guardar el historial completo.");
    }
  }, [chatHistory]);

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistory(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const cleanMsgs = messages.map(m => {
            if (m.registros && m.registros.length > 50) {
              return { ...m, registros: m.registros.slice(0, 50) };
            }
            return m;
          });
          return { ...chat, messages: cleanMsgs, updatedAt: Date.now() };
        }
        return chat;
      }));
    }
  }, [messages, currentChatId]);

  const formatDaysAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const chatDate = new Date(timestamp);
    now.setHours(0, 0, 0, 0);
    chatDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(now - chatDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;

    const realDate = new Date(timestamp);
    return realDate.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setCurrentChatId(null);
    setEmotion('idle');
    setIsLoading(false);
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!isLoading) {
      if (e.target.value.trim().length > 0) {
        setEmotion('typing');
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setEmotion('idle');
        }, 1500);
      } else {
        setEmotion('idle');
      }
    }
  };

  const handleSubmit = async (e, directText = null) => {
    if (e?.preventDefault) e.preventDefault();
    
    const textToSubmit = directText || input;
    if (!textToSubmit.trim() || isLoading) return;

    const userMessage = textToSubmit.trim();
    if (!directText) setInput('');

    const newMessages = [...messages, { id: Date.now(), role: 'user', content: userMessage }];
    setMessages(newMessages);

    if (!currentChatId) {
      const newId = Date.now().toString();
      setCurrentChatId(newId);

      let title = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;

      setChatHistory(prev => [{
        id: newId,
        title: title,
        updatedAt: Date.now(),
        messages: newMessages
      }, ...prev]);
    }

    setIsLoading(true);
    setEmotion('thinking');

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: userMessage,
          historial: messages.map(m => ({ role: m.role, content: m.content })),
          modelo: modeloActual
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();

      if (data.registros && data.registros.length === 0) {
        setEmotion('sad');
      } else {
        setEmotion('happy');
      }

      let parsedContent = data.mensaje || "Respuesta procesada exitosamente.";
      let extractedSugerencias = data.sugerencias || [];

      // Extraer sugerencias si la IA las mandó en formato de texto Markdown
      const lines = parsedContent.split('\n');
      const cleanLines = [];
      lines.forEach(line => {
        const match = line.match(/^\s*(?:\*\*)?SUGERENCIA:(?:\*\*)?\s*(.*)/i);
        if (match) {
          let sugText = match[1].trim();
          sugText = sugText.replace(/^["*]+|["*]+$/g, '').trim(); // Limpiar comillas o asteriscos
          if (sugText) extractedSugerencias.push(sugText);
        } else {
          cleanLines.push(line);
        }
      });
      
      parsedContent = cleanLines.join('\n').trim();

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: parsedContent,
        sugerencias: extractedSugerencias,
        sql: data.sql_generado,
        registros: data.datos,
        tiempos: data.tiempos,
        total_registros: data.total_registros,
        isError: false
      }]);

    } catch (error) {
      if (error.name === 'AbortError') {
        setEmotion('idle');
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: 'Detenido por el usuario.',
          isError: true,
          isAborted: true
        }]);
      } else {
        setEmotion('error');
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: `Error de red: ${error.message}. Por favor revisa la consola del backend.`,
          isError: true
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const menuHerramientas = [
    { icon: <FileUp className="w-4 h-4" />, label: 'Subir archivos' },
    { icon: <HardDrive className="w-4 h-4" />, label: 'Añadir desde Drive' },
    { icon: <ImageIcon className="w-4 h-4" />, label: 'Fotos' },
  ];

  const menuModelos = [
    { key: 'Fast', label: 'Fast', desc: 'Responde rápidamente' },
    { key: 'Razonamiento', label: 'Razonamiento', desc: 'Resuelve problemas complejos' },
    { key: 'Ultra', label: 'Multillantas AI Ultra', desc: 'Acceso corporativo ilimitado a BD' },
  ];

  const renderOrbisHUD = (isCentered = true) => (
    <div className={`flex flex-col items-center justify-center transition-all duration-700 ${isCentered ? 'mb-12' : 'scale-90 opacity-90'}`}>
      <div className="flex items-center gap-6 relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <OrbisFace emotion={emotion} />
        <OrbisStatusBubble isLoading={isLoading} newsIndex={newsIndex} newsData={newsData} />
      </div>

      <div className={`flex flex-col items-center justify-center animate-in fade-in duration-1000 ${isCentered ? 'mb-8' : 'mb-2'}`}>
        <h1 className="text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-cyan-600 leading-none drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          ORBIS
        </h1>
        <p className="text-[9px] font-bold text-cyan-400 tracking-[0.5em] uppercase mt-2">
          Inteligencia Artificial Nieto
        </p>
      </div>
    </div>
  );

  const renderInputBox = (isCentered = false) => (
    <div className={`w-full px-4 md:px-0 relative z-20 ${isCentered ? 'max-w-3xl mx-auto mt-6' : 'max-w-4xl mx-auto pb-8'}`}>

      {isCentered && renderOrbisHUD(true)}

      <div className="glass-input p-2.5 w-full relative">

        <div className="px-2 pt-1 pb-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={deepThink ? "Razonamiento profundo activo..." : "Escribe tu consulta para ORBIS..."}
            className="w-full min-h-[48px] max-h-32 bg-transparent text-slate-800 placeholder-slate-400 text-lg resize-none focus:outline-none pl-4 pt-3"
            rows={1}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between mt-1 px-1 relative">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="relative" ref={herramientasRef}>
              <button
                type="button"
                onClick={() => setShowHerramientas(!showHerramientas)}
                className={`flex items-center justify-center p-3 rounded-full transition-all ${showHerramientas ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-600 hover:bg-black/5 hover:text-cyan-300'}`}
              >
                <Plus className="w-5 h-5" />
              </button>

              {showHerramientas && (
                <div className={`absolute left-0 mb-3 w-56 bg-white/90 backdrop-blur-2xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in bottom-full slide-in-from-bottom-2`}>
                  {menuHerramientas.map((item, i) => (
                    <button key={i} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-black/5 flex items-center gap-3 transition-colors">
                      <span className="text-slate-600">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDeepThink(!deepThink)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${deepThink ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-transparent border-transparent text-slate-500 hover:bg-black/5 hover:text-slate-700'}`}
            >
              <Brain className={`w-4 h-4 ${deepThink ? 'text-cyan-400' : ''}`} />
              Pensamiento Profundo
            </button>
          </div>

          <div className="flex items-center gap-3 mr-4">
            <div className="relative hidden md:block" ref={modelosRef}>
              <button
                type="button"
                onClick={() => setShowModelos(!showModelos)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                {modeloActual} <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showModelos && (
                <div className={`absolute right-0 mb-3 w-80 bg-white/90 backdrop-blur-2xl border border-black/10 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in bottom-full slide-in-from-bottom-2`}>
                  {menuModelos.map((mod) => (
                    <button
                      key={mod.key}
                      onClick={() => { setModeloActual(mod.label); setShowModelos(false); }}
                      className="w-full text-left px-4 py-3 rounded-2xl hover:bg-black/5 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className={`text-base font-medium ${modeloActual === mod.label ? 'text-cyan-600' : 'text-slate-800'}`}>
                          {mod.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{mod.desc}</div>
                      </div>
                      {modeloActual === mod.label && <Check className="w-5 h-5 text-cyan-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoading ? (
              <button
                type="button"
                onClick={stopGenerating}
                className="w-11 h-11 flex items-center justify-center rounded-full transition-all flex-shrink-0 bg-red-500 hover:bg-red-600 text-white shadow-lg border border-red-400"
                title="Detener generación"
              >
                <Square className="w-4 h-4 fill-current text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all flex-shrink-0
                       ${!input.trim()
                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_5px_15px_rgba(34,211,238,0.4)] border border-cyan-400/50'}`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`text-center mt-3 text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase ${isCentered ? 'mt-6' : ''}`}>
        ORBIS | Motor de Inteligencia Nieto
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-transparent text-slate-800 font-sans relative overflow-hidden">
      {isSidebarOpen && (
        <div className="w-[300px] flex-shrink-0 glass-panel hidden md:flex flex-col animate-in slide-in-from-left-4 duration-300 z-40 relative border-r-0 border-y-0 rounded-r-3xl my-2 ml-2">
          
          {/* El Logo Superior del Sidebar fue removido para ahorrar espacio */}

          <div className="p-4 flex items-center gap-2">
            <button onClick={handleNewChat} className="flex-1 flex items-center justify-center gap-2 glass-card hover:bg-black/10 text-cyan-400 px-4 py-3 font-semibold transition-all shadow-lg group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Nuevo Chat
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-3 text-slate-500 hover:bg-black/5 hover:text-cyan-400 rounded-xl transition-all" title="Ocultar panel">
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin">
            {chatHistory.length > 0 && <div className="text-[10px] font-bold text-slate-500/70 mb-4 ml-2 uppercase tracking-[0.2em] mt-2">Consultas Recientes</div>}

            {chatHistory.map((chat) => (
              <div key={chat.id} className="relative group mb-2">
                <button
                  onClick={() => { setMessages(chat.messages); setCurrentChatId(chat.id); }}
                  className={`w-full flex items-center justify-between text-sm rounded-xl px-4 py-3 max-w-full transition-all ${currentChatId === chat.id ? 'sidebar-item-active font-semibold shadow-lg' : 'text-slate-700 hover:bg-black/5 bg-transparent'}`}
                >
                  <div className="flex items-center gap-3 truncate max-w-[85%]">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentChatId === chat.id ? 'text-cyan-400' : 'text-slate-500/50'}`} />
                    <div className="flex flex-col items-start truncate">
                      <span className="truncate w-full text-left">{chat.title}</span>
                      <span className={`text-[10px] font-medium mt-0.5 ${currentChatId === chat.id ? 'text-cyan-400/70' : 'text-slate-500/70'}`}>{formatDaysAgo(chat.updatedAt)}</span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatHistory(prev => prev.filter(c => c.id !== chat.id));
                    if (currentChatId === chat.id) {
                      setMessages([]);
                      setCurrentChatId(null);
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs ring-1 ring-cyan-500/30">
                MN
              </div>
              <div className="text-sm font-semibold text-slate-800">Multillantas Nieto</div>
            </div>
          </div>
        </div>
      )}


      <div className="flex-1 flex flex-col relative h-full w-full overflow-hidden">
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          {!isSidebarOpen && (
            <>
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-slate-500 hover:text-cyan-600 bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-md rounded-xl transition-all hidden md:flex" title="Abrir barra lateral">
                <PanelLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNewChat} className="p-2.5 text-slate-500 hover:text-cyan-600 bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-md rounded-xl transition-all hidden md:flex" title="Nuevo chat">
                <Plus className="w-5 h-5" />
              </button>
            </>
          )}
          <button className={`p-2 -ml-2 text-gray-500 hover:text-gray-800 rounded-md md:hidden ${!isSidebarOpen ? 'hidden' : ''}`}>
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-8 px-4 animate-in fade-in duration-500 w-full relative">
            {renderInputBox(true)}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 md:px-0">
              <div className="max-w-3xl mx-auto py-6 space-y-8">
                {messages.map((msg, idx) => (
                  <div key={msg.id} className="flex gap-5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-shrink-0 mt-1">
                      {msg.role === 'user' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-cyan-400/30">
                          <User className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-6 -ml-1">
                          <div className="w-14 h-14 flex items-center justify-center">
                            <OrbisFace emotion={idx === messages.length - 1 ? emotion : 'idle'} size="small" />
                          </div>
                          {idx === messages.length - 1 && isLoading && (
                            <OrbisStatusBubble isLoading={isLoading} newsIndex={newsIndex} newsData={newsData} />
                          )}
                        </div>
                      )}
                    </div>

                    <div className={`flex-1 space-y-3 max-w-full overflow-hidden ${msg.role === 'user' ? 'pt-1.5' : 'glass-card p-5'}`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-3 border-b border-black/5 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 glow-text">
                            ORBIS System
                          </span>
                        </div>
                      )}
                      <div className={`prose  prose-sm md:prose-base max-w-none leading-relaxed ${msg.role === 'user' ? 'text-slate-800 text-lg font-medium pl-2' : 'text-slate-700'} ${msg.isError ? 'text-red-400 bg-red-400/5 p-4 rounded-2xl border border-red-400/20' : ''}`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {msg.role === 'assistant' && msg.registros && msg.registros.length === 0 && !msg.isError && (
                        <span className="block mt-2 text-xs text-slate-500 italic">No encontré información sobre esto en la base de datos de Nieto.</span>
                      )}

                      {msg.role === 'assistant' && msg.sql && msg.registros?.length > 0 && (
                        <MessageDataViewer registros={msg.registros} tiempos={msg.tiempos} sql_query={msg.sql} total_registros={msg.total_registros} />
                      )}

                      {msg.role === 'assistant' && msg.sugerencias && msg.sugerencias.length > 0 && !msg.isError && (
                        <div className="mt-6 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                          {msg.sugerencias.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => handleSubmit(null, sug)}
                              className="px-4 py-2.5 text-[12px] font-semibold text-cyan-400 bg-black/5 hover:bg-black/10 rounded-xl border border-black/10 transition-all text-left shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-5 animate-in fade-in">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center gap-6 -ml-1">
                        <div className="w-14 h-14 flex items-center justify-center">
                          <OrbisFace emotion={emotion} size="small" />
                        </div>
                        <OrbisStatusBubble isLoading={isLoading} newsIndex={newsIndex} newsData={newsData} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endOfMessagesRef} className="h-4" />
              </div>
            </div>

            {renderInputBox(false)}
          </>
        )}
      </div>
    </div>
  );
}
