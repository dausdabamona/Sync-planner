import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, AppState as RNAppState } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { TIMER_TYPES, TimerType } from '../data/constants';
import { getPomodoroStats, incrementPomodoro, PomodoroStats } from '../database/database';
import { formatTime } from '../utils/helpers';

export default function PomodoroScreen() {
  useKeepAwake();

  const [timerType, setTimerType] = useState<TimerType>('focus');
  const [seconds, setSeconds] = useState(TIMER_TYPES.focus.duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState<PomodoroStats>({ today: 0, total: 0, streak: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStats = useCallback(async () => {
    setStats(await getPomodoroStats());
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

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
      const newStats = await incrementPomodoro();
      setStats(newStats);
    }
  };

  const selectTimer = (type: TimerType) => {
    setTimerType(type);
    setSeconds(TIMER_TYPES[type].duration * 60);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(TIMER_TYPES[timerType].duration * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const config = TIMER_TYPES[timerType];
  const totalSeconds = config.duration * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  return (
    <View style={[styles.container, { backgroundColor: config.color }]}>
      {/* Timer Types */}
      <View style={styles.typeRow}>
        {(Object.keys(TIMER_TYPES) as TimerType[]).map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.typeBtn, timerType === type && styles.typeBtnActive]}
            onPress={() => selectTimer(type)}
          >
            <Text style={styles.typeIcon}>{TIMER_TYPES[type].icon}</Text>
            <Text style={[styles.typeLabel, timerType === type && styles.typeLabelActive]}>
              {TIMER_TYPES[type].name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <View style={styles.timerRing}>
          <View style={[styles.timerProgress, { transform: [{ rotate: `${(progress / 100) * 360}deg` }] }]} />
          <View style={styles.timerInner}>
            <Text style={styles.timerIcon}>{config.icon}</Text>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            <Text style={styles.timerLabel}>{config.name} - {config.duration} menit</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  typeRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 4, marginBottom: 20 },
  typeBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: BorderRadius.md, backgroundColor: 'rgba(255,255,255,0.15)' },
  typeBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  typeIcon: { fontSize: 18 },
  typeLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600' },
  typeLabelActive: { color: '#fff' },
  timerContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  timerRing: { width: 260, height: 260, borderRadius: 130, borderWidth: 6, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  timerProgress: { position: 'absolute', width: '100%', height: '100%' },
  timerInner: { alignItems: 'center' },
  timerIcon: { fontSize: 40, marginBottom: 8 },
  timerText: { fontSize: 56, fontWeight: '200', color: '#fff', letterSpacing: 2 },
  timerLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
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
});
