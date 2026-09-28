import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, shadows, borders } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalBadge, DotPattern, GeometricSquare } from '../../src/components/ui/BrutalDecorations';
import { useClasses } from '../../src/hooks/useClasses';
import { useStudents } from '../../src/hooks/useStudents';
import { Ionicons } from '@expo/vector-icons';

export default function AttendanceListScreen() {
  const { classes, loading: classesLoading } = useClasses();
  const { studentsByClass, loading: studentsLoading } = useStudents();

  const loading = classesLoading || studentsLoading;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
          <Text style={styles.loadingText}>LOADING CLASSES...</Text>
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
            <Text style={styles.title}>TAKE{'\n'}ATTENDANCE</Text>
            <Text style={styles.subtitle}>Select a class to begin</Text>
          </View>
          <View>
            <DotPattern size={50} />
            <GeometricSquare size={14} color={colors.orange} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* Today's date */}
        <BrutalCard variant="yellow" style={styles.dateCard}>
          <View style={styles.dateContent}>
            <Ionicons name="calendar" size={22} color={colors.black} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.dateLabel}>TODAY'S DATE</Text>
              <Text style={styles.dateValue}>
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).toUpperCase()}
              </Text>
            </View>
          </View>
        </BrutalCard>

        {/* Class Cards */}
        {classes.length > 0 ? (
          classes.map((cls, index) => (
            <TouchableOpacity
              key={cls.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/attendance/${cls.id}`)}
            >
              <BrutalCard style={[styles.classCard, index % 2 === 0 && styles.classCardAlt]}>
                <View style={styles.classHeader}>
                  <View style={[styles.classNumber, { backgroundColor: index % 2 === 0 ? colors.yellow : colors.orange }]}>
                    <Text style={styles.classNumberText}>{(index + 1).toString().padStart(2, '0')}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                      <BrutalBadge text={`SECTION ${cls.section}`} />
                      <BrutalBadge 
                        text={`${(studentsByClass[cls.id] || []).length} STUDENTS`} 
                        variant="info" 
                      />
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={20} color={colors.black} />
                  </View>
                </View>
              </BrutalCard>
            </TouchableOpacity>
          ))
        ) : (
          <BrutalCard style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="book-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No classes found.{'\n'}Create a class from the dashboard.</Text>
          </BrutalCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { ...typography.label, color: colors.textMuted },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { ...typography.hero, fontSize: 34, lineHeight: 38, color: colors.black },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '500', marginTop: 4 },
  dateCard: { marginBottom: 20, padding: 14 },
  dateContent: { flexDirection: 'row', alignItems: 'center' },
  dateLabel: { ...typography.caption, fontSize: 10, color: colors.black, opacity: 0.6 },
  dateValue: { ...typography.bodyBold, fontSize: 13, color: colors.black, marginTop: 2 },
  classCard: { marginBottom: 12, padding: 16 },
  classCardAlt: {},
  classHeader: { flexDirection: 'row', alignItems: 'center' },
  classNumber: {
    width: 46,
    height: 46,
    borderRadius: 4,
    ...borders.thick,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classNumberText: { ...typography.h2, fontSize: 18, color: colors.black },
  className: { ...typography.h3, fontSize: 15, color: colors.black },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 4,
    ...borders.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 22 },
});
