import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/theme';
import { getTasks, addTask, updateTask, deleteTask, Task } from '../database/database';
import { generateId } from '../utils/helpers';

type ViewMode = 'list' | 'kanban';
type TaskStatus = 'backlog' | 'todo' | 'progress' | 'done';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: Colors.statusBacklog },
  todo: { label: 'To Do', color: Colors.statusTodo },
  progress: { label: 'In Progress', color: Colors.statusProgress },
  done: { label: 'Done', color: Colors.statusDone },
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const loadData = useCallback(async () => {
    setTasks(await getTasks());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addTask({
      id: generateId(),
      title: newTitle.trim(),
      priority: newPriority,
      status: 'todo',
      created_at: new Date().toISOString(),
    });
    setNewTitle('');
    setNewPriority('medium');
    setShowModal(false);
    loadData();
  };

  const handleToggle = async (task: Task) => {
    await updateTask(task.id, { done: !task.done, status: task.done ? 'todo' : 'done' });
    loadData();
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status, done: status === 'done' });
    loadData();
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Hapus Task', `Hapus "${task.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await deleteTask(task.id); loadData(); } },
    ]);
  };

  const todoCount = tasks.filter(t => !t.done).length;
  const doneCount = tasks.filter(t => t.done).length;

  const renderListView = () => (
    <>
      {tasks.filter(t => !t.done).map(task => (
        <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => handleToggle(task)} onLongPress={() => handleDelete(task)}>
          <View style={[styles.taskCheck, task.done && styles.taskCheckDone]}>
            {task.done && <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <Text style={[styles.badge, { backgroundColor: task.priority === 'high' ? '#FFEBEE' : task.priority === 'medium' ? '#FFF8E1' : '#E8F5E9', color: task.priority === 'high' ? Colors.danger : task.priority === 'medium' ? Colors.warning : Colors.accent }]}>
                {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
              </Text>
              <Text style={[styles.badge, { backgroundColor: STATUS_CONFIG[task.status].color + '20', color: STATUS_CONFIG[task.status].color }]}>
                {STATUS_CONFIG[task.status].label}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {doneCount > 0 && (
        <>
          <Text style={styles.sectionTitle}>✓ Selesai ({doneCount})</Text>
          {tasks.filter(t => t.done).map(task => (
            <TouchableOpacity key={task.id} style={[styles.taskItem, { opacity: 0.5 }]} onPress={() => handleToggle(task)} onLongPress={() => handleDelete(task)}>
              <View style={[styles.taskCheck, styles.taskCheckDone]}>
                <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text>
              </View>
              <Text style={[styles.taskTitle, { textDecorationLine: 'line-through', color: Colors.textLight }]}>{task.title}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </>
  );

  const renderKanbanView = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {(['backlog', 'todo', 'progress', 'done'] as TaskStatus[]).map(status => {
        const columnTasks = tasks.filter(t => t.status === status);
        return (
          <View key={status} style={styles.kanbanColumn}>
            <View style={[styles.kanbanHeader, { borderBottomColor: STATUS_CONFIG[status].color }]}>
              <Text style={[styles.kanbanTitle, { color: STATUS_CONFIG[status].color }]}>
                {STATUS_CONFIG[status].label} ({columnTasks.length})
              </Text>
            </View>
            {columnTasks.map(task => (
              <TouchableOpacity key={task.id} style={styles.kanbanCard} onLongPress={() => handleDelete(task)}>
                <Text style={styles.kanbanCardTitle}>{task.title}</Text>
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                  <Text style={[styles.badge, { fontSize: 10, backgroundColor: task.priority === 'high' ? '#FFEBEE' : task.priority === 'medium' ? '#FFF8E1' : '#E8F5E9', color: task.priority === 'high' ? Colors.danger : task.priority === 'medium' ? Colors.warning : Colors.accent }]}>
                    {task.priority}
                  </Text>
                </View>
                <View style={styles.kanbanActions}>
                  {status !== 'backlog' && (
                    <TouchableOpacity onPress={() => {
                      const prev: Record<string, TaskStatus> = { todo: 'backlog', progress: 'todo', done: 'progress' };
                      handleStatusChange(task.id, prev[status]);
                    }}>
                      <Text style={styles.kanbanActionText}>← </Text>
                    </TouchableOpacity>
                  )}
                  {status !== 'done' && (
                    <TouchableOpacity onPress={() => {
                      const next: Record<string, TaskStatus> = { backlog: 'todo', todo: 'progress', progress: 'done' };
                      handleStatusChange(task.id, next[status]);
                    }}>
                      <Text style={styles.kanbanActionText}> →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Stats */}
      <Card style={{ backgroundColor: '#E3F2FD', marginHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: Colors.primary }}>{todoCount}</Text>
          <Text style={{ fontSize: 12, color: Colors.primary }}>Task aktif</Text>
        </View>
      </Card>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]} onPress={() => setViewMode('list')}>
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>📋 List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, viewMode === 'kanban' && styles.toggleActive]} onPress={() => setViewMode('kanban')}>
          <Text style={[styles.toggleText, viewMode === 'kanban' && styles.toggleTextActive]}>📊 Kanban</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: viewMode === 'list' ? Spacing.lg : 0 }}>
        {viewMode === 'list' ? renderListView() : renderKanbanView()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Task</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Apa yang perlu dikerjakan?"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <Text style={styles.label}>Prioritas</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, newPriority === p && styles.priorityActive]}
                  onPress={() => setNewPriority(p)}
                >
                  <Text style={styles.priorityLabel}>
                    {p === 'high' ? '🔴 High' : p === 'medium' ? '🟡 Medium' : '🟢 Low'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
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
  viewToggle: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginVertical: Spacing.md, gap: 8 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.md, backgroundColor: Colors.surface },
  toggleActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  toggleTextActive: { color: '#fff' },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 10 },
  taskCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  taskTitle: { fontSize: 14, color: Colors.text },
  badge: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden', fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginTop: 20, marginBottom: 8 },
  kanbanColumn: { width: 220, marginHorizontal: 6, backgroundColor: '#F0F0F0', borderRadius: BorderRadius.lg, padding: 8 },
  kanbanHeader: { borderBottomWidth: 3, paddingBottom: 8, marginBottom: 8 },
  kanbanTitle: { fontSize: 13, fontWeight: '700' },
  kanbanCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: 10, marginBottom: 6, elevation: 1 },
  kanbanCardTitle: { fontSize: 13, fontWeight: '500' },
  kanbanActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  kanbanActionText: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, color: Colors.textSecondary },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priorityBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  priorityActive: { borderColor: Colors.primary, backgroundColor: '#E3F2FD' },
  priorityLabel: { fontSize: 12, fontWeight: '600' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
