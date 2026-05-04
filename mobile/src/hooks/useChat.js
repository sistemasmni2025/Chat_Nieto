import { useState, useCallback, useRef } from 'react';
import { chatApi } from '../api/client';
import { Audio } from 'expo-av';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emotion, setEmotion] = useState('idle');
  const soundRef = useRef(null);

  const playVoiceResponse = async (text) => {
    try {
      // Detener audio previo si existe
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const url = chatApi.getAudioUrl(text);
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      
      // Cambiar emoción mientras habla
      setEmotion('thinking'); 
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setEmotion('idle');
        }
      });
    } catch (error) {
      console.log('Error playing voice:', error);
      setEmotion('idle');
    }
  };

  const sendMessage = useCallback(async (text, model = 'Razonamiento') => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatApi.sendMessage(text, history, model);
      
      const data = response.data;
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.mensaje,
        sugerencias: data.sugerencias || [],
        registros: data.datos || [],
        sql: data.sql_generado,
        tiempos: data.tiempos,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // REPRODUCIR VOZ AUTOMÁTICAMENTE
      playVoiceResponse(data.mensaje);
      
    } catch (error) {
      console.error('Error in chat:', error);
      setEmotion('idle');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Error al conectar con el servidor. Por favor verifica tu conexión.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    emotion,
    sendMessage,
    setEmotion,
  };
};

