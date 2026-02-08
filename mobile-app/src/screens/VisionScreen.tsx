import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { getVision, saveVision } from '../database/database';

export default function VisionScreen() {
  const [vision, setVision] = useState({ year10: '', year3: '', year1: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const loadData = useCallback(async () => {
    setVision(await getVision());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSave = async (key: string) => {
    await saveVision(key, editValue.trim());
    setEditing(null);
    loadData();
  };

  const startEdit = (key: string, value: string) => {
    setEditing(key);
    setEditValue(value);
  };

  const levels = [
    { key: 'year10', label: '10 Tahun', icon: '🔭', color: '#E8EAF6', accent: '#3F51B5', desc: 'Bayangkan diri Anda 10 tahun dari sekarang' },
    { key: 'year3', label: '3 Tahun', icon: '🎯', color: '#E0F2F1', accent: '#00897B', desc: 'Target realistis untuk 3 tahun ke depan' },
    { key: 'year1', label: '1 Tahun', icon: '📋', color: '#FFF8E1', accent: '#F57F17', desc: 'Langkah konkrit untuk tahun ini' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Pyramid Visual */}
      <View style={styles.pyramid}>
        <View style={[styles.pyramidLevel, { width: '60%', backgroundColor: '#3F51B5' }]}>
          <Text style={styles.pyramidText}>🔭 10 Tahun</Text>
        </View>
        <View style={[styles.pyramidLevel, { width: '75%', backgroundColor: '#00897B' }]}>
          <Text style={styles.pyramidText}>🎯 3 Tahun</Text>
        </View>
        <View style={[styles.pyramidLevel, { width: '90%', backgroundColor: '#F57F17' }]}>
          <Text style={styles.pyramidText}>📋 1 Tahun</Text>
        </View>
      </View>

      <View style={{ padding: Spacing.lg }}>
        {levels.map(level => (
          <Card key={level.key} style={{ backgroundColor: level.color }}>
            <View style={styles.cardHeader}>
              <Text style={[styles.levelTitle, { color: level.accent }]}>{level.icon} Visi {level.label}</Text>
              {editing !== level.key && (
                <TouchableOpacity onPress={() => startEdit(level.key, (vision as any)[level.key])}>
                  <Text style={{ color: level.accent, fontWeight: '600', fontSize: 13 }}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.desc}>{level.desc}</Text>

            {editing === level.key ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                  multiline
                  placeholder="Tuliskan visi Anda..."
                  autoFocus
                />
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(null)}>
                    <Text style={styles.cancelText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: level.accent }]} onPress={() => handleSave(level.key)}>
                    <Text style={styles.saveBtnText}>Simpan</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.visionText}>
                {(vision as any)[level.key] || 'Belum diisi...'}
              </Text>
            )}
          </Card>
        ))}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pyramid: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.md, gap: 4 },
  pyramidLevel: { paddingVertical: 10, borderRadius: BorderRadius.md, alignItems: 'center' },
  pyramidText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  levelTitle: { fontSize: 15, fontWeight: '700' },
  desc: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  visionText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top', backgroundColor: Colors.white },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: BorderRadius.md, backgroundColor: '#F5F5F5' },
  cancelText: { fontWeight: '600', color: Colors.textSecondary },
  saveBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: BorderRadius.md },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
