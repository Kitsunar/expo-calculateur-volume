// screens/CalculatorScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  StatusBar,
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Linking,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

import data from '../assets/data.json';
import { Images } from '../assets/images';

type Objet = { name: string; volume: number; image: string };

export default function CalculatorScreen() {
  const [selectedPiece, setSelectedPiece] = useState(data[0].piece);

  // Quantités par pièce / objet
  const [quantities, setQuantities] = useState<Record<string, Record<string, string>>>(() => {
    const init: any = {};
    data.forEach(p => {
      init[p.piece] = {};
      p.objets.forEach(o => (init[p.piece][o.name] = '0'));
    });
    return init;
  });

  // Volume « extra » par pièce
  const [customVolumes, setCustomVolumes] = useState<Record<string, string>>(
    () => data.reduce((acc, p) => ({ ...acc, [p.piece]: '0.00' }), {})
  );

  // Nom du PDF
  const [fileName, setFileName] = useState('recapitulatif');

  // Logo en base64 (pour PDF)
  const [logoBase64, setLogoBase64] = useState<string>('');
  useEffect(() => {
    (async () => {
      const module = require('../assets/images/demcertlogo.png');
      const asset = Asset.fromModule(module);
      await asset.downloadAsync();
      const b64 = await FileSystem.readAsStringAsync(asset.localUri!, { encoding: 'base64' });
      setLogoBase64(`data:image/png;base64,${b64}`);
    })();
  }, []);

  const current = data.find(p => p.piece === selectedPiece)!;

  // Calcul du total
  const totalGlobal = useMemo(() => {
    let sum = 0;
    data.forEach(p => {
      p.objets.forEach(o => {
        const q = parseFloat(quantities[p.piece][o.name]) || 0;
        sum += q * o.volume;
      });
      sum += parseFloat(customVolumes[p.piece]) || 0;
    });
    return sum;
  }, [quantities, customVolumes]);

  const resetAll = () => {
    const fq: any = {};
    data.forEach(p => {
      fq[p.piece] = {};
      p.objets.forEach(o => (fq[p.piece][o.name] = '0'));
    });
    setQuantities(fq);
    setCustomVolumes(data.reduce((acc, p) => ({ ...acc, [p.piece]: '0.00' }), {}));
  };

  const updateQty = (piece: string, name: string, val: string) => {
    const norm = val.replace(',', '.').replace(/[^0-9.]/g, '');
    setQuantities(q => ({
      ...q,
      [piece]: { ...q[piece], [name]: norm === '' ? '0' : norm },
    }));
  };

  const updateCustom = (piece: string, val: string) => {
    const norm = val.replace(',', '.').replace(/[^0-9.]/g, '');
    setCustomVolumes(cv => ({
      ...cv,
      [piece]: norm === '' ? '0.00' : norm,
    }));
  };

  const handleExportPDF = async () => {
    let html = `
      <html><head><style>
        body{font-family:Arial;padding:20px;margin:0;}
        .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
        .logo{max-width:100px;height:auto;}
        .title{font-size:20px;margin:0;text-align:right;}
        h2{text-align:center;font-size:18px;margin-top:0;}
        h3{margin-top:24px;}
        table{width:100%;border-collapse:collapse;margin-top:10px;}
        th,td{border:1px solid #999;padding:8px;text-align:left;}
        th{background:#f0f0f0;}
        .footer{text-align:center;margin-top:40px;font-size:14px;}
      </style></head><body>`;

    html += `<div class="header">
      ${logoBase64 ? `<img src="${logoBase64}" class="logo"/>` : ''}
      <h1 class="title">${fileName}.pdf</h1>
    </div><h2>Récapitulatif des Volumes</h2>`;

    data.forEach(p => {
      let rows = '';
      p.objets.forEach(o => {
        const q = parseFloat(quantities[p.piece][o.name]) || 0;
        if (q > 0) {
          const tot = q * o.volume;
          rows += `<tr>
            <td>${o.name}</td>
            <td>${q}</td>
            <td>${o.volume.toFixed(2)}</td>
            <td>${tot.toFixed(2)}</td>
          </tr>`;
        }
      });
      const extra = parseFloat(customVolumes[p.piece]) || 0;
      if (extra > 0) {
        rows += `<tr style="background:#eef">
          <td><em>Extra ${p.piece}</em></td>
          <td>–</td><td>–</td>
          <td>${extra.toFixed(2)}</td>
        </tr>`;
      }
      if (rows) {
        html += `<h3>${p.piece}</h3>
          <table>
            <thead><tr><th>Objet</th><th>Quantité</th><th>Unité (m³)</th><th>Total (m³)</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
      }
    });

    html += `<h2>Total général : ${totalGlobal.toFixed(2)} m³</h2>
      <div class="footer">
        Pour un déménagement serein :
        <a href="https://demenageurscertifies.fr">demenageurscertifies.fr</a>
      </div></body></html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      const pdfName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      const newUri = FileSystem.documentDirectory + pdfName;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri, { mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: Objet }) => {
    const qty = quantities[selectedPiece][item.name];
    const img = Images[item.image] || Images['placeholder.png'];
    return (
      <View style={styles.card}>
        <Image source={img} style={styles.image} resizeMode="contain" />
        <Text style={styles.label}>{item.name}</Text>
        <Text style={styles.subLabel}>{item.volume.toFixed(2)} m³</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() =>
              updateQty(selectedPiece, item.name, (parseFloat(qty) - 1).toString())
            }
          >
            <Text style={styles.btnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={qty}
            keyboardType="decimal-pad"
            blurOnSubmit={false}
            returnKeyType="done"
            onFocus={() => updateQty(selectedPiece, item.name, '')}
            onChangeText={t => updateQty(selectedPiece, item.name, t)}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={() =>
              updateQty(selectedPiece, item.name, (parseFloat(qty) + 1).toString())
            }
          >
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.fullCard}>
      <Text style={styles.label}>Du volume en plus ?</Text>
      <TextInput
        style={styles.inputCustom}
        value={customVolumes[selectedPiece]}
        keyboardType="decimal-pad"
        blurOnSubmit={false}
        returnKeyType="done"
        onFocus={() => updateCustom(selectedPiece, '')}
        onChangeText={t => updateCustom(selectedPiece, t)}
      />
    </View>
  );

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: statusBarHeight }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ExpoStatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="always">
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Image
              source={require('../assets/images/demcertlogo.png')}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>Déménageurs Certifiés</Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPiece}
            onValueChange={setSelectedPiece}
            style={styles.picker}
          >
            {data.map(p => (
              <Picker.Item key={p.piece} label={p.piece} value={p.piece} />
            ))}
          </Picker>
        </View>
        <Text style={styles.pieceTitle}>{selectedPiece}</Text>
        <Text style={styles.totalText}>
          Volume total : {totalGlobal.toFixed(2)} m³
        </Text>

        <FlatList
          data={current.objets}
          renderItem={renderItem}
          keyExtractor={o => o.name}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          ListFooterComponent={renderFooter}
        />

        <Text style={[styles.totalText, { marginBottom: 20 }]}>
          Volume total : {totalGlobal.toFixed(2)} m³
        </Text>

        <View style={styles.pdfContainer}>
          <TextInput
            style={styles.pdfInput}
            value={fileName}
            onChangeText={setFileName}
            placeholder="Nom du fichier"
          />
          <TouchableOpacity style={styles.pdfButton} onPress={handleExportPDF}>
            <Text style={styles.pdfButtonText}>PDF</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.adBanner}
          onPress={() => Linking.openURL('https://demenageurscertifies.fr')}
        >
          <Text style={styles.adText}>
            Vous prévoyez un déménagement ? Rendez-vous sur demenageurscertifies.fr
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const FULL_WIDTH = width - 32;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 32, height: 32, marginRight: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  resetButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: { color: '#6B46C1', fontSize: 14, fontWeight: '600' },

  pickerContainer: {
    margin: 16,
   	borderWidth: 1,
   	borderColor: '#ccc',
   	borderRadius: 6,
    overflow: 'hidden',
  },
  picker: { height: 56, width: '100%' },

  pieceTitle: {
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },

  totalText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },

  row: { justifyContent: 'space-between', marginHorizontal: 16 },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },

  fullCard: {
    width: FULL_WIDTH,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    alignSelf: 'center',
    alignItems: 'center',
  },

  image: { width: 80, height: 80, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 4 },
  subLabel: { fontSize: 12, color: '#666', marginBottom: 8 },

  controls: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  btnText: { fontSize: 18, lineHeight: 18 },

  input: {
    width: 40,
    height: 32,
   	borderColor: '#bbb',
   	borderWidth: 1,
   	borderRadius: 4,
   	textAlign: 'center',
   	fontSize: 14,
   	padding: 0,
  },
  inputCustom: {
    width: FULL_WIDTH - 20,
    height: 40,
   	borderColor: '#bbb',
   	borderWidth: 1,
   	borderRadius: 4,
   	textAlign: 'center',
   	fontSize: 14,
   	padding: 0,
  },

  pdfContainer: {
    flexDirection: 'row',
   	marginHorizontal: 16,
   	marginBottom: 16,
   	alignItems: 'center',
  },
  pdfInput: {
    flex: 3,
    height: 40,
   	borderColor: '#ccc',
   	borderWidth: 1,
   	borderRadius: 6,
   	paddingHorizontal: 8,
   	fontSize: 14,
   	marginRight: 8,
  },
  pdfButton: {
    flex: 1,
   	backgroundColor: '#6B46C1',
    height: 40,
    borderRadius: 6,
   	justifyContent: 'center',
   	alignItems: 'center',
  },
  pdfButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  adBanner: {
    backgroundColor: '#6B46C1',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  adText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
