import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Vibration, Modal, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { SHOLAT_LIST, DZIKIR_LIST } from '../data/constants';
import { getSholatToday, toggleSholat as dbToggleSholat, getDzikirToday, updateDzikirCount } from '../database/database';
import { getCurrentHour } from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function IbadahScreen({ route }: any) {
  const initialTab = route?.params?.tab || 'sholat';
  const [activeTab, setActiveTab] = useState<'sholat' | 'dzikir'>(initialTab);
  const [sholat, setSholat] = useState<Record<string, boolean>>({});
  const [dzikirCounts, setDzikirCounts] = useState<Record<string, number>>({});
  const [fullscreenDzikir, setFullscreenDzikir] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setSholat(await getSholatToday());
    setDzikirCounts(await getDzikirToday());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleToggleSholat = async (id: string) => {
    await dbToggleSholat(id);
    setSholat(await getSholatToday());
  };

  const handleDzikirTap = async (id: string, target: number) => {
    const current = dzikirCounts[id] || 0;
    if (current >= target) return;
    const newCount = current + 1;
    Vibration.vibrate(30);
    await updateDzikirCount(id, newCount);
    setDzikirCounts(prev => ({ ...prev, [id]: newCount }));
    if (newCount >= target) {
      Vibration.vibrate([0, 200, 100, 200]);
    }
  };

  const sholatDone = Object.values(sholat).filter(Boolean).length;
  const dzikirDone = DZIKIR_LIST.filter(d => (dzikirCounts[d.id] || 0) >= d.count).length;
  const isPagi = getCurrentHour() < 12;

  const activeDzikir = fullscreenDzikir ? DZIKIR_LIST.find(d => d.id === fullscreenDzikir) : null;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'sholat' && styles.tabActive]} onPress={() => setActiveTab('sholat')}>
          <Text style={[styles.tabText, activeTab === 'sholat' && styles.tabTextActive]}>🕌 Sholat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'dzikir' && styles.tabActive]} onPress={() => setActiveTab('dzikir')}>
          <Text style={[styles.tabText, activeTab === 'dzikir' && styles.tabTextActive]}>📿 Dzikir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
        {activeTab === 'sholat' ? (
          <>
            {/* Sholat Stats */}
            <Card style={{ backgroundColor: '#E8F5E9' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.accent }}>{sholatDone}/8</Text>
                <Text style={{ fontSize: 12, color: Colors.accent }}>Sholat hari ini</Text>
                <View style={{ width: '100%', marginTop: 10 }}>
                  <ProgressBar progress={(sholatDone / 8) * 100} color={Colors.accent} />
                </View>
              </View>
            </Card>

            {/* Sholat List */}
            {SHOLAT_LIST.map(s => (
              <TouchableOpacity key={s.id} style={[styles.sholatItem, sholat[s.id] && styles.sholatDone]} onPress={() => handleToggleSholat(s.id)}>
                <View style={[styles.sholatCheck, sholat[s.id] && styles.sholatCheckDone]}>
                  {sholat[s.id] && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={styles.sholatIcon}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sholatName}>{s.name}</Text>
                  <Text style={styles.sholatTime}>{s.time} - {s.fardhu ? 'Fardhu' : 'Sunnah'}</Text>
                </View>
                {sholat[s.id] && <Text style={{ color: Colors.accent, fontWeight: '700' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {/* Dzikir Stats */}
            <Card style={{ backgroundColor: '#E3F2FD' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600', marginBottom: 4 }}>
                  {isPagi ? '🌅 Dzikir Pagi' : '🌇 Dzikir Sore'}
                </Text>
                <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.primary }}>{dzikirDone}/{DZIKIR_LIST.length}</Text>
                <View style={{ width: '100%', marginTop: 10 }}>
                  <ProgressBar progress={(dzikirDone / DZIKIR_LIST.length) * 100} color={Colors.primary} />
                </View>
              </View>
            </Card>

            {/* Dzikir List */}
            {DZIKIR_LIST.map(d => {
              const count = dzikirCounts[d.id] || 0;
              const completed = count >= d.count;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.dzikirCard, completed && styles.dzikirDone]}
                  onPress={() => setFullscreenDzikir(d.id)}
                >
                  <View style={styles.dzikirHeader}>
                    <Text style={styles.dzikirIcon}>{d.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dzikirArabic}>{d.arabic}</Text>
                      <Text style={styles.dzikirLatin}>{d.latin}</Text>
                    </View>
                    <View style={[styles.countBadge, completed && { backgroundColor: Colors.accent }]}>
                      <Text style={styles.countText}>{count}/{d.count}</Text>
                    </View>
                  </View>
                  <Text style={styles.dzikirMeaning}>{d.meaning}</Text>
                  <Text style={styles.dzikirVirtue}>{d.virtue} ({d.riwayat})</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Fullscreen Dzikir Counter */}
      <Modal visible={!!fullscreenDzikir} animationType="slide">
        {activeDzikir && (
          <TouchableOpacity
            style={[styles.fullscreen, { backgroundColor: (dzikirCounts[activeDzikir.id] || 0) >= activeDzikir.count ? Colors.accent : Colors.primary }]}
            activeOpacity={0.9}
            onPress={() => handleDzikirTap(activeDzikir.id, activeDzikir.count)}
          >
            <TouchableOpacity style={styles.closeBtn} onPress={() => setFullscreenDzikir(null)}>
              <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.fsArabic}>{activeDzikir.arabic}</Text>
            <Text style={styles.fsLatin}>{activeDzikir.latin}</Text>
            <Text style={styles.fsMeaning}>{activeDzikir.meaning}</Text>
            <View style={styles.fsCountContainer}>
              <Text style={styles.fsCount}>{dzikirCounts[activeDzikir.id] || 0}</Text>
              <Text style={styles.fsTarget}>/ {activeDzikir.count}</Text>
            </View>
            <Text style={styles.fsHint}>
              {(dzikirCounts[activeDzikir.id] || 0) >= activeDzikir.count ? '✓ Selesai!' : 'Tap layar untuk menghitung'}
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={async () => {
                await updateDzikirCount(activeDzikir.id, 0);
                setDzikirCounts(prev => ({ ...prev, [activeDzikir.id]: 0 }));
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>🔄 Reset</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </Modal>
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
  sholatItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 8, gap: 12 },
  sholatDone: { backgroundColor: '#E8F5E9' },
  sholatCheck: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  sholatCheckDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  sholatIcon: { fontSize: 24 },
  sholatName: { fontSize: 15, fontWeight: '600' },
  sholatTime: { fontSize: 12, color: Colors.textSecondary },
  dzikirCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 8 },
  dzikirDone: { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: Colors.accent },
  dzikirHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dzikirIcon: { fontSize: 20 },
  dzikirArabic: { fontSize: 16, color: Colors.text, textAlign: 'right' },
  dzikirLatin: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  countBadge: { backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dzikirMeaning: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
  dzikirVirtue: { fontSize: 11, color: Colors.accent, marginTop: 4, fontWeight: '600' },
  fullscreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  closeBtn: { position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  fsArabic: { fontSize: 24, color: '#fff', textAlign: 'center', lineHeight: 40 },
  fsLatin: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 12 },
  fsMeaning: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8 },
  fsCountContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 30 },
  fsCount: { fontSize: 80, fontWeight: '200', color: '#fff' },
  fsTarget: { fontSize: 24, color: 'rgba(255,255,255,0.6)', marginLeft: 4 },
  fsHint: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 20 },
  resetBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
});
