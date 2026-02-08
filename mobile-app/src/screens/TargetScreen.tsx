import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getQuarterlyTargets,
  addQuarterlyTarget,
  updateQuarterlyTarget,
  deleteQuarterlyTarget,
  addKeyResult,
  updateKeyResult,
  deleteKeyResult,
  getMonthlyMilestones,
  addMonthlyMilestone,
  updateMonthlyMilestone,
  deleteMonthlyMilestone,
  QuarterlyTarget,
  KeyResult,
  MonthlyMilestone,
} from '../database/database';
import {
  getQuarter,
  getMonth,
  getQuarterLabel,
  getMonthLabel,
  generateId,
} from '../utils/helpers';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

// ===== Vision Area Color Map =====

const VISION_AREA_COLOR: Record<string, string> = {
  karir: Colors.primary,
  keluarga: '#C49A6C',
  spiritual: Colors.accent,
  kesehatan: Colors.teal,
  keuangan: Colors.warning,
};

function getAreaColor(area: string): string {
  return VISION_AREA_COLOR[area] || Colors.purple;
}

const VISION_AREAS = [
  { key: 'karir', label: 'Karir' },
  { key: 'keluarga', label: 'Keluarga' },
  { key: 'spiritual', label: 'Spiritual' },
  { key: 'kesehatan', label: 'Kesehatan' },
  { key: 'keuangan', label: 'Keuangan' },
];

// ===== Status helpers =====

function getStatusLabel(progress: number): string {
  if (progress >= 100) return 'Selesai';
  if (progress >= 70) return 'On Track';
  if (progress >= 30) return 'Progressing';
  return 'Baru Mulai';
}

function getStatusColor(progress: number): string {
  if (progress >= 100) return Colors.accent;
  if (progress >= 70) return Colors.teal;
  if (progress >= 30) return Colors.warning;
  return Colors.textLight;
}

// ===== Month navigation helpers =====

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ===== Component =====

export default function TargetScreen() {
  const [activeTab, setActiveTab] = useState<'quarterly' | 'monthly'>('quarterly');

  // Quarterly state
  const [currentQuarter, setCurrentQuarter] = useState(getQuarter());
  const [targets, setTargets] = useState<QuarterlyTarget[]>([]);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [targetTitle, setTargetTitle] = useState('');
  const [targetDesc, setTargetDesc] = useState('');
  const [targetArea, setTargetArea] = useState('karir');

  // Key Result modal state
  const [showKRModal, setShowKRModal] = useState(false);
  const [krTargetId, setKrTargetId] = useState('');
  const [editKRId, setEditKRId] = useState<string | null>(null);
  const [krTitle, setKrTitle] = useState('');
  const [krTargetValue, setKrTargetValue] = useState('100');
  const [krUnit, setKrUnit] = useState('%');
  const [krCurrentValue, setKrCurrentValue] = useState('0');

  // Update KR value modal
  const [showUpdateKRModal, setShowUpdateKRModal] = useState(false);
  const [updateKR, setUpdateKR] = useState<KeyResult | null>(null);
  const [updateKRValue, setUpdateKRValue] = useState('');

  // Monthly state
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const [milestones, setMilestones] = useState<MonthlyMilestone[]>([]);
  const [allTargets, setAllTargets] = useState<QuarterlyTarget[]>([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editMilestoneId, setEditMilestoneId] = useState<string | null>(null);
  const [msTitle, setMsTitle] = useState('');
  const [msTargetId, setMsTargetId] = useState('');
  const [msDod, setMsDod] = useState('');
  const [msMonth, setMsMonth] = useState(getMonth());

  // ===== Data Loading =====

  const loadQuarterlyData = useCallback(async () => {
    const data = await getQuarterlyTargets(currentQuarter);
    setTargets(data);
  }, [currentQuarter]);

  const loadMonthlyData = useCallback(async () => {
    const data = await getMonthlyMilestones(currentMonth);
    setMilestones(data);
    const all = await getQuarterlyTargets();
    setAllTargets(all);
  }, [currentMonth]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'quarterly') {
        loadQuarterlyData();
      } else {
        loadMonthlyData();
      }
    }, [activeTab, loadQuarterlyData, loadMonthlyData]),
  );

  // ===== Quarter Navigation =====

  const shiftQuarter = (delta: number) => {
    const [yearStr, qStr] = currentQuarter.split('-');
    let year = parseInt(yearStr);
    let q = parseInt(qStr.replace('Q', '')) + delta;
    if (q > 4) { q = 1; year++; }
    if (q < 1) { q = 4; year--; }
    setCurrentQuarter(`${year}-Q${q}`);
  };

  // ===== Quarterly Target CRUD =====

  const resetTargetForm = () => {
    setTargetTitle('');
    setTargetDesc('');
    setTargetArea('karir');
    setEditTargetId(null);
    setShowTargetModal(false);
  };

  const handleSaveTarget = async () => {
    if (!targetTitle.trim()) return;
    if (editTargetId) {
      await updateQuarterlyTarget(editTargetId, {
        title: targetTitle.trim(),
        description: targetDesc.trim(),
        vision_area: targetArea,
      });
    } else {
      await addQuarterlyTarget({
        id: generateId(),
        title: targetTitle.trim(),
        description: targetDesc.trim(),
        quarter: currentQuarter,
        vision_area: targetArea,
        status: 'active',
        created_at: new Date().toISOString(),
      });
    }
    resetTargetForm();
    loadQuarterlyData();
  };

  const handleEditTarget = (target: QuarterlyTarget) => {
    setEditTargetId(target.id);
    setTargetTitle(target.title);
    setTargetDesc(target.description);
    setTargetArea(target.vision_area || 'karir');
    setShowTargetModal(true);
  };

  const handleDeleteTarget = (target: QuarterlyTarget) => {
    Alert.alert('Hapus Target', `Hapus "${target.title}"? Semua key result dan milestone terkait juga akan dihapus.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteQuarterlyTarget(target.id);
          loadQuarterlyData();
        },
      },
    ]);
  };

  // ===== Key Result CRUD =====

  const resetKRForm = () => {
    setKrTitle('');
    setKrTargetValue('100');
    setKrUnit('%');
    setKrCurrentValue('0');
    setEditKRId(null);
    setKrTargetId('');
    setShowKRModal(false);
  };

  const handleAddKR = (targetId: string) => {
    resetKRForm();
    setKrTargetId(targetId);
    setShowKRModal(true);
  };

  const handleSaveKR = async () => {
    if (!krTitle.trim() || !krTargetId) return;
    if (editKRId) {
      // For editing, we delete and re-add since updateKeyResult only updates current_value
      await deleteKeyResult(editKRId);
    }
    await addKeyResult({
      id: editKRId || generateId(),
      target_id: krTargetId,
      title: krTitle.trim(),
      metric: '',
      current_value: parseFloat(krCurrentValue) || 0,
      target_value: parseFloat(krTargetValue) || 100,
      unit: krUnit.trim() || '%',
    });
    resetKRForm();
    loadQuarterlyData();
  };

  const handleTapKR = (kr: KeyResult) => {
    setUpdateKR(kr);
    setUpdateKRValue(String(kr.current_value));
    setShowUpdateKRModal(true);
  };

  const handleSaveKRValue = async () => {
    if (!updateKR) return;
    const val = parseFloat(updateKRValue);
    if (isNaN(val)) return;
    await updateKeyResult(updateKR.id, val);
    setShowUpdateKRModal(false);
    setUpdateKR(null);
    setUpdateKRValue('');
    loadQuarterlyData();
  };

  const handleDeleteKR = (kr: KeyResult) => {
    Alert.alert('Hapus Key Result', `Hapus "${kr.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteKeyResult(kr.id);
          loadQuarterlyData();
        },
      },
    ]);
  };

  // ===== Monthly Milestone CRUD =====

  const resetMilestoneForm = () => {
    setMsTitle('');
    setMsTargetId('');
    setMsDod('');
    setMsMonth(currentMonth);
    setEditMilestoneId(null);
    setShowMilestoneModal(false);
  };

  const handleSaveMilestone = async () => {
    if (!msTitle.trim() || !msTargetId) return;
    if (editMilestoneId) {
      await updateMonthlyMilestone(editMilestoneId, {
        title: msTitle.trim(),
        definition_of_done: msDod.trim(),
      });
    } else {
      await addMonthlyMilestone({
        id: generateId(),
        target_id: msTargetId,
        title: msTitle.trim(),
        description: '',
        month: msMonth,
        definition_of_done: msDod.trim(),
        status: 'active',
        progress: 0,
        created_at: new Date().toISOString(),
      });
    }
    resetMilestoneForm();
    loadMonthlyData();
  };

  const handleEditMilestone = (ms: MonthlyMilestone) => {
    setEditMilestoneId(ms.id);
    setMsTitle(ms.title);
    setMsTargetId(ms.target_id);
    setMsDod(ms.definition_of_done);
    setMsMonth(ms.month);
    setShowMilestoneModal(true);
  };

  const handleDeleteMilestone = (ms: MonthlyMilestone) => {
    Alert.alert('Hapus Milestone', `Hapus "${ms.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteMonthlyMilestone(ms.id);
          loadMonthlyData();
        },
      },
    ]);
  };

  const handleMilestoneProgress = async (ms: MonthlyMilestone, delta: number) => {
    const newProgress = Math.max(0, Math.min(100, ms.progress + delta));
    const newStatus = newProgress >= 100 ? 'done' : 'active';
    await updateMonthlyMilestone(ms.id, { progress: newProgress, status: newStatus });
    loadMonthlyData();
  };

  // ===== Computed =====

  const avgProgress = targets.length
    ? Math.round(targets.reduce((s, t) => s + (t.progress || 0), 0) / targets.length)
    : 0;

  // Group milestones by target
  const milestonesByTarget: Record<string, { targetTitle: string; items: MonthlyMilestone[] }> = {};
  milestones.forEach((ms) => {
    if (!milestonesByTarget[ms.target_id]) {
      milestonesByTarget[ms.target_id] = {
        targetTitle: ms.target_title || 'Target Tidak Diketahui',
        items: [],
      };
    }
    milestonesByTarget[ms.target_id].items.push(ms);
  });

  // ===== Render =====

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quarterly' && styles.tabActive]}
          onPress={() => setActiveTab('quarterly')}
        >
          <Text style={[styles.tabText, activeTab === 'quarterly' && styles.tabTextActive]}>
            Quarterly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'monthly' && styles.tabActive]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}>
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================== QUARTERLY TAB ======================== */}
      {activeTab === 'quarterly' && (
        <>
          <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
            {/* Quarter Navigation + Header Card */}
            <Card style={{ backgroundColor: '#E3F2FD' }}>
              <View style={styles.navRow}>
                <TouchableOpacity onPress={() => shiftQuarter(-1)} style={styles.navBtn}>
                  <Text style={styles.navBtnText}>{'<'}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.headerLabel}>{getQuarterLabel(currentQuarter)}</Text>
                  <Text style={styles.headerSub}>Target Center</Text>
                </View>
                <TouchableOpacity onPress={() => shiftQuarter(1)} style={styles.navBtn}>
                  <Text style={styles.navBtnText}>{'>'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: Spacing.md }}>
                <ProgressBar progress={avgProgress} color={Colors.primary} height={10} />
                <Text style={styles.headerProgress}>Progress keseluruhan: {avgProgress}%</Text>
              </View>
            </Card>

            {/* Target List */}
            {targets.map((target) => {
              const areaColor = getAreaColor(target.vision_area);
              const progress = target.progress || 0;
              return (
                <Card key={target.id} style={{ borderLeftWidth: 4, borderLeftColor: areaColor }}>
                  <TouchableOpacity
                    onPress={() => handleEditTarget(target)}
                    onLongPress={() => handleDeleteTarget(target)}
                    activeOpacity={0.7}
                  >
                    {/* Target Header */}
                    <View style={styles.targetHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.targetTitle}>{target.title}</Text>
                        {target.description ? (
                          <Text style={styles.targetDesc}>{target.description}</Text>
                        ) : null}
                      </View>
                      <View style={[styles.areaBadge, { backgroundColor: areaColor + '20' }]}>
                        <Text style={[styles.areaBadgeText, { color: areaColor }]}>
                          {target.vision_area || 'lainnya'}
                        </Text>
                      </View>
                    </View>

                    {/* Progress */}
                    <View style={{ marginTop: Spacing.md }}>
                      <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={[styles.progressValue, { color: areaColor }]}>{progress}%</Text>
                      </View>
                      <ProgressBar progress={progress} color={areaColor} height={8} />
                    </View>
                  </TouchableOpacity>

                  {/* Key Results */}
                  {target.key_results && target.key_results.length > 0 && (
                    <View style={styles.krSection}>
                      <Text style={styles.krSectionTitle}>Key Results</Text>
                      {target.key_results.map((kr) => {
                        const krProgress =
                          kr.target_value > 0
                            ? Math.min(100, (kr.current_value / kr.target_value) * 100)
                            : 0;
                        return (
                          <TouchableOpacity
                            key={kr.id}
                            style={styles.krItem}
                            onPress={() => handleTapKR(kr)}
                            onLongPress={() => handleDeleteKR(kr)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.krHeader}>
                              <Text style={styles.krTitle} numberOfLines={1}>
                                {kr.title}
                              </Text>
                              <Text style={styles.krValue}>
                                {kr.current_value}/{kr.target_value} {kr.unit}
                              </Text>
                            </View>
                            <ProgressBar
                              progress={krProgress}
                              color={areaColor}
                              height={5}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Add KR button */}
                  <TouchableOpacity
                    style={styles.addKRBtn}
                    onPress={() => handleAddKR(target.id)}
                  >
                    <Text style={styles.addKRBtnText}>+ Tambah Key Result</Text>
                  </TouchableOpacity>
                </Card>
              );
            })}

            {targets.length === 0 && (
              <Text style={styles.emptyText}>
                Belum ada target untuk {getQuarterLabel(currentQuarter)}. Mulai dengan menambahkan target baru!
              </Text>
            )}

            <View style={{ height: 80 }} />
          </ScrollView>

          {/* FAB */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: Colors.primary }]}
            onPress={() => {
              resetTargetForm();
              setShowTargetModal(true);
            }}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ======================== MONTHLY TAB ======================== */}
      {activeTab === 'monthly' && (
        <>
          <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
            {/* Month Navigation + Header */}
            <Card style={{ backgroundColor: '#FFF8E1' }}>
              <View style={styles.navRow}>
                <TouchableOpacity
                  onPress={() => setCurrentMonth(shiftMonth(currentMonth, -1))}
                  style={styles.navBtn}
                >
                  <Text style={styles.navBtnText}>{'<'}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.headerLabel}>{getMonthLabel(currentMonth)}</Text>
                  <Text style={styles.headerSub}>Monthly Milestones</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCurrentMonth(shiftMonth(currentMonth, 1))}
                  style={styles.navBtn}
                >
                  <Text style={styles.navBtnText}>{'>'}</Text>
                </TouchableOpacity>
              </View>
              {milestones.length > 0 && (
                <View style={{ marginTop: Spacing.md }}>
                  <ProgressBar
                    progress={Math.round(
                      milestones.reduce((s, m) => s + m.progress, 0) / milestones.length,
                    )}
                    color={Colors.warning}
                    height={10}
                  />
                  <Text style={[styles.headerProgress, { color: Colors.warning }]}>
                    Rata-rata progress:{' '}
                    {Math.round(
                      milestones.reduce((s, m) => s + m.progress, 0) / milestones.length,
                    )}
                    %
                  </Text>
                </View>
              )}
            </Card>

            {/* Milestones grouped by target */}
            {Object.entries(milestonesByTarget).map(([targetId, group]) => (
              <View key={targetId} style={{ marginBottom: Spacing.lg }}>
                <Text style={styles.groupTitle}>{group.targetTitle}</Text>
                {group.items.map((ms) => {
                  const statusLabel = getStatusLabel(ms.progress);
                  const statusColor = getStatusColor(ms.progress);
                  // Find parent target color
                  const parentTarget = allTargets.find((t) => t.id === ms.target_id);
                  const parentColor = parentTarget
                    ? getAreaColor(parentTarget.vision_area)
                    : Colors.purple;

                  return (
                    <Card key={ms.id}>
                      <TouchableOpacity
                        onPress={() => handleEditMilestone(ms)}
                        onLongPress={() => handleDeleteMilestone(ms)}
                        activeOpacity={0.7}
                      >
                        {/* Title + Badge Row */}
                        <View style={styles.msHeaderRow}>
                          <Text style={styles.msTitle} numberOfLines={2}>
                            {ms.title}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                              {statusLabel}
                            </Text>
                          </View>
                        </View>

                        {/* Parent Target Badge */}
                        <View style={[styles.parentBadge, { backgroundColor: parentColor + '15' }]}>
                          <Text style={[styles.parentBadgeText, { color: parentColor }]}>
                            {ms.target_title || 'Target'}
                          </Text>
                        </View>

                        {/* Definition of Done */}
                        {ms.definition_of_done ? (
                          <Text style={styles.dodText}>{ms.definition_of_done}</Text>
                        ) : null}
                      </TouchableOpacity>

                      {/* Progress Slider */}
                      <View style={{ marginTop: Spacing.md }}>
                        <View style={styles.progressLabelRow}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={[styles.progressValue, { color: statusColor }]}>
                            {ms.progress}%
                          </Text>
                        </View>
                        <ProgressBar progress={ms.progress} color={statusColor} height={8} />
                        <View style={styles.sliderRow}>
                          <TouchableOpacity
                            style={styles.sliderBtn}
                            onPress={() => handleMilestoneProgress(ms, -10)}
                          >
                            <Text style={styles.sliderBtnText}>-10</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.sliderBtn}
                            onPress={() => handleMilestoneProgress(ms, -5)}
                          >
                            <Text style={styles.sliderBtnText}>-5</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.sliderBtn, { backgroundColor: Colors.accent + '20' }]}
                            onPress={() => handleMilestoneProgress(ms, 5)}
                          >
                            <Text style={[styles.sliderBtnText, { color: Colors.accent }]}>+5</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.sliderBtn, { backgroundColor: Colors.accent + '20' }]}
                            onPress={() => handleMilestoneProgress(ms, 10)}
                          >
                            <Text style={[styles.sliderBtnText, { color: Colors.accent }]}>+10</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.sliderBtn, { backgroundColor: Colors.accent + '30' }]}
                            onPress={() => handleMilestoneProgress(ms, 100 - ms.progress)}
                          >
                            <Text style={[styles.sliderBtnText, { color: Colors.accent }]}>100%</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            ))}

            {milestones.length === 0 && (
              <Text style={styles.emptyText}>
                Belum ada milestone untuk {getMonthLabel(currentMonth)}. Tambahkan milestone dari target quarterly!
              </Text>
            )}

            <View style={{ height: 80 }} />
          </ScrollView>

          {/* FAB */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: Colors.warning }]}
            onPress={() => {
              resetMilestoneForm();
              setMsMonth(currentMonth);
              if (allTargets.length > 0) {
                setMsTargetId(allTargets[0].id);
              }
              setShowMilestoneModal(true);
            }}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ======================== ADD/EDIT TARGET MODAL ======================== */}
      <Modal visible={showTargetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editTargetId ? 'Edit Target' : 'Tambah Target'}
              </Text>
              <TouchableOpacity onPress={resetTargetForm}>
                <Text style={styles.closeBtn}>{'✕'}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Judul target..."
              value={targetTitle}
              onChangeText={setTargetTitle}
              autoFocus
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Deskripsi (opsional)"
              value={targetDesc}
              onChangeText={setTargetDesc}
              multiline
            />

            {/* Vision Area Picker */}
            <Text style={styles.pickerLabel}>Area Kehidupan</Text>
            <View style={styles.areaPickerRow}>
              {VISION_AREAS.map((area) => {
                const color = getAreaColor(area.key);
                const isSelected = targetArea === area.key;
                return (
                  <TouchableOpacity
                    key={area.key}
                    style={[
                      styles.areaPill,
                      {
                        backgroundColor: isSelected ? color : color + '15',
                        borderColor: color,
                        borderWidth: isSelected ? 0 : 1,
                      },
                    ]}
                    onPress={() => setTargetArea(area.key)}
                  >
                    <Text
                      style={[
                        styles.areaPillText,
                        { color: isSelected ? Colors.white : color },
                      ]}
                    >
                      {area.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveTarget}>
              <Text style={styles.submitText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================== ADD KEY RESULT MODAL ======================== */}
      <Modal visible={showKRModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Key Result</Text>
              <TouchableOpacity onPress={resetKRForm}>
                <Text style={styles.closeBtn}>{'✕'}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Judul key result..."
              value={krTitle}
              onChangeText={setKrTitle}
              autoFocus
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: Spacing.sm }}>
                <Text style={styles.inputLabel}>Target Value</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  value={krTargetValue}
                  onChangeText={setKrTargetValue}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="%"
                  value={krUnit}
                  onChangeText={setKrUnit}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Current Value</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={krCurrentValue}
              onChangeText={setKrCurrentValue}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveKR}>
              <Text style={styles.submitText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================== UPDATE KR VALUE MODAL ======================== */}
      <Modal visible={showUpdateKRModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Progress</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowUpdateKRModal(false);
                  setUpdateKR(null);
                }}
              >
                <Text style={styles.closeBtn}>{'✕'}</Text>
              </TouchableOpacity>
            </View>

            {updateKR && (
              <>
                <Text style={styles.updateKRLabel}>{updateKR.title}</Text>
                <Text style={styles.updateKRSub}>
                  Target: {updateKR.target_value} {updateKR.unit}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder={`Nilai saat ini (${updateKR.unit})`}
                  value={updateKRValue}
                  onChangeText={setUpdateKRValue}
                  keyboardType="numeric"
                  autoFocus
                />

                {/* Quick value buttons */}
                <View style={styles.quickValRow}>
                  {[0, 25, 50, 75, 100].map((pct) => {
                    const val = Math.round((pct / 100) * updateKR.target_value);
                    return (
                      <TouchableOpacity
                        key={pct}
                        style={styles.quickValBtn}
                        onPress={() => setUpdateKRValue(String(val))}
                      >
                        <Text style={styles.quickValText}>{val}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveKRValue}>
                  <Text style={styles.submitText}>Update</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================== ADD/EDIT MILESTONE MODAL ======================== */}
      <Modal visible={showMilestoneModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={[styles.modalContent, { marginTop: 100 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMilestoneId ? 'Edit Milestone' : 'Tambah Milestone'}
                </Text>
                <TouchableOpacity onPress={resetMilestoneForm}>
                  <Text style={styles.closeBtn}>{'✕'}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Judul milestone..."
                value={msTitle}
                onChangeText={setMsTitle}
                autoFocus
              />

              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Definition of Done..."
                value={msDod}
                onChangeText={setMsDod}
                multiline
              />

              {/* Parent Target Picker */}
              <Text style={styles.pickerLabel}>Target Induk</Text>
              {allTargets.length === 0 ? (
                <Text style={styles.noTargetHint}>
                  Belum ada target quarterly. Buat target terlebih dahulu.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: Spacing.md }}
                >
                  {allTargets.map((t) => {
                    const color = getAreaColor(t.vision_area);
                    const isSelected = msTargetId === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.targetPill,
                          {
                            backgroundColor: isSelected ? color : color + '15',
                            borderColor: color,
                            borderWidth: isSelected ? 0 : 1,
                          },
                        ]}
                        onPress={() => setMsTargetId(t.id)}
                      >
                        <Text
                          style={[
                            styles.targetPillText,
                            { color: isSelected ? Colors.white : color },
                          ]}
                          numberOfLines={1}
                        >
                          {t.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Month Picker */}
              {!editMilestoneId && (
                <>
                  <Text style={styles.pickerLabel}>Bulan</Text>
                  <View style={styles.monthPickerRow}>
                    <TouchableOpacity
                      style={styles.monthNavBtn}
                      onPress={() => setMsMonth(shiftMonth(msMonth, -1))}
                    >
                      <Text style={styles.monthNavText}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthPickerLabel}>{getMonthLabel(msMonth)}</Text>
                    <TouchableOpacity
                      style={styles.monthNavBtn}
                      onPress={() => setMsMonth(shiftMonth(msMonth, 1))}
                    >
                      <Text style={styles.monthNavText}>{'>'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, allTargets.length === 0 && { opacity: 0.5 }]}
                onPress={handleSaveMilestone}
                disabled={allTargets.length === 0}
              >
                <Text style={styles.submitText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ===== Styles =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
  },

  // Navigation Row
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },

  // Header Card
  headerLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerProgress: {
    fontSize: 11,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },

  // Target Card
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  targetDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  areaBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  areaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Progress
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Key Results
  krSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  krSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  krItem: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  krHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  krTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  krValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  addKRBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  addKRBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Monthly
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  msHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  msTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  parentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  parentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dodText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  // Slider Buttons
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  sliderBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F0F0F0',
  },
  sliderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  // Empty
  emptyText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 40,
    lineHeight: 20,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    marginTop: -2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.textLight,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  areaPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  areaPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  areaPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  targetPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
    maxWidth: 160,
  },
  targetPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Month Picker
  monthPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  monthPickerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: Spacing.lg,
  },

  // Submit
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Update KR
  updateKRLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  updateKRSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  quickValRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  quickValBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  quickValText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  noTargetHint: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
});
