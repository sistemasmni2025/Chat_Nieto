import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Plus, Mic, Square, ArrowUp, Camera, FileText, Cloud, Image as ImageIcon, X, Menu, MessageSquare, Clock, Trash2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Markdown from 'react-native-markdown-display';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OrbisFace from '../components/OrbisFace';
import AnimatedTire from '../components/AnimatedTire';

const SERVER_URL = 'http://172.16.71.208:8000'; 
const VOICE_SERVER_URL = 'http://172.16.71.208:8005'; 

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('idle'); // idle, listening, processing, speaking
  const [recording, setRecording] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking'); 
  const [newsList, setNewsList] = useState([
    "Tendencia: El sector automotriz en México crece un 15% en exportaciones.",
    "Dato: Multillantas Nieto refuerza su inventario con tecnología inteligente."
  ]);
  const flatListRef = useRef(null);

  // Estados multimedia
  const [attachment, setAttachment] = useState(null); // { type, uri, name, base64 }
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sessions, setSessions] = useState([]); // Historial de chats pasados

  useEffect(() => {
    loadChatHistory();
    loadSessions();
    checkServerHealth();
    fetchNews();
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Guardar cada vez que cambien los mensajes
  useEffect(() => {
    saveChatHistory();
  }, [messages]);

  const saveChatHistory = async () => {
    try {
      await AsyncStorage.setItem('@orbis_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Error al guardar historial:', e);
    }
  };

  const loadChatHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@orbis_messages');
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) {
      console.error('Error al cargar historial:', e);
    }
  };

  const saveSessions = async (newSessions) => {
    try {
      await AsyncStorage.setItem('@orbis_sessions', JSON.stringify(newSessions));
    } catch (e) {
      console.error('Error al guardar sesiones:', e);
    }
  };

  const loadSessions = async () => {
    try {
      const saved = await AsyncStorage.getItem('@orbis_sessions');
      if (saved) setSessions(JSON.parse(saved));
    } catch (e) {
      console.error('Error al cargar sesiones:', e);
    }
  };

  const fetchNews = async () => {
    try {
      const resp = await axios.get(`${SERVER_URL}/api/news`);
      if (resp.data && resp.data.length > 0) setNewsList(resp.data);
    } catch (e) {
      console.log("No se pudieron cargar noticias", e);
    }
  };

  const checkServerHealth = async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const resp = await fetch(`${VOICE_SERVER_URL}/health`, { signal: controller.signal });
      clearTimeout(id);
      const data = await resp.json();
      if (data.status === 'ok') setServerStatus('online');
      else setServerStatus('error');
    } catch (e) {
      setServerStatus('offline');
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setMode('idle');
      Speech.stop(); 
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setMode('listening');
    } catch (err) {
      console.error('Error al iniciar:', err);
      setRecording(null);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    const currentRecording = recording;
    setRecording(null);
    setMode('idle');

    try {
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      handleVoiceInput(uri);
    } catch (err) {
      console.error('Error al detener:', err);
    }
  };

  const handleVoiceInput = async (uri) => {
    if (!uri) return;
    if (mode === 'processing') return; 
    
    setMode('processing');
    const cleanUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    
    const formData = new FormData();
    formData.append('file', {
      uri: cleanUri,
      name: 'voice.m4a',
      type: 'audio/m4a',
    });

    try {
      const response = await fetch(`${VOICE_SERVER_URL}/transcribe`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.text) {
        sendMessage(data.text);
      } else if (data.error) {
        alert(`Servidor i9: ${data.error}`);
        setMode('idle');
      }
    } catch (err) {
      console.error('Error STT:', err);
      alert(`Error de red: No se pudo contactar al servidor de voz.`);
      setMode('idle');
    }
  };

  // ----- FUNCIONES MULTIMEDIA -----
  const handleOpenCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Se necesita permiso para acceder a la cámara');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setAttachment({
          type: 'image',
          uri: result.assets[0].uri,
          name: 'foto_capturada.jpg',
          base64: result.assets[0].base64
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenGallery = async () => {
    setShowAttachMenu(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Se necesita permiso para acceder a la galería');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setAttachment({
          type: 'image',
          uri: result.assets[0].uri,
          name: 'imagen_galeria.jpg',
          base64: result.assets[0].base64
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickDocument = async () => {
    setShowAttachMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setAttachment({
          type: 'document',
          uri: result.assets[0].uri,
          name: result.assets[0].name
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  // -------------------------------

  const handleSendText = () => {
    if (inputText.trim() === '' && !attachment) return;
    sendMessage(inputText.trim(), attachment);
    setInputText('');
    setAttachment(null);
  };

  const sendMessage = async (text, attach = null) => {
    if (!text && !attach) return;

    // Mensaje visual en el chat (Incluye marca si mandó archivo)
    let displayMsg = text;
    if (attach) {
      const isImg = attach.type === 'image';
      displayMsg = text ? `${text}\n\n*[Adjunto: ${attach.name}]*` : `*[Adjunto: ${attach.name}]*`;
    }

    const userMsg = { id: Date.now().toString(), text: displayMsg, sender: 'user', timestamp: new Date(), attachment: attach?.uri };

    const thinkingMsg = { 
      id: 'thinking_msg', 
      isThinking: true, 
      sender: 'bot', 
      newsText: newsList[Math.floor(Math.random() * newsList.length)] 
    };

    setMessages(prev => [...prev, userMsg, thinkingMsg]);
    setMode('processing');
    
    try {
      const payload = { 
        mensaje: text || '¿Qué ves en la imagen?',
        historial: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        modelo: "Razonamiento"
      };
      
      if (attach && attach.base64) {
        payload.image_base64 = attach.base64;
      }

      console.log("🚀 Enviando a ORBIS:", `${SERVER_URL}/api/chat`);
      const response = await axios.post(`${SERVER_URL}/api/chat`, payload);
      console.log("✅ Respuesta recibida:", response.data);
      
      let botText = response.data.mensaje || '';
      
      // Renderizar datos tabulares en Markdown
      if (response.data.datos && response.data.datos.length > 0) {
        const datos = response.data.datos;
        const limit = Math.min(datos.length, 50); // Limitar renderizado en móvil
        const keys = Object.keys(datos[0]);
        
        let mdTable = '\n\n| ' + keys.join(' | ') + ' |\n';
        mdTable += '| ' + keys.map(() => '---').join(' | ') + ' |\n';
        
        for(let i=0; i<limit; i++) {
           mdTable += '| ' + keys.map(k => String(datos[i][k]).replace(/\|/g, '-')).join(' | ') + ' |\n';
        }
        
        if (datos.length > limit) {
           mdTable += `\n\n*... y ${datos.length - limit} registros más (ocultos por rendimiento móvil).*`;
        }
        
        botText += mdTable;
      }

      if (!botText.trim()) botText = 'No encontré resultados para tu consulta en la base de datos.';
      
      const botMsg = { id: (Date.now()+1).toString(), text: botText.trim(), sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev.filter(m => m.id !== 'thinking_msg'), botMsg]);
      playBotVoice(botText);
    } catch (err) {
      console.error('Error en Chat:', err);
      setMessages(prev => prev.filter(m => m.id !== 'thinking_msg'));
      setMode('idle');
    }
  };
  const handleNewChat = async () => {
    if (messages.length > 0) {
      // Guardar la sesión actual antes de limpiar
      const firstMsg = messages.find(m => m.sender === 'user')?.text || 'Consulta sin título';
      const newSession = {
        id: Date.now().toString(),
        title: firstMsg.substring(0, 25) + (firstMsg.length > 25 ? '...' : ''),
        date: new Date().toLocaleDateString(),
        messages: [...messages]
      };
      const updatedSessions = [newSession, ...sessions].slice(0, 10); // Guardar últimas 10
      setSessions(updatedSessions);
      await saveSessions(updatedSessions);
    }
    
    setMessages([]);
    await AsyncStorage.removeItem('@orbis_messages');
    setShowSidebar(false);
    setAttachment(null);
    setInputText('');
  };

  const handleSelectSession = (session) => {
    setMessages(session.messages);
    setShowSidebar(false);
  };

  const handleDeleteSession = async (sessionId) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    await saveSessions(updatedSessions);
  };

  const playBotVoice = (text) => {
    setMode('speaking');
    Speech.speak(text, {
      language: 'es-MX',
      rate: 1.0,
      onDone: () => setMode('idle'),
      onStopped: () => setMode('idle'),
      onError: (e) => {
        console.error("Error TTS Nativo:", e);
        setMode('idle');
      }
    });
  };

  const renderMessage = ({ item }) => {
    const isBot = item.sender === 'bot';
    
    if (isBot) {
      if (item.isThinking) {
        return (
          <View style={styles.botMessageContainer}>
            <View style={styles.botAvatar}>
              <OrbisFace mode="processing" size={38} />
            </View>
            <View style={[styles.botBubble, styles.thinkingBubble]}>
              <View style={styles.thinkingHeader}>
                <View style={styles.thinkingDotBlue} />
                <Text style={styles.thinkingTitle}>PENSANDO...</Text>
              </View>
              <Text style={styles.thinkingNews}>{item.newsText}</Text>
            </View>
          </View>
        );
      }

      const isLastMessage = messages[messages.length - 1].id === item.id;
      const shouldRoll = isLastMessage && (mode === 'speaking');

      return (
        <View style={styles.botMessageContainer}>
          <View style={styles.botAvatar}>
            <AnimatedTire size={26} color="#0284C7" isRolling={shouldRoll} />
          </View>
          <View style={styles.botBubble}>
            <Markdown 
              style={markdownStyles}
              rules={{
                table: (node, children, parent, styles) => (
                  <ScrollView horizontal key={node.key} showsHorizontalScrollIndicator={false}>
                    <View>{children}</View>
                  </ScrollView>
                ),
              }}
            >
              {item.text}
            </Markdown>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.userMessageContainer}>
        <View style={styles.userBubble}>
          {item.attachment && (
            <Image source={{ uri: item.attachment }} style={styles.chatImage} />
          )}
          <Text style={styles.userMsgText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      {/* MENU LATERAL (SIDEBAR) */}
      {showSidebar && (
        <TouchableOpacity 
          style={styles.sidebarOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSidebar(false)}
        >
          <View style={styles.sidebar}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.sidebarHeader}>
                <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
                  <Plus size={20} color="#00C2FF" />
                  <Text style={styles.newChatBtnText}>Nuevo Chat</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.recentTitle}>CONSULTAS RECIENTES</Text>
              
              <ScrollView style={styles.recentList}>
                {messages.length > 0 && (
                  <TouchableOpacity style={styles.recentItemActive} onPress={() => setShowSidebar(false)}>
                    <MessageSquare size={18} color="#00C2FF" style={styles.recentIcon} />
                    <View>
                      <Text style={styles.recentTextActive} numberOfLines={1}>
                        {messages.find(m => m.sender === 'user')?.text || 'Chat actual'}
                      </Text>
                      <Text style={styles.recentTime}>Ahora (Chat actual)</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {sessions.map((session) => (
                  <View key={session.id} style={styles.sessionRow}>
                    <TouchableOpacity 
                      style={styles.recentItem} 
                      onPress={() => handleSelectSession(session)}
                    >
                      <Clock size={18} color="#94A3B8" style={styles.recentIcon} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recentText} numberOfLines={1}>{session.title}</Text>
                        <Text style={styles.recentTime}>{session.date}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteBtn} 
                      onPress={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.sidebarFooter}>
                <View style={styles.userBadge}>
                  <Text style={styles.userBadgeText}>MN</Text>
                </View>
                <Text style={styles.userName}>Multillantas Nieto</Text>
              </View>
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Overlay del Menú de Adjuntos */}
        {showAttachMenu && (
          <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1} 
            onPress={() => setShowAttachMenu(false)}
          >
            <View style={styles.attachMenu}>
              <TouchableOpacity style={styles.menuItem} onPress={handlePickDocument}>
                <FileText size={20} color="#64748B" style={styles.menuIcon} />
                <Text style={styles.menuText}>Subir archivos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handlePickDocument}>
                <Cloud size={20} color="#64748B" style={styles.menuIcon} />
                <Text style={styles.menuText}>Añadir desde Drive</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleOpenGallery}>
                <ImageIcon size={20} color="#64748B" style={styles.menuIcon} />
                <Text style={styles.menuText}>Fotos</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <TouchableOpacity style={styles.menuToggle} onPress={() => setShowSidebar(true)}>
            <Menu size={24} color="#64748B" />
          </TouchableOpacity>
          <OrbisFace mode={mode} size={70} />
          <View style={[styles.headerContent, { marginTop: 12 }]}>
            <Text style={styles.headerTitle}>O R B I S</Text>
            <View style={[styles.statusDot, { backgroundColor: serverStatus === 'online' ? '#10B981' : '#EF4444' }]} />
          </View>
          <Text style={styles.headerSubtitle}>INTELIGENCIA ARTIFICIAL NIETO</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {mode === 'listening' && (
          <View style={styles.listeningContainer}>
            <View style={styles.pulsingDot} />
            <Text style={styles.listeningText}>Escuchando...</Text>
          </View>
        )}

        <View style={styles.inputArea}>
          <View style={styles.megaPill}>
            
            {/* Vista Previa del Adjunto */}
            {attachment && (
              <View style={styles.attachmentPreview}>
                <View style={styles.attachmentIconBox}>
                  {attachment.type === 'image' ? (
                    <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
                  ) : (
                    <FileText size={24} color="#0284C7" />
                  )}
                </View>
                <Text style={styles.attachmentName} numberOfLines={1}>{attachment.name}</Text>
                <TouchableOpacity style={styles.removeAttachBtn} onPress={() => setAttachment(null)}>
                  <X size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Escribe tu consulta para ORBIS..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />

            <View style={styles.pillBottomRow}>
              <View style={styles.utilGroupLeft}>
                <TouchableOpacity style={styles.utilBtn} onPress={() => setShowAttachMenu(!showAttachMenu)}>
                  <Plus size={22} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.utilBtn}
                  onPress={toggleRecording}
                  disabled={mode === 'processing'}
                >
                  {recording ? (
                    <Square size={22} color="#EF4444" />
                  ) : (
                    <Mic size={22} color={mode === 'processing' ? '#CBD5E1' : '#64748B'} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.utilBtn} onPress={handleOpenCamera}>
                  <Camera size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {inputText.trim().length > 0 || attachment ? (
                <TouchableOpacity 
                  style={styles.actionBtnSendActive}
                  onPress={handleSendText}
                  disabled={mode === 'processing'}
                  activeOpacity={0.7}
                >
                  <ArrowUp size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View style={styles.actionBtnSendIdle}>
                  <ArrowUp size={20} color="#CBD5E1" />
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.footerBrand}>ORBIS | MOTOR DE INTELIGENCIA NIETO</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // --- ESTILOS SIDEBAR ---
  sidebarOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    zIndex: 1000,
  },
  sidebar: {
    width: '80%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    marginBottom: 30,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  newChatBtnText: {
    marginLeft: 10,
    color: '#00C2FF',
    fontWeight: '700',
    fontSize: 16,
  },
  recentTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  recentList: {
    flex: 1,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    flex: 1,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteBtn: {
    padding: 10,
  },
  recentItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#EBF4F6',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00C2FF',
    marginBottom: 8,
  },
  recentIcon: {
    marginRight: 15,
  },
  recentText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  recentTextActive: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '600',
  },
  recentTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  sidebarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  userBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#D1E9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userBadgeText: {
    color: '#00C2FF',
    fontWeight: '800',
    fontSize: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  menuToggle: {
    position: 'absolute',
    left: 20,
    top: 5,
    padding: 10,
  },
  // --- FIN SIDEBAR ---
  header: { 
    paddingTop: Platform.OS === 'android' ? 45 : 15, 
    paddingBottom: 15, 
    backgroundColor: '#EBF4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { 
    color: '#0284C7',
    fontSize: 22, 
    fontWeight: '900',
    letterSpacing: 4
  },
  headerSubtitle: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4
  },
  statusDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    marginLeft: 8,
  },
  list: { 
    padding: 15, 
    paddingBottom: 40 
  },
  
  // Burbujas
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userBubble: { 
    backgroundColor: '#0284C7',
    padding: 16,
    borderRadius: 24,
    borderBottomRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMsgText: { 
    color: '#FFFFFF', 
    fontSize: 16,
    lineHeight: 24
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  
  botMessageContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 28,
    maxWidth: '90%',
  },
  botAvatar: {
    marginRight: 10,
    marginTop: 2,
  },
  botBubble: { 
    flex: 1,
  },
  thinkingBubble: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  thinkingDotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
    marginRight: 8,
  },
  thinkingTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  thinkingNews: {
    color: '#EA580C', // Naranja vibrante para el texto de tendencia
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  // Estados
  listeningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 8
  },
  listeningText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600'
  },

  // Menú Flotante de Adjuntos
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 100,
  },
  attachMenu: {
    position: 'absolute',
    bottom: 120, // Altura estimada arriba de la barra
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },

  // Previsualización de Adjunto
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attachmentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  removeAttachBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },

  // Input Area
  inputArea: { 
    paddingHorizontal: 15, 
    paddingTop: 10, 
    paddingBottom: Platform.OS === 'ios' ? 25 : 15, 
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  megaPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  input: { 
    color: '#1E293B', 
    fontSize: 17, 
    minHeight: 40,
    maxHeight: 120,
    marginBottom: 15,
  },
  pillBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilBtn: {
    padding: 8,
    marginRight: 10,
  },
  
  // Botones de Envío
  actionBtnSendIdle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F1F5F9',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  actionBtnSendActive: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#0F172A',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  footerBrand: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 15
  }
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  heading1: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  em: {
    fontStyle: 'italic',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 10,
  },
  code_inline: {
    backgroundColor: '#F1F5F9',
    color: '#0284C7',
    paddingHorizontal: 6,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  code_block: {
    backgroundColor: '#F8FAFC',
    color: '#334155',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 10,
  },
  list_item: {
    marginBottom: 5,
  },
  bullet_list: {
    marginBottom: 10,
  },
  // --- ESTILOS DE TABLA PREMIUM ---
  table: {
    borderWidth: 1,
    borderColor: '#D1E9F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
  },
  thead: {
    backgroundColor: '#EBF4F6',
    borderBottomWidth: 2,
    borderColor: '#D1E9F0',
  },
  th: {
    padding: 8,
    color: '#05445E',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  td: {
    padding: 8,
    color: '#334155',
    fontSize: 11,
    minWidth: 80, // Asegura que las columnas no se colapsen
  },
});

export default ChatScreen;
