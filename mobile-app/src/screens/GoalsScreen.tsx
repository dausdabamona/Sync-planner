import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { getGoals, addGoal, updateGoal, deleteGoal, Goal } from '../database/database';
import { generateId } from '../utils/helpers';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formWhy, setFormWhy] = useState('');

  const loadData = useCallback(async () => {
    setGoals(await getGoals());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    if (editId) {
      await updateGoal(editId, { title: formTitle.trim(), why: formWhy.trim() });
    } else {
      await addGoal({
        id: generateId(),
        title: formTitle.trim(),
        why: formWhy.trim(),
        progress: 0,
        milestones: '[]',
        created_at: new Date().toISOString(),
      });
    }
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormWhy('');
    setEditId(null);
    setShowModal(false);
  };

  const handleEdit = (goal: Goal) => {
    setEditId(goal.id);
    setFormTitle(goal.title);
    setFormWhy(goal.why);
    setShowModal(true);
  };

  const handleProgressChange = async (id: string, delta: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newProgress = Math.max(0, Math.min(100, goal.progress + delta));
    await updateGoal(id, { progress: newProgress });
    loadData();
  };

  const handleDelete = (goal: Goal) => {
    Alert.alert('Hapus Goal', `Hapus "${goal.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await deleteGoal(goal.id); loadData(); } },
    ]);
  };

  const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
        {/* Stats */}
        <Card style={{ backgroundColor: '#E8F5E9' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.accent }}>{goals.length}</Text>
            <Text style={{ fontSize: 12, color: Colors.accent }}>Goals aktif</Text>
            <View style={{ width: '100%', marginTop: 10 }}>
              <ProgressBar progress={avgProgress} color={Colors.accent} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                Rata-rata progress: {avgProgress}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Goals */}
        {goals.map(goal => (
          <Card key={goal.id}>
            <TouchableOpacity onPress={() => handleEdit(goal)} onLongPress={() => handleDelete(goal)}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.why ? <Text style={styles.goalWhy}>{goal.why}</Text> : null}
              <View style={styles.progressRow}>
                <TouchableOpacity style={styles.progressBtn} onPress={() => handleProgressChange(goal.id, -10)}>
                  <Text style={styles.progressBtnText}>-</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <ProgressBar progress={goal.progress} color={goal.progress >= 100 ? Colors.accent : Colors.primary} />
                </View>
                <Text style={styles.progressText}>{goal.progress}%</Text>
                <TouchableOpacity style={styles.progressBtn} onPress={() => handleProgressChange(goal.id, 10)}>
                  <Text style={styles.progressBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Card>
        ))}

        {goals.length === 0 && (
          <Text style={styles.emptyText}>Belum ada goal. Mulai dengan menambahkan goal 12 minggu!</Text>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setShowModal(true); }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Edit Goal' : 'Tambah Goal'}</Text>
              <TouchableOpacity onPress={resetForm}>
                <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Judul goal..."
              value={formTitle}
              onChangeText={setFormTitle}
              autoFocus
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Mengapa goal ini penting? (opsional)"
              value={formWhy}
              onChangeText={setFormWhy}
              multiline
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  goalTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  goalWhy: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  progressBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  progressBtnText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  progressText: { fontSize: 14, fontWeight: '700', color: Colors.primary, width: 40, textAlign: 'center' },
  emptyText: { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingVertical: 40 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, marginBottom: 12 },
  submitBtn: { backgroundColor: Colors.accent, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
