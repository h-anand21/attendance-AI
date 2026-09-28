import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { colors, typography, borders, shadows } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalButton } from '../../src/components/ui/BrutalButton';
import { BrutalInput } from '../../src/components/ui/BrutalInput';
import { BrutalBadge, GeometricSquare } from '../../src/components/ui/BrutalDecorations';
import { useStudents } from '../../src/hooks/useStudents';
import { useClasses } from '../../src/hooks/useClasses';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function StudentRegistrationScreen() {
  const { studentsByClass, addStudent, loading: studentsLoading } = useStudents();
  const { classes, addClass, loading: classesLoading } = useClasses();

  const [studentName, setStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loading = studentsLoading || classesLoading;

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes]);

  const handleCapture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({ base64: true, quality: 0.5 });
        setCapturedImage(`data:image/jpeg;base64,${photo.base64}`);
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('ERROR', 'Failed to capture photo.');
      }
    }
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('CAMERA REQUIRED', 'Please allow camera access.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      Alert.alert('REQUIRED', 'Please enter student name.');
      return;
    }
    if (!capturedImage) {
      Alert.alert('REQUIRED', 'Please capture a photo.');
      return;
    }
    if (!selectedClassId) {
      Alert.alert('REQUIRED', 'Please select a class.');
      return;
    }

    setIsSubmitting(true);
    const newStudentId = await addStudent(
      { name: studentName.trim(), avatar: capturedImage },
      selectedClassId
    );

    if (newStudentId) {
      Alert.alert('✅ REGISTERED', `${studentName} has been added successfully.`);
      setStudentName('');
      setCapturedImage(null);
    } else {
      Alert.alert('❌ FAILED', 'Could not register the student.');
    }
    setIsSubmitting(false);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const currentStudents = studentsByClass[selectedClassId] || [];
  
  const filteredStudents = searchQuery 
    ? currentStudents.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentStudents;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Registration Form */}
      <BrutalCard style={styles.formCard}>
        <Text style={styles.formTitle}>REGISTER NEW STUDENT</Text>
        <Text style={styles.formSubtitle}>Fill in details and capture a photo.</Text>

        {/* Camera Preview */}
        <TouchableOpacity onPress={handleOpenCamera} style={styles.cameraPreview}>
          {capturedImage ? (
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera" size={40} color={colors.textMuted} />
              <Text style={styles.cameraPlaceholderText}>TAP TO CAPTURE</Text>
            </View>
          )}
          <View style={styles.cameraOverlayBadge}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </TouchableOpacity>

        {capturedImage && (
          <BrutalButton
            title="RETAKE PHOTO"
            onPress={handleOpenCamera}
            variant="outline"
            size="sm"
            icon="camera-reverse"
            style={{ marginBottom: 12 }}
          />
        )}

        {/* Student Name */}
        <BrutalInput
          label="FULL NAME"
          placeholder="e.g. Rahul Sharma"
          value={studentName}
          onChangeText={setStudentName}
          icon="person-outline"
        />

        {/* Class Picker */}
        <Text style={styles.inputLabel}>CLASS</Text>
        <TouchableOpacity onPress={() => setShowClassPicker(true)} style={styles.pickerButton}>
          <Ionicons name="book-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.pickerText}>
            {selectedClass ? `${selectedClass.name} - Sec. ${selectedClass.section}` : 'Select a class'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Submit */}
        <BrutalButton
          title="REGISTER STUDENT"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          fullWidth
          showArrow
          loading={isSubmitting}
          disabled={isSubmitting || !capturedImage || !studentName.trim()}
          icon="person-add"
          style={{ marginTop: 16 }}
        />
      </BrutalCard>

      {/* Student List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          REGISTERED STUDENTS ({currentStudents.length})
        </Text>
        <BrutalInput
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          containerStyle={{ marginBottom: 8 }}
        />

        {filteredStudents.map((student) => (
          <BrutalCard key={student.id} style={styles.studentCard}>
            <View style={styles.studentRow}>
              <View style={styles.studentAvatar}>
                {student.avatar ? (
                  <Image source={{ uri: student.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitial}>{student.name.charAt(0)}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentId}>{student.id}</Text>
              </View>
              <Ionicons name="qr-code-outline" size={20} color={colors.textMuted} />
            </View>
          </BrutalCard>
        ))}

        {filteredStudents.length === 0 && (
          <Text style={styles.emptyText}>
            {searchQuery ? `No results for "${searchQuery}"` : 'No students registered yet.'}
          </Text>
        )}
      </View>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <Text style={styles.cameraTitle}>CAPTURE PHOTO</Text>
            <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          {permission?.granted && (
            <CameraView
              ref={setCameraRef}
              style={styles.fullCamera}
              facing="front"
            >
              <View style={styles.cameraControls}>
                <TouchableOpacity onPress={handleCapture} style={styles.captureBtn}>
                  <View style={styles.captureBtnInner} />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>

      {/* Class Picker Modal */}
      <Modal visible={showClassPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BrutalCard style={styles.pickerModal}>
            <Text style={styles.modalTitle}>SELECT CLASS</Text>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => {
                  setSelectedClassId(cls.id);
                  setShowClassPicker(false);
                }}
                style={[
                  styles.classOption,
                  selectedClassId === cls.id && styles.classOptionActive,
                ]}
              >
                <Text style={styles.classOptionText}>{cls.name} - Sec. {cls.section}</Text>
                {selectedClassId === cls.id && (
                  <Ionicons name="checkmark" size={20} color={colors.orange} />
                )}
              </TouchableOpacity>
            ))}
            <BrutalButton
              title="CLOSE"
              onPress={() => setShowClassPicker(false)}
              variant="outline"
              size="sm"
              style={{ marginTop: 12 }}
            />
          </BrutalCard>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formCard: { padding: 20, marginBottom: 24 },
  formTitle: { ...typography.h1, fontSize: 22, color: colors.black, marginBottom: 4 },
  formSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  cameraPreview: {
    width: '100%',
    height: 200,
    ...borders.thick,
    borderRadius: 4,
    backgroundColor: colors.surface,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  capturedImage: { width: '100%', height: '100%' },
  cameraPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraPlaceholderText: { ...typography.caption, color: colors.textMuted, marginTop: 8 },
  cameraOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: { ...typography.label, color: colors.black, marginBottom: 6 },
  pickerButton: {
    ...borders.thick,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: colors.white,
    gap: 10,
    marginBottom: 12,
  },
  pickerText: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.black },
  listSection: { marginTop: 8 },
  sectionTitle: { ...typography.h2, fontSize: 16, color: colors.black, marginBottom: 12 },
  studentCard: { marginBottom: 8, padding: 12 },
  studentRow: { flexDirection: 'row', alignItems: 'center' },
  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 4,
    ...borders.medium,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 42, height: 42 },
  avatarInitial: { fontSize: 18, fontWeight: '900', color: colors.black },
  studentName: { ...typography.bodyBold, fontSize: 14, color: colors.black },
  studentId: { ...typography.small, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 20 },
  // Camera
  cameraContainer: { flex: 1, backgroundColor: colors.black },
  cameraHeader: {
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
  cameraTitle: { ...typography.h1, fontSize: 22, color: colors.black },
  closeBtn: {
    width: 40,
    height: 40,
    ...borders.medium,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  fullCamera: { flex: 1 },
  cameraControls: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  pickerModal: { padding: 24 },
  modalTitle: { ...typography.h2, color: colors.black, marginBottom: 16 },
  classOption: {
    ...borders.medium,
    borderRadius: 4,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  classOptionActive: { backgroundColor: colors.yellow + '20', borderColor: colors.orange },
  classOptionText: { ...typography.bodyBold, color: colors.black },
});
