// screens/QuoteForm.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  StyleSheet, TouchableOpacity, Platform, Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'QuoteForm'>;
export default function QuoteForm({ route, navigation }: Props) {
  const { movers } = route.params;

  // --- États pour tous les champs (identiques à votre dernier code) ---
  const [sexe, setSexe] = useState<'M.'|'Mme.'|'Société'>('M.');
  const [isEntreprise, setIsEntreprise] = useState(false);
  const [ename, setEname] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [departAdresse, setDepartAdresse] = useState('');
  const [departVille, setDepartVille] = useState('');
  const [departCP, setDepartCP] = useState('');
  const [departPays, setDepartPays] = useState('');
  const [chargement, setChargement] = useState<'Maison'|'Appartement'|'Bureaux'|'Box / Garde-Meuble'>('Maison');
  const [etages, setEtages] = useState<string[]>([]);
  const [numeroEtage, setNumeroEtage] = useState('');
  const [etageDetails, setEtageDetails] = useState('');
  const [observation, setObservation] = useState('');
  const [volumeType, setVolumeType] = useState<'Volume'|'Surface'>('Volume');
  const [volumeM3, setVolumeM3] = useState('');
  const [surfaceM2, setSurfaceM2] = useState('');
  const [ascenseurDepart, setAscenseurDepart] = useState<'Non'|'Oui'>('Non');
  const [dateType, setDateType] = useState<'Date fixe'|'Période'>('Date fixe');
  const [dateFixe, setDateFixe] = useState<Date>(new Date());
  const [periodeDeb, setPeriodeDeb] = useState<Date>(new Date());
  const [periodeFin, setPeriodeFin] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<'none'|'fixe'|'deb'|'fin'>('none');
  const [formule, setFormule] = useState<'ECO'|'ECO+'|'Standard Confort'|'LUXE PREMIUM'|'Service VIP'>('ECO');
  const [arrAdresse, setArrAdresse] = useState('');
  const [arrVille, setArrVille] = useState('');
  const [arrCP, setArrCP] = useState('');
  const [arrPays, setArrPays] = useState('');
  const [livraison, setLivraison] = useState<'Maison'|'Appartement'|'Bureaux'|'Box / Garde-Meuble'>('Maison');
  const [etagesArr, setEtagesArr] = useState<string[]>([]);
  const [numeroEtageArr, setNumeroEtageArr] = useState('');
  const [etageDetailsArr, setEtageDetailsArr] = useState('');
  const [observationArr, setObservationArr] = useState('');
  const [ascenseurArr, setAscenseurArr] = useState<'Non'|'Oui'>('Non');

  const toggleEtage = (
    e: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => setList(cur => cur.includes(e) ? cur.filter(x => x!==e) : [...cur,e]);

  const onChangeDate = (evt: DateTimePickerEvent, sel?: Date) => {
    setShowPicker('none');
    if (!sel) return;
    if (showPicker==='fixe') setDateFixe(sel);
    if (showPicker==='deb') setPeriodeDeb(sel);
    if (showPicker==='fin') setPeriodeFin(sel);
  };

  const buildPayload = () => ({
    recipients: movers,
    subject: '📩 Nouvelle demande de devis PROVolume',
    htmlContent: `
      <h2>👤 Infos Personnelles</h2>
      <p><strong>Civilité :</strong> ${sexe}</p>
      ${isEntreprise? `<p><strong>Société :</strong> ${ename}</p>`:''}
      <p><strong>Nom / Prénom :</strong> ${lname} ${fname}</p>
      <p><strong>📞 Téléphone :</strong> ${phone}</p>
      <p><strong>✉️ Email :</strong> ${email}</p>

      <h2>🚚 Départ</h2>
      <p>${departAdresse}, ${departVille}, ${departCP}, ${departPays}</p>
      <p><strong>Type :</strong> ${chargement}</p>
      <p><strong>Étage :</strong> ${
        chargement==='Maison'? etages.join(', '):
        chargement==='Appartement'? numeroEtage:
        chargement==='Bureaux'? etageDetails: observation
      }</p>
      <p><strong>Volume :</strong> ${
        volumeType==='Volume'? volumeM3+' m³': surfaceM2+' m²'
      }</p>
      <p><strong>Ascenseur :</strong> ${ascenseurDepart}</p>
      <p><strong>Date :</strong> ${
        dateType==='Date fixe'
          ? dateFixe.toLocaleDateString()
          : `Du ${periodeDeb.toLocaleDateString()} au ${periodeFin.toLocaleDateString()}`
      }</p>
      <p><strong>Formule :</strong> ${formule}</p>

      <h2>🏡 Arrivée</h2>
      <p>${arrAdresse}, ${arrVille}, ${arrCP}, ${arrPays}</p>
      <p><strong>Type :</strong> ${livraison}</p>
      <p><strong>Étage :</strong> ${
        livraison==='Maison'? etagesArr.join(', '):
        livraison==='Appartement'? numeroEtageArr:
        livraison==='Bureaux'? etageDetailsArr: observationArr
      }</p>
      <p><strong>Ascenseur :</strong> ${ascenseurArr}</p>
    `
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch('/.netlify/functions/send-quote', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(buildPayload())
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Devis envoyé ✅', 'Votre demande a bien été transmise.', [
        { text:'OK', onPress:() => navigation.popToTop() }
      ]);
    } catch(err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d’envoyer le devis. Réessayez plus tard.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* … réintégrez **tous** vos champs ici, comme ci-dessus … */}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Envoyer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding:16, backgroundColor:'#fff' },
  heading:   { fontSize:22, fontWeight:'bold', marginTop:24, marginBottom:8 },
  subheading:{ fontSize:18, fontWeight:'600', marginTop:16, marginBottom:8 },
  field:     { marginBottom:12 },
  labelBold: { fontWeight:'600', marginBottom:4 },
  row:       { flexDirection:'row', justifyContent:'space-between' },
  halfField: { width:'48%' },
  input: {
    borderWidth:1, borderColor:'#ccc', borderRadius:6,
    paddingHorizontal:8, height:40, marginTop:4
  },
  picker: {
    borderWidth:1, borderColor:'#ccc', borderRadius:6, marginTop:4
  },
  checkboxRow:{ flexDirection:'row', alignItems:'center', marginTop:4 },
  checkbox:{ width:20, height:20, borderWidth:1, borderColor:'#666', marginRight:8 },
  checkedBox:{ backgroundColor:'#6B46C1' },
  dateButton:{
    borderWidth:1, borderColor:'#ccc', borderRadius:6,
    padding:12, marginTop:4, alignItems:'center'
  },
  submitBtn:{
    backgroundColor:'#6B46C1', paddingVertical:14,
    borderRadius:8, marginVertical:24
  },
  submitText:{ color:'#fff', textAlign:'center', fontSize:18, fontWeight:'600' }
});
