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
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Movers'>;

const moversData = [
  { id: '1', name: 'Déménageur A', logo: require('../assets/logos/a.png'), email: 'hisjosua2004@gmail.com' },
  { id: '2', name: 'Déménageur B', logo: require('../assets/logos/b.png'), email: 'hisjosuapro@gmail.com' },
  // … ajoutez autant que nécessaire
];

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export default function Movers({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <FlatList
          data={moversData}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const isSel = selected.includes(item.id);
            return (
              <TouchableOpacity
                style={[styles.card, isSel && styles.cardSel]}
                onPress={() => toggle(item.id)}
                activeOpacity={0.8}
              >
                <Image source={item.logo} style={styles.logo} />
                <Text style={styles.name}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* bouton fixe en bas, au-dessus de la nav bar */}
      <View style={styles.nextWrapper}>
        <TouchableOpacity
          style={[styles.nextBtn, selected.length === 0 && styles.nextBtnDisabled]}
          disabled={selected.length === 0}
          onPress={() =>
            navigation.navigate('QuoteForm', {
              movers: selected.map(id => moversData.find(m => m.id === id)!.email)
            })
          }
        >
          <Text style={styles.nextText}>Suivant ({selected.length})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    width: CARD_W,
    height: CARD_W,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  cardSel: { borderWidth: 2, borderColor: '#6B46C1' },
  logo: { width: 60, height: 60, marginBottom: 8 },
  name: { textAlign: 'center', fontWeight: '500' },

  nextWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,           // espace par rapport à la nav bar
    backgroundColor: '#fff',
  },
  nextBtn: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#aaa' },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
