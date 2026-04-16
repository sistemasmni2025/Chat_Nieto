import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, PanelLeft, MessageSquare, Send, Zap, Bot, Database, Code, Shield, Brain, Globe, ChevronDown, Paperclip, ArrowUp, FileUp, HardDrive, Image as ImageIcon, Laptop, FileText, Check, User } from 'lucide-react';

const BmoFace = ({ emotion }) => {
  const renderEyes = () => {
    switch(emotion) {
      case 'happy':
        return (
          <>
            <div className="w-3.5 h-3.5 border-t-[3.5px] border-l-[3.5px] border-[#1e293b] rounded-tl-[8px] rotate-45 transform translate-y-1"></div>
            <div className="w-3.5 h-3.5 border-t-[3.5px] border-r-[3.5px] border-[#1e293b] rounded-tr-[8px] -rotate-45 transform translate-y-1"></div>
          </>
        );
      case 'sad':
      case 'error':
        return (
          <>
            <div className="w-3.5 h-1.5 border-b-[3.5px] border-[#1e293b] rounded-full rotate-12 mt-1"></div>
            <div className="w-3.5 h-1.5 border-b-[3.5px] border-[#1e293b] rounded-full -rotate-12 mt-1"></div>
          </>
        );
      case 'thinking':
        return (
          <>
            <div className="w-3.5 h-3.5 bg-[#1e293b] rounded-full animate-bounce"></div>
            <div className="w-3.5 h-3.5 bg-[#1e293b] rounded-full animate-bounce delay-75"></div>
          </>
        );
      case 'typing':
        return (
          <>
            <div className="w-[14px] h-[14px] bg-[#1e293b] rounded-full animate-pulse transition-all"></div>
            <div className="w-[14px] h-[14px] bg-[#1e293b] rounded-full animate-pulse delay-75 transition-all"></div>
          </>
        );
      default: // idle
        return (
          <>
            <div className="w-3 h-3 bg-[#1e293b] rounded-full animate-blink transition-all duration-300"></div>
            <div className="w-3 h-3 bg-[#1e293b] rounded-full animate-blink delay-75 transition-all duration-300"></div>
          </>
        );
    }
  };

  const renderMouth = () => {
    switch(emotion) {
      case 'happy':
        return <div className="w-6 h-3.5 bg-[#1e293b] rounded-b-full rounded-t-[2px]"></div>;
      case 'sad':
      case 'error':
        return <div className="w-5 h-2.5 border-t-[4px] border-[#1e293b] rounded-tr-full rounded-tl-full mt-2"></div>;
      case 'thinking':
        return <div className="w-4 h-4 border-b-4 border-l-4 border-r-4 border-transparent border-b-[#1e293b] rounded-full animate-spin"></div>;
      case 'typing':
        return <div className="w-2.5 h-2.5 bg-[#1e293b] rounded-full mt-1 animate-pulse"></div>;
      default: // idle
        return <div className="w-5 h-[4px] bg-[#1e293b] rounded-full animate-talk"></div>;
    }
  };

  return (
    <div className={`w-24 h-24 mb-4 ${emotion === 'thinking' ? 'animate-[floating_2s_ease-in-out_infinite]' : 'animate-[floating_4s_ease-in-out_infinite]'}`}>
      <div className={`w-full h-full rounded-[2rem] border-[6px] shadow-inner relative flex flex-col items-center justify-center overflow-hidden drop-shadow-xl transition-colors duration-500 ${emotion === 'error' ? 'bg-[#ffccd5] border-[#c92a2a]' : emotion === 'sad' ? 'bg-[#d6e8ed] border-[#1B4D7E]' : 'bg-[#E0F6E5] border-[#6C9C88]'}`}>
        <div className="absolute top-1.5 left-2 w-3 h-1.5 bg-white/40 rounded-full"></div>
        <div className="flex gap-4 mb-2 w-full justify-center h-4 items-center">
           {renderEyes()}
        </div>
        <div className="h-5 flex items-center justify-center">
           {renderMouth()}
        </div>
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
    { icon: <Code className="w-4 h-4"/>, label: 'Importar código' },
    { icon: <Database className="w-4 h-4"/>, label: 'NotebookLM' },
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
                      <div className={`absolute left-0 mb-3 w-56 bg-[#1e1e1e] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in ${isCentered ? 'top-full mt-3' : 'bottom-full slide-in-from-bottom-2'}`}>
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
                      <div className={`absolute right-0 mb-3 w-80 bg-[#1e1e1e] border border-gray-700 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in ${isCentered ? 'top-full mt-3' : 'bottom-full slide-in-from-bottom-2'}`}>
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

                <button type="button" className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors hidden sm:block">
                   <Paperclip className="w-5 h-5" />
                </button>

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
    <div className="flex h-screen bg-white text-gray-800 font-sans">
      <div className="w-64 bg-gray-50 border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-3">
          <button onClick={() => setMessages([])} className="w-full flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4 text-blue-600" />
            Nuevo chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="text-xs font-semibold text-gray-400 mb-3 ml-2 uppercase tracking-wider mt-4">Hoy</div>
          <button className="w-full flex items-center justify-between text-sm text-gray-700 bg-gray-200/50 rounded-lg px-3 py-2.5 mb-1 group max-w-full">
            <div className="flex items-center gap-3 truncate max-w-[90%]">
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate flex-1">Análisis Transaccional</span>
            </div>
          </button>
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

      <div className="flex-1 flex flex-col relative h-full">
        <div className="h-14 flex items-center px-4 md:px-6 justify-between border-b border-transparent">
          <button className="p-2 -ml-2 text-gray-500 hover:text-gray-800 rounded-md md:hidden">
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-16 px-4 animate-in fade-in duration-500 w-full relative">
             <div className="flex flex-col items-center justify-center pb-8">
                <BmoFace emotion={emotion} />
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
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
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm ${msg.isError ? 'bg-[#ffccd5] border-[#c92a2a]' : msg.registros && msg.registros.length === 0 ? 'bg-[#d6e8ed] border-[#1B4D7E]' : 'bg-[#E0F6E5] border-[#6C9C88]'}`}>
                             {msg.isError ? (
                               <div className="w-4 h-1 border-b-2 border-[#1e293b] rounded-full"></div>
                             ) : msg.registros && msg.registros.length === 0 ? (
                               <div className="w-4 h-[2px] bg-[#1e293b] rounded-full"></div>
                             ) : (
                               <div className="w-4 h-2 bg-[#1e293b] rounded-b-full rounded-t-sm"></div>
                             )}
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
                          <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex gap-4 text-xs font-medium text-gray-500">
                               <span>IA: {msg.tiempos?.ia_segundos}s</span>
                               <span>DB: {msg.tiempos?.bd_segundos}s</span>
                               <span>Filas: {msg.registros?.length || 0}</span>
                            </div>
                            <div className="overflow-x-auto max-h-[400px]">
                              <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100/80 text-gray-600 sticky top-0 backdrop-blur-md z-10">
                                  <tr>
                                    {Object.keys(msg.registros[0]).map((k) => (
                                      <th key={k} className="px-4 py-3 font-semibold border-b border-gray-200 whitespace-nowrap">{k}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {msg.registros.slice(0, 50).map((fila, idx) => (
                                     <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                                      {Object.values(fila).map((val, cellIdx) => (
                                        <td key={cellIdx} className="px-4 py-2 whitespace-nowrap text-gray-700 max-w-[200px] truncate">
                                          {val === null ? <span className="text-gray-400 italic">null</span> : String(val)}
                                        </td>
                                      ))}
                                     </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
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
                      <div className="w-10 h-10 flex-shrink-0 animate-floating">
                         <BmoFace emotion="thinking" />
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
