import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, shadows, borders } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalButton } from '../../src/components/ui/BrutalButton';
import { DotPattern, GeometricSquare } from '../../src/components/ui/BrutalDecorations';
import { useAuth } from '../../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, userRole, signOut } = useAuth();

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [aiServerUrl, setAiServerUrl] = useState(
    process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'https://attendance-ai-1.onrender.com'
  );
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [aiStatusMessage, setAiStatusMessage] = useState('');

  // Info Modal States
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  // Load custom saved AI URL from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('CUSTOM_AI_SERVICE_URL')
      .then((saved) => {
        if (saved && saved.trim().length > 0) {
          setAiServerUrl(saved.trim());
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert('LOG OUT', 'Are you sure you want to sign out?', [
      { text: 'CANCEL', style: 'cancel' },
      {
        text: 'LOG OUT',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleTestAiConnection = async () => {
    try {
      setIsTestingAi(true);
      setAiStatus('idle');
      setAiStatusMessage('Connecting to AI Server...');

      const cleanUrl = aiServerUrl.trim().replace(/\/+$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${cleanUrl}/health`, {
        method: 'GET',
        headers: {
          'bypass-tunnel-reminder': 'true',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setAiStatus('connected');
        setAiStatusMessage(`Online! Engine: ${data.engine || 'UniFace ArcFace'}`);
      } else {
        setAiStatus('error');
        setAiStatusMessage(`Server responded with HTTP ${res.status}`);
      }
    } catch (e: any) {
      setAiStatus('error');
      setAiStatusMessage('Could not reach server. Verify URL or check internet connection.');
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleSaveAiSettings = async () => {
    try {
      const cleanUrl = aiServerUrl.trim().replace(/\/+$/, '');
      await AsyncStorage.setItem('CUSTOM_AI_SERVICE_URL', cleanUrl);
      setShowSettingsModal(false);
      Alert.alert('SAVED', `AI Biometric URL saved:\n${cleanUrl}`);
    } catch {
      setShowSettingsModal(false);
    }
  };

  const menuItems = [
    {
      icon: 'person-outline' as const,
      label: 'PERSONAL INFO',
      onPress: () => setActiveInfoModal('personal'),
    },
    {
      icon: 'hardware-chip-outline' as const,
      label: 'AI BIOMETRICS SETTINGS',
      detail: 'UniFace',
      onPress: () => setShowSettingsModal(true),
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'PRIVACY & SECURITY',
      onPress: () => setActiveInfoModal('privacy'),
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'HELP & SUPPORT',
      onPress: () => setActiveInfoModal('help'),
    },
    {
      icon: 'information-circle-outline' as const,
      label: 'ABOUT ATTENDEASE',
      detail: 'v1.2.0',
      onPress: () => setActiveInfoModal('about'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MY PROFILE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GeometricSquare size={14} color={colors.orange} style={{ marginRight: 8 }} />
            <TouchableOpacity
              onPress={() => setShowSettingsModal(true)}
              style={styles.settingsButton}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={22} color={colors.black} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Manage your account, settings & AI configuration.</Text>

        {/* User Card */}
        <BrutalCard style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={32} color={colors.black} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.userName}>{user?.displayName || user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>VERIFIED ACCOUNT</Text>
              </View>
            </View>
          </View>
        </BrutalCard>

        {/* Role Badge */}
        <BrutalCard variant="yellow" style={styles.roleCard}>
          <View style={styles.roleRow}>
            <View>
              <Text style={styles.roleLabel}>
                {userRole === 'admin' ? '👑 ADMINISTRATOR' : '📚 TEACHER'}
              </Text>
              <Text style={styles.roleDesc}>
                {userRole === 'admin'
                  ? 'Full administrative privileges: attendance, students, analytics & reports'
                  : 'Teacher privileges: class attendance & meal verification'}
              </Text>
            </View>
          </View>
        </BrutalCard>

        {/* Menu Items */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>SETTINGS & INFO</Text>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} onPress={item.onPress} activeOpacity={0.8}>
            <BrutalCard style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuIconBg}>
                  <Ionicons name={item.icon} size={20} color={colors.black} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.detail ? (
                  <View style={styles.detailBadge}>
                    <Text style={styles.menuDetail}>{item.detail}</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                )}
              </View>
            </BrutalCard>
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <BrutalButton
          title="LOG OUT OF ACCOUNT"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          fullWidth
          icon="log-out-outline"
          style={{ marginTop: 24 }}
        />
      </ScrollView>

      {/* --- Settings Modal --- */}
      <Modal visible={showSettingsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>AI & APP SETTINGS</Text>
                <Text style={styles.modalSubtitle}>Configure UniFace Biometric Engine</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.black} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>UNIFACE SERVER IP / URL</Text>
            <TextInput
              style={styles.textInput}
              value={aiServerUrl}
              onChangeText={setAiServerUrl}
              placeholder="http://192.168.x.x:8000"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helperText}>
              Ensure laptop & mobile are connected to the same Wi-Fi network.
            </Text>

            {/* Test Connection Button */}
            <TouchableOpacity
              onPress={handleTestAiConnection}
              disabled={isTestingAi}
              style={[styles.testBtn, isTestingAi && { opacity: 0.6 }]}
            >
              {isTestingAi ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="flash-outline" size={18} color={colors.white} />
              )}
              <Text style={styles.testBtnText}>
                {isTestingAi ? 'CONNECTING...' : 'TEST UNIFACE CONNECTION'}
              </Text>
            </TouchableOpacity>

            {/* Status Feedback */}
            {aiStatus !== 'idle' && (
              <View
                style={[
                  styles.statusBox,
                  aiStatus === 'connected' ? styles.statusSuccess : styles.statusError,
                ]}
              >
                <Ionicons
                  name={aiStatus === 'connected' ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={aiStatus === 'connected' ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: aiStatus === 'connected' ? colors.success : colors.error },
                  ]}
                >
                  {aiStatusMessage}
                </Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>QUICK SELECT PRESET:</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => setAiServerUrl('https://attendance-ai-1.onrender.com')}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  backgroundColor: colors.yellow,
                  ...borders.medium,
                  alignItems: 'center',
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '900', color: colors.black }}>☁️ RENDER 24/7</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAiServerUrl('http://10.63.17.162:8000')}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  backgroundColor: colors.surface,
                  ...borders.medium,
                  alignItems: 'center',
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '900', color: colors.black }}>💻 LOCAL WI-FI</Text>
              </TouchableOpacity>
            </View>

            <BrutalButton
              title="SAVE SETTINGS"
              onPress={handleSaveAiSettings}
              variant="primary"
              size="md"
              fullWidth
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* --- Personal Info Modal --- */}
      <Modal visible={activeInfoModal === 'personal'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PERSONAL INFO</Text>
              <TouchableOpacity onPress={() => setActiveInfoModal(null)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NAME</Text>
              <Text style={styles.infoValue}>{user?.displayName || 'Himanshu Anand'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>EMAIL</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ROLE</Text>
              <Text style={styles.infoValue}>{userRole?.toUpperCase() || 'ADMIN'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>USER ID</Text>
              <Text style={[styles.infoValue, { fontSize: 11 }]}>{user?.uid || 'N/A'}</Text>
            </View>
            <BrutalButton
              title="CLOSE"
              onPress={() => setActiveInfoModal(null)}
              variant="secondary"
              size="md"
              fullWidth
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* --- Privacy & Security Modal --- */}
      <Modal visible={activeInfoModal === 'privacy'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SECURITY & PRIVACY</Text>
              <TouchableOpacity onPress={() => setActiveInfoModal(null)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBodyText}>
              • <Text style={{ fontWeight: '800' }}>Local Biometrics:</Text> Face recognition is powered by UniFace (RetinaFace & ArcFace) on your local network. No raw photos are sent to third parties.
            </Text>
            <Text style={styles.modalBodyText}>
              • <Text style={{ fontWeight: '800' }}>Cloud Fallback:</Text> When local AI is offline, secure Google Gemini 3.8 Flash handles recognition with zero data retention.
            </Text>
            <Text style={styles.modalBodyText}>
              • <Text style={{ fontWeight: '800' }}>Data Encryption:</Text> Firebase Firestore encrypts all student records, roll numbers, and attendance logs.
            </Text>
            <BrutalButton
              title="GOT IT"
              onPress={() => setActiveInfoModal(null)}
              variant="primary"
              size="md"
              fullWidth
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* --- Help Modal --- */}
      <Modal visible={activeInfoModal === 'help'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>HELP & GUIDE</Text>
              <TouchableOpacity onPress={() => setActiveInfoModal(null)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBodyText}>
              📸 <Text style={{ fontWeight: '800' }}>Live Face Scan:</Text> Open a class, tap "AI FACE SCAN", frame students in view and tap "SCAN FACE" or enable "LIVE".
            </Text>
            <Text style={styles.modalBodyText}>
              🍽️ <Text style={{ fontWeight: '800' }}>Meal Verification:</Text> View today's present students and 1-tap verify their breakfast, lunch, or dinner.
            </Text>
            <Text style={styles.modalBodyText}>
              📊 <Text style={{ fontWeight: '800' }}>Reports Export:</Text> Filter by class, view 7-day visual attendance charts, and tap "EXPORT CSV" to share reports via WhatsApp or Email.
            </Text>
            <BrutalButton
              title="CLOSE"
              onPress={() => setActiveInfoModal(null)}
              variant="secondary"
              size="md"
              fullWidth
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* --- About Modal --- */}
      <Modal visible={activeInfoModal === 'about'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ABOUT ATTENDEASE</Text>
              <TouchableOpacity onPress={() => setActiveInfoModal(null)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
            <Text style={{ ...typography.hero, fontSize: 24, color: colors.orange }}>
              AttendEase AI
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
              Production Version 1.2.0 (Build 2026.09)
            </Text>
            <Text style={styles.modalBodyText}>
              A Unified Smart Attendance & Meal Management Platform featuring real-time biometric face recognition, meal verification, and instant classroom insights.
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
              Developed by Himanshu Anand.
            </Text>
            <BrutalButton
              title="CLOSE"
              onPress={() => setActiveInfoModal(null)}
              variant="primary"
              size="md"
              fullWidth
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.hero, fontSize: 30, color: colors.black },
  subtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginBottom: 20 },
  settingsButton: {
    width: 42,
    height: 42,
    ...borders.medium,
    borderRadius: 4,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: { padding: 16, marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 4,
    ...borders.thick,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: 60, height: 60 },
  userName: { ...typography.h3, fontSize: 17, color: colors.black },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { fontSize: 10, fontWeight: '800', color: colors.success, letterSpacing: 0.5 },
  roleCard: { padding: 16, marginBottom: 12 },
  roleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roleLabel: { ...typography.h3, fontSize: 15, color: colors.black },
  roleDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  sectionTitle: { ...typography.h2, fontSize: 13, color: colors.textMuted, marginBottom: 10, letterSpacing: 0.5 },
  menuCard: { marginBottom: 8, padding: 14 },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: colors.surface,
    ...borders.thin,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { ...typography.bodyBold, fontSize: 13, color: colors.black, flex: 1 },
  detailBadge: { backgroundColor: colors.yellow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 3, ...borders.thin },
  menuDetail: { fontSize: 11, fontWeight: '800', color: colors.black },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    ...borders.thick,
    ...shadows.brutal,
    padding: 20,
    borderRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
    paddingBottom: 10,
  },
  modalTitle: { ...typography.h2, fontSize: 17, color: colors.black },
  modalSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  fieldLabel: { ...typography.caption, fontSize: 11, color: colors.black, marginBottom: 6, fontWeight: '800' },
  textInput: {
    backgroundColor: colors.surface,
    ...borders.medium,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
    fontWeight: '600',
  },
  helperText: { fontSize: 11, color: colors.textMuted, marginTop: 6, marginBottom: 14 },
  testBtn: {
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
    gap: 8,
  },
  testBtnText: { color: colors.white, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    ...borders.thin,
  },
  statusSuccess: { backgroundColor: colors.successBg, borderColor: colors.success },
  statusError: { backgroundColor: colors.errorBg, borderColor: colors.error },
  statusText: { fontSize: 12, fontWeight: '700', flex: 1 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: 12, fontWeight: '800', color: colors.textMuted },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.black },
  modalBodyText: { fontSize: 13, color: colors.text, lineHeight: 20, marginBottom: 10 },
});
