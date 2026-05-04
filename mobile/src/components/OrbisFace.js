import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const idleVideo = require('../../assets/orbis-idle.webm');
const thinkingVideo = require('../../assets/orbis-thinking.webm');

const OrbisFace = ({ mode = 'idle', size = 80 }) => {
  // mode puede ser: idle, listening, processing, speaking
  let videoSource = idleVideo;
  if (mode === 'processing' || mode === 'listening' || mode === 'speaking') {
    videoSource = thinkingVideo;
  }

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Video
        source={videoSource}
        style={{ width: size * 1.3, height: size * 1.3 }} // Zoom para ocultar bordes si los hay
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#EBF4F6'
  }
});

export default OrbisFace;
