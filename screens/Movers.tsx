// screens/Movers.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Movers'>;

const moversData: {
  id: string;
  name: string;
  logo: number;    // require(...) returns a number
  email: string;
}[] = [
  {
    id: '1',
    name: 'Déménageur A',
    logo: require('../assets/logos/a.png'),
    email: 'demenageurA@example.com',
  },
  {
    id: '2',
    name: 'Déménageur B',
    logo: require('../assets/logos/b.png'),
    email: 'demenageurB@example.com',
  },
  // … ajoutez autant que nécessaire
];

export default function Movers({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected(curr =>
      curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
    );
  };

  const moveOn = () => {
    const emails = selected.map(id =>
      moversData.find(m => m.id === id)!.email
    );
    navigation.navigate('QuoteForm', { movers: emails });
  };

  const { width } = Dimensions.get('window');
  const CARD_SIZE = (width - 48) / 2; // 16px padding + 16px gap

  return (
    <View style={styles.container}>
      <FlatList
        data={moversData}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { width: CARD_SIZE, height: CARD_SIZE },
                isSelected && styles.cardSelected,
              ]}
              onPress={() => toggleSelect(item.id)}
              activeOpacity={0.8}
            >
              <Image source={item.logo} style={styles.logo} />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={[
          styles.nextButton,
          selected.length === 0 && styles.nextButtonDisabled,
        ]}
        disabled={selected.length === 0}
        onPress={moveOn}
        activeOpacity={0.8}
      >
        <Text style={styles.nextText}>
          Suivant ({selected.length})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  name: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#6B46C1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#999',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
