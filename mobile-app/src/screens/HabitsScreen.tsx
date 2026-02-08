import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { SUNNAH_HABITS } from '../data/constants';
import { getHabitsToday, toggleHabit as dbToggleHabit } from '../database/database';

const TIME_LABELS: Record<string, string> = {
  pagi: '🌅 Pagi',
  siang: '☀️ Siang',
  sore: '🌇 Sore',
  malam: '🌙 Malam',
};

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setHabits(await getHabitsToday());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleToggle = async (id: string) => {
    await dbToggleHabit(id);
    setHabits(await getHabitsToday());
  };

  const done = Object.values(habits).filter(Boolean).length;
  const total = SUNNAH_HABITS.length;

  const byTime: Record<string, typeof SUNNAH_HABITS> = { pagi: [], siang: [], sore: [], malam: [] };
  SUNNAH_HABITS.forEach(h => byTime[h.time].push(h));

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: Spacing.lg }}>
        {/* Stats */}
        <Card style={{ backgroundColor: '#F3E5F5' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.purpleLight }}>{done}/{total}</Text>
            <Text style={{ fontSize: 12, color: Colors.purple }}>Sunnah hari ini</Text>
            <View style={{ width: '100%', marginTop: 10 }}>
              <ProgressBar progress={(done / total) * 100} color={Colors.purpleLight} />
            </View>
          </View>
        </Card>

        {/* Arabic Quote */}
        <Card style={{ backgroundColor: '#FFFDE7', alignItems: 'center' }}>
          <Text style={styles.arabicQuote}>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</Text>
          <Text style={styles.quoteTranslation}>"Sebaik-baik kalian adalah yang mempelajari Al-Quran dan mengajarkannya"</Text>
        </Card>

        {/* Habits by Time */}
        {Object.entries(byTime).map(([time, items]) => {
          if (!items.length) return null;
          return (
            <View key={time} style={styles.section}>
              <Text style={styles.sectionTitle}>{TIME_LABELS[time]}</Text>
              {items.map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.habitItem, habits[h.id] && styles.habitDone]}
                  onPress={() => handleToggle(h.id)}
                >
                  <View style={[styles.checkbox, habits[h.id] && styles.checkboxDone]}>
                    {habits[h.id] && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.habitName}>{h.icon} {h.name}</Text>
                    <Text style={styles.habitArabic}>{h.arabic}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        {/* Tips */}
        <Card style={{ backgroundColor: '#E8F5E9' }}>
          <Text style={styles.tipsTitle}>💡 Tips Istiqomah</Text>
          <Text style={styles.tipItem}>• Mulai dengan yang paling mudah</Text>
          <Text style={styles.tipItem}>• Konsisten lebih baik dari sempurna</Text>
          <Text style={styles.tipItem}>• Ajak keluarga bersama-sama</Text>
          <Text style={styles.tipItem}>• Niatkan karena Allah</Text>
        </Card>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  arabicQuote: { fontSize: 18, color: Colors.warning, textAlign: 'center' },
  quoteTranslation: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  habitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 6, gap: 12 },
  habitDone: { backgroundColor: '#F3E5F5' },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: Colors.purpleLight, borderColor: Colors.purpleLight },
  habitName: { fontSize: 14, fontWeight: '600' },
  habitArabic: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  tipsTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  tipItem: { fontSize: 12, color: Colors.textSecondary, lineHeight: 20 },
});
