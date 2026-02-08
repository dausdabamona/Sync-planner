import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, ScrollView, Modal } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { TIMER_TYPES, TimerType } from '../data/constants';
import { getPomodoroStats, incrementPomodoro, getDailyActions, PomodoroStats, DailyAction } from '../database/database';
import { formatTime, getToday } from '../utils/helpers';

export default function PomodoroScreen() {
  useKeepAwake();

  const [timerType, setTimerType] = useState<TimerType>('focus');
  const [seconds, setSeconds] = useState(TIMER_TYPES.focus.duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState<PomodoroStats>({ today: 0, total: 0, streak: 0 });
  const [todayActions, setTodayActions] = useState<DailyAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    setStats(await getPomodoroStats());
    setTodayActions(await getDailyActions(getToday()));
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      handleComplete();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, seconds]);

  const handleComplete = async () => {
    if (timerType === 'focus' || timerType === 'deep' || timerType === 'ultra') {
      const newStats = await incrementPomodoro(selectedActionId || undefined);
      setStats(newStats);
      setTodayActions(await getDailyActions(getToday()));
    }
  };

  const selectTimer = (type: TimerType) => {
    setTimerType(type);
    setSeconds(TIMER_TYPES[type].duration * 60);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(TIMER_TYPES[timerType].duration * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const config = TIMER_TYPES[timerType];
  const totalSeconds = config.duration * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const selectedAction = todayActions.find(a => a.id === selectedActionId);

  return (
    <View style={[styles.container, { backgroundColor: config.color }]}>
      {/* Timer Type Selector */}
      <View style={styles.typeRow}>
        {(Object.keys(TIMER_TYPES) as TimerType[]).map(type => (
          <TouchableOpacity key={type} style={[styles.typeBtn, timerType === type && styles.typeBtnActive]} onPress={() => selectTimer(type)}>
            <Text style={styles.typeIcon}>{TIMER_TYPES[type].icon}</Text>
            <Text style={[styles.typeLabel, timerType === type && styles.typeLabelActive]}>{TIMER_TYPES[type].name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Linked Action Selector */}
      <TouchableOpacity style={styles.actionSelector} onPress={() => setShowActionPicker(true)}>
        <Text style={styles.actionSelectorLabel}>
          {selectedAction ? `🎯 ${selectedAction.title}` : '🔗 Pilih aksi yang dikerjakan...'}
        </Text>
        <Text style={styles.actionSelectorChevron}>▼</Text>
      </TouchableOpacity>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <View style={styles.timerRing}>
          <View style={styles.timerInner}>
            <Text style={styles.timerIcon}>{config.icon}</Text>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            <Text style={styles.timerLabel}>{config.name} - {config.duration} menit</Text>
            {selectedAction && (
              <Text style={styles.timerActionLabel}>🍅 {selectedAction.pomodoro_count} sesi</Text>
            )}
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
          <Text style={styles.controlIcon}>🔄</Text>
          <Text style={styles.controlLabel}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={toggleTimer}>
          <Text style={styles.playIcon}>{isActive ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => {
          setIsActive(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setSeconds(0);
          handleComplete();
        }}>
          <Text style={styles.controlIcon}>⏭</Text>
          <Text style={styles.controlLabel}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.today}</Text>
          <Text style={styles.statLabel}>Hari Ini</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round((stats.total * 25) / 60)}h</Text>
          <Text style={styles.statLabel}>Fokus</Text>
        </View>
      </View>

      {/* Action Picker Modal */}
      <Modal visible={showActionPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Aksi</Text>
              <TouchableOpacity onPress={() => setShowActionPicker(false)}>
                <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>Hubungkan sesi pomodoro ke aksi hari ini</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <TouchableOpacity
                style={[styles.actionItem, !selectedActionId && styles.actionItemSelected]}
                onPress={() => { setSelectedActionId(null); setShowActionPicker(false); }}
              >
                <Text style={styles.actionItemText}>Tanpa aksi (sesi bebas)</Text>
              </TouchableOpacity>
              {todayActions.filter(a => !a.done).map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionItem, selectedActionId === action.id && styles.actionItemSelected]}
                  onPress={() => { setSelectedActionId(action.id); setShowActionPicker(false); }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionItemText}>{action.title}</Text>
                    {action.sprint_title && (
                      <Text style={styles.actionItemSprint}>[{action.sprint_title}]</Text>
                    )}
                  </View>
                  <Text style={styles.actionItemPom}>🍅 {action.pomodoro_count}</Text>
                </TouchableOpacity>
              ))}
              {todayActions.filter(a => !a.done).length === 0 && (
                <Text style={styles.emptyText}>Belum ada aksi hari ini. Tambahkan di Planner.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  typeRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 4, marginBottom: 12 },
  typeBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: BorderRadius.md, backgroundColor: 'rgba(255,255,255,0.15)' },
  typeBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  typeIcon: { fontSize: 18 },
  typeLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600' },
  typeLabelActive: { color: '#fff' },
  actionSelector: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 10 },
  actionSelectorLabel: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },
  actionSelectorChevron: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  timerContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  timerRing: { width: 260, height: 260, borderRadius: 130, borderWidth: 6, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  timerInner: { alignItems: 'center' },
  timerIcon: { fontSize: 40, marginBottom: 8 },
  timerText: { fontSize: 56, fontWeight: '200', color: '#fff', letterSpacing: 2 },
  timerLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  timerActionLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, paddingVertical: 20 },
  controlBtn: { alignItems: 'center' },
  controlIcon: { fontSize: 24 },
  controlLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  playIcon: { fontSize: 28, color: '#fff' },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingBottom: 40, gap: 10 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.lg, paddingVertical: 12 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalDesc: { fontSize: 12, color: Colors.textSecondary, marginBottom: 16 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: BorderRadius.md, marginBottom: 4, backgroundColor: '#F5F5F5' },
  actionItemSelected: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: Colors.primary },
  actionItemText: { fontSize: 14, fontWeight: '500' },
  actionItemSprint: { fontSize: 11, color: Colors.purple, marginTop: 2 },
  actionItemPom: { fontSize: 12, color: Colors.textSecondary },
  emptyText: { fontSize: 13, color: Colors.textLight, textAlign: 'center', padding: 20 },
});
