import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { accountService, ApiAccountDTO } from '@/services/accountService';
import { OswaldFonts } from '@/constants/theme';

interface AccountFormProps {
  role: 'customer' | 'courier';
  userId: number;
}

const LABELS = {
  customer: {
    loggedInAs: 'Logged In As: Customer',
    emailLabel: 'Customer Email:',
    emailHelper: 'Email used for your Customer account.',
    phoneLabel: 'Customer Phone:',
    phoneHelper: 'Phone number for your Customer account.',
  },
  courier: {
    loggedInAs: 'Logged In As: Courier',
    emailLabel: 'Courier Email:',
    emailHelper: 'Email used for your Courier account.',
    phoneLabel: 'Courier Phone:',
    phoneHelper: 'Phone number for your Courier account.',
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountForm({ role, userId }: AccountFormProps) {
  const insets = useSafeAreaInsets();
  const labels = LABELS[role];

  const [primaryEmail, setPrimaryEmail] = useState('');
  const [roleEmail, setRoleEmail] = useState('');
  const [rolePhone, setRolePhone] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const populateFields = (account: ApiAccountDTO) => {
    setPrimaryEmail(account.email);
    const roleData = role === 'customer' ? account.customer : account.courier;
    if (roleData) {
      setRoleEmail(roleData.email);
      setRolePhone(roleData.phone);
    }
  };

  const fetchAccount = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const response = await accountService.getAccount(userId);
      const account = response.data?.data ?? (response.data as unknown as ApiAccountDTO);
      populateFields(account);
    } catch {
      setFetchError('Failed to load account details. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleUpdate = async () => {
    setValidationError(null);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!EMAIL_REGEX.test(roleEmail.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!rolePhone.trim()) {
      setValidationError('Phone number cannot be empty.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await accountService.updateAccount(userId, role, {
        email: roleEmail.trim(),
        phone: rolePhone.trim(),
      });
      const account = response.data?.data ?? (response.data as unknown as ApiAccountDTO);
      populateFields(account);
      setSubmitSuccess('Account updated successfully.');
    } catch {
      setSubmitError('Failed to update account. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DA583B" />
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{fetchError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchAccount}>
          <Text style={styles.retryBtnText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heading */}
        <Text style={styles.heading}>MY ACCOUNT</Text>
        <Text style={styles.subheading}>{labels.loggedInAs}</Text>

        {/* Primary Email (read-only) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Primary Email (Read Only)</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={primaryEmail}
            editable={false}
            selectTextOnFocus={false}
          />
          <Text style={styles.helperText}>Email used to login to the application.</Text>
        </View>

        {/* Role Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{labels.emailLabel}</Text>
          <TextInput
            style={styles.input}
            value={roleEmail}
            onChangeText={(text) => {
              setRoleEmail(text);
              setValidationError(null);
              setSubmitError(null);
              setSubmitSuccess(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitLoading}
          />
          <Text style={styles.helperText}>{labels.emailHelper}</Text>
        </View>

        {/* Role Phone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{labels.phoneLabel}</Text>
          <TextInput
            style={styles.input}
            value={rolePhone}
            onChangeText={(text) => {
              setRolePhone(text);
              setValidationError(null);
              setSubmitError(null);
              setSubmitSuccess(null);
            }}
            keyboardType="phone-pad"
            editable={!submitLoading}
          />
          <Text style={styles.helperText}>{labels.phoneHelper}</Text>
        </View>

        {/* Validation / submit feedback */}
        {validationError ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackError}>{validationError}</Text>
          </View>
        ) : null}
        {submitError ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackError}>{submitError}</Text>
          </View>
        ) : null}
        {submitSuccess ? (
          <View style={[styles.feedbackBox, styles.feedbackSuccessBox]}>
            <Text style={styles.feedbackSuccess}>{submitSuccess}</Text>
          </View>
        ) : null}

        {/* Update button */}
        <TouchableOpacity
          style={[styles.updateBtn, submitLoading && styles.updateBtnDisabled]}
          onPress={handleUpdate}
          disabled={submitLoading}
          activeOpacity={0.8}
        >
          {submitLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.updateBtnText}>UPDATE ACCOUNT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heading: {
    fontSize: 26,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#222126',
    backgroundColor: '#FAFAFA',
  },
  inputReadOnly: {
    backgroundColor: '#F0F0F0',
    color: '#999999',
  },
  helperText: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  feedbackBox: {
    backgroundColor: '#FEE8E8',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  feedbackSuccessBox: {
    backgroundColor: '#E8F8EE',
  },
  feedbackError: {
    fontSize: 13,
    color: '#851919',
  },
  feedbackSuccess: {
    fontSize: 13,
    color: '#1A6633',
  },
  updateBtn: {
    backgroundColor: '#DA583B',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  updateBtnDisabled: {
    opacity: 0.7,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontFamily: OswaldFonts.bold,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 15,
    color: '#C1392B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#DA583B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontFamily: OswaldFonts.bold,
    fontSize: 14,
  },
});
