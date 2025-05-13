// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './screens/Home';
import CalculatorScreen from './screens/CalculatorScreen';
import Movers from './screens/Movers';
import QuoteForm from './screens/QuoteForm';

export type RootStackParamList = {
  Home: undefined;
  Calculator: undefined;
  Movers: undefined;
  QuoteForm: { movers: string[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen
          name="Calculator"
          component={CalculatorScreen}
          options={{ title: 'Calculateur de volume' }}
        />
        <Stack.Screen
          name="Movers"
          component={Movers}
          options={{ title: 'Demande de devis' }}
        />
        <Stack.Screen
          name="QuoteForm"
          component={QuoteForm}
          options={{ title: 'Formulaire de devis' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
