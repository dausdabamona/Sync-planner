import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { getBrainDumps, addBrainDump, deleteBrainDump, getDontList, addDontItem, deleteDontItem, BrainDumpItem, addTask } from '../database/database';
import { generateId } from '../utils/helpers';

export default function BrainDumpScreen() {
  const [tab, setTab] = useState<'dump' | 'dont'>('dump');
  const [dumps, setDumps] = useState<BrainDumpItem[]>([]);
  const [dontList, setDontList] = useState<BrainDumpItem[]>([]);
  const [inputText, setInputText] = useState('');

  const loadData = useCallback(async () => {
    setDumps(await getBrainDumps());
    setDontList(await getDontList());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAddDump = async () => {
    if (!inputText.trim()) return;
    await addBrainDump({ id: generateId(), text: inputText.trim(), created_at: new Date().toISOString() });
    setInputText('');
    loadData();
  };

  const handleAddDont = async () => {
    if (!inputText.trim()) return;
    await addDontItem({ id: generateId(), text: inputText.trim(), created_at: new Date().toISOString() });
    setInputText('');
    loadData();
  };

  const handleDeleteDump = (item: BrainDumpItem) => {
    Alert.alert('Hapus', `Hapus "${item.text}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await deleteBrainDump(item.id); loadData(); } },
    ]);
  };

  const handleDeleteDont = (item: BrainDumpItem) => {
    Alert.alert('Hapus', `Hapus "${item.text}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await deleteDontItem(item.id); loadData(); } },
    ]);
  };

  const handleConvertToTask = async (item: BrainDumpItem) => {
    await addTask({
      id: generateId(),
      title: item.text,
      priority: 'medium',
      status: 'todo',
      created_at: new Date().toISOString(),
    });
    await deleteBrainDump(item.id);
    Alert.alert('Berhasil', 'Dikonversi menjadi task');
    loadData();
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'dump' && styles.tabActive]} onPress={() => setTab('dump')}>
          <Text style={[styles.tabText, tab === 'dump' && styles.tabTextActive]}>💭 Brain Dump</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'dont' && styles.tabActive]} onPress={() => setTab('dont')}>
          <Text style={[styles.tabText, tab === 'dont' && styles.tabTextActive]}>🚫 Don't List</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={tab === 'dump' ? 'Tulis apapun yang ada di pikiran...' : 'Hal yang harus dihindari...'}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.addBtn} onPress={tab === 'dump' ? handleAddDump : handleAddDont}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {tab === 'dump' ? (
          <>
            {dumps.length === 0 && (
              <Text style={styles.emptyText}>Belum ada catatan. Tulis apapun yang ada di pikiranmu!</Text>
            )}
            {dumps.map(item => (
              <Card key={item.id}>
                <Text style={styles.itemText}>{item.text}</Text>
                <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleConvertToTask(item)}>
                    <Text style={{ fontSize: 12, color: Colors.primary }}>📋 Jadikan Task</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteDump(item)}>
                    <Text style={{ fontSize: 12, color: Colors.danger }}>🗑 Hapus</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        ) : (
          <>
            {dontList.length === 0 && (
              <Text style={styles.emptyText}>Belum ada item. Tulis hal-hal yang harus dihindari!</Text>
            )}
            {dontList.map(item => (
              <Card key={item.id} style={{ borderLeftWidth: 4, borderLeftColor: Colors.danger }}>
                <Text style={styles.itemText}>🚫 {item.text}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                  <TouchableOpacity onPress={() => handleDeleteDont(item)}>
                    <Text style={{ fontSize: 12, color: Colors.danger }}>🗑 Hapus</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  inputRow: { marginBottom: 16 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, backgroundColor: Colors.white, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: 'center' },
  emptyText: { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingVertical: 40 },
  itemText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  itemDate: { fontSize: 11, color: Colors.textLight, marginTop: 6 },
  itemActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.divider },
  actionBtn: { paddingVertical: 4 },
});
