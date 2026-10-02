import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, shadows, borders } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalButton } from '../../src/components/ui/BrutalButton';
import { BrutalInput } from '../../src/components/ui/BrutalInput';
import { DotPattern, GeometricSquare, BrutalBadge } from '../../src/components/ui/BrutalDecorations';
import { useClasses } from '../../src/hooks/useClasses';
import { useStudents } from '../../src/hooks/useStudents';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useAuth } from '../../src/hooks/useAuth';
import { useNotices } from '../../src/hooks/useNotices';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { classes, loading: classesLoading, addClass } = useClasses();
  const { studentsByClass, loading: studentsLoading } = useStudents();
  const { attendanceRecords, loading: attendanceLoading } = useAttendance();
  const { userRole, user } = useAuth();
  const { notices, addNotice, deleteNotice, loading: noticesLoading } = useNotices();
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [showClassModal, setShowClassModal] = useState(false);
  const [className, setClassName] = useState('');
  const [classSection, setClassSection] = useState('');

  const totalStudents = useMemo(() => {
    const existingClassIds = new Set(classes.map(c => c.id));
    return Object.entries(studentsByClass)
      .filter(([classId]) => existingClassIds.has(classId))
      .reduce((acc, [, classStudents]) => acc + classStudents.length, 0);
  }, [studentsByClass, classes]);

  const validAttendanceRecords = useMemo(() => {
    const existingClassIds = new Set(classes.map(c => c.id));
    return attendanceRecords.filter(r => r.classId && existingClassIds.has(r.classId));
  }, [attendanceRecords, classes]);

  const loading = classesLoading || studentsLoading || attendanceLoading || noticesLoading;

  const handleAddNotice = async () => {
    if (!noticeTitle.trim()) return;
    await addNotice({ title: noticeTitle.trim() });
    setNoticeTitle('');
    setShowNoticeModal(false);
  };

  const handleAddClass = async () => {
    if (!className.trim() || !classSection.trim()) return;
    await addClass({ name: className.trim(), section: classSection.trim() });
    setClassName('');
    setClassSection('');
    setShowClassModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
          <Text style={styles.loadingText}>LOADING...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statCards = [
    { title: 'TOTAL CLASSES', value: classes.length, icon: 'book-outline' as const, color: colors.yellow },
    { title: 'TOTAL STUDENTS', value: totalStudents, icon: 'people-outline' as const, color: colors.orange },
    { title: 'ATTENDANCE', value: validAttendanceRecords.length, icon: 'checkmark-circle-outline' as const, color: colors.success },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>DASHBOARD</Text>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          </View>
          <View style={styles.headerRight}>
            <GeometricSquare size={14} color={colors.orange} style={{ marginRight: 8 }} />
            <DotPattern size={40} />
          </View>
        </View>

        {/* Stat Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          {statCards.map((stat) => (
            <BrutalCard key={stat.title} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: stat.color + '25' }]}>
                <Ionicons name={stat.icon} size={22} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </BrutalCard>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        {userRole === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.yellow }]}
                onPress={() => router.push('/registration/students')}
              >
                <Ionicons name="person-add" size={24} color={colors.black} />
                <Text style={styles.actionText}>REGISTER{'\n'}STUDENT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.orange }]}
                onPress={() => router.push('/registration/teachers')}
              >
                <Ionicons name="people" size={24} color={colors.white} />
                <Text style={[styles.actionText, { color: colors.white }]}>MANAGE{'\n'}TEACHERS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.black }]}
                onPress={() => router.push('/meal-verification')}
              >
                <Ionicons name="restaurant" size={24} color={colors.yellow} />
                <Text style={[styles.actionText, { color: colors.white }]}>MEAL{'\n'}VERIFY</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YOUR CLASSES</Text>
            <BrutalButton
              title="NEW"
              onPress={() => setShowClassModal(true)}
              variant="yellow"
              size="sm"
              icon="add"
            />
          </View>

          {classes.length > 0 ? (
            classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/attendance/${cls.id}`)}
              >
                <BrutalCard style={styles.classCard}>
                  <View style={styles.classCardContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.className}>{cls.name}</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                        <BrutalBadge text={`SEC. ${cls.section}`} />
                        <BrutalBadge text={`${(studentsByClass[cls.id] || []).length} STUDENTS`} variant="info" />
                      </View>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.black} />
                  </View>
                </BrutalCard>
              </TouchableOpacity>
            ))
          ) : (
            <BrutalCard style={{ alignItems: 'center', padding: 32 }}>
              <Ionicons name="book-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { marginTop: 12 }]}>No classes yet</Text>
              <BrutalButton
                title="CREATE CLASS"
                onPress={() => setShowClassModal(true)}
                variant="primary"
                size="sm"
                icon="add"
                style={{ marginTop: 12 }}
              />
            </BrutalCard>
          )}
        </View>

        {/* Notice Board */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📢 NOTICE BOARD</Text>
            {userRole === 'admin' && (
              <BrutalButton
                title="PUBLISH"
                onPress={() => setShowNoticeModal(true)}
                variant="primary"
                size="sm"
                icon="megaphone"
              />
            )}
          </View>

          {notices.length > 0 ? (
            notices.slice(0, 5).map((notice) => (
              <BrutalCard key={notice.id} style={styles.noticeCard}>
                <View style={styles.noticeContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noticeTitle}>{notice.title}</Text>
                    <Text style={styles.noticeDate}>
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {userRole === 'admin' && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Delete Notice', 'Are you sure?', [
                          { text: 'Cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteNotice(notice.id) },
                        ]);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </BrutalCard>
            ))
          ) : (
            <Text style={styles.emptyText}>No notices yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Add Notice Modal */}
      <Modal visible={showNoticeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BrutalCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>PUBLISH NOTICE</Text>
            <BrutalInput
              label="NOTICE TITLE"
              placeholder="Enter notice title..."
              value={noticeTitle}
              onChangeText={setNoticeTitle}
              icon="megaphone-outline"
            />
            <View style={styles.modalActions}>
              <BrutalButton title="CANCEL" onPress={() => setShowNoticeModal(false)} variant="outline" size="sm" />
              <BrutalButton title="PUBLISH" onPress={handleAddNotice} variant="primary" size="sm" showArrow />
            </View>
          </BrutalCard>
        </View>
      </Modal>

      {/* Add Class Modal */}
      <Modal visible={showClassModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BrutalCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>CREATE NEW CLASS</Text>
            <BrutalInput
              label="CLASS NAME"
              placeholder="e.g. Mathematics 101"
              value={className}
              onChangeText={setClassName}
              icon="book-outline"
            />
            <BrutalInput
              label="SECTION"
              placeholder="e.g. A"
              value={classSection}
              onChangeText={setClassSection}
              icon="grid-outline"
            />
            <View style={styles.modalActions}>
              <BrutalButton title="CANCEL" onPress={() => setShowClassModal(false)} variant="outline" size="sm" />
              <BrutalButton title="CREATE" onPress={handleAddClass} variant="primary" size="sm" showArrow />
            </View>
          </BrutalCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { ...typography.label, color: colors.textMuted },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  greeting: { ...typography.h1, fontSize: 32, color: colors.black },
  userName: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginTop: 2 },
  statsRow: { marginBottom: 24 },
  statCard: { width: 130, marginRight: 12, padding: 14 },
  statIconBg: { width: 40, height: 40, borderRadius: 4, ...borders.medium, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: '900', color: colors.black },
  statTitle: { ...typography.caption, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...typography.h2, fontSize: 18, color: colors.black },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, ...borders.thick, ...shadows.brutalSmall, borderRadius: 4, padding: 14, alignItems: 'center', gap: 8 },
  actionText: { ...typography.caption, fontSize: 10, color: colors.black, textAlign: 'center' },
  classCard: { marginBottom: 10, padding: 14 },
  classCardContent: { flexDirection: 'row', alignItems: 'center' },
  className: { ...typography.h3, fontSize: 16, color: colors.black },
  noticeCard: { marginBottom: 8, padding: 12 },
  noticeContent: { flexDirection: 'row', alignItems: 'center' },
  noticeTitle: { ...typography.bodyBold, color: colors.black },
  noticeDate: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24 },
  modalTitle: { ...typography.h2, color: colors.black, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
});
