import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { exportAllData, importAllData, clearAllData } from '../database/database';

export default function SettingsScreen() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await exportAllData();
      const fileName = `sync-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, data);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export Sync Planner Data',
        });
      } else {
        Alert.alert('Export Berhasil', `File tersimpan di: ${filePath}`);
      }
    } catch (e: any) {
      Alert.alert('Error', `Gagal export: ${e.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'Import Data',
      'Fitur import memerlukan file JSON backup. Letakkan file di folder Documents dengan nama "sync-planner-import.json", lalu tekan OK.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'OK - Import',
          onPress: async () => {
            try {
              const filePath = `${FileSystem.documentDirectory}sync-planner-import.json`;
              const exists = await FileSystem.getInfoAsync(filePath);
              if (!exists.exists) {
                Alert.alert('Error', 'File sync-planner-import.json tidak ditemukan di folder Documents');
                return;
              }
              const data = await FileSystem.readAsStringAsync(filePath);
              await importAllData(data);
              Alert.alert('Berhasil', 'Data berhasil diimport!');
            } catch (e: any) {
              Alert.alert('Error', `Gagal import: ${e.message}`);
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Hapus Semua Data',
      'Tindakan ini tidak bisa dibatalkan. Semua data akan dihapus permanen.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Konfirmasi', 'Yakin ingin menghapus SEMUA data?', [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Ya, Hapus',
                style: 'destructive',
                onPress: async () => {
                  await clearAllData();
                  Alert.alert('Berhasil', 'Semua data telah dihapus');
                },
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: Spacing.lg }}>
        {/* App Info */}
        <Card style={{ alignItems: 'center', backgroundColor: '#E3F2FD' }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📱</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.primary }}>Sync Planner</Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Islamic Productivity Mobile</Text>
          <Text style={{ fontSize: 11, color: Colors.textLight, marginTop: 4 }}>v1.0.0 - React Native + SQLite</Text>
        </Card>

        {/* Data Management */}
        <Text style={styles.sectionTitle}>💾 Data Management</Text>

        <Card>
          <TouchableOpacity style={styles.menuItem} onPress={handleExport} disabled={exporting}>
            <Text style={styles.menuIcon}>📤</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Export Data</Text>
              <Text style={styles.menuDesc}>Backup semua data ke file JSON</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Card>
          <TouchableOpacity style={styles.menuItem} onPress={handleImport}>
            <Text style={styles.menuIcon}>📥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Import Data</Text>
              <Text style={styles.menuDesc}>Restore data dari file backup JSON</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Database Info */}
        <Text style={styles.sectionTitle}>🗄️ Database</Text>

        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipe</Text>
            <Text style={styles.infoValue}>SQLite (Lokal)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lokasi</Text>
            <Text style={styles.infoValue}>Di perangkat HP</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Koneksi Internet</Text>
            <Text style={styles.infoValue}>Tidak diperlukan</Text>
          </View>
        </Card>

        {/* Features */}
        <Text style={styles.sectionTitle}>📋 Fitur</Text>

        <Card>
          {[
            '✅ Tasks & Kanban Board',
            '🎯 Goals 12 Minggu',
            '🍅 Pomodoro Timer',
            '🕌 Tracker Sholat (8 waktu)',
            '📿 Dzikir Pagi/Sore (16 dzikir)',
            '✨ Sunnah Rasul (11 habit)',
            '📓 Jurnal Pagi/Malam',
            '🔭 Piramida Visi',
            '🏛️ Wisdom Stoik (30 situasi)',
            '💭 Brain Dump & Don\'t List',
            '📊 Weekly Review',
          ].map((feat, i) => (
            <Text key={i} style={styles.featureItem}>{feat}</Text>
          ))}
        </Card>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: Colors.danger }]}>⚠️ Zona Bahaya</Text>

        <Card style={{ borderWidth: 1, borderColor: '#FFCDD2' }}>
          <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
            <Text style={styles.menuIcon}>🗑</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: Colors.danger }]}>Hapus Semua Data</Text>
              <Text style={styles.menuDesc}>Menghapus semua data secara permanen</Text>
            </View>
          </TouchableOpacity>
        </Card>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginTop: 20, marginBottom: 8, paddingLeft: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { fontSize: 24 },
  menuText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  menuDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  infoLabel: { fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  featureItem: { fontSize: 13, color: Colors.text, paddingVertical: 4 },
});
