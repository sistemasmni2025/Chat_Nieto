import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

const ChatBubble = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <View style={[
      styles.container,
      isAssistant ? styles.assistantContainer : styles.userContainer
    ]}>
      <View style={[
        styles.bubble,
        isAssistant ? styles.assistantBubble : styles.userBubble
      ]}>
        <Markdown style={isAssistant ? markdownAssistantStyles : markdownUserStyles}>
          {message.content}
        </Markdown>
        
        {message.tiempos && isAssistant && (
          <Text style={styles.timeText}>
            IA: {message.tiempos.ia_segundos}s | BD: {message.tiempos.bd_segundos}s
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
    flexDirection: 'row',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  userBubble: {
    backgroundColor: '#06b6d4',
    borderBottomRightRadius: 4,
  },
  timeText: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'right',
  }
});

const markdownAssistantStyles = StyleSheet.create({
  body: { color: '#334155', fontSize: 15 },
  strong: { fontWeight: 'bold', color: '#0f172a' },
});

const markdownUserStyles = StyleSheet.create({
  body: { color: '#fff', fontSize: 15 },
});

export default ChatBubble;
