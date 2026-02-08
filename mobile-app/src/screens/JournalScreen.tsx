import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { getJournalToday, saveJournalMorning, saveJournalEvening, JournalEntry } from '../database/database';
import { formatDate } from '../utils/helpers';

export default function JournalScreen() {
  const [journal, setJournal] = useState<JournalEntry>({ morning: null, evening: null });
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [editing, setEditing] = useState(false);

  // Morning form
  const [focus, setFocus] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [affirmation, setAffirmation] = useState('');

  // Evening form
  const [wins, setWins] = useState('');
  const [improve, setImprove] = useState('');
  const [lesson, setLesson] = useState('');

  const loadData = useCallback(async () => {
    const j = await getJournalToday();
    setJournal(j);
    if (j.morning) {
      setFocus(j.morning.focus);
      setGratitude(j.morning.gratitude);
      setAffirmation(j.morning.affirmation);
    }
    if (j.evening) {
      setWins(j.evening.wins);
      setImprove(j.evening.improve);
      setLesson(j.evening.lesson);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSaveMorning = async () => {
    if (!focus.trim() && !gratitude.trim() && !affirmation.trim()) {
      Alert.alert('Info', 'Isi minimal satu field');
      return;
    }
    await saveJournalMorning({ focus: focus.trim(), gratitude: gratitude.trim(), affirmation: affirmation.trim() });
    setEditing(false);
    loadData();
  };

  const handleSaveEvening = async () => {
    if (!wins.trim() && !improve.trim() && !lesson.trim()) {
      Alert.alert('Info', 'Isi minimal satu field');
      return;
    }
    await saveJournalEvening({ wins: wins.trim(), improve: improve.trim(), lesson: lesson.trim() });
    setEditing(false);
    loadData();
  };

  const renderMorning = () => {
    if (journal.morning && !editing) {
      return (
        <Card>
          <View style={styles.savedHeader}>
            <Text style={styles.savedTitle}>☀️ Jurnal Pagi</Text>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>🎯 Fokus utama hari ini</Text>
            <Text style={styles.fieldValue}>{journal.morning.focus || '-'}</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>🤲 Syukur</Text>
            <Text style={styles.fieldValue}>{journal.morning.gratitude || '-'}</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>💪 Afirmasi</Text>
            <Text style={styles.fieldValue}>{journal.morning.affirmation || '-'}</Text>
          </View>
        </Card>
      );
    }

    return (
      <Card>
        <Text style={styles.formTitle}>☀️ Jurnal Pagi</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>🎯 Apa fokus utama hari ini?</Text>
          <TextInput style={styles.input} value={focus} onChangeText={setFocus} placeholder="Satu hal terpenting..." multiline />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>🤲 Apa yang disyukuri?</Text>
          <TextInput style={styles.input} value={gratitude} onChangeText={setGratitude} placeholder="Alhamdulillah untuk..." multiline />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>💪 Afirmasi positif</Text>
          <TextInput style={styles.input} value={affirmation} onChangeText={setAffirmation} placeholder="Hari ini saya akan..." multiline />
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMorning}>
          <Text style={styles.saveBtnText}>Simpan Jurnal Pagi</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEvening = () => {
    if (journal.evening && !editing) {
      return (
        <Card>
          <View style={styles.savedHeader}>
            <Text style={styles.savedTitle}>🌙 Jurnal Malam</Text>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>🏆 Kemenangan hari ini</Text>
            <Text style={styles.fieldValue}>{journal.evening.wins || '-'}</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>📈 Yang bisa diperbaiki</Text>
            <Text style={styles.fieldValue}>{journal.evening.improve || '-'}</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>📖 Pelajaran</Text>
            <Text style={styles.fieldValue}>{journal.evening.lesson || '-'}</Text>
          </View>
        </Card>
      );
    }

    return (
      <Card>
        <Text style={styles.formTitle}>🌙 Jurnal Malam</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>🏆 Kemenangan hari ini</Text>
          <TextInput style={styles.input} value={wins} onChangeText={setWins} placeholder="Apa yang berhasil..." multiline />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>📈 Yang bisa diperbaiki</Text>
          <TextInput style={styles.input} value={improve} onChangeText={setImprove} placeholder="Besok saya akan..." multiline />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>📖 Pelajaran</Text>
          <TextInput style={styles.input} value={lesson} onChangeText={setLesson} placeholder="Hari ini saya belajar..." multiline />
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEvening}>
          <Text style={styles.saveBtnText}>Simpan Jurnal Malam</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatDate(new Date())}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'morning' && styles.tabMorningActive]}
          onPress={() => { setActiveTab('morning'); setEditing(false); }}
        >
          <Text style={[styles.tabText, activeTab === 'morning' && { color: Colors.warning }]}>
            ☀️ Pagi {journal.morning ? '✓' : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'evening' && styles.tabEveningActive]}
          onPress={() => { setActiveTab('evening'); setEditing(false); }}
        >
          <Text style={[styles.tabText, activeTab === 'evening' && { color: Colors.primary }]}>
            🌙 Malam {journal.evening ? '✓' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
        {activeTab === 'morning' ? renderMorning() : renderEvening()}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  dateHeader: { backgroundColor: Colors.white, paddingVertical: 10, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  dateText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.white },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabMorningActive: { borderBottomColor: Colors.warning },
  tabEveningActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  fieldValue: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  savedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  savedTitle: { fontSize: 16, fontWeight: '700' },
  editBtn: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
});
