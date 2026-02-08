import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getReview,
  saveReview,
  Review,
  getDailyActions,
  getWeeklySprints,
  getMonthlyMilestones,
  getQuarterlyTargets,
  getSholatToday,
  getPomodoroStats,
} from '../database/database';
import {
  getToday,
  getWeekStart,
  getMonth,
  getQuarter,
  getWeekLabel,
  getMonthLabel,
  getQuarterLabel,
  formatDate,
  generateId,
} from '../utils/helpers';
import { SHOLAT_LIST } from '../data/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

// ============================================================
// TYPES
// ============================================================

type ReviewTab = 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface TabConfig {
  key: ReviewTab;
  label: string;
  color: string;
  colorLight: string;
  bgTint: string;
}

interface ReviewStats {
  daily: { actionsDone: number; actionsTotal: number; pomodoroCount: number; sholatCount: number; sholatTotal: number };
  weekly: { sprintCount: number; sprintActionsDone: number; sprintActionsTotal: number };
  monthly: { milestonesCount: number; milestonesAvgProgress: number; actionsCompleted: number; sprintsCompleted: number };
  quarterly: { targetsCount: number; targetsAvgProgress: number };
}

// ============================================================
// CONSTANTS
// ============================================================

const TABS: TabConfig[] = [
  { key: 'daily', label: 'Harian', color: Colors.accent, colorLight: Colors.accentLight, bgTint: '#E8F5E9' },
  { key: 'weekly', label: 'Mingguan', color: Colors.purple, colorLight: Colors.purpleLight, bgTint: '#F3E5F5' },
  { key: 'monthly', label: 'Bulanan', color: Colors.teal, colorLight: Colors.tealLight, bgTint: '#E0F2F1' },
  { key: 'quarterly', label: 'Quarterly', color: Colors.primary, colorLight: Colors.primaryLight, bgTint: '#E3F2FD' },
];

const EMPTY_FORM = {
  wins: '',
  challenges: '',
  lessons: '',
  adjustments: '',
  next_plan: '',
  rating: 0,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ReviewScreen() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('daily');
  const [review, setReview] = useState<Review | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [stats, setStats] = useState<ReviewStats>({
    daily: { actionsDone: 0, actionsTotal: 0, pomodoroCount: 0, sholatCount: 0, sholatTotal: SHOLAT_LIST.length },
    weekly: { sprintCount: 0, sprintActionsDone: 0, sprintActionsTotal: 0 },
    monthly: { milestonesCount: 0, milestonesAvgProgress: 0, actionsCompleted: 0, sprintsCompleted: 0 },
    quarterly: { targetsCount: 0, targetsAvgProgress: 0 },
  });

  const getPeriod = useCallback((tab: ReviewTab): string => {
    switch (tab) {
      case 'daily': return getToday();
      case 'weekly': return getWeekStart();
      case 'monthly': return getMonth();
      case 'quarterly': return getQuarter();
    }
  }, []);

  const getPeriodLabel = useCallback((tab: ReviewTab, period: string): string => {
    switch (tab) {
      case 'daily': return formatDate(new Date(period + 'T00:00:00'));
      case 'weekly': return getWeekLabel(period);
      case 'monthly': return getMonthLabel(period);
      case 'quarterly': return getQuarterLabel(period);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const period = getPeriod(activeTab);
      const existingReview = await getReview(activeTab, period);
      setReview(existingReview);

      if (existingReview) {
        setForm({
          wins: existingReview.wins,
          challenges: existingReview.challenges,
          lessons: existingReview.lessons,
          adjustments: existingReview.adjustments,
          next_plan: existingReview.next_plan,
          rating: existingReview.rating,
        });
        setEditing(false);
      } else {
        setForm({ ...EMPTY_FORM });
        setEditing(false);
      }

      // Load stats based on active tab
      if (activeTab === 'daily') {
        const [actions, pomStats, sholatData] = await Promise.all([
          getDailyActions(getToday()),
          getPomodoroStats(),
          getSholatToday(),
        ]);
        const sholatDone = Object.values(sholatData).filter(Boolean).length;
        setStats(prev => ({
          ...prev,
          daily: {
            actionsDone: actions.filter(a => a.done).length,
            actionsTotal: actions.length,
            pomodoroCount: pomStats.today,
            sholatCount: sholatDone,
            sholatTotal: SHOLAT_LIST.length,
          },
        }));
      } else if (activeTab === 'weekly') {
        const sprints = await getWeeklySprints(getWeekStart());
        const totalActions = sprints.reduce((s, sp) => s + (sp.actions_total || 0), 0);
        const doneActions = sprints.reduce((s, sp) => s + (sp.actions_done || 0), 0);
        setStats(prev => ({
          ...prev,
          weekly: {
            sprintCount: sprints.length,
            sprintActionsDone: doneActions,
            sprintActionsTotal: totalActions,
          },
        }));
      } else if (activeTab === 'monthly') {
        const month = getMonth();
        const milestones = await getMonthlyMilestones(month);
        const avgProgress = milestones.length > 0
          ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
          : 0;
        // Get all weekly sprints for this month (approximate: get weeks that fall in this month)
        const [year, mon] = month.split('-').map(Number);
        const firstDay = new Date(year, mon - 1, 1);
        const lastDay = new Date(year, mon, 0);
        let totalActions = 0;
        let completedActions = 0;
        let completedSprints = 0;
        // Check each week in the month
        const current = new Date(firstDay);
        const checkedWeeks = new Set<string>();
        while (current <= lastDay) {
          const ws = getWeekStart(current);
          if (!checkedWeeks.has(ws)) {
            checkedWeeks.add(ws);
            const sprints = await getWeeklySprints(ws);
            for (const sp of sprints) {
              totalActions += sp.actions_total || 0;
              completedActions += sp.actions_done || 0;
              if (sp.status === 'done') completedSprints++;
            }
          }
          current.setDate(current.getDate() + 1);
        }
        setStats(prev => ({
          ...prev,
          monthly: {
            milestonesCount: milestones.length,
            milestonesAvgProgress: avgProgress,
            actionsCompleted: completedActions,
            sprintsCompleted: completedSprints,
          },
        }));
      } else if (activeTab === 'quarterly') {
        const targets = await getQuarterlyTargets(getQuarter());
        const avgProgress = targets.length > 0
          ? Math.round(targets.reduce((s, t) => s + (t.progress || 0), 0) / targets.length)
          : 0;
        setStats(prev => ({
          ...prev,
          quarterly: {
            targetsCount: targets.length,
            targetsAvgProgress: avgProgress,
          },
        }));
      }
    } catch (error) {
      console.error('ReviewScreen loadData error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleTabChange = (tab: ReviewTab) => {
    setActiveTab(tab);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!form.wins.trim() && !form.challenges.trim() && !form.lessons.trim()) {
      Alert.alert('Info', 'Isi minimal satu field (wins, challenges, atau lessons)');
      return;
    }

    const period = getPeriod(activeTab);
    const reviewData: Review = {
      id: review?.id || generateId(),
      type: activeTab,
      period,
      wins: form.wins.trim(),
      challenges: form.challenges.trim(),
      lessons: form.lessons.trim(),
      adjustments: form.adjustments.trim(),
      next_plan: form.next_plan.trim(),
      rating: form.rating,
      created_at: review?.created_at || new Date().toISOString(),
    };

    await saveReview(reviewData);
    setEditing(false);
    loadData();
  };

  const handleEdit = () => {
    if (review) {
      setForm({
        wins: review.wins,
        challenges: review.challenges,
        lessons: review.lessons,
        adjustments: review.adjustments,
        next_plan: review.next_plan,
        rating: review.rating,
      });
    }
    setEditing(true);
  };

  const updateForm = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const tabConfig = TABS.find(t => t.key === activeTab)!;
  const period = getPeriod(activeTab);
  const periodLabel = getPeriodLabel(activeTab, period);

  // ============================================================
  // RENDER: TAB BAR
  // ============================================================

  const renderTabBar = () => (
    <View style={styles.tabRow}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && { borderBottomWidth: 3, borderBottomColor: tab.color },
          ]}
          onPress={() => handleTabChange(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && { color: tab.color, fontWeight: '700' },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ============================================================
  // RENDER: PERIOD HEADER
  // ============================================================

  const renderPeriodHeader = () => (
    <Card style={{ backgroundColor: tabConfig.bgTint, alignItems: 'center' as const }}>
      <Text style={{ fontSize: 13, color: tabConfig.color, fontWeight: '600' }}>
        {tabConfig.label.toUpperCase()} REVIEW
      </Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: tabConfig.color, marginTop: 4 }}>
        {periodLabel}
      </Text>
    </Card>
  );

  // ============================================================
  // RENDER: STATS CARDS
  // ============================================================

  const renderStats = () => {
    switch (activeTab) {
      case 'daily':
        return (
          <Card>
            <Text style={[styles.statsTitle, { color: tabConfig.color }]}>Statistik Hari Ini</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.daily.actionsDone}/{stats.daily.actionsTotal}
                </Text>
                <Text style={styles.statLabel}>Aksi Selesai</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.daily.pomodoroCount}
                </Text>
                <Text style={styles.statLabel}>Pomodoro</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.daily.sholatCount}/{stats.daily.sholatTotal}
                </Text>
                <Text style={styles.statLabel}>Sholat</Text>
              </View>
            </View>
            {stats.daily.actionsTotal > 0 && (
              <View style={{ marginTop: Spacing.sm }}>
                <ProgressBar
                  progress={(stats.daily.actionsDone / stats.daily.actionsTotal) * 100}
                  color={tabConfig.color}
                />
              </View>
            )}
          </Card>
        );

      case 'weekly':
        return (
          <Card>
            <Text style={[styles.statsTitle, { color: tabConfig.color }]}>Statistik Minggu Ini</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.weekly.sprintCount}
                </Text>
                <Text style={styles.statLabel}>Sprint</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.weekly.sprintActionsDone}/{stats.weekly.sprintActionsTotal}
                </Text>
                <Text style={styles.statLabel}>Aksi Selesai</Text>
              </View>
            </View>
            {stats.weekly.sprintActionsTotal > 0 && (
              <View style={{ marginTop: Spacing.sm }}>
                <ProgressBar
                  progress={(stats.weekly.sprintActionsDone / stats.weekly.sprintActionsTotal) * 100}
                  color={tabConfig.color}
                />
              </View>
            )}
          </Card>
        );

      case 'monthly':
        return (
          <Card>
            <Text style={[styles.statsTitle, { color: tabConfig.color }]}>Statistik Bulan Ini</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.monthly.milestonesCount}
                </Text>
                <Text style={styles.statLabel}>Milestone</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.monthly.milestonesAvgProgress}%
                </Text>
                <Text style={styles.statLabel}>Avg Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.monthly.actionsCompleted}
                </Text>
                <Text style={styles.statLabel}>Aksi Selesai</Text>
              </View>
            </View>
            {stats.monthly.milestonesCount > 0 && (
              <View style={{ marginTop: Spacing.sm }}>
                <ProgressBar
                  progress={stats.monthly.milestonesAvgProgress}
                  color={tabConfig.color}
                />
              </View>
            )}
          </Card>
        );

      case 'quarterly':
        return (
          <Card>
            <Text style={[styles.statsTitle, { color: tabConfig.color }]}>Statistik Quarter</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.quarterly.targetsCount}
                </Text>
                <Text style={styles.statLabel}>Target</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: tabConfig.color }]}>
                  {stats.quarterly.targetsAvgProgress}%
                </Text>
                <Text style={styles.statLabel}>Avg Progress</Text>
              </View>
            </View>
            {stats.quarterly.targetsCount > 0 && (
              <View style={{ marginTop: Spacing.sm }}>
                <ProgressBar
                  progress={stats.quarterly.targetsAvgProgress}
                  color={tabConfig.color}
                />
              </View>
            )}
          </Card>
        );
    }
  };

  // ============================================================
  // RENDER: STAR RATING
  // ============================================================

  const renderStarRating = (value: number, onSelect?: (n: number) => void) => (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity
          key={n}
          disabled={!onSelect}
          onPress={() => onSelect?.(n)}
          style={styles.starButton}
        >
          <Text style={{ fontSize: onSelect ? 32 : 24 }}>
            {n <= value ? '\u2B50' : '\u2606'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ============================================================
  // RENDER: DISPLAY MODE (review exists, not editing)
  // ============================================================

  const renderDisplay = () => {
    if (!review) return null;

    const fields: { key: string; label: string; icon: string; value: string }[] = [
      { key: 'wins', label: 'Kemenangan', icon: '\uD83C\uDFC6', value: review.wins },
      { key: 'challenges', label: 'Tantangan', icon: '\u26A1', value: review.challenges },
      { key: 'lessons', label: 'Pelajaran', icon: '\uD83D\uDCD6', value: review.lessons },
    ];

    // Add adjustments and next_plan for weekly/monthly/quarterly
    if (activeTab !== 'daily') {
      fields.push(
        { key: 'adjustments', label: 'Penyesuaian', icon: '\uD83D\uDD04', value: review.adjustments },
        { key: 'next_plan', label: 'Rencana Selanjutnya', icon: '\uD83C\uDFAF', value: review.next_plan },
      );
    }

    return (
      <>
        {/* Rating display */}
        <Card style={{ alignItems: 'center' as const }}>
          <Text style={[styles.fieldLabel, { color: tabConfig.color }]}>Rating</Text>
          {renderStarRating(review.rating)}
        </Card>

        {/* Fields display */}
        {fields.map(f => (
          <Card key={f.key}>
            <Text style={styles.fieldLabel}>{f.icon} {f.label}</Text>
            <Text style={styles.fieldValue}>{f.value || '-'}</Text>
          </Card>
        ))}

        {/* Edit button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: tabConfig.color }]}
          onPress={handleEdit}
        >
          <Text style={styles.actionBtnText}>Edit Review</Text>
        </TouchableOpacity>
      </>
    );
  };

  // ============================================================
  // RENDER: FORM MODE (no review yet, or editing)
  // ============================================================

  const renderForm = () => {
    const fields: { key: string; label: string; icon: string; placeholder: string }[] = [
      { key: 'wins', label: 'Kemenangan', icon: '\uD83C\uDFC6', placeholder: 'Apa yang berhasil dicapai...' },
      { key: 'challenges', label: 'Tantangan', icon: '\u26A1', placeholder: 'Apa yang sulit atau menjadi hambatan...' },
      { key: 'lessons', label: 'Pelajaran', icon: '\uD83D\uDCD6', placeholder: 'Apa yang dipelajari...' },
    ];

    if (activeTab !== 'daily') {
      fields.push(
        { key: 'adjustments', label: 'Penyesuaian', icon: '\uD83D\uDD04', placeholder: 'Apa yang perlu diubah atau diredistribusi...' },
        { key: 'next_plan', label: 'Rencana Selanjutnya', icon: '\uD83C\uDFAF', placeholder: 'Fokus untuk periode selanjutnya...' },
      );
    }

    return (
      <>
        {/* Rating selector */}
        <Card>
          <Text style={styles.fieldLabel}>Nilai periode ini</Text>
          {renderStarRating(form.rating, (n) => updateForm('rating', n))}
        </Card>

        {/* Form fields */}
        {fields.map(f => (
          <Card key={f.key}>
            <Text style={styles.fieldLabel}>{f.icon} {f.label}</Text>
            <TextInput
              style={styles.input}
              value={(form as any)[f.key]}
              onChangeText={(val) => updateForm(f.key, val)}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.textLight}
              multiline
            />
          </Card>
        ))}

        {/* Save and Cancel buttons */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: tabConfig.color }]}
          onPress={handleSave}
        >
          <Text style={styles.actionBtnText}>Simpan Review</Text>
        </TouchableOpacity>

        {review && editing && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.textLight, marginTop: Spacing.sm }]}
            onPress={() => {
              setEditing(false);
              setForm({
                wins: review.wins,
                challenges: review.challenges,
                lessons: review.lessons,
                adjustments: review.adjustments,
                next_plan: review.next_plan,
                rating: review.rating,
              });
            }}
          >
            <Text style={styles.actionBtnText}>Batal</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <View style={styles.container}>
      {renderTabBar()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tabConfig.color} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
          {renderPeriodHeader()}
          {renderStats()}

          {review && !editing ? renderDisplay() : renderForm()}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Tab bar
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Star rating
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xs,
  },
  starButton: {
    padding: 2,
  },

  // Fields
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  fieldValue: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },

  // Form input
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // Action buttons
  actionBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
