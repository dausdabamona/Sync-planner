import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/theme';
import { SHOLAT_LIST, DZIKIR_LIST, WISDOM_QUOTES, BEST_WEEK_TEMPLATE } from '../data/constants';
import { getSholatToday, toggleSholat, getDzikirToday, getTasks, updateTask, getJournalToday, Task, JournalEntry } from '../database/database';
import { formatDate, getGreeting, getRandomItem, isWeekend } from '../utils/helpers';

export default function HomeScreen({ navigation }: any) {
  const [quote, setQuote] = useState(getRandomItem(WISDOM_QUOTES));
  const [sholat, setSholat] = useState<Record<string, boolean>>({});
  const [dzikir, setDzikir] = useState<Record<string, number>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journal, setJournal] = useState<JournalEntry>({ morning: null, evening: null });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [s, d, t, j] = await Promise.all([
      getSholatToday(),
      getDzikirToday(),
      getTasks(),
      getJournalToday(),
    ]);
    setSholat(s);
    setDzikir(d);
    setTasks(t.filter(task => !task.done).slice(0, 3));
    setJournal(j);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleSholat = async (id: string) => {
    await toggleSholat(id);
    setSholat(await getSholatToday());
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { done: !task.done });
      setTasks((await getTasks()).filter(t => !t.done).slice(0, 3));
    }
  };

  const sholatDone = Object.values(sholat).filter(Boolean).length;
  const dzikirDone = DZIKIR_LIST.filter(d => (dzikir[d.id] || 0) >= d.count).length;
  const schedule = isWeekend() ? BEST_WEEK_TEMPLATE.weekend : BEST_WEEK_TEMPLATE.weekdays;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        <Text style={styles.translation}>Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang</Text>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.date}>{formatDate(new Date())}</Text>

        <View style={styles.headerStats}>
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Ibadah')}>
            <Text style={styles.statIcon}>🕌</Text>
            <Text style={styles.statValue}>{sholatDone}/8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Ibadah', { tab: 'dzikir' })}>
            <Text style={styles.statIcon}>📿</Text>
            <Text style={styles.statValue}>{dzikirDone}/{DZIKIR_LIST.length}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Quote */}
        <Card>
          <View style={styles.quoteRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={styles.quoteSource}>-- {quote.source}</Text>
            </View>
            <TouchableOpacity onPress={() => setQuote(getRandomItem(WISDOM_QUOTES))}>
              <Text style={{ fontSize: 20 }}>🔄</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => navigation.navigate('Pomodoro')}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionLabel}>Fokus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Ibadah', { tab: 'dzikir' })}>
            <Text style={styles.actionIcon}>📿</Text>
            <Text style={styles.actionLabel}>Dzikir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Journal')}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionLabel}>Jurnal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Wisdom')}>
            <Text style={styles.actionIcon}>🏛️</Text>
            <Text style={styles.actionLabel}>Wisdom</Text>
          </TouchableOpacity>
        </View>

        {/* Journal Status */}
        <View style={styles.twoCol}>
          <TouchableOpacity style={[styles.journalCard, { backgroundColor: '#FFF8E1' }]} onPress={() => navigation.navigate('Journal')}>
            <Text style={styles.journalTitle}>☀️ Jurnal Pagi</Text>
            <Text style={[styles.journalStatus, { color: journal.morning ? Colors.accent : Colors.warning }]}>
              {journal.morning ? '✓ Sudah diisi' : 'Belum diisi'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.journalCard, { backgroundColor: '#E8EAF6' }]} onPress={() => navigation.navigate('Journal')}>
            <Text style={styles.journalTitle}>🌙 Jurnal Malam</Text>
            <Text style={[styles.journalStatus, { color: journal.evening ? Colors.accent : Colors.warning }]}>
              {journal.evening ? '✓ Sudah diisi' : 'Belum diisi'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sholat & Dzikir Summary */}
        <View style={styles.twoCol}>
          <TouchableOpacity style={styles.summaryCard} onPress={() => navigation.navigate('Ibadah')}>
            <Text style={{ fontSize: 14 }}>🕌 Sholat</Text>
            <Text style={styles.summaryValue}>{sholatDone}/8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.summaryCard} onPress={() => navigation.navigate('Ibadah', { tab: 'dzikir' })}>
            <Text style={{ fontSize: 14 }}>📿 Dzikir</Text>
            <Text style={styles.summaryValue}>{dzikirDone}/{DZIKIR_LIST.length}</Text>
          </TouchableOpacity>
        </View>

        {/* Sholat Detail */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🕌 Sholat Hari Ini</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ibadah')}>
              <Text style={styles.cardAction}>Detail →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sholatGrid}>
            {SHOLAT_LIST.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sholatItem, sholat[s.id] && styles.sholatDone]}
                onPress={() => handleToggleSholat(s.id)}
              >
                <Text style={styles.sholatCheck}>{sholat[s.id] ? '✓' : ''}</Text>
                <Text style={styles.sholatName}>{s.icon} {s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Tasks */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📌 Fokus Hari Ini</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.cardAction}>Semua →</Text>
            </TouchableOpacity>
          </View>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada task</Text>
          ) : (
            tasks.map(t => (
              <TouchableOpacity key={t.id} style={styles.taskItem} onPress={() => handleToggleTask(t.id)}>
                <View style={[styles.taskCheck, t.done && styles.taskCheckDone]}>
                  {t.done && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={[styles.taskTitle, t.done && styles.taskTitleDone]}>{t.title}</Text>
                <View style={[styles.priorityDot, { backgroundColor: t.priority === 'high' ? Colors.danger : t.priority === 'medium' ? Colors.warning : Colors.accent }]} />
              </TouchableOpacity>
            ))
          )}
        </Card>

        {/* Schedule */}
        <Card>
          <Text style={styles.cardTitle}>📅 Jadwal Hari Ini</Text>
          {schedule.slice(0, 8).map((item, i) => (
            <View key={i} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <Text style={styles.scheduleActivity}>{item.activity}</Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.xl, paddingTop: 50, alignItems: 'center' },
  bismillah: { fontSize: 20, color: Colors.gold, fontWeight: '600', textAlign: 'center' },
  translation: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'center' },
  greeting: { fontSize: 18, color: '#fff', fontWeight: '700', marginTop: 12 },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerStats: { flexDirection: 'row', gap: 20, marginTop: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  statIcon: { fontSize: 16 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  content: { padding: Spacing.lg, marginTop: -8 },
  quoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  quoteText: { fontSize: 13, lineHeight: 20, color: Colors.text, fontStyle: 'italic' },
  quoteSource: { fontSize: 12, color: Colors.gold, marginTop: 6, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingVertical: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: '#fff' },
  twoCol: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  journalCard: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, elevation: 1 },
  journalTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  journalStatus: { fontSize: 12, fontWeight: '500' },
  summaryCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', elevation: 1 },
  summaryValue: { fontSize: 28, fontWeight: '700', color: Colors.accent, marginTop: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  cardAction: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  sholatGrid: { gap: 6 },
  sholatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: BorderRadius.sm, backgroundColor: '#F5F5F5' },
  sholatDone: { backgroundColor: '#E8F5E9' },
  sholatCheck: { width: 20, fontSize: 14, color: Colors.accent, fontWeight: '700' },
  sholatName: { fontSize: 13 },
  emptyText: { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingVertical: 16 },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  taskCheckDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  taskTitle: { flex: 1, fontSize: 13 },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textLight },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  scheduleItem: { flexDirection: 'row', paddingVertical: 6, gap: 12 },
  scheduleTime: { fontSize: 12, color: Colors.primary, fontWeight: '600', width: 45 },
  scheduleActivity: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
});
