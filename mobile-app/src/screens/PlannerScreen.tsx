import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getWeeklySprints, addWeeklySprint, deleteWeeklySprint, getActionsForSprint,
  getDailyActions, addDailyAction, updateDailyAction, deleteDailyAction,
  getMonthlyMilestones, WeeklySprint, DailyAction, MonthlyMilestone,
} from '../database/database';
import {
  getWeekStart, getWeekLabel, getToday, getMonth, generateId, formatDate,
} from '../utils/helpers';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

type Tab = 'sprint' | 'action';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  planned: { bg: '#E3F2FD', text: Colors.primary },
  active: { bg: '#FFF8E1', text: Colors.warning },
  completed: { bg: '#E8F5E9', text: Colors.accent },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: Colors.priorityHigh,
  medium: Colors.priorityMedium,
  low: Colors.priorityLow,
};

export default function PlannerScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('sprint');

  // --- Sprint tab state ---
  const [sprints, setSprints] = useState<WeeklySprint[]>([]);
  const [sprintActions, setSprintActions] = useState<Record<string, DailyAction[]>>({});
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintTitle, setSprintTitle] = useState('');
  const [sprintDesc, setSprintDesc] = useState('');
  const [sprintMilestoneId, setSprintMilestoneId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MonthlyMilestone[]>([]);

  // --- Action tab state ---
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionPriority, setActionPriority] = useState<string>('medium');
  const [actionSprintId, setActionSprintId] = useState<string | null>(null);
  const [actionDate, setActionDate] = useState(getToday());

  // --- Detail modal state ---
  const [detailAction, setDetailAction] = useState<DailyAction | null>(null);
  const [detailNotes, setDetailNotes] = useState('');

  // ================================================================
  // DATA LOADING
  // ================================================================

  const loadSprints = useCallback(async () => {
    const weekStart = getWeekStart();
    const data = await getWeeklySprints(weekStart);
    setSprints(data);
    const currentMonth = getMonth();
    const ms = await getMonthlyMilestones(currentMonth);
    setMilestones(ms);
  }, []);

  const loadActions = useCallback(async () => {
    const today = getToday();
    const data = await getDailyActions(today);
    setActions(data);
  }, []);

  const loadAll = useCallback(async () => {
    await loadSprints();
    await loadActions();
  }, [loadSprints, loadActions]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  // ================================================================
  // SPRINT HANDLERS
  // ================================================================

  const toggleExpandSprint = async (sprintId: string) => {
    if (expandedSprint === sprintId) {
      setExpandedSprint(null);
      return;
    }
    if (!sprintActions[sprintId]) {
      const acts = await getActionsForSprint(sprintId);
      setSprintActions(prev => ({ ...prev, [sprintId]: acts }));
    }
    setExpandedSprint(sprintId);
  };

  const refreshSprintActions = async (sprintId: string) => {
    const acts = await getActionsForSprint(sprintId);
    setSprintActions(prev => ({ ...prev, [sprintId]: acts }));
  };

  const handleToggleSprintAction = async (action: DailyAction) => {
    await updateDailyAction(action.id, { done: !action.done });
    if (action.sprint_id) {
      await refreshSprintActions(action.sprint_id);
    }
    await loadSprints();
    await loadActions();
  };

  const handleAddSprint = async () => {
    if (!sprintTitle.trim()) return;
    const weekStart = getWeekStart();
    await addWeeklySprint({
      id: generateId(),
      milestone_id: sprintMilestoneId,
      title: sprintTitle.trim(),
      description: sprintDesc.trim(),
      week_start: weekStart,
      status: 'planned',
      created_at: new Date().toISOString(),
    });
    resetSprintForm();
    loadSprints();
  };

  const resetSprintForm = () => {
    setSprintTitle('');
    setSprintDesc('');
    setSprintMilestoneId(null);
    setShowSprintModal(false);
  };

  const handleDeleteSprint = (sprint: WeeklySprint) => {
    Alert.alert('Hapus Sprint', `Hapus "${sprint.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          await deleteWeeklySprint(sprint.id);
          setExpandedSprint(null);
          loadSprints();
        },
      },
    ]);
  };

  // ================================================================
  // ACTION HANDLERS
  // ================================================================

  const handleToggleAction = async (action: DailyAction) => {
    await updateDailyAction(action.id, { done: !action.done });
    loadActions();
    loadSprints();
  };

  const handleAddAction = async () => {
    if (!actionTitle.trim()) return;
    await addDailyAction({
      id: generateId(),
      sprint_id: actionSprintId,
      title: actionTitle.trim(),
      date: actionDate,
      priority: actionPriority,
      notes: '',
      created_at: new Date().toISOString(),
    });
    resetActionForm();
    loadActions();
    loadSprints();
  };

  const resetActionForm = () => {
    setActionTitle('');
    setActionPriority('medium');
    setActionSprintId(null);
    setActionDate(getToday());
    setShowActionModal(false);
  };

  const handleDeleteAction = (action: DailyAction) => {
    Alert.alert('Hapus Aksi', `Hapus "${action.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          await deleteDailyAction(action.id);
          loadActions();
          loadSprints();
        },
      },
    ]);
  };

  const openDetailModal = (action: DailyAction) => {
    setDetailAction(action);
    setDetailNotes(action.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!detailAction) return;
    await updateDailyAction(detailAction.id, { notes: detailNotes });
    setDetailAction(null);
    loadActions();
  };

  // ================================================================
  // COMPUTED VALUES
  // ================================================================

  const weekStart = getWeekStart();
  const weekLabel = getWeekLabel(weekStart);
  const sprintTotalActions = sprints.reduce((s, sp) => s + (sp.actions_total || 0), 0);
  const sprintDoneActions = sprints.reduce((s, sp) => s + (sp.actions_done || 0), 0);
  const sprintProgress = sprintTotalActions > 0 ? Math.round((sprintDoneActions / sprintTotalActions) * 100) : 0;

  const actionsDone = actions.filter(a => a.done).length;
  const actionsTotal = actions.length;
  const actionProgress = actionsTotal > 0 ? Math.round((actionsDone / actionsTotal) * 100) : 0;

  const todayLabel = formatDate(new Date());

  // ================================================================
  // RENDER: SPRINT TAB
  // ================================================================

  const renderSprintTab = () => (
    <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
      {/* Header Card */}
      <Card style={{ backgroundColor: '#E3F2FD' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary, marginBottom: 4 }}>
            {weekLabel}
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.primary }}>
            {sprintDoneActions}/{sprintTotalActions}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.primary }}>Aksi selesai minggu ini</Text>
          <View style={{ width: '100%', marginTop: 10 }}>
            <ProgressBar progress={sprintProgress} color={Colors.primary} />
          </View>
        </View>
      </Card>

      {/* Sprint List */}
      {sprints.map(sprint => {
        const total = sprint.actions_total || 0;
        const done = sprint.actions_done || 0;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        const statusStyle = STATUS_COLORS[sprint.status] || STATUS_COLORS.planned;
        const isExpanded = expandedSprint === sprint.id;
        const expandedActions = sprintActions[sprint.id] || [];

        return (
          <Card key={sprint.id}>
            <TouchableOpacity
              onPress={() => toggleExpandSprint(sprint.id)}
              onLongPress={() => handleDeleteSprint(sprint)}
              activeOpacity={0.7}
            >
              {/* Sprint Title Row */}
              <View style={styles.sprintTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sprintTitle}>{sprint.title}</Text>
                  {sprint.milestone_title ? (
                    <View style={styles.milestoneBadge}>
                      <Text style={styles.milestoneBadgeText}>M: {sprint.milestone_title}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                    {sprint.status}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={{ marginTop: 10 }}>
                <ProgressBar progress={progress} color={statusStyle.text} />
                <Text style={styles.progressLabel}>{done}/{total} aksi</Text>
              </View>

              {/* Expand indicator */}
              <Text style={styles.expandIndicator}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Expanded Actions */}
            {isExpanded && (
              <View style={styles.expandedSection}>
                {expandedActions.length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada aksi untuk sprint ini</Text>
                ) : (
                  expandedActions.map(action => (
                    <TouchableOpacity
                      key={action.id}
                      style={styles.sprintActionItem}
                      onPress={() => handleToggleSprintAction(action)}
                    >
                      <View style={[styles.checkbox, action.done && styles.checkboxDone]}>
                        {action.done && <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text>}
                      </View>
                      <Text style={[
                        styles.sprintActionTitle,
                        action.done && { textDecorationLine: 'line-through', color: Colors.textLight },
                      ]}>
                        {action.title}
                      </Text>
                      <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium }]} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </Card>
        );
      })}

      {sprints.length === 0 && (
        <Text style={styles.emptyText}>Belum ada sprint minggu ini. Tambahkan sprint pertamamu!</Text>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  // ================================================================
  // RENDER: ACTION TAB
  // ================================================================

  const renderActionTab = () => (
    <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
      {/* Header Card */}
      <Card style={{ backgroundColor: '#E8F5E9' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.accent, marginBottom: 4 }}>
            {todayLabel}
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.accent }}>
            {actionsDone}/{actionsTotal}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.accent }}>Aksi hari ini</Text>
          <View style={{ width: '100%', marginTop: 10 }}>
            <ProgressBar progress={actionProgress} color={Colors.accent} />
          </View>
        </View>
      </Card>

      {/* Action List */}
      {actions.map(action => (
        <TouchableOpacity
          key={action.id}
          style={[styles.actionItem, action.done && styles.actionItemDone]}
          onPress={() => openDetailModal(action)}
          onLongPress={() => handleDeleteAction(action)}
          activeOpacity={0.7}
        >
          {/* Checkbox */}
          <TouchableOpacity
            style={[styles.checkbox, action.done && styles.checkboxDone]}
            onPress={() => handleToggleAction(action)}
          >
            {action.done && <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text>}
          </TouchableOpacity>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={[
              styles.actionTitle,
              action.done && { textDecorationLine: 'line-through', color: Colors.textLight },
            ]}>
              {action.title}
            </Text>

            {/* Badges row */}
            <View style={styles.badgeRow}>
              {action.sprint_title ? (
                <View style={styles.sprintLabelBadge}>
                  <Text style={styles.sprintLabelText}>S: {action.sprint_title}</Text>
                </View>
              ) : null}
              {action.pomodoro_count > 0 && (
                <View style={styles.pomodoroBadge}>
                  <Text style={styles.pomodoroText}>🍅 {action.pomodoro_count}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Priority dot */}
          <View style={[styles.priorityDotLarge, { backgroundColor: PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium }]} />
        </TouchableOpacity>
      ))}

      {actions.length === 0 && (
        <Text style={styles.emptyText}>Belum ada aksi hari ini. Tambahkan aksi pertamamu!</Text>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  // ================================================================
  // MAIN RENDER
  // ================================================================

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sprint' && styles.tabActive]}
          onPress={() => setActiveTab('sprint')}
        >
          <Text style={[styles.tabText, activeTab === 'sprint' && styles.tabTextActive]}>
            Sprint Minggu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'action' && styles.tabActive]}
          onPress={() => setActiveTab('action')}
        >
          <Text style={[styles.tabText, activeTab === 'action' && styles.tabTextActive]}>
            Aksi Hari Ini
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'sprint' ? renderSprintTab() : renderActionTab()}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: activeTab === 'sprint' ? Colors.primary : Colors.accent }]}
        onPress={() => activeTab === 'sprint' ? setShowSprintModal(true) : setShowActionModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ============================================================ */}
      {/* ADD SPRINT MODAL                                              */}
      {/* ============================================================ */}
      <Modal visible={showSprintModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Sprint</Text>
              <TouchableOpacity onPress={resetSprintForm}>
                <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Judul sprint..."
              value={sprintTitle}
              onChangeText={setSprintTitle}
              autoFocus
            />

            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Deskripsi (opsional)"
              value={sprintDesc}
              onChangeText={setSprintDesc}
              multiline
            />

            {/* Milestone Picker */}
            <Text style={styles.label}>Milestone (opsional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={[styles.pickerChip, sprintMilestoneId === null && styles.pickerChipActive]}
                onPress={() => setSprintMilestoneId(null)}
              >
                <Text style={[styles.pickerChipText, sprintMilestoneId === null && styles.pickerChipTextActive]}>
                  Tanpa milestone
                </Text>
              </TouchableOpacity>
              {milestones.map(ms => (
                <TouchableOpacity
                  key={ms.id}
                  style={[styles.pickerChip, sprintMilestoneId === ms.id && styles.pickerChipActive]}
                  onPress={() => setSprintMilestoneId(ms.id)}
                >
                  <Text style={[styles.pickerChipText, sprintMilestoneId === ms.id && styles.pickerChipTextActive]}>
                    {ms.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Colors.primary }]} onPress={handleAddSprint}>
              <Text style={styles.submitText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* ADD ACTION MODAL                                              */}
      {/* ============================================================ */}
      <Modal visible={showActionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Aksi</Text>
              <TouchableOpacity onPress={resetActionForm}>
                <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Apa yang perlu dilakukan?"
              value={actionTitle}
              onChangeText={setActionTitle}
              autoFocus
            />

            {/* Priority Picker */}
            <Text style={styles.label}>Prioritas</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, actionPriority === p && styles.priorityActive]}
                  onPress={() => setActionPriority(p)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                  <Text style={styles.priorityLabel}>
                    {p === 'high' ? 'Tinggi' : p === 'medium' ? 'Sedang' : 'Rendah'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sprint Picker */}
            <Text style={styles.label}>Sprint (opsional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={[styles.pickerChip, actionSprintId === null && styles.pickerChipActive]}
                onPress={() => setActionSprintId(null)}
              >
                <Text style={[styles.pickerChipText, actionSprintId === null && styles.pickerChipTextActive]}>
                  Tanpa sprint
                </Text>
              </TouchableOpacity>
              {sprints.map(sp => (
                <TouchableOpacity
                  key={sp.id}
                  style={[styles.pickerChip, actionSprintId === sp.id && styles.pickerChipActive]}
                  onPress={() => setActionSprintId(sp.id)}
                >
                  <Text style={[styles.pickerChipText, actionSprintId === sp.id && styles.pickerChipTextActive]}>
                    {sp.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date */}
            <Text style={styles.label}>Tanggal</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={actionDate}
              onChangeText={setActionDate}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Colors.accent }]} onPress={handleAddAction}>
              <Text style={styles.submitText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* ACTION DETAIL MODAL                                           */}
      {/* ============================================================ */}
      <Modal visible={!!detailAction} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {detailAction && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail Aksi</Text>
                  <TouchableOpacity onPress={() => setDetailAction(null)}>
                    <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.detailTitle}>{detailAction.title}</Text>

                {/* Detail info row */}
                <View style={styles.detailInfoRow}>
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[detailAction.priority] || PRIORITY_COLORS.medium }]} />
                  <Text style={styles.detailInfoText}>
                    {detailAction.priority === 'high' ? 'Tinggi' : detailAction.priority === 'medium' ? 'Sedang' : 'Rendah'}
                  </Text>
                  {detailAction.sprint_title ? (
                    <View style={styles.sprintLabelBadge}>
                      <Text style={styles.sprintLabelText}>S: {detailAction.sprint_title}</Text>
                    </View>
                  ) : null}
                  {detailAction.pomodoro_count > 0 && (
                    <View style={styles.pomodoroBadge}>
                      <Text style={styles.pomodoroText}>🍅 {detailAction.pomodoro_count}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.label}>Catatan</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Tambahkan catatan..."
                  value={detailNotes}
                  onChangeText={setDetailNotes}
                  multiline
                />

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Colors.accent }]} onPress={handleSaveNotes}>
                  <Text style={styles.submitText}>Simpan Catatan</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Tab bar
  tabRow: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },

  // Sprint card
  sprintTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  sprintTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  milestoneBadge: { backgroundColor: '#F3E5F5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start' },
  milestoneBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.purple },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  progressLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'right', marginTop: 4 },
  expandIndicator: { fontSize: 11, color: Colors.textLight, textAlign: 'center', marginTop: 8 },

  // Expanded sprint actions
  expandedSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 10 },
  sprintActionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  sprintActionTitle: { flex: 1, fontSize: 13, color: Colors.text },

  // Checkbox
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },

  // Action items
  actionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 8, gap: 12 },
  actionItemDone: { backgroundColor: '#F5F5F5', opacity: 0.7 },
  actionTitle: { fontSize: 14, fontWeight: '500', color: Colors.text },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  sprintLabelBadge: { backgroundColor: '#E3F2FD', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  sprintLabelText: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  pomodoroBadge: { backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  pomodoroText: { fontSize: 10, fontWeight: '600', color: Colors.warning },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityDotLarge: { width: 10, height: 10, borderRadius: 5 },

  // Detail modal
  detailTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  detailInfoText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  // Empty state
  emptyText: { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingVertical: 30 },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 14, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, color: Colors.textSecondary },

  // Priority picker
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priorityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  priorityActive: { borderColor: Colors.primary, backgroundColor: '#E3F2FD' },
  priorityLabel: { fontSize: 12, fontWeight: '600' },

  // Picker chips
  pickerChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, marginRight: 8, backgroundColor: Colors.white },
  pickerChipActive: { borderColor: Colors.primary, backgroundColor: '#E3F2FD' },
  pickerChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  pickerChipTextActive: { color: Colors.primary },

  // Submit
  submitBtn: { borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
