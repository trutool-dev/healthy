/**
 * Pantalla placeholder temporal mientras se implementan las pantallas reales
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors }     from '@/theme/colors';
import { textStyles } from '@/theme/typography';

export function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Healthy</Text>
      <Text style={styles.sub}>Cargando pantalla...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: colors.neutral.white,
  },
  text: {
    ...textStyles.titleLarge,
    color: colors.primary.green,
  },
  sub: {
    ...textStyles.bodyNormal,
    color:      colors.neutral.midGray,
    marginTop:  8,
  },
});
