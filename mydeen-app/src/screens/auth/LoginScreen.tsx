import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, googleLogin } from '@/store/authSlice';
import * as Google from 'expo-auth-session/providers/google';
import { ENV } from '@/config/env';
import { useThemeColors } from '@/theme/theme';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  // showToast controls a transient success banner at the bottom of the screen.  It
  // is separate from the full-screen modal above and more closely resembles
  // the Figma design that displays a small message with a check icon after
  // signing in successfully.
  const [showToast, setShowToast] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({ webClientId: ENV.googleWebClientId });

  // Pull colours from the current theme.  We derive our styles via
  // a helper below so that they update automatically when the theme
  // toggles between light and dark.
  const colors = useThemeColors();

  // Dynamically create the style sheet based on colours.  Using
  // useMemo ensures the styles object is only recreated when
  // `colors` changes (i.e. on theme switch) and not on every re‑render.
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) dispatch(googleLogin(idToken));
    }
  }, [response]);

  async function handleLogin() {
    // Basic validation
    if (!email.trim() || !password.trim()) return;
    const result = await dispatch(login({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      // Show the transient toast; hide it after a short delay. The modal is also
      // available as a fallback for a more prominent success indicator.
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowSuccess(true);
      // You might navigate to main app automatically once auth token is set by slice
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[{ fontSize: 18 }, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Sign In Account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, !!email && styles.inputFilled]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, !!password && styles.inputFilled]}
            secureTextEntry
          />
          <TouchableOpacity onPress={() => { /* TODO: navigate to forgot password */ }}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            style={[
              styles.primaryBtn,
              (!email || !password) && styles.primaryBtnDisabled,
              status === 'loading' && { opacity: 0.7 },
            ]}
            disabled={!email || !password || status === 'loading'}
          >
            {status === 'loading' ? <ActivityIndicator color={colors.text} /> : <Text style={styles.primaryText}>Sign in</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={[{ marginHorizontal: 8 }, { color: colors.muted }]}>Or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity onPress={() => promptAsync()} style={styles.socialBtn}>
            <Text style={styles.socialText}>Sign Up with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={styles.socialBtn}>
            <Text style={styles.socialText}>Sign Up with Facebook</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>
              Doesn’t Have an Account?
              <Text onPress={() => navigation.navigate('Register')} style={styles.link}> Register Now</Text>
            </Text>
          </View>
        </View>

        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8, color: colors.text }}>Sign In Success</Text>
              <Text style={{ textAlign: 'center', color: colors.muted, marginBottom: 16 }}>Successfully signed in</Text>
              <TouchableOpacity onPress={() => setShowSuccess(false)} style={[styles.primaryBtn, { backgroundColor: colors.primary }] }>
                <Text style={[styles.primaryText, { color: '#fff' }]}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Transient toast to indicate sign in success. Positioned at the bottom of the screen and
          automatically dismissed after a few seconds. */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, { backgroundColor: colors.card }] }>
            <Text style={[styles.toastIcon, { color: '#10b981' }]}>✓</Text>
            <Text style={[styles.toastText, { color: colors.text }]}>Successfully signed in</Text>
          </View>
        </View>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Factory to create a StyleSheet with dynamic colours. The returned
// object mimics the static styles previously defined but derives
// border, background and text colours from the current theme. Note
// that numerical values (padding, margin) remain constant.
const createStyles = (colors: { [key: string]: string }) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      padding: 24,
      backgroundColor: colors.background,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backBtn: {
      padding: 4,
      marginRight: 8,
    },
    header: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    form: {
      width: '100%',
    },
    label: {
      marginBottom: 4,
      marginTop: 12,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 8,
      fontSize: 16,
      backgroundColor: colors.background === '#0B1220' ? '#1F2937' : '#f9fafb',
      color: colors.text,
    },
    inputFilled: {
      borderColor: colors.primary,
      backgroundColor: colors.background === '#0B1220' ? '#0E3b47' : '#ecfdf5',
    },
    forgot: {
      color: colors.muted,
      textAlign: 'right',
      marginTop: -4,
      marginBottom: 16,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    primaryBtnDisabled: {
      backgroundColor: colors.primary + '40',
    },
    primaryText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    socialBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: colors.background === '#0B1220' ? '#1F2937' : '#fff',
    },
    socialText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    link: {
      color: colors.primary,
      fontWeight: '600',
    },
    modalWrap: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 24,
      width: '100%',
      maxWidth: 320,
      alignItems: 'center',
    },
    toastContainer: {
      position: 'absolute',
      bottom: 32,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    toast: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    toastText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    toastIcon: {
      color: '#10b981',
      fontSize: 16,
      fontWeight: '700',
      marginRight: 8,
    },
  });