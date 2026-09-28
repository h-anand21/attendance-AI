import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, shadows, borders } from '../../src/theme';
import { BrutalCard } from '../../src/components/ui/BrutalCard';
import { BrutalButton } from '../../src/components/ui/BrutalButton';
import { DotPattern, GeometricSquare } from '../../src/components/ui/BrutalDecorations';
import { useAuth } from '../../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, userRole, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('LOG OUT', 'Are you sure you want to sign out?', [
      { text: 'CANCEL', style: 'cancel' },
      { text: 'LOG OUT', style: 'destructive', onPress: signOut },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline' as const, label: 'PERSONAL INFO', onPress: () => {} },
    { icon: 'shield-outline' as const, label: 'PRIVACY & SECURITY', onPress: () => {} },
    { icon: 'help-circle-outline' as const, label: 'HELP & SUPPORT', onPress: () => {} },
    { icon: 'information-circle-outline' as const, label: 'ABOUT ATTENDEASE', detail: 'v1.0.0', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MY PROFILE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GeometricSquare size={14} color={colors.orange} style={{ marginRight: 8 }} />
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={22} color={colors.black} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Manage your profile and account.</Text>

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
              <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>VERIFIED USER</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
                  ? 'Full access to all features' 
                  : 'Attendance & class management'}
              </Text>
            </View>
          </View>
        </BrutalCard>

        {/* Menu Items */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ACCOUNT</Text>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} onPress={item.onPress} activeOpacity={0.8}>
            <BrutalCard style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuIconBg}>
                  <Ionicons name={item.icon} size={20} color={colors.black} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.detail ? (
                  <Text style={styles.menuDetail}>{item.detail}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                )}
              </View>
            </BrutalCard>
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <BrutalButton
          title="LOG OUT"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          fullWidth
          icon="log-out-outline"
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.hero, fontSize: 30, color: colors.black },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '500', marginBottom: 20 },
  settingsButton: {
    width: 40,
    height: 40,
    ...borders.medium,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: { padding: 16, marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 4,
    ...borders.thick,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: 64, height: 64 },
  userName: { ...typography.h3, fontSize: 17, color: colors.black },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { fontSize: 10, fontWeight: '800', color: colors.success, letterSpacing: 0.5 },
  roleCard: { padding: 16, marginBottom: 8 },
  roleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roleLabel: { ...typography.h3, fontSize: 16, color: colors.black },
  roleDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.h2, fontSize: 14, color: colors.textMuted, marginBottom: 10 },
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
  menuDetail: { ...typography.small, color: colors.textMuted },
});
