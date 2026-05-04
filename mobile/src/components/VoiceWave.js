import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

const VoiceWave = ({ mode = 'idle' }) => {
  // mode: 'idle', 'listening', 'speaking', 'processing'
  const phase = useRef(new Animated.Value(0)).current;
  const amplitude = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    // Animación de fase infinita (movimiento horizontal)
    Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Cambiar amplitud según el modo
    let targetAmp = 0.1;
    if (mode === 'listening') targetAmp = 0.8;
    if (mode === 'speaking') targetAmp = 0.5;
    if (mode === 'processing') targetAmp = 0.3;

    Animated.spring(amplitude, {
      toValue: targetAmp,
      friction: 5,
      useNativeDriver: true,
    }).start();

  }, [mode]);

  const getPath = (p, amp, freq, offset) => {
    const points = [];
    const midY = 40;
    for (let x = 0; x <= width; x += 5) {
      const y = Math.sin(x * freq + p * Math.PI * 2 + offset) * (amp * 30) + midY;
      points.push(`${x},${y}`);
    }
    return `M 0,${midY} ${points.map(p => `L ${p}`).join(' ')} L ${width},${midY}`;
  };

  const getColor = () => {
    if (mode === 'listening') return ['#00E5FF', '#2979FF']; // Cyan a Azul
    if (mode === 'speaking') return ['#D500F9', '#7C4DFF'];  // Purple a Violeta
    if (mode === 'processing') return ['#FACC15', '#F59E0B']; // Amarillo/Naranja (Pensando)
    return ['#334155', '#475569']; // Gris oscuro (Idle)
  };

  const colors = getColor();

  return (
    <View style={styles.container}>
      <Svg height="80" width={width}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors[0]} stopOpacity="0.8" />
            <Stop offset="1" stopColor={colors[1]} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Capa de brillo externa */}
        <AnimatedPath
          d={phase.interpolate({
            inputRange: [0, 1],
            outputRange: [getPath(0, 0.4, 0.01, 0), getPath(1, 0.4, 0.01, 0)]
          })}
          stroke="url(#grad)"
          strokeWidth="1"
          fill="none"
          opacity={0.3}
        />

        {/* Onda Principal (Jarvis/Siri style) */}
        <AnimatedPath
          d={phase.interpolate({
            inputRange: [0, 1],
            outputRange: [getPath(0, 0.8, 0.015, 2), getPath(1, 0.8, 0.015, 2)]
          })}
          stroke="url(#grad)"
          strokeWidth="3"
          fill="none"
        />

        {/* Capa interna rápida */}
        <AnimatedPath
          d={phase.interpolate({
            inputRange: [0, 1],
            outputRange: [getPath(0, 0.3, 0.03, 4), getPath(1, 0.3, 0.03, 4)]
          })}
          stroke="url(#grad)"
          strokeWidth="1.5"
          fill="none"
          opacity={0.5}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VoiceWave;
