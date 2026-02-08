import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import Card from '../components/Card';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { WISDOM_DATA, WisdomItem } from '../data/constants';

type AreaFilter = 'semua' | 'istri' | 'anak' | 'diri';

const AREA_COLORS = {
  istri: '#C49A6C',
  anak: '#A08BC4',
  diri: '#2D9A8C',
};

export default function WisdomScreen() {
  const [filter, setFilter] = useState<AreaFilter>('semua');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<WisdomItem | null>(null);

  const filtered = WISDOM_DATA.filter(w => {
    const matchFilter = filter === 'semua' || w.area === filter;
    const matchSearch = !search || w.title.toLowerCase().includes(search.toLowerCase()) || w.pm.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
        {/* Header */}
        <Card style={{ backgroundColor: '#E8EAF6', alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🏛️</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.accent }}>{WISDOM_DATA.length}</Text>
          <Text style={{ fontSize: 13, color: '#3949AB' }}>Situasi Wisdom</Text>
        </Card>

        {/* Filters */}
        <View style={styles.filterRow}>
          {([
            { key: 'semua', label: 'Semua' },
            { key: 'istri', label: '👩 Istri' },
            { key: 'anak', label: '👶 Anak' },
            { key: 'diri', label: '🧘 Diri' },
          ] as { key: AreaFilter; label: string }[]).map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cari situasi..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Wisdom List */}
        {filtered.map(w => (
          <TouchableOpacity
            key={w.id}
            style={[styles.wisdomCard, { borderLeftColor: AREA_COLORS[w.area] }]}
            onPress={() => setSelectedItem(w)}
          >
            <View style={styles.wisdomHeader}>
              <Text style={styles.wisdomIcon}>{w.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wisdomId}>{w.id}</Text>
                <Text style={styles.wisdomTitle}>{w.title}</Text>
              </View>
            </View>
            <Text style={styles.wisdomPrinciple}>{w.pm}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedItem.icon} {selectedItem.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedItem(null)}>
                    <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Arabic Principle */}
                <View style={styles.principleBox}>
                  <Text style={styles.principleArabic}>{selectedItem.p}</Text>
                  <Text style={styles.principleMeaning}>{selectedItem.pm}</Text>
                </View>

                {selectedItem.detail && (
                  <>
                    {selectedItem.trigger && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Trigger</Text>
                        <Text style={styles.detailText}>{selectedItem.trigger}</Text>
                      </View>
                    )}

                    {selectedItem.wrong && selectedItem.wrong.length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: Colors.danger }]}>❌ Respons Salah</Text>
                        {selectedItem.wrong.map((r, i) => (
                          <Text key={i} style={styles.listItem}>• {r}</Text>
                        ))}
                      </View>
                    )}

                    {selectedItem.right && selectedItem.right.length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: Colors.accent }]}>✅ Respons Benar</Text>
                        {selectedItem.right.map((r, i) => (
                          <Text key={i} style={styles.listItem}>• {r}</Text>
                        ))}
                      </View>
                    )}

                    {/* Frameworks */}
                    <View style={styles.frameworkGrid}>
                      {[
                        { icon: '🏛️', name: 'Stoic', value: selectedItem.stoic, color: Colors.accent },
                        { icon: '🧠', name: 'NLP', value: selectedItem.nlp, color: Colors.purple },
                        { icon: '🦋', name: 'Sedona', value: selectedItem.sedona, color: Colors.teal },
                        { icon: '⚛️', name: 'Atomic', value: selectedItem.atomic, color: '#E65100' },
                      ].map((fw, i) => (
                        <View key={i} style={styles.frameworkBox}>
                          <Text style={[styles.frameworkTitle, { color: fw.color }]}>{fw.icon} {fw.name}</Text>
                          <Text style={styles.frameworkValue}>{fw.value || '-'}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {!selectedItem.detail && (
                  <Text style={styles.comingSoon}>Detail lengkap segera hadir...</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 12, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  searchInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, backgroundColor: Colors.white, marginBottom: 12 },
  wisdomCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 8, borderLeftWidth: 4 },
  wisdomHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wisdomIcon: { fontSize: 24 },
  wisdomId: { fontSize: 10, color: Colors.textLight },
  wisdomTitle: { fontSize: 14, fontWeight: '600' },
  wisdomPrinciple: { fontSize: 12, color: Colors.textSecondary, marginTop: 8, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  principleBox: { backgroundColor: '#E8EAF6', borderRadius: BorderRadius.lg, padding: 16, alignItems: 'center', marginBottom: 20 },
  principleArabic: { fontSize: 20, color: Colors.accent, textAlign: 'center' },
  principleMeaning: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  detailSection: { marginBottom: 16 },
  detailLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', color: Colors.accent, marginBottom: 6 },
  detailText: { fontSize: 13, color: Colors.text },
  listItem: { fontSize: 13, color: Colors.textSecondary, lineHeight: 22 },
  frameworkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  frameworkBox: { width: '47%', backgroundColor: '#F5F5F5', borderRadius: BorderRadius.md, padding: 10 },
  frameworkTitle: { fontSize: 11, fontWeight: '600' },
  frameworkValue: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  comingSoon: { textAlign: 'center', color: Colors.textLight, padding: 20 },
});
