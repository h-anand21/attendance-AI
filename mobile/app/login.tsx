import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, shadows, borders } from '../src/theme';
import { BrutalButton } from '../src/components/ui/BrutalButton';
import { BrutalCard } from '../src/components/ui/BrutalCard';
import { DotPattern, GeometricSquare } from '../src/components/ui/BrutalDecorations';
import { useAuth } from '../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

type Role = 'teacher' | 'admin';

export default function LoginScreen() {
  const { user, signInWithGoogle, loading, setUserRoleForSignIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleSignIn = async () => {
    if (!selectedRole) {
      Alert.alert('Role Required', 'Please select a role before signing in.');
      return;
    }
    await setUserRoleForSignIn(selectedRole);
    await signInWithGoogle();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Decorations */}
        <DotPattern size={50} style={styles.dotPattern} />
        <GeometricSquare size={16} color={colors.orange} style={styles.squareDecor} />

        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backButtonInner}>
            <Ionicons name="arrow-back" size={20} color={colors.black} />
          </View>
        </TouchableOpacity>

        {/* Help text */}
        <Text style={styles.helpText}>HELP</Text>

        {/* Title */}
        <Text style={styles.title}>WELCOME{'\n'}BACK!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Avatar icon */}
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={36} color={colors.black} />
        </View>

        {/* Role Selection */}
        <Text style={styles.sectionLabel}>SELECT YOUR ROLE</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'teacher' && styles.roleCardActive,
            ]}
            onPress={() => handleRoleSelect('teacher')}
            activeOpacity={0.8}
          >
            <View style={[
              styles.roleIconBg,
              selectedRole === 'teacher' && { backgroundColor: colors.yellow },
            ]}>
              <Ionicons name="person-outline" size={28} color={colors.black} />
            </View>
            <Text style={styles.roleText}>TEACHER</Text>
            {selectedRole === 'teacher' && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'admin' && styles.roleCardActive,
            ]}
            onPress={() => handleRoleSelect('admin')}
            activeOpacity={0.8}
          >
            <View style={[
              styles.roleIconBg,
              selectedRole === 'admin' && { backgroundColor: colors.yellow },
            ]}>
              <Ionicons name="school-outline" size={28} color={colors.black} />
            </View>
            <Text style={styles.roleText}>ADMIN</Text>
            {selectedRole === 'admin' && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Google Sign In button */}
        <BrutalButton
          title="SIGN IN WITH GOOGLE"
          onPress={handleSignIn}
          variant="primary"
          size="lg"
          showArrow
          fullWidth
          loading={loading}
          disabled={!selectedRole || loading}
          icon="logo-google"
          style={{ marginTop: 24 }}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          {['logo-google', 'logo-apple', 'logo-facebook'].map((icon, i) => (
            <TouchableOpacity
              key={icon}
              style={styles.socialButton}
              onPress={handleSignIn}
              activeOpacity={0.8}
            >
              <Ionicons name={icon as any} size={24} color={colors.black} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>NEW HERE? </Text>
          <Text style={[styles.footerText, { color: colors.orange, fontWeight: '900' }]}>
            CREATE ACCOUNT
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  dotPattern: {
    position: 'absolute',
    top: 10,
    right: 28,
  },
  squareDecor: {
    position: 'absolute',
    top: 70,
    right: 45,
  },
  backButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  backButtonInner: {
    width: 44,
    height: 44,
    ...borders.medium,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  helpText: {
    position: 'absolute',
    top: 20,
    right: 0,
    ...typography.label,
    color: colors.black,
  },
  title: {
    ...typography.hero,
    fontSize: 38,
    lineHeight: 42,
    color: colors.black,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    backgroundColor: colors.yellow,
    ...borders.thick,
    ...shadows.brutalSmall,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 80,
    right: 28,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.black,
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    ...borders.thick,
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.white,
    position: 'relative',
  },
  roleCardActive: {
    backgroundColor: colors.yellow + '20',
    borderColor: colors.yellow,
    ...shadows.brutalSmall,
  },
  roleIconBg: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: colors.surface,
    ...borders.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    ...typography.label,
    color: colors.black,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    ...borders.thick,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    ...typography.label,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
