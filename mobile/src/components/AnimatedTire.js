import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Settings, LifeBuoy } from 'lucide-react-native';

const AnimatedTire = ({ size = 30, color = '#0284C7', isRolling = false }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRolling) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500, // Velocidad de la rueda
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [isRolling]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        {/* Usamos LifeBuoy de Lucide modificado visualmente para que parezca el rin de una llanta */}
        <View style={[styles.tireWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
          <LifeBuoy size={size * 0.8} color={color} strokeWidth={2.5} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B', // Color de la goma de la llanta (Gris muy oscuro)
    borderWidth: 2,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  tireWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Color del rin (Plateado/Blanco)
    transform: [{ scale: 0.85 }], // Para que se vea la goma negra alrededor
  }
});

export default AnimatedTire;
