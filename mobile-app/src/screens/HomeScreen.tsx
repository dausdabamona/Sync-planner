import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardData, toggleSholat, getSholatToday, updateDailyAction, DailyAction } from '../database/database';
import { SHOLAT_LIST, DZIKIR_LIST, WISDOM_QUOTES } from '../data/constants';
import { formatDate, getGreeting, getRandomItem, getQuarterLabel, getMonthLabel, getWeekLabel, getQuarter, getMonth, getWeekStart } from '../utils/helpers';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/theme';

// ============================================================
// TYPES
// ============================================================

interface DashboardData {
  quarter: { targets: any[]; avgProgress: number };
  month: { milestones: any[]; avgProgress: number };
  week: { sprints: any[]; done: number; total: number };
  today: { actions: DailyAction[]; done: number; total: number };
  sholat: Record<string, boolean>;
  pomodoro: { today: number; total: number; streak: number };
}

// ============================================================
// PRIORITY HELPERS
// ============================================================

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return Colors.priorityHigh;
    case 'medium': return Colors.priorityMedium;
    case 'low': return Colors.priorityLow;
    default: return Colors.priorityMedium;
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function HomeScreen({ navigation }: any) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [sholat, setSholat] = useState<Record<string, boolean>>({});
  const [quote, setQuote] = useState(getRandomItem(WISDOM_QUOTES));
  const [refreshing, setRefreshing] = useState(false);

  // ----------------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------------

  const loadData = useCallback(async () => {
    const dashboard = await getDashboardData();
    setData(dashboard);
    setSholat(dashboard.sholat);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setQuote(getRandomItem(WISDOM_QUOTES));
    setRefreshing(false);
  };

  // ----------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------

  const handleToggleSholat = async (id: string) => {
    await toggleSholat(id);
    const updated = await getSholatToday();
    setSholat(updated);
  };

  const handleToggleAction = async (action: DailyAction) => {
    await updateDailyAction(action.id, { done: !action.done });
    await loadData();
  };

  // ----------------------------------------------------------
  // DERIVED VALUES
  // ----------------------------------------------------------

  const sholatDone = Object.values(sholat).filter(Boolean).length;
  const dzikirDone = data
    ? 0 // dzikir count is not in dashboard; approximate from sholat screen
    : 0;
  const quarterLabel = getQuarterLabel(getQuarter());
  const monthLabel = getMonthLabel(getMonth());
  const weekLabel = getWeekLabel(getWeekStart());

  const quarterProgress = data?.quarter.avgProgress ?? 0;
  const monthMilestones = data?.month.milestones ?? [];
  const monthDone = monthMilestones.filter((m: any) => m.status === 'done' || m.progress >= 100).length;
  const weekDone = data?.week.done ?? 0;
  const weekTotal = data?.week.total ?? 0;
  const todayActions = data?.today.actions ?? [];
  const todayDone = data?.today.done ?? 0;
  const todayTotal = data?.today.total ?? 0;

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* ======== HEADER ======== */}
      <View style={styles.header}>
        <Text style={styles.bismillah}>
          {'\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'}
        </Text>
        <Text style={styles.translation}>
          Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
        </Text>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.date}>{formatDate(new Date())}</Text>

        {/* Quick Stats Badges */}
        <View style={styles.headerStats}>
          <TouchableOpacity
            style={styles.statBadge}
            onPress={() => navigation.navigate('Ibadah')}
          >
            <Text style={styles.statIcon}>🕌</Text>
            <Text style={styles.statValue}>{sholatDone}/{SHOLAT_LIST.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBadge}
            onPress={() => navigation.navigate('Ibadah', { tab: 'dzikir' })}
          >
            <Text style={styles.statIcon}>📿</Text>
            <Text style={styles.statValue}>Dzikir</Text>
          </TouchableOpacity>
          <View style={styles.statBadge}>
            <Text style={styles.statIcon}>🍅</Text>
            <Text style={styles.statValue}>{data?.pomodoro.today ?? 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* ======== CASCADE PROGRESS ======== */}
        <Text style={styles.sectionTitle}>Cascading Goals</Text>

        <View style={styles.cascadeContainer}>
          {/* --- Quarterly Target --- */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Target')}
          >
            <View style={styles.cascadeRow}>
              <View style={styles.pipelineCol}>
                <View style={[styles.pipelineDot, { backgroundColor: Colors.primary }]} />
                <View style={[styles.pipelineLine, { backgroundColor: Colors.primary }]} />
              </View>
              <View style={[styles.cascadeCard, { borderLeftColor: Colors.primary }]}>
                <View style={styles.cascadeHeader}>
                  <Text style={[styles.cascadeLevel, { color: Colors.primary }]}>
                    Target Kuartal
                  </Text>
                  <Text style={[styles.cascadeChevron, { color: Colors.primary }]}>
                    {'>'}
                  </Text>
                </View>
                <Text style={styles.cascadeLabel}>{quarterLabel}</Text>
                <View style={styles.cascadeProgressRow}>
                  <View style={styles.cascadeBarWrap}>
                    <ProgressBar
                      progress={quarterProgress}
                      color={Colors.primary}
                      height={6}
                    />
                  </View>
                  <Text style={[styles.cascadePercent, { color: Colors.primary }]}>
                    {quarterProgress}%
                  </Text>
                </View>
                {(data?.quarter.targets ?? []).length > 0 && (
                  <Text style={styles.cascadeSub}>
                    {data!.quarter.targets.length} target aktif
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* --- Monthly Milestone --- */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Target')}
          >
            <View style={styles.cascadeRow}>
              <View style={styles.pipelineCol}>
                <View style={[styles.pipelineDot, { backgroundColor: Colors.teal }]} />
                <View style={[styles.pipelineLine, { backgroundColor: Colors.teal }]} />
              </View>
              <View style={[styles.cascadeCard, { borderLeftColor: Colors.teal }]}>
                <View style={styles.cascadeHeader}>
                  <Text style={[styles.cascadeLevel, { color: Colors.teal }]}>
                    Milestone Bulanan
                  </Text>
                  <Text style={[styles.cascadeChevron, { color: Colors.teal }]}>
                    {'>'}
                  </Text>
                </View>
                <Text style={styles.cascadeLabel}>{monthLabel}</Text>
                <View style={styles.cascadeProgressRow}>
                  <View style={styles.cascadeBarWrap}>
                    <ProgressBar
                      progress={data?.month.avgProgress ?? 0}
                      color={Colors.teal}
                      height={6}
                    />
                  </View>
                  <Text style={[styles.cascadePercent, { color: Colors.teal }]}>
                    {monthDone}/{monthMilestones.length}
                  </Text>
                </View>
                {monthMilestones.length > 0 && (
                  <Text style={styles.cascadeSub}>
                    {monthDone} dari {monthMilestones.length} milestone selesai
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* --- Weekly Sprint --- */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Planner')}
          >
            <View style={styles.cascadeRow}>
              <View style={styles.pipelineCol}>
                <View style={[styles.pipelineDot, { backgroundColor: Colors.purple }]} />
                <View style={[styles.pipelineLine, { backgroundColor: Colors.purple }]} />
              </View>
              <View style={[styles.cascadeCard, { borderLeftColor: Colors.purple }]}>
                <View style={styles.cascadeHeader}>
                  <Text style={[styles.cascadeLevel, { color: Colors.purple }]}>
                    Sprint Mingguan
                  </Text>
                  <Text style={[styles.cascadeChevron, { color: Colors.purple }]}>
                    {'>'}
                  </Text>
                </View>
                <Text style={styles.cascadeLabel}>{weekLabel}</Text>
                <View style={styles.cascadeProgressRow}>
                  <View style={styles.cascadeBarWrap}>
                    <ProgressBar
                      progress={weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0}
                      color={Colors.purple}
                      height={6}
                    />
                  </View>
                  <Text style={[styles.cascadePercent, { color: Colors.purple }]}>
                    {weekDone}/{weekTotal} aksi
                  </Text>
                </View>
                {(data?.week.sprints ?? []).length > 0 && (
                  <Text style={styles.cascadeSub}>
                    {data!.week.sprints.length} sprint aktif
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* --- Daily Actions --- */}
          <View style={styles.cascadeRow}>
            <View style={styles.pipelineCol}>
              <View style={[styles.pipelineDot, { backgroundColor: Colors.accent }]} />
              {/* No line after the last item */}
            </View>
            <View style={[styles.cascadeCard, styles.cascadeCardLast, { borderLeftColor: Colors.accent }]}>
              <View style={styles.cascadeHeader}>
                <Text style={[styles.cascadeLevel, { color: Colors.accent }]}>
                  Aksi Hari Ini
                </Text>
                <Text style={[styles.cascadePercent, { color: Colors.accent }]}>
                  {todayDone}/{todayTotal} selesai
                </Text>
              </View>
              <View style={styles.cascadeProgressRow}>
                <View style={styles.cascadeBarWrap}>
                  <ProgressBar
                    progress={todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0}
                    color={Colors.accent}
                    height={6}
                  />
                </View>
              </View>

              {/* Actual action items with toggleable checkboxes */}
              {todayActions.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada aksi hari ini</Text>
              ) : (
                <View style={styles.actionsList}>
                  {todayActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={styles.actionItem}
                      onPress={() => handleToggleAction(action)}
                      activeOpacity={0.6}
                    >
                      <View
                        style={[
                          styles.actionCheckbox,
                          action.done && styles.actionCheckboxDone,
                        ]}
                      >
                        {action.done && (
                          <Text style={styles.actionCheckmark}>{'✓'}</Text>
                        )}
                      </View>
                      <View style={styles.actionContent}>
                        <Text
                          style={[
                            styles.actionTitle,
                            action.done && styles.actionTitleDone,
                          ]}
                          numberOfLines={1}
                        >
                          {action.title}
                        </Text>
                        {action.sprint_title ? (
                          <Text style={styles.actionSprint} numberOfLines={1}>
                            {'🔗 '}{action.sprint_title}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(action.priority) },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ======== QUICK ACTIONS ======== */}
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: Colors.primary }]}
            onPress={() => navigation.navigate('Pomodoro')}
          >
            <Text style={styles.quickIcon}>🎯</Text>
            <Text style={styles.quickLabel}>Fokus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: Colors.teal }]}
            onPress={() => navigation.navigate('Ibadah', { tab: 'dzikir' })}
          >
            <Text style={styles.quickIcon}>📿</Text>
            <Text style={styles.quickLabel}>Dzikir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: Colors.purple }]}
            onPress={() => navigation.navigate('Journal')}
          >
            <Text style={styles.quickIcon}>📝</Text>
            <Text style={styles.quickLabel}>Jurnal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: Colors.accent }]}
            onPress={() => navigation.navigate('Wisdom')}
          >
            <Text style={styles.quickIcon}>🏛️</Text>
            <Text style={styles.quickLabel}>Wisdom</Text>
          </TouchableOpacity>
        </View>

        {/* ======== SHOLAT MINI TRACKER ======== */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🕌 Sholat Hari Ini</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ibadah')}>
              <Text style={styles.cardLink}>Lihat Semua →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sholatGrid}>
            {SHOLAT_LIST.map((item) => {
              const done = sholat[item.id] ?? false;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sholatCell, done && styles.sholatCellDone]}
                  onPress={() => handleToggleSholat(item.id)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.sholatEmoji}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.sholatName,
                      done && styles.sholatNameDone,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {done && (
                    <View style={styles.sholatCheckBadge}>
                      <Text style={styles.sholatCheckText}>{'✓'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ======== WISDOM QUOTE ======== */}
        <Card style={styles.wisdomCard}>
          <View style={styles.wisdomHeader}>
            <Text style={styles.wisdomLabel}>Hikmah Hari Ini</Text>
            <TouchableOpacity onPress={() => setQuote(getRandomItem(WISDOM_QUOTES))}>
              <Text style={styles.wisdomRefresh}>🔄 Ganti</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.wisdomText}>"{quote.text}"</Text>
          <Text style={styles.wisdomSource}>-- {quote.source}</Text>
          <View style={styles.wisdomBadge}>
            <Text style={styles.wisdomFramework}>
              {quote.framework === 'stoic'
                ? 'Stoikisme'
                : quote.framework === 'nlp'
                ? 'NLP'
                : quote.framework === 'sedona'
                ? 'Sedona Method'
                : 'Atomic Habits'}
            </Text>
          </View>
        </Card>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // --- Layout ---
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    marginTop: -10,
  },

  // --- Header ---
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: 52,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  bismillah: {
    fontSize: 20,
    color: Colors.gold,
    fontWeight: '600',
    textAlign: 'center',
  },
  translation: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    textAlign: 'center',
  },
  greeting: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  date: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.lg,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statIcon: {
    fontSize: 14,
  },
  statValue: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // --- Section ---
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },

  // --- Cascade Pipeline ---
  cascadeContainer: {
    marginBottom: Spacing.sm,
  },
  cascadeRow: {
    flexDirection: 'row',
  },
  pipelineCol: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  pipelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pipelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
    opacity: 0.35,
  },
  cascadeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cascadeCardLast: {
    marginBottom: 0,
  },
  cascadeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cascadeLevel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cascadeChevron: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  cascadeLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  cascadeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cascadeBarWrap: {
    flex: 1,
  },
  cascadePercent: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  cascadeSub: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 4,
  },

  // --- Today's Actions List ---
  actionsList: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  actionCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  actionCheckboxDone: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  actionCheckmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  actionContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  actionTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  actionTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  actionSprint: {
    fontSize: FontSize.xs,
    color: Colors.purple,
    marginTop: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // --- Empty ---
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },

  // --- Quick Actions ---
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  quickBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- Card Shared ---
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  cardLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },

  // --- Sholat Grid ---
  sholatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sholatCell: {
    width: '23%' as any,
    flexGrow: 1,
    flexBasis: '22%' as any,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
  },
  sholatCellDone: {
    backgroundColor: '#E8F5E9',
  },
  sholatEmoji: {
    fontSize: 18,
    marginBottom: 3,
  },
  sholatName: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  sholatNameDone: {
    color: Colors.accent,
    fontWeight: '700',
  },
  sholatCheckBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sholatCheckText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },

  // --- Wisdom Card ---
  wisdomCard: {
    backgroundColor: '#FFFDE7',
    borderWidth: 1,
    borderColor: '#FFF9C4',
  },
  wisdomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  wisdomLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  wisdomRefresh: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  wisdomText: {
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  wisdomSource: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  wisdomBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  wisdomFramework: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
