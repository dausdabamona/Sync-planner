import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

interface MenuItem {
  icon: string;
  label: string;
  description: string;
  screen: string;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: '🍅', label: 'Pomodoro', description: 'Timer fokus & deep work', screen: 'Pomodoro', color: '#0D47A1' },
  { icon: '📝', label: 'Jurnal', description: 'Jurnal pagi & malam', screen: 'Journal', color: '#F57F17' },
  { icon: '📊', label: 'Review', description: 'Review harian sampai quarterly', screen: 'Review', color: '#6A1B9A' },
  { icon: '📋', label: 'Tasks', description: 'Daftar tugas standalone', screen: 'Tasks', color: '#00695C' },
  { icon: '🌟', label: 'Habits', description: 'Kebiasaan sunnah harian', screen: 'Habits', color: '#2E7D32' },
  { icon: '🏛️', label: 'Wisdom', description: '30 kebijaksanaan situasional', screen: 'Wisdom', color: '#C49A6C' },
  { icon: '💭', label: 'Brain Dump', description: 'Catatan pikiran & don\'t list', screen: 'BrainDump', color: '#C62828' },
  { icon: '🔭', label: 'Vision', description: 'Visi hidup 10/3/1 tahun', screen: 'Vision', color: '#D4A853' },
  { icon: '⚙️', label: 'Pengaturan', description: 'Export, import & reset data', screen: 'Settings', color: '#666666' },
];

export default function MenuScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <Text style={styles.headerSub}>Fitur tambahan & pengaturan</Text>
      </View>

      <View style={styles.grid}>
        {MENU_ITEMS.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sync Planner v2.0</Text>
        <Text style={styles.footerSub}>Cascading Goal System</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.white, padding: Spacing.xl, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: Spacing.sm },
  menuItem: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%' as any,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  icon: { fontSize: 22 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  menuDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },
  footer: { alignItems: 'center', padding: Spacing.xl, marginTop: Spacing.lg },
  footerText: { fontSize: 14, fontWeight: '600', color: Colors.textLight },
  footerSub: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
});
