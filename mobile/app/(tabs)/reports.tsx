import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, borders } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalButton } from '../../src/components/ui/BrutalButton';
import { DotPattern, GeometricSquare } from '../../src/components/ui/BrutalDecorations';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useClasses } from '../../src/hooks/useClasses';
import { useStudents } from '../../src/hooks/useStudents';
import { useAuth } from '../../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function ReportsScreen() {
  const { userRole, loading: authLoading } = useAuth();
  const { attendanceRecords, loading: attendanceLoading } = useAttendance();
  const { classes, loading: classesLoading } = useClasses();
  const { allStudents } = useStudents();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const loading = authLoading || attendanceLoading || classesLoading;

  // Student ID to name map
  const studentMap = useMemo(() => {
    const map = new Map<string, string>();
    allStudents.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [allStudents]);

  // Class ID to name map
  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => map.set(c.id, `${c.name} (${c.section})`));
    return map;
  }, [classes]);

  // Filter records based on selected class and time range
  const filteredRecords = useMemo(() => {
    let records = attendanceRecords;

    if (selectedClassId !== 'all') {
      records = records.filter((r) => r.classId === selectedClassId);
    }

    if (timeRange !== 'all') {
      const days = timeRange === '7d' ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      records = records.filter((r) => r.date >= cutoffStr);
    }

    return records;
  }, [attendanceRecords, selectedClassId, timeRange]);

  // Overall stats
  const stats = useMemo(() => {
    const present = filteredRecords.filter((r) => r.status === 'present').length;
    const absent = filteredRecords.filter((r) => r.status === 'absent').length;
    const late = filteredRecords.filter((r) => r.status === 'late').length;
    const total = filteredRecords.length;
    const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
    const absentPercent = total > 0 ? Math.round((absent / total) * 100) : 0;
    const latePercent = total > 0 ? Math.round((late / total) * 100) : 0;
    return { present, absent, late, total, presentPercent, absentPercent, latePercent };
  }, [filteredRecords]);

  // Daily trend for the last 7 days (Visual Bar Chart data)
  const last7DaysData = useMemo(() => {
    const days: { dateStr: string; label: string; present: number; absent: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRecords = filteredRecords.filter((r) => r.date === dateStr);
      const present = dayRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
      const absent = dayRecords.filter((r) => r.status === 'absent').length;

      days.push({
        dateStr,
        label: dayName,
        present,
        absent,
        total: dayRecords.length,
      });
    }
    return days;
  }, [filteredRecords]);

  // Class-wise breakdown
  const classStats = useMemo(() => {
    return classes.map((cls) => {
      const records = filteredRecords.filter((r) => r.classId === cls.id);
      const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
      const total = records.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return { ...cls, present, total, rate };
    });
  }, [classes, filteredRecords]);

  // CSV Export & Share
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      if (filteredRecords.length === 0) {
        Alert.alert('NO DATA', 'No attendance records match the selected filters to export.');
        setIsExporting(false);
        return;
      }

      // Build CSV string
      const headers = 'Date,Class Name,Student ID,Student Name,Status\n';
      const rows = filteredRecords
        .map((r) => {
          const cName = `"${classMap.get(r.classId) || r.classId}"`;
          const sName = `"${studentMap.get(r.studentId) || 'Student'}"`;
          return `${r.date},${cName},${r.studentId},${sName},${r.status.toUpperCase()}`;
        })
        .join('\n');

      const csvContent = headers + rows;

      await Share.share({
        title: 'AttendEase_Attendance_Report.csv',
        message: csvContent,
      });
    } catch (error: any) {
      Alert.alert('EXPORT ERROR', error.message || 'Could not export attendance data.');
    } finally {
      setIsExporting(false);
    }
  };

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
          <Text style={styles.accessDesc}>Only administrators can view attendance analytics.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const maxDayTotal = Math.max(...last7DaysData.map((d) => d.total), 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ATTENDANCE{'\n'}ANALYTICS</Text>
            <Text style={styles.subtitle}>UniFace AI Insights & Reports</Text>
          </View>
          <DotPattern size={50} />
        </View>

        {/* Filter Controls Bar */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>FILTER BY CLASS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            <TouchableOpacity
              onPress={() => setSelectedClassId('all')}
              style={[styles.filterPill, selectedClassId === 'all' && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedClassId === 'all' && styles.filterPillTextActive,
                ]}
              >
                ALL CLASSES
              </Text>
            </TouchableOpacity>
            {classes.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedClassId(c.id)}
                style={[styles.filterPill, selectedClassId === c.id && styles.filterPillActive]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedClassId === c.id && styles.filterPillTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Time range pills */}
          <View style={styles.timeRow}>
            {(['7d', '30d', 'all'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTimeRange(t)}
                style={[styles.timeBtn, timeRange === t && styles.timeBtnActive]}
              >
                <Text style={[styles.timeBtnText, timeRange === t && styles.timeBtnTextActive]}>
                  {t === '7d' ? 'LAST 7 DAYS' : t === '30d' ? 'LAST 30 DAYS' : 'ALL TIME'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Export CSV Button */}
        <BrutalButton
          title={isExporting ? 'GENERATING CSV...' : 'EXPORT CSV / SHARE REPORT'}
          onPress={handleExportCsv}
          variant="secondary"
          size="md"
          fullWidth
          icon="download-outline"
          style={styles.exportBtn}
        />

        {/* Overall Statistics Grid */}
        <Text style={styles.sectionTitle}>OVERVIEW METRICS</Text>
        <View style={styles.statsGrid}>
          <BrutalCard style={[styles.statCard, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.presentPercent}%</Text>
            <Text style={styles.statLabel}>PRESENT RATE</Text>
            <View style={[styles.statBar, { backgroundColor: colors.success + '30' }]}>
              <View
                style={[
                  styles.statBarFill,
                  { width: `${stats.presentPercent}%`, backgroundColor: colors.success },
                ]}
              />
            </View>
            <Text style={styles.statCount}>{stats.present} records</Text>
          </BrutalCard>

          <BrutalCard style={[styles.statCard, { backgroundColor: colors.errorBg }]}>
            <Text style={[styles.statValue, { color: colors.error }]}>{stats.absentPercent}%</Text>
            <Text style={styles.statLabel}>ABSENT RATE</Text>
            <View style={[styles.statBar, { backgroundColor: colors.error + '30' }]}>
              <View
                style={[
                  styles.statBarFill,
                  { width: `${stats.absentPercent}%`, backgroundColor: colors.error },
                ]}
              />
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
                <View
                  style={[
                    styles.statBarFill,
                    { width: `${stats.latePercent}%`, backgroundColor: colors.yellow },
                  ]}
                />
              </View>
              <Text style={styles.statCount}>{stats.late} marked late</Text>
            </View>
          </View>
        </BrutalCard>

        {/* 📊 VISUAL ATTENDANCE BAR CHART */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>DAILY ATTENDANCE TREND</Text>
        <BrutalCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>LAST 7 DAYS ATTENDANCE</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Present</Text>
              <View style={[styles.legendDot, { backgroundColor: colors.error, marginLeft: 10 }]} />
              <Text style={styles.legendText}>Absent</Text>
            </View>
          </View>

          {/* Bar Chart Container */}
          <View style={styles.barsContainer}>
            {last7DaysData.map((d, idx) => {
              const presentHeight = d.total > 0 ? (d.present / maxDayTotal) * 110 : 4;
              const absentHeight = d.total > 0 ? (d.absent / maxDayTotal) * 110 : 0;

              return (
                <View key={idx} style={styles.barCol}>
                  <View style={styles.barStack}>
                    {/* Absent bar */}
                    {absentHeight > 0 && (
                      <View style={[styles.barPart, { height: absentHeight, backgroundColor: colors.error }]} />
                    )}
                    {/* Present bar */}
                    <View style={[styles.barPart, { height: Math.max(presentHeight, 4), backgroundColor: colors.success }]} />
                  </View>
                  <Text style={styles.dayLabel}>{d.label}</Text>
                  <Text style={styles.dayCount}>{d.present}</Text>
                </View>
              );
            })}
          </View>
        </BrutalCard>

        {/* Class-wise breakdown */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>CLASS-WISE PERFORMANCE</Text>
        {classStats.map((cls) => (
          <TouchableOpacity
            key={cls.id}
            onPress={() => setSelectedClassId(selectedClassId === cls.id ? 'all' : cls.id)}
            activeOpacity={0.8}
          >
            <BrutalCard style={styles.classStatCard}>
              <View style={styles.classStatHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classStatName}>{cls.name}</Text>
                  <Text style={styles.classStatSection}>Section: {cls.section}</Text>
                </View>
                <View
                  style={[
                    styles.rateBox,
                    {
                      backgroundColor:
                        cls.rate >= 75
                          ? colors.successBg
                          : cls.rate >= 50
                          ? colors.warningBg
                          : colors.errorBg,
                      borderColor:
                        cls.rate >= 75
                          ? colors.success
                          : cls.rate >= 50
                          ? colors.yellow
                          : colors.error,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rateText,
                      {
                        color:
                          cls.rate >= 75
                            ? colors.success
                            : cls.rate >= 50
                            ? '#92400E'
                            : colors.error,
                      },
                    ]}
                  >
                    {cls.rate}%
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statBar,
                  { backgroundColor: colors.borderLight, marginTop: 10, height: 8 },
                ]}
              >
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${cls.rate}%`,
                      backgroundColor:
                        cls.rate >= 75
                          ? colors.success
                          : cls.rate >= 50
                          ? colors.yellow
                          : colors.error,
                      height: 8,
                    },
                  ]}
                />
              </View>
              <Text style={styles.classStatDetail}>
                {cls.present} present out of {cls.total} recorded
              </Text>
            </BrutalCard>
          </TouchableOpacity>
        ))}

        {/* Total Summary */}
        <BrutalCard variant="yellow" style={styles.summaryCard}>
          <GeometricSquare
            size={14}
            color={colors.orange}
            style={{ position: 'absolute', top: 10, right: 10 }}
          />
          <Text style={styles.summaryTitle}>TOTAL SAMPLES ANALYZED</Text>
          <Text style={styles.summaryValue}>{stats.total}</Text>
          <Text style={styles.summaryDetail}>
            Across {classes.length} classes • {filteredRecords.length} records in view
          </Text>
        </BrutalCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { ...typography.label, color: colors.textMuted },
  accessDenied: { ...typography.h1, color: colors.black, marginTop: 16 },
  accessDesc: { ...typography.body, color: colors.textMuted },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { ...typography.hero, fontSize: 30, lineHeight: 34, color: colors.black },
  subtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
  filterSection: { marginBottom: 16 },
  filterLabel: { ...typography.caption, fontSize: 11, color: colors.textMuted, marginBottom: 8 },
  pillScroll: { flexDirection: 'row', marginBottom: 12 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    ...borders.medium,
    marginRight: 8,
  },
  filterPillActive: { backgroundColor: colors.black },
  filterPillText: { ...typography.caption, fontSize: 11, color: colors.black },
  filterPillTextActive: { color: colors.white },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    ...borders.thin,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  timeBtnActive: { backgroundColor: colors.yellow, ...borders.medium },
  timeBtnText: { ...typography.caption, fontSize: 10, color: colors.textSecondary },
  timeBtnTextActive: { color: colors.black, fontWeight: '800' },
  exportBtn: { marginBottom: 20 },
  sectionTitle: { ...typography.h2, fontSize: 15, color: colors.black, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, padding: 14 },
  statValue: { fontSize: 32, fontWeight: '900' },
  statLabel: { ...typography.caption, fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  statBar: { height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 3 },
  statCount: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  lateCard: { padding: 14, ...borders.thick, borderRadius: 4, marginBottom: 8 },
  lateRow: { flexDirection: 'row', alignItems: 'center' },
  chartCard: { padding: 16, marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { ...typography.caption, fontSize: 11, color: colors.black, fontWeight: '800' },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginLeft: 4 },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  barCol: { alignItems: 'center', flex: 1 },
  barStack: { width: 22, justifyContent: 'flex-end', alignItems: 'center', height: 110 },
  barPart: { width: 20, borderRadius: 2, marginBottom: 1 },
  dayLabel: { fontSize: 10, fontWeight: '800', color: colors.black, marginTop: 6 },
  dayCount: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },
  classStatCard: { marginBottom: 10, padding: 14 },
  classStatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classStatName: { ...typography.bodyBold, color: colors.black },
  classStatSection: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rateBox: { ...borders.medium, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 },
  rateText: { fontWeight: '900', fontSize: 14 },
  classStatDetail: { ...typography.small, color: colors.textMuted, marginTop: 6 },
  summaryCard: { marginTop: 16, padding: 20, alignItems: 'center' },
  summaryTitle: { ...typography.caption, color: colors.black, opacity: 0.6 },
  summaryValue: { fontSize: 48, fontWeight: '900', color: colors.black, marginVertical: 4 },
  summaryDetail: { ...typography.body, color: colors.textSecondary },
});
