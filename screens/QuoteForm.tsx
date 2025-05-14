// screens/QuoteForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'QuoteForm'>;

export default function QuoteForm({ route, navigation }: Props) {
  const { movers } = route.params; // liste des emails

  // ── 1. PERSONNEL ─────────────────────────────────────────────────────────
  const [sexe, setSexe] = useState<'M.' | 'Mme.' | 'Société'>('M.');
  const [isEntreprise, setIsEntreprise] = useState(false);
  const [ename, setEname] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // ── 2. DÉPART ────────────────────────────────────────────────────────────
  const [departAdresse, setDepartAdresse] = useState('');
  const [departVille, setDepartVille] = useState('');
  const [departCP, setDepartCP] = useState('');
  const [departPays, setDepartPays] = useState('');
  const [chargement, setChargement] = useState<'Maison' | 'Appartement' | 'Bureaux' | 'Box / Garde-Meuble'>('Maison');
  const [etages, setEtages] = useState<string[]>([]);
  const [numeroEtage, setNumeroEtage] = useState('');
  const [etageDetails, setEtageDetails] = useState('');
  const [observation, setObservation] = useState('');
  const [volumeType, setVolumeType] = useState<'Volume' | 'Surface'>('Volume');
  const [volumeM3, setVolumeM3] = useState('');
  const [surfaceM2, setSurfaceM2] = useState('');
  const [ascenseurDepart, setAscenseurDepart] = useState<'Non' | 'Oui'>('Non');
  const [dateType, setDateType] = useState<'Date fixe' | 'Période'>('Date fixe');
  const [dateFixe, setDateFixe] = useState<Date>(new Date());
  const [periodeDeb, setPeriodeDeb] = useState<Date>(new Date());
  const [periodeFin, setPeriodeFin] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<'none' | 'fixe' | 'deb' | 'fin'>('none');
  const [formule, setFormule] = useState<'ECO' | 'ECO+' | 'Standard Confort' | 'LUXE PREMIUM' | 'Service VIP'>('ECO');

  // ── 3. ARRIVÉE ──────────────────────────────────────────────────────────
  const [arrAdresse, setArrAdresse] = useState('');
  const [arrVille, setArrVille] = useState('');
  const [arrCP, setArrCP] = useState('');
  const [arrPays, setArrPays] = useState('');
  const [livraison, setLivraison] = useState<'Maison' | 'Appartement' | 'Bureaux' | 'Box / Garde-Meuble'>('Maison');
  const [etagesArr, setEtagesArr] = useState<string[]>([]);
  const [numeroEtageArr, setNumeroEtageArr] = useState('');
  const [etageDetailsArr, setEtageDetailsArr] = useState('');
  const [observationArr, setObservationArr] = useState('');
  const [ascenseurArr, setAscenseurArr] = useState<'Non' | 'Oui'>('Non');

  const toggleEtage = (
    e: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(cur => cur.includes(e) ? cur.filter(x => x!==e) : [...cur, e]);
  };

  const onChangeDate = (evt: DateTimePickerEvent, sel?: Date) => {
    setShowPicker('none');
    if (!sel) return;
    if (showPicker==='fixe') setDateFixe(sel);
    if (showPicker==='deb') setPeriodeDeb(sel);
    if (showPicker==='fin') setPeriodeFin(sel);
  };

  // monte le payload
  const buildPayload = () => ({
    recipients: movers,
    sexe, ename: isEntreprise ? ename : undefined,
    fname, lname, phone, email,
    depart: {
      adresse: departAdresse, ville: departVille, cp: departCP, pays: departPays,
      type: chargement,
      etages, numeroEtage, etageDetails, observation,
      volumeType, volumeM3, surfaceM2,
      ascenseur: ascenseurDepart,
      dateType, dateFixe, periodeDeb, periodeFin,
      formule,
    },
    arrivee: {
      adresse: arrAdresse, ville: arrVille, cp: arrCP, pays: arrPays,
      type: livraison,
      etages: etagesArr,
      numeroEtage: numeroEtageArr,
      etageDetails: etageDetailsArr,
      observation: observationArr,
      ascenseur: ascenseurArr,
    },
  });

  const handleSubmit = async () => {
    const payload = buildPayload();
    try {
      const res = await fetch(
        'https://expo-calculateur-volume-4zw9m5gae-his-josuas-projects.vercel.app/api/send-quote',  // ← remplacez par votre URL
        {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      // succès
      Alert.alert('Devis envoyé ✅', 'Nous avons bien transmis votre demande.', [
        { text:'Ok', onPress: ()=> navigation.popToTop() }
      ]);
    } catch(err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d’envoyer le devis. Réessayez plus tard.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 1. Infos perso */}
      <Text style={styles.heading}>Informations Personnelles</Text>
      <View style={styles.field}>
        <Text style={styles.labelBold}>Vous êtes ?</Text>
        <Picker
          selectedValue={sexe}
          onValueChange={v => {
            setSexe(v as any);
            setIsEntreprise(v==='Société');
          }}
          style={styles.picker}
        >
          <Picker.Item label="M." value="M."/>
          <Picker.Item label="Mme." value="Mme."/>
          <Picker.Item label="Société" value="Société"/>
        </Picker>
      </View>
      {isEntreprise && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Nom de la société</Text>
          <TextInput value={ename} style={styles.input} onChangeText={setEname} placeholder="Nom de la société"/>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Prénom</Text>
          <TextInput value={fname} style={styles.input} onChangeText={setFname} placeholder="Votre prénom"/>
        </View>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Nom</Text>
          <TextInput value={lname} style={styles.input} onChangeText={setLname} placeholder="Votre nom"/>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Téléphone</Text>
          <TextInput
            value={phone}
            style={styles.input}
            onChangeText={setPhone}
            placeholder="06 XX XX XX XX"
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Email</Text>
          <TextInput
            value={email}
            style={styles.input}
            onChangeText={setEmail}
            placeholder="exemple@domaine.com"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* 2. Départ */}
      <Text style={styles.heading}>Information Déménagement Départ</Text>
      <Text style={styles.subheading}>Adresse de départ</Text>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Adresse</Text>
          <TextInput value={departAdresse} style={styles.input} onChangeText={setDepartAdresse} placeholder="Adresse de départ"/>
        </View>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Ville</Text>
          <TextInput value={departVille} style={styles.input} onChangeText={setDepartVille} placeholder="Ville"/>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Code Postal</Text>
          <TextInput
            value={departCP}
            style={styles.input}
            onChangeText={setDepartCP}
            placeholder="CP"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Pays</Text>
          <TextInput value={departPays} style={styles.input} onChangeText={setDepartPays} placeholder="Pays"/>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.labelBold}>Type de logement</Text>
        <Picker
          selectedValue={chargement}
          onValueChange={v => setChargement(v as any)}
          style={styles.picker}
        >
          <Picker.Item label="Maison" value="Maison"/>
          <Picker.Item label="Appartement" value="Appartement"/>
          <Picker.Item label="Bureaux" value="Bureaux"/>
          <Picker.Item label="Box / Garde-Meuble" value="Box / Garde-Meuble"/>
        </Picker>
      </View>

      {chargement==='Maison' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Étage (plusieurs choix)</Text>
          {['RDC','RDC +1','RDC +2','Cave','Garage'].map(e => (
            <TouchableOpacity key={e} style={styles.checkboxRow} onPress={()=>toggleEtage(e,etages,setEtages)}>
              <View style={[styles.checkbox, etages.includes(e)&&styles.checkedBox]} />
              <Text>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {chargement==='Appartement' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Numéro d’étage</Text>
          <TextInput
            value={numeroEtage}
            style={styles.input}
            onChangeText={setNumeroEtage}
            placeholder="Ex : 2"
            keyboardType="numeric"
          />
        </View>
      )}
      {chargement==='Bureaux' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Détails étage</Text>
          <TextInput
            value={etageDetails}
            style={[styles.input,{height:80}]}
            onChangeText={setEtageDetails}
            placeholder="Ex : niveau 3 sur 5"
            multiline
          />
        </View>
      )}
      {chargement==='Box / Garde-Meuble' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Observation</Text>
          <TextInput
            value={observation}
            style={[styles.input,{height:80}]}
            onChangeText={setObservation}
            placeholder="Infos complémentaires"
            multiline
          />
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.labelBold}>Volume estimé</Text>
        <Picker
          selectedValue={volumeType}
          onValueChange={v=>setVolumeType(v as any)}
          style={styles.picker}
        >
          <Picker.Item label="Volume (m³)" value="Volume"/>
          <Picker.Item label="Surface (m²)" value="Surface"/>
        </Picker>
      </View>
      {volumeType==='Volume' ? (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Indiquer le volume (m³)</Text>
          <TextInput
            value={volumeM3}
            style={styles.input}
            onChangeText={setVolumeM3}
            placeholder="Ex : 50"
            keyboardType="numeric"
          />
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Indiquer la surface (m²)</Text>
          <TextInput
            value={surfaceM2}
            style={styles.input}
            onChangeText={setSurfaceM2}
            placeholder="Ex : 100"
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.labelBold}>Ascenseur disponible ?</Text>
        <Picker
          selectedValue={ascenseurDepart}
          onValueChange={v=>setAscenseurDepart(v as any)}
          style={styles.picker}
        >
          <Picker.Item label="Non" value="Non"/>
          <Picker.Item label="Oui" value="Oui"/>
        </Picker>
      </View>

      <View style={styles.field}>
        <Text style={styles.labelBold}>Choix de la date</Text>
        <Picker
          selectedValue={dateType}
          onValueChange={v=>setDateType(v as any)}
          style={styles.picker}
        >
          <Picker.Item label="Date fixe" value="Date fixe"/>
          <Picker.Item label="Période" value="Période"/>
        </Picker>
      </View>
      {dateType==='Date fixe' ? (
        <TouchableOpacity onPress={()=>setShowPicker('fixe')} style={styles.dateButton}>
          <Text>{dateFixe.toLocaleDateString()}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity onPress={()=>setShowPicker('deb')} style={styles.dateButton}>
            <Text>Début : {periodeDeb.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setShowPicker('fin')} style={styles.dateButton}>
            <Text>Fin : {periodeFin.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </>
      )}
      {showPicker!=='none' && (
        <DateTimePicker
          value={
            showPicker==='fixe' ? dateFixe :
            showPicker==='deb' ? periodeDeb :
            periodeFin
          }
          mode="date"
          display={Platform.OS==='ios'? 'inline':'default'}
          onChange={onChangeDate}
        />
      )}

      <View style={styles.field}>
        <Text style={styles.labelBold}>Formule de déménagement</Text>
        <Picker
          selectedValue={formule}
          onValueChange={v=>setFormule(v as any)}
          style={styles.picker}
        >
          <Picker.Item label="ECO" value="ECO"/>
          <Picker.Item label="ECO+" value="ECO+"/>
          <Picker.Item label="Standard Confort" value="Standard Confort"/>
          <Picker.Item label="LUXE PREMIUM" value="LUXE PREMIUM"/>
          <Picker.Item label="Service VIP" value="Service VIP"/>
        </Picker>
      </View>

      {/* 3. ARRIVÉE (identique au départ) */}
      <Text style={styles.heading}>Information Déménagement Arrivée</Text>
      <Text style={styles.subheading}>Adresse d'arrivée</Text>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Adresse</Text>
          <TextInput
            value={arrAdresse}
            style={styles.input}
            onChangeText={setArrAdresse}
            placeholder="Adresse d'arrivée"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Ville</Text>
          <TextInput
            value={arrVille}
            style={styles.input}
            onChangeText={setArrVille}
            placeholder="Ville"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Code Postal</Text>
          <TextInput
            value={arrCP}
            style={styles.input}
            onChangeText={setArrCP}
            placeholder="CP"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.labelBold}>Pays</Text>
          <TextInput
            value={arrPays}
            style={styles.input}
            onChangeText={setArrPays}
            placeholder="Pays"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.labelBold}>Type de logement</Text>
        <Picker
          selectedValue={livraison}
          onValueChange={v=>setLivraison(v as any)}
          style={styles.picker}
        >
          <Picker.Item label="Maison" value="Maison"/>
          <Picker.Item label="Appartement" value="Appartement"/>
          <Picker.Item label="Bureaux" value="Bureaux"/>
          <Picker.Item label="Box / Garde-Meuble" value="Box / Garde-Meuble"/>
        </Picker>
      </View>
      {livraison==='Maison' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Étage (plusieurs choix)</Text>
          {['RDC','RDC +1','RDC +2','Cave','Garage'].map(e=>(
            <TouchableOpacity key={e} style={styles.checkboxRow} onPress={()=>toggleEtage(e,etagesArr,setEtagesArr)}>
              <View style={[styles.checkbox, etagesArr.includes(e)&&styles.checkedBox]} />
              <Text>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {livraison==='Appartement' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Numéro d’étage</Text>
          <TextInput
            value={numeroEtageArr}
            style={styles.input}
            onChangeText={setNumeroEtageArr}
            placeholder="Ex : 2"
            keyboardType="numeric"
          />
        </View>
      )}
      {livraison==='Bureaux' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Détails étage</Text>
          <TextInput
            value={etageDetailsArr}
            style={[styles.input,{height:80}]}
            onChangeText={setEtageDetailsArr}
            placeholder="Ex : niveau 3 sur 5"
            multiline
          />
        </View>
      )}
      {livraison==='Box / Garde-Meuble' && (
        <View style={styles.field}>
          <Text style={styles.labelBold}>Observation</Text>
          <TextInput
            value={observationArr}
            style={[styles.input,{height:80}]}
            onChangeText={setObservationArr}
            placeholder="Infos complémentaires"
            multiline
          />
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.labelBold}>Ascenseur disponible ?</Text>
        <Picker
          selectedValue={ascenseurArr}
          onValueChange={v=>setAscenseurArr(v as any)}
          style={styles.picker}
        >
          <Picker.Item label="Non" value="Non"/>
          <Picker.Item label="Oui" value="Oui"/>
        </Picker>
      </View>

      {/* BOUTON ENVOYER */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Envoyer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  subheading: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  field: { marginBottom: 12 },
  labelBold: { fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfField: { width: '48%' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 40,
    marginTop: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#666', marginRight: 8 },
  checkedBox: { backgroundColor: '#6B46C1' },
  dateButton: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 12, marginTop: 4, alignItems: 'center'
  },
  submitBtn: {
    backgroundColor: '#6B46C1',
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 24,
  },
  submitText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '600' },
});
