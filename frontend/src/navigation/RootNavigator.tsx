/**
 * Navegador raíz — decide entre Auth stack y App tabs
 * según el estado de sesión del authStore
 */

import React, { useEffect } from 'react';
import { NavigationContainer }        from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View }    from 'react-native';
import { useAuthStore }               from '@/stores/authStore';
import { colors }                     from '@/theme/colors';
import {
  WelcomeScreen,
  RegisterScreen,
  VerifyEmailScreen,
  SetPasswordScreen,
  LoginScreen,
  ForgotPasswordScreen,
} from '@/screens/auth';
import { PlaceholderScreen } from './PlaceholderScreen';

export type RootStackParamList = {
  // Auth
  Welcome:        undefined;
  Register:       undefined;
  VerifyEmail:    { email: string };
  SetPassword:    { email: string; code: string };
  Login:          undefined;
  ForgotPassword: undefined;
  // Onboarding
  OnboardingWelcome:    undefined;
  OnboardingGoal:       undefined;
  OnboardingProfile:    undefined;
  OnboardingLifestyle:  undefined;
  OnboardingTraining:   undefined;
  OnboardingNutrition:  undefined;
  OnboardingHealth:     undefined;
  OnboardingMotivation: undefined;
  OnboardingComplete:   undefined;
  // App principal
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

  // Restaura sesión almacenada al montar
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral.white }}>
        <ActivityIndicator size="large" color={colors.primary.green} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown:  false,
          animation:    'slide_from_right',
          // Fondo blanco en todas las transiciones
          contentStyle: { backgroundColor: colors.neutral.white },
        }}
      >
        {isAuthenticated ? (
          // App principal (tabs) — se implementará en el siguiente sprint
          <Stack.Screen name="MainTabs" component={PlaceholderScreen} />
        ) : (
          // Flujo de autenticación
          <>
            <Stack.Screen name="Welcome"        component={WelcomeScreen} />
            <Stack.Screen name="Register"       component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail"    component={VerifyEmailScreen} />
            <Stack.Screen name="SetPassword"    component={SetPasswordScreen} />
            <Stack.Screen name="Login"          component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
