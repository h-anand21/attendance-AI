import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  FlatList,
  Vibration,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors, typography, borders, shadows } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalButton } from '../../src/components/ui/BrutalButton';
import { BrutalBadge, GeometricSquare } from '../../src/components/ui/BrutalDecorations';
import { useClasses } from '../../src/hooks/useClasses';
import { useStudents } from '../../src/hooks/useStudents';
import { useAttendance } from '../../src/hooks/useAttendance';
import { Ionicons } from '@expo/vector-icons';
import type { AttendanceStatus, Student, AttendanceRecord } from '../../src/types';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { recognizeFacesWithAI } from '../../src/lib/gemini';

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AttendanceDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { classes, loading: classesLoading } = useClasses();
  const { studentsByClass, loading: studentsLoading } = useStudents();
  const { attendanceRecords, addAttendanceRecords, loading: attendanceLoading } = useAttendance();

  const [attendance, setAttendance] = useState<{ studentId: string; status: AttendanceStatus }[]>([]);
  const [isAttendanceConfirmed, setIsAttendanceConfirmed] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedIds, setScannedIds] = useState<Set<string>>(new Set());

  // Camera & Face Scan AI states
  const [showFaceCamera, setShowFaceCamera] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState<boolean>(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [liveScanStatusText, setLiveScanStatusText] = useState<string>('');
  const [sessionRecognizedIds, setSessionRecognizedIds] = useState<Set<string>>(new Set());
  const liveScanIntervalRef = useRef<any>(null);

  // Upload Photo states
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<string>>(new Set());
  const [pickerMode, setPickerMode] = useState<'face' | 'upload'>('face');
  const [isAiUploading, setIsAiUploading] = useState(false);
  const [uploadAiStatus, setUploadAiStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const cameraRef = useRef<any>(null);

  const currentClass = classes.find(c => c.id === classId);
  const students = studentsByClass[classId || ''] || [];
  const loading = classesLoading || studentsLoading || attendanceLoading;

  useEffect(() => {
    if (students.length === 0) return;

    const todayStr = toLocalDateString(new Date());
    const todaysRecords = attendanceRecords.filter(
      r => r.classId === classId && r.date === todayStr
    );

    let initialAttendance;
    if (todaysRecords.length > 0) {
      initialAttendance = students.map(student => {
        const record = todaysRecords.find(r => r.studentId === student.id);
        return {
          studentId: student.id,
          status: (record ? record.status : 'absent') as AttendanceStatus,
        };
      });
      setIsAttendanceConfirmed(true);
    } else {
      initialAttendance = students.map(student => ({
        studentId: student.id,
        status: 'absent' as AttendanceStatus,
      }));
      setIsAttendanceConfirmed(false);
    }
    setAttendance(initialAttendance);
  }, [students, classId, attendanceRecords]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev =>
      prev.map(record =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
    setIsAttendanceConfirmed(false);
  };

  const handleConfirmAttendance = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const recordsToSave = attendance.map(record => ({
        ...record,
        classId: classId!,
      }));

      await addAttendanceRecords(recordsToSave as any);
      setIsAttendanceConfirmed(true);
      Alert.alert('✅ ATTENDANCE SAVED', `Attendance for ${currentClass?.name} has been saved to database.`);
    } catch (error) {
      Alert.alert('ERROR', 'Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQrScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('CAMERA REQUIRED', 'Please allow camera access to scan QR codes.');
        return;
      }
    }
    setShowQrScanner(true);
  };

  // Stop live scan helper
  const stopLiveScan = () => {
    if (liveScanIntervalRef.current) {
      clearInterval(liveScanIntervalRef.current);
      liveScanIntervalRef.current = null;
    }
    setIsLiveScanning(false);
  };

  useEffect(() => {
    return () => {
      if (liveScanIntervalRef.current) {
        clearInterval(liveScanIntervalRef.current);
      }
    };
  }, []);

  // === FACE SCAN: Open camera, live/manual AI scan with front/back toggle ===
  const handleFaceScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('CAMERA REQUIRED', 'Please allow camera access for face scanning.');
        return;
      }
    }
    setSessionRecognizedIds(new Set());
    setLiveScanStatusText('');
    setIsLiveScanning(false);
    setShowFaceCamera(true);
  };

  const handleCloseFaceCamera = () => {
    stopLiveScan();
    setShowFaceCamera(false);
    if (sessionRecognizedIds.size > 0) {
      Alert.alert(
        '✅ AI SCAN COMPLETE',
        `${sessionRecognizedIds.size} student(s) recognized & marked PRESENT! Tap 'CONFIRM ATTENDANCE' to save to database.`
      );
    }
  };

  // Perform AI Face Scan using camera snapshot
  const performAiScan = async () => {
    if (!cameraRef.current || isAiScanning) return;
    try {
      setIsAiScanning(true);
      setLiveScanStatusText('📸 Capturing frame...');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
      });

      if (!photo?.base64) {
        setLiveScanStatusText('⚠️ Could not capture image');
        setIsAiScanning(false);
        return;
      }

      setLiveScanStatusText('🤖 AI Analyzing...');
      const result = await recognizeFacesWithAI(photo.base64, students);

      if (result.error) {
        // If live scanning, fail gracefully in background just like Web app does
        console.warn('Scan frame issue:', result.error);
        if (!isLiveScanning) {
          setLiveScanStatusText(
            result.error.includes('Rate limit')
              ? '⏳ Rate limit: Please wait a moment'
              : '⚠️ Scan missed, please try again'
          );
          setTimeout(() => setLiveScanStatusText(''), 3000);
        } else {
          setLiveScanStatusText('🔴 Scanning for faces...');
        }
      } else if (result.recognizedStudentIds.length > 0) {
        try {
          Vibration.vibrate(150);
        } catch {}

        result.recognizedStudentIds.forEach((id) => {
          handleStatusChange(id, 'present');
        });

        setSessionRecognizedIds((prev) => {
          const updated = new Set(prev);
          result.recognizedStudentIds.forEach((id) => updated.add(id));
          return updated;
        });

        const names = result.recognizedStudentNames.join(', ');
        setLiveScanStatusText(`🎉 Recognized (${result.recognizedStudentIds.length}): ${names}`);
      } else {
        setLiveScanStatusText(isLiveScanning ? '🔴 Scanning for faces...' : '👀 No matching face detected');
        if (!isLiveScanning) {
          setTimeout(() => {
            setLiveScanStatusText('');
          }, 2500);
        }
      }
    } catch (error: any) {
      console.warn('Scan error:', error);
      if (!isLiveScanning) {
        setLiveScanStatusText('⚠️ Scan failed, try again');
        setTimeout(() => setLiveScanStatusText(''), 2500);
      }
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleToggleLiveScan = () => {
    if (isLiveScanning) {
      stopLiveScan();
      setLiveScanStatusText('⏸️ Live scan paused');
    } else {
      setIsLiveScanning(true);
      performAiScan();
      liveScanIntervalRef.current = setInterval(() => {
        performAiScan();
      }, 2500);
    }
  };

  // === UPLOAD IMAGE: Pick from gallery, automatic AI scan ===
  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCapturedPhoto(asset.uri);
        setPickerSelectedIds(new Set());
        setPickerMode('upload');
        setShowStudentPicker(true);

        // Run AI face recognition on uploaded image
        if (asset.base64) {
          setIsAiUploading(true);
          setUploadAiStatus('🤖 Gemini AI analyzing faces in photo...');
          const aiResult = await recognizeFacesWithAI(asset.base64, students);
          setIsAiUploading(false);

          if (aiResult.error) {
            setUploadAiStatus(`⚠️ ${aiResult.error}`);
          } else if (aiResult.recognizedStudentIds.length > 0) {
            setPickerSelectedIds(new Set(aiResult.recognizedStudentIds));
            setUploadAiStatus(
              `🎉 AI recognized ${aiResult.recognizedStudentIds.length} student(s): ${aiResult.recognizedStudentNames.join(', ')}`
            );
          } else {
            setUploadAiStatus(
              '👀 No matching faces recognized. You can select students manually below.'
            );
          }
        }
      }
    } catch (error) {
      Alert.alert('ERROR', 'Failed to pick image. Please try again.');
    }
  };

  // Toggle student selection in picker
  const toggleStudentPick = (studentId: string) => {
    setPickerSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Select all students
  const selectAllStudents = () => {
    setPickerSelectedIds(new Set(students.map((s) => s.id)));
  };

  // Deselect all students
  const deselectAllStudents = () => {
    setPickerSelectedIds(new Set());
  };

  // Confirm picked students as present
  const handleConfirmPicker = () => {
    if (pickerSelectedIds.size === 0) {
      Alert.alert('NO SELECTION', 'Please select at least one student to mark present.');
      return;
    }

    pickerSelectedIds.forEach((id) => {
      handleStatusChange(id, 'present');
    });

    setShowStudentPicker(false);
    setCapturedPhoto(null);
    Alert.alert(
      '✅ STUDENTS MARKED',
      `${pickerSelectedIds.size} student(s) marked as PRESENT via AI. Tap 'CONFIRM ATTENDANCE' below to save!`
    );
  };

  const onBarCodeScanned = ({ data }: { data: string }) => {
    if (scannedIds.has(data)) return;
    
    const student = students.find(s => s.id === data);
    if (student) {
      setScannedIds(prev => new Set(prev).add(data));
      handleStatusChange(data, 'present');
      Alert.alert('✅ SCANNED', `${student.name} marked as PRESENT`);
    } else {
      Alert.alert('❌ NOT FOUND', 'This QR code does not belong to any student in this class.');
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return colors.success;
      case 'absent': return colors.error;
      case 'late': return colors.yellow;
    }
  };

  const getStatusBg = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return colors.successBg;
      case 'absent': return colors.errorBg;
      case 'late': return colors.warningBg;
    }
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: currentClass?.name?.toUpperCase() || 'ATTENDANCE',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Action Buttons */}
        <Text style={styles.sectionTitle}>TAKE ATTENDANCE</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.yellow }]} onPress={handleQrScan}>
            <Ionicons name="qr-code" size={28} color={colors.black} />
            <Text style={styles.actionLabel}>SCAN QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.orange }]} onPress={handleFaceScan}>
            <Ionicons name="scan" size={28} color={colors.white} />
            <Text style={[styles.actionLabel, { color: colors.white }]}>FACE SCAN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.black }]} onPress={handleUploadImage}>
            <Ionicons name="image" size={28} color={colors.yellow} />
            <Text style={[styles.actionLabel, { color: colors.white }]}>UPLOAD</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <BrutalCard style={[styles.summaryCard, { backgroundColor: colors.successBg }]} shadowSize="small">
            <Text style={[styles.summaryValue, { color: colors.success }]}>{presentCount}</Text>
            <Text style={styles.summaryLabel}>PRESENT</Text>
          </BrutalCard>
          <BrutalCard style={[styles.summaryCard, { backgroundColor: colors.errorBg }]} shadowSize="small">
            <Text style={[styles.summaryValue, { color: colors.error }]}>{absentCount}</Text>
            <Text style={styles.summaryLabel}>ABSENT</Text>
          </BrutalCard>
          <BrutalCard style={[styles.summaryCard, { backgroundColor: colors.warningBg }]} shadowSize="small">
            <Text style={[styles.summaryValue, { color: '#92400E' }]}>{lateCount}</Text>
            <Text style={styles.summaryLabel}>LATE</Text>
          </BrutalCard>
        </View>

        {/* Student List */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>STUDENTS ({students.length})</Text>
        {students.map((student) => {
          const record = attendance.find(a => a.studentId === student.id);
          const status = record?.status || 'absent';

          return (
            <BrutalCard key={student.id} style={styles.studentCard}>
              <View style={styles.studentRow}>
                {/* Avatar */}
                <View style={[styles.studentAvatar, { borderColor: getStatusColor(status) }]}>
                  {student.avatar ? (
                    <Image source={{ uri: student.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>{student.name.charAt(0)}</Text>
                  )}
                </View>

                {/* Name */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentId}>{student.id}</Text>
                </View>

                {/* Status buttons */}
                <View style={styles.statusButtons}>
                  {(['present', 'late', 'absent'] as AttendanceStatus[]).map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => handleStatusChange(student.id, s)}
                      style={[
                        styles.statusBtn,
                        status === s && { backgroundColor: getStatusBg(s), borderColor: getStatusColor(s) },
                      ]}
                    >
                      <Text style={[
                        styles.statusBtnText,
                        status === s && { color: getStatusColor(s) },
                      ]}>
                        {s === 'present' ? 'P' : s === 'late' ? 'L' : 'A'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </BrutalCard>
          );
        })}

        {/* Confirm Button */}
        <BrutalButton
          title={isSaving ? 'SAVING TO DATABASE...' : isAttendanceConfirmed ? '✓ ATTENDANCE SAVED' : 'CONFIRM ATTENDANCE'}
          onPress={handleConfirmAttendance}
          variant={isAttendanceConfirmed ? 'yellow' : 'primary'}
          size="lg"
          fullWidth
          showArrow={!isAttendanceConfirmed && !isSaving}
          disabled={students.length === 0 || isAttendanceConfirmed || isSaving}
          icon={isAttendanceConfirmed ? 'checkmark-circle' : 'checkmark-done'}
          style={{ marginTop: 20, marginBottom: 20 }}
        />
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showQrScanner} animationType="slide">
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>SCAN QR CODE</Text>
            <TouchableOpacity onPress={() => setShowQrScanner(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onBarCodeScanned}
            >
              <View style={styles.scanOverlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.scanText}>POINT AT STUDENT QR CODE</Text>
              </View>
            </CameraView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>CAMERA PERMISSION REQUIRED</Text>
              <BrutalButton title="GRANT ACCESS" onPress={requestPermission} variant="primary" />
            </View>
          )}

          <View style={styles.scannerFooter}>
            <Text style={styles.scannedCount}>SCANNED: {scannedIds.size} STUDENTS</Text>
            <BrutalButton
              title="DONE"
              onPress={() => setShowQrScanner(false)}
              variant="primary"
              size="md"
              fullWidth
              showArrow
            />
          </View>
        </View>
      </Modal>

      {/* Face Scan Camera Modal */}
      <Modal visible={showFaceCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          {/* Header with Close, Flip Camera, Flash */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={handleCloseFaceCamera} style={styles.cameraHeaderBtn}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>

            <View style={styles.cameraHeaderCenter}>
              <Text style={styles.cameraHeaderTitle}>🤖 AI FACE SCAN</Text>
              <Text style={styles.cameraHeaderSub}>
                {facing === 'front' ? 'FRONT CAMERA' : 'BACK CAMERA'} • {sessionRecognizedIds.size} MARKED
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Flash / Torch */}
              <TouchableOpacity
                onPress={() => setTorch((prev) => !prev)}
                style={[styles.cameraHeaderBtn, torch && { backgroundColor: colors.yellow }]}
              >
                <Ionicons
                  name={torch ? 'flash' : 'flash-off'}
                  size={20}
                  color={torch ? colors.black : colors.white}
                />
              </TouchableOpacity>

              {/* Front / Back Switch */}
              <TouchableOpacity
                onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
                style={styles.cameraHeaderBtn}
              >
                <Ionicons name="camera-reverse" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              enableTorch={torch}
            >
              <View style={styles.scanOverlay}>
                {/* Live Banner */}
                {liveScanStatusText ? (
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{liveScanStatusText}</Text>
                  </View>
                ) : isLiveScanning ? (
                  <View style={[styles.statusPill, { backgroundColor: '#DC2626' }]}>
                    <Text style={styles.statusPillText}>🔴 LIVE AI SCAN ACTIVE</Text>
                  </View>
                ) : null}

                {/* Viewfinder frame */}
                <View
                  style={[
                    styles.aiScanFrame,
                    isAiScanning && styles.aiScanFrameScanning,
                    isLiveScanning && styles.aiScanFrameLive,
                  ]}
                >
                  {isAiScanning && (
                    <View style={styles.scanningBadge}>
                      <ActivityIndicator size="large" color={colors.yellow} />
                      <Text style={styles.scanningBadgeText}>AI ANALYZING...</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cameraTip}>
                  {isAiScanning
                    ? 'Comparing faces with Gemini AI...'
                    : isLiveScanning
                    ? 'Auto-scanning every 8s (Tap SCAN FACE anytime)'
                    : 'Point at students & tap SCAN FACE'}
                </Text>
              </View>
            </CameraView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>CAMERA PERMISSION REQUIRED</Text>
              <BrutalButton title="GRANT ACCESS" onPress={requestPermission} variant="primary" />
            </View>
          )}

          {/* Camera Controls Footer */}
          <View style={styles.cameraFooterBar}>
            {/* Live Scan Toggle */}
            <TouchableOpacity
              onPress={handleToggleLiveScan}
              style={[
                styles.cameraBarBtn,
                isLiveScanning && { backgroundColor: '#DC2626', borderColor: '#DC2626' },
              ]}
            >
              <Ionicons
                name={isLiveScanning ? 'pause' : 'play'}
                size={20}
                color={colors.white}
              />
              <Text style={styles.cameraBarBtnText}>
                {isLiveScanning ? 'STOP' : 'LIVE'}
              </Text>
            </TouchableOpacity>

            {/* Instant Scan */}
            <TouchableOpacity
              onPress={performAiScan}
              disabled={isAiScanning}
              style={[styles.cameraScanMainBtn, isAiScanning && { opacity: 0.6 }]}
            >
              <Ionicons name="sparkles" size={26} color={colors.black} />
              <Text style={styles.cameraScanMainBtnText}>
                {isAiScanning ? 'SCANNING...' : 'SCAN FACE'}
              </Text>
            </TouchableOpacity>

            {/* Done Button */}
            <TouchableOpacity
              onPress={handleCloseFaceCamera}
              style={[styles.cameraBarBtn, { backgroundColor: colors.success, borderColor: colors.success }]}
            >
              <Ionicons name="checkmark-done" size={20} color={colors.white} />
              <Text style={styles.cameraBarBtnText}>
                DONE ({sessionRecognizedIds.size})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Student Picker Modal (after Upload) */}
      <Modal visible={showStudentPicker} animationType="slide">
        <View style={styles.scannerContainer}>
          <View style={[styles.scannerHeader, { backgroundColor: colors.black }]}>
            <Text style={[styles.scannerTitle, { color: colors.white }]}>
              🖼️ AI PHOTO ATTENDANCE
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowStudentPicker(false);
                setCapturedPhoto(null);
                setUploadAiStatus('');
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>

          {/* Show photo preview */}
          {capturedPhoto && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
            </View>
          )}

          {/* AI Status Banner */}
          <View style={[
            styles.aiStatusBanner,
            isAiUploading ? { backgroundColor: colors.warningBg } : { backgroundColor: colors.successBg },
          ]}>
            {isAiUploading ? (
              <ActivityIndicator size="small" color={colors.orange} />
            ) : (
              <Ionicons name="sparkles" size={20} color={colors.success} />
            )}
            <Text style={[
              styles.aiStatusBannerText,
              isAiUploading ? { color: '#92400E' } : { color: colors.success },
            ]}>
              {uploadAiStatus || 'AI analyzed image and pre-selected matching students below.'}
            </Text>
          </View>

          {/* Bulk Select / Deselect */}
          <View style={styles.pickerToolbar}>
            <TouchableOpacity style={styles.selectAllBtn} onPress={selectAllStudents}>
              <Ionicons name="checkmark-done" size={16} color={colors.orange} />
              <Text style={styles.selectAllText}>SELECT ALL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectAllBtn} onPress={deselectAllStudents}>
              <Ionicons name="close-circle-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.selectAllText, { color: colors.textMuted }]}>CLEAR</Text>
            </TouchableOpacity>
          </View>

          {/* Student list */}
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            renderItem={({ item: student }) => {
              const isSelected = pickerSelectedIds.has(student.id);
              return (
                <TouchableOpacity
                  onPress={() => toggleStudentPick(student.id)}
                  style={[
                    styles.pickerStudentCard,
                    isSelected && styles.pickerStudentCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.pickerCheckbox,
                      isSelected && styles.pickerCheckboxSelected,
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>
                  <View style={styles.pickerStudentAvatar}>
                    {student.avatar ? (
                      <Image source={{ uri: student.avatar }} style={{ width: 36, height: 36 }} />
                    ) : (
                      <Text style={{ fontWeight: '900', fontSize: 16, color: colors.black }}>
                        {student.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.pickerStudentName}>{student.name}</Text>
                    <Text style={styles.pickerStudentSub}>ID: {student.id}</Text>
                  </View>
                  {isSelected && <BrutalBadge text="PRESENT" variant="success" />}
                </TouchableOpacity>
              );
            }}
          />

          {/* Confirm */}
          <View style={styles.scannerFooter}>
            <Text style={styles.scannedCount}>
              SELECTED: {pickerSelectedIds.size} / {students.length} STUDENTS
            </Text>
            <BrutalButton
              title={`MARK ${pickerSelectedIds.size} PRESENT`}
              onPress={handleConfirmPicker}
              variant="primary"
              size="lg"
              fullWidth
              showArrow
              disabled={pickerSelectedIds.size === 0}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: colors.white },
  loadingText: { ...typography.label, color: colors.textMuted },
  sectionTitle: { ...typography.h2, fontSize: 16, color: colors.black, marginBottom: 4 },
  dateText: { ...typography.caption, fontSize: 11, color: colors.textMuted, marginBottom: 14 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: {
    flex: 1,
    ...borders.thick,
    ...shadows.brutalSmall,
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: { ...typography.caption, fontSize: 10, color: colors.black },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  summaryCard: { flex: 1, alignItems: 'center', padding: 12 },
  summaryValue: { fontSize: 26, fontWeight: '900' },
  summaryLabel: { ...typography.caption, fontSize: 9, color: colors.textSecondary, marginTop: 2 },
  studentCard: { marginBottom: 8, padding: 12 },
  studentRow: { flexDirection: 'row', alignItems: 'center' },
  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 4,
    borderWidth: 3,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 42, height: 42 },
  avatarInitial: { fontSize: 18, fontWeight: '900', color: colors.black },
  studentName: { ...typography.bodyBold, fontSize: 14, color: colors.black },
  studentId: { ...typography.small, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
  statusButtons: { flexDirection: 'row', gap: 6 },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    ...borders.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  statusBtnText: { fontWeight: '900', fontSize: 14, color: colors.textMuted },
  // Scanner
  scannerContainer: { flex: 1, backgroundColor: colors.white },
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
    width: 40,
    height: 40,
    ...borders.medium,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  camera: { flex: 1 },
  scanOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: colors.yellow,
    borderRadius: 8,
  },
  scanText: { ...typography.label, color: colors.white, marginTop: 20 },
  scannerFooter: {
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: colors.black,
    gap: 12,
  },
  scannedCount: { ...typography.label, color: colors.black, textAlign: 'center' },
  // Photo preview
  photoPreview: {
    height: 150,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  // Student picker
  pickerInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.warningBg,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
  },
  pickerInstructionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
  },
  selectAllText: {
    ...typography.label,
    fontSize: 12,
    color: colors.orange,
  },
  pickerStudentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  pickerStudentCardSelected: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  pickerCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pickerCheckboxSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  pickerStudentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: colors.surface,
    ...borders.thin,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerStudentName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.black,
  },
  pickerStudentSub: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  // Camera Modal Styles
  cameraContainer: { flex: 1, backgroundColor: colors.black },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: colors.black,
  },
  cameraHeaderCenter: { alignItems: 'center' },
  cameraHeaderTitle: { fontSize: 16, fontWeight: '900', color: colors.yellow, letterSpacing: 1 },
  cameraHeaderSub: { fontSize: 10, fontWeight: '800', color: colors.white, opacity: 0.8, marginTop: 2 },
  cameraHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    position: 'absolute',
    top: 20,
    backgroundColor: colors.yellow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    elevation: 4,
  },
  statusPillText: { fontSize: 12, fontWeight: '900', color: colors.black, textTransform: 'uppercase' },
  aiScanFrame: {
    width: 270,
    height: 310,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiScanFrameScanning: { borderColor: colors.yellow, borderWidth: 4, borderStyle: 'solid' },
  aiScanFrameLive: { borderColor: '#DC2626', borderWidth: 4, borderStyle: 'solid' },
  scanningBadge: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  scanningBadgeText: { fontSize: 12, fontWeight: '900', color: colors.yellow },
  cameraTip: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cameraFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.black,
  },
  cameraBarBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 78,
  },
  cameraBarBtnText: { fontSize: 11, fontWeight: '900', color: colors.white, marginTop: 4 },
  cameraScanMainBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yellow,
    borderRadius: 36,
    width: 74,
    height: 74,
    ...borders.medium,
  },
  cameraScanMainBtnText: { fontSize: 9, fontWeight: '900', color: colors.black, marginTop: 2 },
  aiStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 6,
    gap: 10,
  },
  aiStatusBannerText: { flex: 1, fontSize: 12, fontWeight: '700' },
  pickerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
});
