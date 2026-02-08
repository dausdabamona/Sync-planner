import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { getReview, saveReview, WeeklyReview } from '../database/database';
import { getToday } from '../utils/helpers';

export default function ReviewScreen() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [editing, setEditing] = useState(false);
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [lessons, setLessons] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [rating, setRating] = useState(0);

  const weekDate = getToday(); // Use current date as week identifier

  const loadData = useCallback(async () => {
    const r = await getReview(weekDate);
    setReview(r);
    if (r) {
      setWins(r.wins);
      setChallenges(r.challenges);
      setLessons(r.lessons);
      setNextWeek(r.next_week);
      setRating(r.rating);
    }
  }, [weekDate]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSave = async () => {
    if (!wins.trim() && !challenges.trim() && !lessons.trim()) {
      Alert.alert('Info', 'Isi minimal satu field');
      return;
    }
    await saveReview({
      date: weekDate,
      wins: wins.trim(),
      challenges: challenges.trim(),
      lessons: lessons.trim(),
      next_week: nextWeek.trim(),
      rating,
    });
    setEditing(false);
    loadData();
  };

  if (review && !editing) {
    return (
      <ScrollView style={styles.container}>
        <View style={{ padding: Spacing.lg }}>
          <Card style={{ backgroundColor: '#E3F2FD', alignItems: 'center' }}>
            <Text style={{ fontSize: 32 }}>📊</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary, marginTop: 4 }}>Weekly Review</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <Text key={n} style={{ fontSize: 24 }}>{n <= review.rating ? '⭐' : '☆'}</Text>
              ))}
            </View>
          </Card>

          <Card>
            <Text style={styles.fieldLabel}>🏆 Kemenangan Minggu Ini</Text>
            <Text style={styles.fieldValue}>{review.wins || '-'}</Text>
          </Card>

          <Card>
            <Text style={styles.fieldLabel}>⚡ Tantangan</Text>
            <Text style={styles.fieldValue}>{review.challenges || '-'}</Text>
          </Card>

          <Card>
            <Text style={styles.fieldLabel}>📖 Pelajaran</Text>
            <Text style={styles.fieldValue}>{review.lessons || '-'}</Text>
          </Card>

          <Card>
            <Text style={styles.fieldLabel}>🎯 Rencana Minggu Depan</Text>
            <Text style={styles.fieldValue}>{review.next_week || '-'}</Text>
          </Card>

          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>Edit Review</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: Spacing.lg }}>
        <Card style={{ backgroundColor: '#E3F2FD', alignItems: 'center' }}>
          <Text style={{ fontSize: 32 }}>📊</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary, marginTop: 4 }}>Weekly Review</Text>
        </Card>

        {/* Rating */}
        <Card>
          <Text style={styles.fieldLabel}>Nilai minggu ini</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={{ fontSize: 32 }}>{n <= rating ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.fieldLabel}>🏆 Kemenangan minggu ini</Text>
          <TextInput style={styles.input} value={wins} onChangeText={setWins} placeholder="Apa yang berhasil dicapai..." multiline />
        </Card>

        <Card>
          <Text style={styles.fieldLabel}>⚡ Tantangan yang dihadapi</Text>
          <TextInput style={styles.input} value={challenges} onChangeText={setChallenges} placeholder="Apa yang sulit..." multiline />
        </Card>

        <Card>
          <Text style={styles.fieldLabel}>📖 Pelajaran</Text>
          <TextInput style={styles.input} value={lessons} onChangeText={setLessons} placeholder="Apa yang dipelajari..." multiline />
        </Card>

        <Card>
          <Text style={styles.fieldLabel}>🎯 Rencana minggu depan</Text>
          <TextInput style={styles.input} value={nextWeek} onChangeText={setNextWeek} placeholder="Apa yang mau dicapai..." multiline />
        </Card>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Simpan Review</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  ratingRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  fieldValue: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  editBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
