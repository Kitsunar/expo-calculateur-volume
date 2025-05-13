// screens/Home.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const { width } = Dimensions.get('window');
const BORDER_COLOR = '#6B46C1';
const BUTTON_HEIGHT = 340;

export default function Home({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Bordure de 10px */}
      <View style={styles.borderTop} />
      {/* Bannière */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/demcertlogo.png')}
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}>Déménageurs Certifiés</Text>
      </View>

      {/* Contenu boutons */}
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Calculator')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../assets/icons/calculator.png')}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Calculateur de volume</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Movers')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../assets/icons/movers.png')}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Faire une demande de devis déménagement</Text>
        </TouchableOpacity>
      </View>

      {/* Bordure basse */}
      <View style={styles.borderBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  borderTop: {
    height: 10,
    backgroundColor: BORDER_COLOR,
  },
  borderBottom: {
    height: 10,
    backgroundColor: BORDER_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: BORDER_COLOR,
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  button: {
    height: BUTTON_HEIGHT,
    width: width - 20,
    backgroundColor: BORDER_COLOR,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  separator: {
    height: 5,
  },
  buttonIcon: {
    width: 256,
    height: 256,
    marginBottom: 12,
    tintColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
