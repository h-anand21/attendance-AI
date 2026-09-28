import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { colors, typography, borders } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalButton } from '../../src/components/ui/BrutalButton';
import { BrutalInput } from '../../src/components/ui/BrutalInput';
import { useTeachers } from '../../src/hooks/useTeachers';
import { Ionicons } from '@expo/vector-icons';

export default function TeacherRegistrationScreen() {
  const { teachers, addTeacher, loading } = useTeachers();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !contact.trim()) {
      Alert.alert('REQUIRED', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    await addTeacher({
      name: name.trim(),
      email: email.trim(),
      contact: contact.trim(),
      avatar: '',
      classIds: [],
    });
    Alert.alert('✅ REGISTERED', `${name} has been added as a teacher.`);
    setName('');
    setEmail('');
    setContact('');
    setIsSubmitting(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Registration Form */}
      <BrutalCard style={styles.formCard}>
        <Text style={styles.formTitle}>REGISTER TEACHER</Text>
        <Text style={styles.formSubtitle}>Add a new teacher to the system.</Text>

        <BrutalInput
          label="FULL NAME"
          placeholder="e.g. Dr. Anand Kumar"
          value={name}
          onChangeText={setName}
          icon="person-outline"
        />
        <BrutalInput
          label="EMAIL ADDRESS"
          placeholder="e.g. teacher@school.com"
          value={email}
          onChangeText={setEmail}
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <BrutalInput
          label="CONTACT NUMBER"
          placeholder="e.g. +91 98765 43210"
          value={contact}
          onChangeText={setContact}
          icon="call-outline"
          keyboardType="phone-pad"
        />

        <BrutalButton
          title="REGISTER TEACHER"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          fullWidth
          showArrow
          loading={isSubmitting}
          disabled={isSubmitting}
          icon="person-add"
          style={{ marginTop: 8 }}
        />
      </BrutalCard>

      {/* Teachers List */}
      <Text style={styles.sectionTitle}>REGISTERED TEACHERS ({teachers.length})</Text>
      {teachers.map((teacher) => (
        <BrutalCard key={teacher.id} style={styles.teacherCard}>
          <View style={styles.teacherRow}>
            <View style={styles.teacherAvatar}>
              <Ionicons name="person" size={22} color={colors.black} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.teacherName}>{teacher.name}</Text>
              <Text style={styles.teacherEmail}>{teacher.email}</Text>
              <Text style={styles.teacherContact}>{teacher.contact}</Text>
            </View>
          </View>
        </BrutalCard>
      ))}

      {teachers.length === 0 && !loading && (
        <Text style={styles.emptyText}>No teachers registered yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formCard: { padding: 20, marginBottom: 24 },
  formTitle: { ...typography.h1, fontSize: 22, color: colors.black, marginBottom: 4 },
  formSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  sectionTitle: { ...typography.h2, fontSize: 16, color: colors.black, marginBottom: 12 },
  teacherCard: { marginBottom: 8, padding: 14 },
  teacherRow: { flexDirection: 'row', alignItems: 'center' },
  teacherAvatar: {
    width: 46,
    height: 46,
    borderRadius: 4,
    ...borders.thick,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherName: { ...typography.bodyBold, fontSize: 15, color: colors.black },
  teacherEmail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  teacherContact: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 20 },
});
