import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, borders } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { DotPattern, GeometricSquare } from '../../src/components/ui/BrutalDecorations';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useClasses } from '../../src/hooks/useClasses';
import { useAuth } from '../../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import type { AttendanceStatus } from '../../src/types';

const { width: screenWidth } = Dimensions.get('window');

export default function ReportsScreen() {
  const { userRole, loading: authLoading } = useAuth();
  const { attendanceRecords, loading: attendanceLoading } = useAttendance();
  const { classes, loading: classesLoading } = useClasses();

  const loading = authLoading || attendanceLoading || classesLoading;

  const stats = useMemo(() => {
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const total = attendanceRecords.length;
    const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
    const absentPercent = total > 0 ? Math.round((absent / total) * 100) : 0;
    const latePercent = total > 0 ? Math.round((late / total) * 100) : 0;
    return { present, absent, late, total, presentPercent, absentPercent, latePercent };
  }, [attendanceRecords]);

  const classStats = useMemo(() => {
    return classes.map(cls => {
      const records = attendanceRecords.filter(r => r.classId === cls.id);
      const present = records.filter(r => r.status === 'present').length;
      const total = records.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return { ...cls, present, total, rate };
    });
  }, [classes, attendanceRecords]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
          <Text style={styles.loadingText}>LOADING REPORTS...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.textMuted} />
          <Text style={styles.accessDenied}>ACCESS DENIED</Text>
          <Text style={styles.accessDesc}>Only admins can view reports.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ATTENDANCE{'\n'}REPORTS</Text>
            <Text style={styles.subtitle}>Analytics & insights</Text>
          </View>
          <DotPattern size={50} />
        </View>

        {/* Overall Stats */}
        <Text style={styles.sectionTitle}>OVERALL STATISTICS</Text>
        <View style={styles.statsGrid}>
          <BrutalCard style={[styles.statCard, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.presentPercent}%</Text>
            <Text style={styles.statLabel}>PRESENT</Text>
            <View style={[styles.statBar, { backgroundColor: colors.success + '30' }]}>
              <View style={[styles.statBarFill, { width: `${stats.presentPercent}%`, backgroundColor: colors.success }]} />
            </View>
            <Text style={styles.statCount}>{stats.present} records</Text>
          </BrutalCard>
          <BrutalCard style={[styles.statCard, { backgroundColor: colors.errorBg }]}>
            <Text style={[styles.statValue, { color: colors.error }]}>{stats.absentPercent}%</Text>
            <Text style={styles.statLabel}>ABSENT</Text>
            <View style={[styles.statBar, { backgroundColor: colors.error + '30' }]}>
              <View style={[styles.statBarFill, { width: `${stats.absentPercent}%`, backgroundColor: colors.error }]} />
            </View>
            <Text style={styles.statCount}>{stats.absent} records</Text>
          </BrutalCard>
        </View>
        <BrutalCard style={[styles.lateCard, { backgroundColor: colors.warningBg }]}>
          <View style={styles.lateRow}>
            <View>
              <Text style={[styles.statValue, { color: '#92400E' }]}>{stats.latePercent}%</Text>
              <Text style={styles.statLabel}>LATE ARRIVALS</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 20 }}>
              <View style={[styles.statBar, { backgroundColor: colors.yellow + '40' }]}>
                <View style={[styles.statBarFill, { width: `${stats.latePercent}%`, backgroundColor: colors.yellow }]} />
              </View>
              <Text style={styles.statCount}>{stats.late} records</Text>
            </View>
          </View>
        </BrutalCard>

        {/* Class-wise breakdown */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>CLASS-WISE BREAKDOWN</Text>
        {classStats.map((cls) => (
          <BrutalCard key={cls.id} style={styles.classStatCard}>
            <View style={styles.classStatHeader}>
              <Text style={styles.classStatName}>{cls.name}</Text>
              <View style={[styles.rateBox, {
                backgroundColor: cls.rate >= 75 ? colors.successBg : cls.rate >= 50 ? colors.warningBg : colors.errorBg,
                borderColor: cls.rate >= 75 ? colors.success : cls.rate >= 50 ? colors.yellow : colors.error,
              }]}>
                <Text style={[styles.rateText, {
                  color: cls.rate >= 75 ? colors.success : cls.rate >= 50 ? '#92400E' : colors.error,
                }]}>{cls.rate}%</Text>
              </View>
            </View>
            <View style={[styles.statBar, { backgroundColor: colors.borderLight, marginTop: 10, height: 8 }]}>
              <View style={[styles.statBarFill, {
                width: `${cls.rate}%`,
                backgroundColor: cls.rate >= 75 ? colors.success : cls.rate >= 50 ? colors.yellow : colors.error,
                height: 8,
              }]} />
            </View>
            <Text style={styles.classStatDetail}>{cls.present} present / {cls.total} total records</Text>
          </BrutalCard>
        ))}

        {/* Total Summary */}
        <BrutalCard variant="yellow" style={styles.summaryCard}>
          <GeometricSquare size={14} color={colors.orange} style={{ position: 'absolute', top: 10, right: 10 }} />
          <Text style={styles.summaryTitle}>TOTAL RECORDS</Text>
          <Text style={styles.summaryValue}>{stats.total}</Text>
          <Text style={styles.summaryDetail}>Across {classes.length} classes</Text>
        </BrutalCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { ...typography.label, color: colors.textMuted },
  accessDenied: { ...typography.h1, color: colors.black, marginTop: 16 },
  accessDesc: { ...typography.body, color: colors.textMuted },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { ...typography.hero, fontSize: 30, lineHeight: 34, color: colors.black },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '500', marginTop: 4 },
  sectionTitle: { ...typography.h2, fontSize: 16, color: colors.black, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, padding: 14 },
  statValue: { fontSize: 32, fontWeight: '900' },
  statLabel: { ...typography.caption, fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  statBar: { height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 3 },
  statCount: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  lateCard: { padding: 14, ...borders.thick, borderRadius: 4, marginBottom: 8 },
  lateRow: { flexDirection: 'row', alignItems: 'center' },
  classStatCard: { marginBottom: 10, padding: 14 },
  classStatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classStatName: { ...typography.bodyBold, color: colors.black, flex: 1 },
  rateBox: { ...borders.medium, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 },
  rateText: { fontWeight: '900', fontSize: 14 },
  classStatDetail: { ...typography.small, color: colors.textMuted, marginTop: 6 },
  summaryCard: { marginTop: 16, padding: 20, alignItems: 'center' },
  summaryTitle: { ...typography.caption, color: colors.black, opacity: 0.6 },
  summaryValue: { fontSize: 48, fontWeight: '900', color: colors.black, marginVertical: 4 },
  summaryDetail: { ...typography.body, color: colors.textSecondary },
});
