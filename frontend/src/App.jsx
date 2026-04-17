import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, PanelLeft, MessageSquare, Send, Zap, Bot, Database, Code, Shield, Brain, Globe, ChevronDown, Paperclip, ArrowUp, FileUp, HardDrive, Image as ImageIcon, Laptop, FileText, Check, User, Trash2, Download, BarChart2, Table, ImagePlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

const BmoFace = ({ emotion }) => {
  const faceColor = '#111827';
  const faceColorDull = 'rgba(17,24,39,0.3)';

  const renderEyes = () => {
    switch(emotion) {
      case 'happy':
        return (
          <>
            <div className="w-3.5 h-3.5 border-t-[4px] border-l-[4px] rounded-tl-[10px] rotate-45 transform translate-y-1" style={{borderColor: faceColor}}></div>
            <div className="w-3.5 h-3.5 border-t-[4px] border-r-[4px] rounded-tr-[10px] -rotate-45 transform translate-y-1" style={{borderColor: faceColor}}></div>
          </>
        );
      case 'sad':
      case 'error':
        return (
          <>
            <div className="w-3.5 h-1.5 border-b-[4px] rounded-full rotate-12 mt-1" style={{borderColor: faceColor}}></div>
            <div className="w-3.5 h-1.5 border-b-[4px] rounded-full -rotate-12 mt-1" style={{borderColor: faceColor}}></div>
          </>
        );
      case 'thinking':
        return (
          <>
            <div className="w-3.5 h-3.5 rounded-full animate-bounce" style={{backgroundColor: faceColor}}></div>
            <div className="w-3.5 h-3.5 rounded-full animate-bounce delay-75" style={{backgroundColor: faceColor}}></div>
          </>
        );
      case 'searching':
        return (
          <>
            <div className="w-4 h-4 border-[3px] rounded-full animate-[ping_1.5s_infinite_reverse]" style={{borderColor: faceColor}}></div>
            <div className="w-4 h-4 border-[3px] rounded-full animate-[ping_1.5s_infinite_reverse] delay-75" style={{borderColor: faceColor}}></div>
          </>
        );
      case 'building':
        return (
          <>
            <div className="w-4 h-1.5 border-b-[4px] rounded-full mt-1" style={{borderColor: faceColor}}></div>
            <div className="w-3 rounded-full overflow-hidden flex items-center" style={{height: "14px", backgroundColor: faceColor}}>
                <div className="w-full h-[4px] bg-white animate-[pulse_0.5s_infinite]"></div>
            </div>
          </>
        );
      case 'typing':
        return (
          <>
             <div className="w-3.5 h-[4px] rounded-sm animate-pulse transition-all" style={{backgroundColor: faceColor}}></div>
             <div className="w-3.5 h-[4px] rounded-sm animate-pulse delay-75 transition-all" style={{backgroundColor: faceColor}}></div>
          </>
        );
      case 'talk':
      default: // idle
        return (
          <>
             <div className="w-3 h-3 rounded-full animate-pulse transition-all duration-300" style={{backgroundColor: faceColor}}></div>
             <div className="w-3 h-3 rounded-full animate-pulse delay-75 transition-all duration-300" style={{backgroundColor: faceColor}}></div>
          </>
        );
    }
  };

  const renderMouth = () => {
    switch(emotion) {
      case 'happy':
        return <div className="w-6 h-3 rounded-b-full rounded-t-[1px]" style={{backgroundColor: faceColor}}></div>;
      case 'sad':
      case 'error':
        return <div className="w-5 h-2.5 border-t-[4px] rounded-tr-full rounded-tl-full mt-2" style={{borderColor: faceColor}}></div>;
      case 'thinking':
        return <div className="w-4 h-4 border-b-4 border-l-4 border-r-4 border-transparent rounded-full animate-spin" style={{borderBottomColor: faceColor}}></div>;
      case 'searching':
        return <div className="w-4 h-[3px] rounded-sm animate-pulse" style={{backgroundColor: faceColor}}></div>;
      case 'building':
        return <div className="w-4 h-[4px] rounded-sm transform translate-x-1 animate-bounce" style={{backgroundColor: faceColor}}></div>;
      case 'typing':
        return <div className="w-3 h-[3px] rounded-sm mt-1 animate-pulse" style={{backgroundColor: faceColor}}></div>;
      case 'talk':
        return <div className="w-5 h-[4px] rounded-sm animate-pulse" style={{backgroundColor: faceColor}}></div>;
      default: // idle
        return <div className="w-5 h-2.5 rounded-b-full rounded-t-[1px]" style={{backgroundColor: faceColor}}></div>;
    }
  };

  return (
    <div className={`w-36 h-52 mb-0 relative origin-bottom animate-[floating_4s_ease-in-out_infinite] scale-[0.85] ${emotion === 'thinking' ? 'animate-[floating_2s_ease-in-out_infinite]' : ''}`}>
      {/* BMO Body */}
      <div className="w-full h-full bg-[#52B4A1] rounded-[14px] border-[5px] border-[#223F39] relative shadow-lg overflow-hidden flex flex-col items-center pt-5 pb-3">
        
        {/* Bezel details */}
        <div className="absolute top-1 left-3 w-1 h-1 bg-[#1e342f] rounded-full"></div>
        <div className="absolute top-1 right-3 w-1 h-1 bg-[#1e342f] rounded-full"></div>
        
        {/* Screen */}
        <div className="w-[85%] h-24 bg-[#D1F1C1] rounded-xl border-[5px] border-[#223F39] shadow-inner mb-4 relative flex flex-col justify-center items-center drop-shadow-sm overflow-hidden z-10">
           {/* Screen reflection */}
           <div className="absolute top-[-20px] left-[-20px] w-[150%] h-[150%] bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 pointer-events-none"></div>

           <div className="flex gap-4 mb-1.5 w-full justify-center h-4 items-center z-10">
             {renderEyes()}
           </div>
           <div className="h-4 flex items-center justify-center z-10">
             {renderMouth()}
           </div>
        </div>

        {/* Lower body (Controls) */}
        <div className="w-[85%] flex-1 flex flex-col items-center px-1">
           {/* Floppy slot */}
           <div className="w-16 h-[5px] border-[2.5px] border-[#223F39] rounded-sm mb-4"></div>

           {/* Buttons row */}
           <div className="w-full flex justify-between items-center px-1 h-10">
              {/* D-Pad */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                 <div className="absolute w-8 h-2.5 bg-[#F6D24A] border-[2px] border-[#223F39] rounded-[2px]"></div>
                 <div className="absolute h-8 w-2.5 bg-[#F6D24A] border-[2px] border-[#223F39] rounded-[2px]"></div>
                 <div className="absolute w-2.5 h-2.5 bg-[#F6D24A] z-10"></div>
              </div>

              {/* Action Buttons */}
              <div className="relative w-12 h-10 right-1">
                 <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#E5423D] border-[2px] border-[#223F39] shadow-sm"></div>
                 <div className="absolute bottom-0 right-3 w-5 h-5 rounded-full bg-[#468EE5] border-[2px] border-[#223F39] shadow-sm"></div>
                 <div className="absolute top-4 left-0 w-3 h-3 rounded-full bg-[#52B4A1] border-[2px] border-[#223F39] shadow-sm"></div>
              </div>
           </div>
           
           {/* Controller Ports */}
           <div className="flex gap-6 mt-auto">
              <div className="w-5 h-[5px] border-[2px] border-[#223F39] rounded-[1px]"></div>
              <div className="w-5 h-[5px] border-[2px] border-[#223F39] rounded-[1px]"></div>
           </div>
        </div>
        
        {/* Side inscription "BMO" simulated */}
        <div className="absolute -right-1 top-12 flex flex-col items-center rotate-90 text-[8px] font-bold tracking-widest text-[#223F39] opacity-30 pointer-events-none">
          B M O
        </div>
      </div>
    </div>
  );
};

const MessageDataViewer = ({ registros, tiempos }) => {
  const [activeView, setActiveView] = useState('table');
  const chartContainerRef = useRef(null);
  
  if (!registros || registros.length === 0) return null;

  const downloadCSV = () => {
    const keys = Object.keys(registros[0]);
    const csvContent = [
      keys.join(','),
      ...registros.map(row => keys.map(k => {
        const val = row[k] === null ? '' : String(row[k]);
        return val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `datos_nieto_${Date.now()}.csv`);
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
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm animate-in fade-in duration-300">
      <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
         <div className="flex bg-gray-200/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeView === 'table' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Table className="w-3.5 h-3.5" /> Tabla
            </button>
            {canChart && (
              <button 
                onClick={() => setActiveView('chart')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeView === 'chart' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Gráfica
              </button>
            )}
         </div>
         
         <div className="flex items-center gap-3">
            <div className="flex gap-3 text-[11px] font-medium text-gray-400 hidden sm:flex">
               {tiempos && <span>IA: {tiempos.ia_segundos}s</span>}
               {tiempos && <span>DB: {tiempos.bd_segundos}s</span>}
               <span>Filas: {registros.length}</span>
            </div>
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
            {activeView === 'table' ? (
              <button onClick={downloadCSV} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors bg-white border border-gray-200 hover:border-blue-200 px-2.5 py-1.5 rounded-lg shadow-sm group" title="Descargar datos en Excel/CSV">
                 <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                 CSV
              </button>
            ) : (
              <button onClick={downloadPNG} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors bg-white border border-gray-200 hover:border-blue-200 px-2.5 py-1.5 rounded-lg shadow-sm group" title="Descargar gráfica como imagen">
                 <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                 PNG
              </button>
            )}
         </div>
      </div>

      <div className="bg-white relative">
         {activeView === 'table' ? (
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 text-gray-500 sticky top-0 backdrop-blur-md z-10 shadow-sm">
                  <tr>
                    {Object.keys(registros[0]).map((k) => (
                      <th key={k} className="px-4 py-3 font-semibold border-b border-gray-200 whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.slice(0, 50).map((fila, idx) => (
                     <tr key={idx} className="border-b border-gray-100/70 hover:bg-gray-50/50 transition-colors">
                      {Object.values(fila).map((val, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-2.5 whitespace-nowrap text-gray-600 max-w-[200px] truncate">
                          {val === null ? <span className="text-gray-400 italic">null</span> : String(val)}
                        </td>
                      ))}
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
         ) : (
            <div className="w-full h-[350px] p-6 pr-8 bg-white" ref={chartContainerRef}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registros.slice(0, 30)} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey={stringKey} tick={{fontSize: 10, fill: '#6B7280'}} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                     <YAxis tick={{fontSize: 11, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                     <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Bar dataKey={numberKey} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         )}
      </div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);
  
  const [emotion, setEmotion] = useState('idle');
  const typingTimeoutRef = useRef(null);

  const [showHerramientas, setShowHerramientas] = useState(false);
  const [showModelos, setShowModelos] = useState(false);
  const [deepThink, setDeepThink] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [modeloActual, setModeloActual] = useState('Razonamiento');

  // Historial de chats
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

  // Guardar en localStorage siempre que cambie el history
  useEffect(() => {
    localStorage.setItem('chatNieto_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Sincronizar los mensajes actuales en el historial guardado
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistory(prev => prev.map(chat => 
         chat.id === currentChatId ? { ...chat, messages: messages, updatedAt: Date.now() } : chat
      ));
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
    setMessages([]);
    setCurrentChatId(null);
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

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Agregamos mensaje localmente a la UI
    const newMessages = [...messages, { id: Date.now(), role: 'user', content: userMessage }];
    setMessages(newMessages);

    // Lógica para crear el chat si estamos en una pantalla vacía
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

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: userMessage,
          historial: messages.map(m => ({ role: m.role, content: m.content })),
          modelo: modeloActual
        })
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      
      if (data.registros && data.registros.length === 0) {
         setEmotion('sad');
      } else {
         setEmotion('happy');
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.mensaje || "Respuesta procesada exitosamente.",
        sugerencias: data.sugerencias || [],
        sql: data.sql_generado,
        registros: data.datos,
        tiempos: data.tiempos,
        isError: false
      }]);
      
    } catch (error) {
      setEmotion('error');
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        content: `Error de red: ${error.message}. Por favor revisa la consola del backend.`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const menuHerramientas = [
    { icon: <FileUp className="w-4 h-4"/>, label: 'Subir archivos' },
    { icon: <HardDrive className="w-4 h-4"/>, label: 'Añadir desde Drive' },
    { icon: <ImageIcon className="w-4 h-4"/>, label: 'Fotos' },
  ];

  const menuModelos = [
    { key: 'Fast', label: 'Fast', desc: 'Responde rápidamente' },
    { key: 'Razonamiento', label: 'Razonamiento', desc: 'Resuelve problemas complejos' },
    { key: 'Ultra', label: 'Multillantas AI Ultra', desc: 'Acceso corporativo ilimitado a BD' },
  ];

  const renderInputBox = (isCentered = false) => (
    <div className={`w-full ${isCentered ? 'max-w-2xl mx-auto mt-6' : 'max-w-3xl mx-auto bg-gradient-to-t from-white via-white to-transparent pt-4 pb-6 px-4 md:px-0 relative z-20'}`}>
       <div className={`bg-gray-50 rounded-[28px] border border-gray-300 focus-within:bg-white focus-within:shadow-[0_4px_25px_rgba(37,99,235,0.08)] focus-within:border-blue-400 transition-all p-3 w-full ${isCentered ? 'shadow-md border-gray-200' : ''}`}>
          
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
               placeholder={deepThink ? "Razonamiento profundo activo. ¿Qué quieres investigar?" : "Háblale a tu Inteligencia Nieto..."}
               className="w-full min-h-[44px] max-h-32 bg-transparent text-gray-800 placeholder-gray-500 text-base resize-none focus:outline-none"
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
                     className={`flex items-center justify-center p-2 rounded-full transition-colors ${showHerramientas ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                   >
                      <Plus className="w-5 h-5" />
                   </button>
                   
                   {showHerramientas && (
                      <div className={`absolute left-0 mb-3 w-56 bg-[#1e1e1e] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in bottom-full slide-in-from-bottom-2`}>
                         {menuHerramientas.map((item, i) => (
                           <button key={i} className="w-full text-left px-5 py-2.5 text-sm text-gray-200 hover:bg-gray-700/50 flex items-center gap-3 transition-colors">
                             <span className="text-gray-400">{item.icon}</span>
                             {item.label}
                           </button>
                         ))}
                      </div>
                   )}
                </div>

                <button 
                  type="button"
                  onClick={() => setDeepThink(!deepThink)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${deepThink ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200/70 hover:text-gray-700'}`}
                >
                   <Brain className={`w-4 h-4 ${deepThink ? 'text-blue-600' : ''}`} />
                   Pensamiento Profundo
                </button>
             </div>

             <div className="flex items-center gap-2">
                <div className="relative hidden md:block" ref={modelosRef}>
                   <button 
                     type="button"
                     onClick={() => setShowModelos(!showModelos)}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-200/70 hover:text-gray-700 transition-colors"
                   >
                      {modeloActual} <ChevronDown className="w-4 h-4" />
                   </button>
                   
                   {showModelos && (
                      <div className={`absolute right-0 mb-3 w-80 bg-[#1e1e1e] border border-gray-700 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in bottom-full slide-in-from-bottom-2`}>
                         {menuModelos.map((mod) => (
                            <button 
                              key={mod.key} 
                              onClick={() => { setModeloActual(mod.label); setShowModelos(false); }}
                              className="w-full text-left px-4 py-3 rounded-2xl hover:bg-gray-800 transition-colors flex items-center justify-between group"
                            >
                               <div>
                                 <div className={`text-base font-medium ${modeloActual === mod.label ? 'text-blue-400' : 'text-gray-200'}`}>
                                    {mod.label}
                                 </div>
                                 <div className="text-xs text-gray-500 mt-0.5">{mod.desc}</div>
                               </div>
                               {modeloActual === mod.label && <Check className="w-5 h-5 text-blue-400" />}
                            </button>
                         ))}
                      </div>
                   )}
                </div>


                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all flex-shrink-0
                     ${!input.trim() || isLoading 
                        ? 'bg-gray-200 text-gray-400' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
             </div>
          </div>
       </div>

       <div className={`text-center mt-3 text-xs text-gray-400 font-medium ${isCentered ? 'mt-6' : ''}`}>
         CHAT_NIETO | Motor Integrado Corporativo
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white text-gray-800 font-sans relative">
      {isSidebarOpen && (
        <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 hidden md:flex flex-col animate-in slide-in-from-left-4 duration-200 z-40 relative">
          <div className="p-3 flex items-center gap-2">
            <button onClick={handleNewChat} className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4 text-blue-600" />
              Nuevo chat
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-md transition-colors" title="Cerrar barra lateral">
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {chatHistory.length > 0 && <div className="text-xs font-semibold text-gray-400 mb-3 ml-2 uppercase tracking-wider mt-4">Historial</div>}
          
          {chatHistory.map((chat) => (
             <div key={chat.id} className="relative group mb-1">
                <button 
                  onClick={() => { setMessages(chat.messages); setCurrentChatId(chat.id); }}
                  className={`w-full flex items-center justify-between text-sm text-gray-700 rounded-lg px-3 py-2.5 max-w-full hover:bg-gray-200/80 transition-colors ${currentChatId === chat.id ? 'bg-gray-200/50 font-medium' : 'bg-transparent'}`}
                >
                  <div className="flex items-center gap-3 truncate max-w-[85%]">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex flex-col items-start truncate">
                      <span className="truncate w-full text-left">{chat.title}</span>
                      <span className="text-[10px] text-gray-400">{formatDaysAgo(chat.updatedAt)}</span>
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
             </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-1 ring-blue-200">
                 MN
              </div>
              <div className="text-sm font-medium text-gray-700">Multillantas Nieto</div>
           </div>
        </div>
         </div>
      )}


      <div className="flex-1 flex flex-col relative h-full w-full overflow-hidden">
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          {!isSidebarOpen && (
            <>
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm rounded-md transition-colors flex items-center justify-center hidden md:flex" title="Abrir barra lateral">
                <PanelLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNewChat} className="p-2 text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm rounded-md transition-colors flex items-center justify-center hidden md:flex" title="Nuevo chat">
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
             <div className="flex flex-col items-center justify-center pb-6">
                <BmoFace emotion={emotion} />
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-2">
                   CHAT_NIETO
                </h1>
             </div>
             {renderInputBox(true)}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 md:px-0">
               <div className="max-w-3xl mx-auto py-6 space-y-8">
                 {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-5 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex-shrink-0 mt-1">
                        {msg.role === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm border border-gray-300">
                            <User className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className={`w-8 h-10 bg-[#52B4A1] flex flex-col items-center pt-1 rounded-sm border-2 border-[#223F39] relative shadow-sm overflow-hidden flex-shrink-0 ${msg.isError ? 'border-red-500' : ''}`}>
                             <div className={`w-[85%] h-4 rounded-[2px] border-[1.5px] border-[#223F39] flex justify-center items-center shadow-inner ${msg.isError ? 'bg-[#ffccd5]' : 'bg-[#D1F1C1]'}`}>
                                 {msg.isError ? (
                                     <div className="w-2.5 h-1 border-b-[2px] border-[#1e293b] rounded-full"></div>
                                 ) : msg.registros && msg.registros.length === 0 ? (
                                     <div className="w-2.5 h-[2px] bg-[#1e293b] rounded-full"></div>
                                 ) : (
                                     <div className="w-2.5 h-1.5 bg-[#1e293b] rounded-b-full rounded-t-[1px]"></div>
                                 )}
                             </div>
                             <div className="w-[85%] mt-1 flex justify-between px-0.5">
                               <div className="w-2 h-2 bg-[#F6D24A] border border-[#223F39] rounded-[1px]"></div>
                               <div className="flex gap-[1px]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#E5423D] border border-[#223F39]"></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#468EE5] border border-[#223F39]"></div>
                               </div>
                             </div>
                             <div className="absolute bottom-[2px] w-[85%] border-t-[1.5px] border-[#223F39]"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 max-w-[calc(100%-3rem)]">
                        <div className={`text-base leading-7 ${msg.isError ? 'text-red-700' : 'text-gray-800'}`}>
                          {/* Markdown renderer activo */}
                          {msg.role === 'assistant' && !msg.isError ? (
                            <div className="prose prose-sm md:prose-base prose-slate max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <span className="whitespace-pre-wrap">{msg.content}</span>
                          )}
                          
                          {msg.role === 'assistant' && msg.registros && msg.registros.length === 0 && !msg.isError && (
                             <span className="block mt-2 text-sm text-gray-500 italic">No encontré información sobre esto en la base de datos de Nieto.</span>
                          )}
                        </div>

                        {msg.role === 'assistant' && msg.sql && msg.registros?.length > 0 && (
                          <MessageDataViewer registros={msg.registros} tiempos={msg.tiempos} />
                        )}

                        {msg.role === 'assistant' && msg.sugerencias && msg.sugerencias.length > 0 && !msg.isError && (
                           <div className="mt-4 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                             {msg.sugerencias.map((sug, i) => (
                               <button 
                                 key={i} 
                                 onClick={() => setInput(sug)}
                                 className="px-4 py-2 text-[13px] font-medium text-blue-700 bg-[#eff6ff] hover:bg-[#dbeafe] rounded-xl border border-[#bfdbfe] transition-all text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
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
                          <div className="w-8 h-10 bg-[#52B4A1] flex flex-col items-center pt-1 rounded-sm border-2 border-[#223F39] relative shadow-sm overflow-hidden animate-floating">
                             <div className="w-[85%] h-4 rounded-[2px] border-[1.5px] border-[#223F39] flex justify-center items-center shadow-inner bg-[#D1F1C1]">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b] animate-bounce"></div>
                             </div>
                             <div className="w-[85%] mt-1 flex justify-between px-0.5">
                               <div className="w-2 h-2 bg-[#F6D24A] border border-[#223F39] rounded-[1px]"></div>
                               <div className="flex gap-[1px]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#E5423D] border border-[#223F39]"></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#468EE5] border border-[#223F39]"></div>
                               </div>
                             </div>
                             <div className="absolute bottom-[2px] w-[85%] border-t-[1.5px] border-[#223F39]"></div>
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
