import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, borders, shadows } from '../src/theme';
import { BrutalCard } from '../src/components/ui/BrutalCard';
import { BrutalButton } from '../src/components/ui/BrutalButton';
import { BrutalInput } from '../src/components/ui/BrutalInput';
import { BrutalBadge, GeometricSquare } from '../src/components/ui/BrutalDecorations';
import { useStudents } from '../src/hooks/useStudents';
import { useAttendance } from '../src/hooks/useAttendance';
import { useMealVerifications } from '../src/hooks/useMealVerifications';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MealVerificationScreen() {
  const { allStudents, loading: studentsLoading } = useStudents();
  const { attendanceRecords, loading: attendanceLoading } = useAttendance();
  const { verifications, addMealVerification, loading: verificationsLoading } = useMealVerifications();
  const [showScanner, setShowScanner] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  const todayStr = toLocalDateString(new Date());
  const todayVerifications = verifications.filter(v => v.date === todayStr);

  // Get today's present or late students from attendance records
  const presentStudents = useMemo(() => {
    const presentRecords = attendanceRecords.filter(
      r => r.date === todayStr && (r.status === 'present' || r.status === 'late')
    );
    const presentStudentIds = new Set(presentRecords.map(r => r.studentId));
    return allStudents.filter(s => presentStudentIds.has(s.id));
  }, [attendanceRecords, allStudents, todayStr]);

  // Check if a student's meal is already verified today
  const isStudentVerifiedToday = (studentId: string) => {
    return todayVerifications.some(v => v.studentId === studentId);
  };

  const handleQrScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('CAMERA REQUIRED', 'Allow camera access to scan QR codes.');
        return;
      }
    }
    setShowScanner(true);
  };

  const onBarCodeScanned = async ({ data }: { data: string }) => {
    setShowScanner(false);
    
    const student = allStudents.find(s => s.id === data);
    if (!student) {
      Alert.alert('❌ NOT FOUND', 'This QR code does not match any student.');
      return;
    }

    if (isStudentVerifiedToday(data)) {
      Alert.alert('⚠️ ALREADY VERIFIED', `${student.name} has already been verified today.`);
      return;
    }

    const isPresent = presentStudents.some(s => s.id === data);
    if (!isPresent) {
      Alert.alert(
        '⚠️ STUDENT NOT PRESENT TODAY',
        `${student.name} is not marked present today. Mark meal anyway?`,
        [
          { text: 'CANCEL', style: 'cancel' },
          {
            text: 'VERIFY ANYWAY',
            onPress: async () => {
              const success = await addMealVerification({
                studentId: data,
                date: todayStr,
                source: 'qr',
              });
              if (success) {
                Alert.alert('✅ VERIFIED', `Meal verified for ${student.name}`);
              }
            }
          }
        ]
      );
      return;
    }

    const success = await addMealVerification({
      studentId: data,
      date: todayStr,
      source: 'qr',
    });

    if (success) {
      Alert.alert('✅ VERIFIED', `Meal verified for ${student.name}`);
    } else {
      Alert.alert('⚠️ ALREADY VERIFIED', `${student.name} has already been verified today.`);
    }
  };

  const handleManualVerify = async () => {
    if (!manualStudentId.trim()) {
      Alert.alert('REQUIRED', 'Please enter student ID.');
      return;
    }

    const student = allStudents.find(s => s.id === manualStudentId.trim());
    if (!student) {
      Alert.alert('❌ NOT FOUND', 'No student found with this ID.');
      return;
    }

    if (isStudentVerifiedToday(student.id)) {
      Alert.alert('⚠️ ALREADY VERIFIED', `${student.name} has already been verified today.`);
      return;
    }

    const isPresent = presentStudents.some(s => s.id === student.id);
    if (!isPresent) {
      Alert.alert(
        '⚠️ STUDENT NOT PRESENT TODAY',
        `${student.name} is not marked present today. Mark meal anyway?`,
        [
          { text: 'CANCEL', style: 'cancel' },
          {
            text: 'VERIFY ANYWAY',
            onPress: async () => {
              const success = await addMealVerification({
                studentId: student.id,
                date: todayStr,
                source: 'manual',
                note: manualNote.trim() || undefined,
              });
              if (success) {
                Alert.alert('✅ VERIFIED', `Meal verified for ${student.name}`);
                setManualStudentId('');
                setManualNote('');
                setShowManualModal(false);
              }
            }
          }
        ]
      );
      return;
    }

    const success = await addMealVerification({
      studentId: manualStudentId.trim(),
      date: todayStr,
      source: 'manual',
      note: manualNote.trim() || undefined,
    });

    if (success) {
      Alert.alert('✅ VERIFIED', `Meal verified for ${student.name}`);
      setManualStudentId('');
      setManualNote('');
      setShowManualModal(false);
    } else {
      Alert.alert('⚠️ ALREADY VERIFIED', `${student.name} has already been verified today.`);
    }
  };

  // Quick verify a present student's meal
  const handleQuickVerify = async (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    if (isStudentVerifiedToday(studentId)) {
      Alert.alert('⚠️ ALREADY VERIFIED', `${student.name} ka meal aaj already verify ho chuka hai.`);
      return;
    }

    Alert.alert(
      '🍽️ VERIFY MEAL',
      `Confirm meal for ${student.name}?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'VERIFY',
          onPress: async () => {
            const success = await addMealVerification({
              studentId,
              date: todayStr,
              source: 'manual',
              note: 'Quick verified from present students list',
            });
            if (success) {
              Alert.alert('✅ VERIFIED', `Meal verified for ${student.name}`);
            }
          },
        },
      ]
    );
  };

  if (studentsLoading || attendanceLoading || verificationsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
        <Text style={styles.loadingText}>LOADING MEAL DATA...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Stats */}
      <BrutalCard variant="yellow" style={styles.statsCard}>
        <View style={styles.statsRow}>
          <GeometricSquare size={12} color={colors.orange} style={{ position: 'absolute', top: 0, right: 0 }} />
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.statsValue}>{todayVerifications.length}</Text>
            <Text style={styles.statsLabel}>VERIFIED TODAY</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.statsValue}>{presentStudents.length}</Text>
            <Text style={styles.statsLabel}>PRESENT TODAY</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.statsValue}>{allStudents.length}</Text>
            <Text style={styles.statsLabel}>TOTAL</Text>
          </View>
        </View>
      </BrutalCard>

      {/* Action Buttons */}
      <Text style={styles.sectionTitle}>VERIFY MEAL</Text>
      <View style={styles.actionsRow}>
        <BrutalButton
          title="SCAN QR"
          onPress={handleQrScan}
          variant="primary"
          size="lg"
          icon="qr-code"
          showArrow
          style={{ flex: 1 }}
        />
        <BrutalButton
          title="MANUAL"
          onPress={() => setShowManualModal(true)}
          variant="yellow"
          size="lg"
          icon="pencil"
          style={{ flex: 1 }}
        />
      </View>

      {/* Today's Present Students — Quick Verify */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        🟢 TODAY'S PRESENT STUDENTS ({presentStudents.length})
      </Text>
      {presentStudents.length > 0 ? (
        presentStudents.map((student) => {
          const verified = isStudentVerifiedToday(student.id);
          return (
            <TouchableOpacity
              key={student.id}
              onPress={() => handleQuickVerify(student.id)}
              disabled={verified}
              activeOpacity={0.7}
            >
              <BrutalCard style={[styles.presentCard, verified && styles.presentCardVerified]}>
                <View style={styles.presentRow}>
                  <View style={[styles.presentAvatar, { borderColor: verified ? colors.success : colors.orange }]}>
                    {student.avatar ? (
                      <Image source={{ uri: student.avatar }} style={{ width: 38, height: 38 }} />
                    ) : (
                      <Text style={{ fontWeight: '900', fontSize: 16, color: colors.black }}>{student.name.charAt(0)}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.presentName}>{student.name}</Text>
                    <Text style={styles.presentStatus}>
                      {verified ? '✅ MEAL VERIFIED' : '🍽️ TAP TO VERIFY MEAL'}
                    </Text>
                  </View>
                  {verified ? (
                    <BrutalBadge text="DONE" variant="success" />
                  ) : (
                    <View style={styles.verifyBtn}>
                      <Ionicons name="restaurant" size={16} color={colors.orange} />
                    </View>
                  )}
                </View>
              </BrutalCard>
            </TouchableOpacity>
          );
        })
      ) : (
        <BrutalCard style={{ alignItems: 'center', padding: 32 }}>
          <Ionicons name="people-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            No students marked present today.{'\n'}Take attendance first!
          </Text>
        </BrutalCard>
      )}

      {/* Today's Verifications */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        TODAY'S VERIFICATIONS ({todayVerifications.length})
      </Text>
      {todayVerifications.length > 0 ? (
        todayVerifications.map((v) => {
          const student = allStudents.find(s => s.id === v.studentId);
          return (
            <BrutalCard key={v.id} style={styles.verificationCard}>
              <View style={styles.verificationRow}>
                <View style={[styles.sourceIcon, { 
                  backgroundColor: v.source === 'qr' ? colors.successBg : colors.warningBg 
                }]}>
                  <Ionicons 
                    name={v.source === 'qr' ? 'qr-code' : 'pencil'} 
                    size={16} 
                    color={v.source === 'qr' ? colors.success : '#92400E'} 
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.verStudentName}>{student?.name || 'Unknown'}</Text>
                  <Text style={styles.verTime}>
                    {new Date(v.verifiedAt).toLocaleTimeString()} • {v.source.toUpperCase()}
                  </Text>
                </View>
                <BrutalBadge text="VERIFIED" variant="success" />
              </View>
            </BrutalCard>
          );
        })
      ) : (
        <Text style={styles.emptyText}>No verifications yet today.</Text>
      )}

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>SCAN MEAL QR</Text>
            <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          {permission?.granted && (
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onBarCodeScanned}
            >
              <View style={styles.scanOverlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.scanText}>POINT AT STUDENT QR</Text>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>

      {/* Manual Verify Modal */}
      <Modal visible={showManualModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BrutalCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>MANUAL VERIFICATION</Text>
            <BrutalInput
              label="STUDENT ID"
              placeholder="Enter student ID..."
              value={manualStudentId}
              onChangeText={setManualStudentId}
              icon="id-card-outline"
            />
            <BrutalInput
              label="NOTE (OPTIONAL)"
              placeholder="Reason for manual entry..."
              value={manualNote}
              onChangeText={setManualNote}
              icon="document-text-outline"
            />
            <View style={styles.modalActions}>
              <BrutalButton title="CANCEL" onPress={() => setShowManualModal(false)} variant="outline" size="sm" />
              <BrutalButton title="VERIFY" onPress={handleManualVerify} variant="primary" size="sm" showArrow />
            </View>
          </BrutalCard>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsCard: { padding: 20, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  statsValue: { fontSize: 30, fontWeight: '900', color: colors.black },
  statsLabel: { ...typography.caption, fontSize: 9, color: colors.black, opacity: 0.6, marginTop: 2 },
  statsDivider: { width: 2, height: 40, backgroundColor: colors.black, opacity: 0.15 },
  sectionTitle: { ...typography.h2, fontSize: 16, color: colors.black, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  // Present students
  presentCard: { marginBottom: 8, padding: 12 },
  presentCardVerified: { opacity: 0.6 },
  presentRow: { flexDirection: 'row', alignItems: 'center' },
  presentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 4,
    borderWidth: 3,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  presentName: { ...typography.bodyBold, fontSize: 14, color: colors.black },
  presentStatus: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginTop: 2 },
  verifyBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    ...borders.medium,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Verifications
  verificationCard: { marginBottom: 8, padding: 12 },
  verificationRow: { flexDirection: 'row', alignItems: 'center' },
  sourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 4,
    ...borders.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verStudentName: { ...typography.bodyBold, fontSize: 14, color: colors.black },
  verTime: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 22 },
  // Scanner
  scannerContainer: { flex: 1, backgroundColor: colors.black },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.yellow,
    borderBottomWidth: 3,
    borderBottomColor: colors.black,
  },
  scannerTitle: { ...typography.h1, fontSize: 22, color: colors.black },
  closeBtn: {
    width: 40, height: 40, ...borders.medium, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white,
  },
  scanOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 4, borderColor: colors.yellow, borderRadius: 8 },
  scanText: { ...typography.label, color: colors.white, marginTop: 20 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24 },
  modalTitle: { ...typography.h2, color: colors.black, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  loadingContainer: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.label, color: colors.black, marginTop: 16 },
});
