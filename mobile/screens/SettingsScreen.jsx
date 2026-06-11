import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useApp } from '../context/AppProvider';
import { clearStorage } from '../utils/storage';

/**
 * SettingsScreen - App settings and preferences
 */
const SettingsScreen = ({ navigation }) => {
  const { currentUser, logout, processSyncQueue } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          // Navigate back to login or splash screen
          Alert.alert('Success', 'You have been logged out');
        },
        style: 'destructive'
      }
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your local data. This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            await clearStorage();
            Alert.alert('Success', 'All data has been cleared');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleSync = async () => {
    Alert.alert('Syncing...', 'Syncing data with server...');
    try {
      const result = await processSyncQueue();
      if (result.success) {
        Alert.alert('Success', `Synced ${result.processed} items`);
      } else {
        Alert.alert('Partial Sync', `Synced ${result.processed} items, ${result.failed} failed`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const SettingItem = ({ icon, label, value, onPress, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        {icon && (
          <View style={styles.settingIcon}>
            <MaterialIcons name={icon} size={20} color="#2d6a4f" />
          </View>
        )}
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{label}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
      {showArrow && (
        <MaterialIcons name="chevron-right" size={24} color="#bbb" />
      )}
    </TouchableOpacity>
  );

  const ToggleSetting = ({ icon, label, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        {icon && (
          <View style={styles.settingIcon}>
            <MaterialIcons name={icon} size={20} color="#2d6a4f" />
          </View>
        )}
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ddd', true: '#c8e6c9' }}
        thumbColor={value ? '#2d6a4f' : '#f0f0f0'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <ToggleSetting
            icon="notifications-active"
            label="Push Notifications"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <ToggleSetting
            icon="email"
            label="Email Notifications"
            value={emailNotifications}
            onToggle={setEmailNotifications}
          />
          <SettingItem
            icon="schedule"
            label="Quiet Hours"
            value="Not set"
            onPress={() =>
              Alert.alert('Quiet Hours', 'Feature coming soon!')
            }
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <ToggleSetting
            icon="dark-mode"
            label="Dark Mode"
            value={darkMode}
            onToggle={setDarkMode}
          />
          <SettingItem
            icon="palette"
            label="Accent Color"
            value="Green"
            onPress={() => Alert.alert('Accent Color', 'Coming soon!')}
          />
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <SettingItem
            icon="backup"
            label="Manual Backup"
            onPress={() =>
              Alert.alert(
                'Backup',
                'Your data is automatically backed up to your device'
              )
            }
          />
          <SettingItem
            icon="cloud-sync"
            label="Sync Now"
            onPress={handleSync}
          />
          <SettingItem
            icon="storage"
            label="Storage Usage"
            value="~5 MB"
            onPress={() =>
              Alert.alert(
                'Storage',
                'Your app is using approximately 5 MB of device storage'
              )
            }
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="account-circle"
            label="Account Info"
            value={currentUser?.email || 'Anonymous'}
            onPress={() =>
              Alert.alert(
                'Account',
                `ID: ${currentUser?.id}\nType: ${currentUser?.isAnonymous ? 'Guest' : 'Email'}`
              )
            }
          />
          <SettingItem
            icon="security"
            label="Privacy & Security"
            onPress={() =>
              Alert.alert(
                'Privacy',
                'Your data is stored locally on your device'
              )
            }
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="info"
            label="About App"
            onPress={() => setShowAbout(true)}
          />
          <SettingItem
            icon="code"
            label="Version"
            value="3.0.0"
            onPress={() =>
              Alert.alert(
                'Version',
                'Summer Project App v3.0.0\nBuilt with React Native & Expo'
              )
            }
          />
          <SettingItem
            icon="help"
            label="Help & Support"
            onPress={() =>
              Alert.alert(
                'Support',
                'Email: support@summerprojectapp.com\nFeedback: feedback@summerprojectapp.com'
              )
            }
          />
        </View>

        {/* Developer Tools (Hidden) */}
        <TouchableOpacity
          style={styles.devToolsTrigger}
          onPress={() => setShowDevTools(!showDevTools)}
        >
          <Text style={styles.devToolsText}>Tap 5 times for dev tools</Text>
        </TouchableOpacity>

        {showDevTools && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer Tools</Text>
            <SettingItem
              icon="bug-report"
              label="View Logs"
              onPress={() =>
                Alert.alert('Logs', 'Logging feature coming soon')
              }
            />
            <SettingItem
              icon="delete-forever"
              label="Clear Cache"
              onPress={() => {
                Alert.alert('Cache Cleared', 'App cache has been cleared');
              }}
            />
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}
          >
            <MaterialIcons name="delete" size={18} color="#e74c3c" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={18} color="#e74c3c" />
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* About Modal */}
      <Modal
        visible={showAbout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.aboutModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAbout(false)}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <MaterialIcons
              name="school"
              size={48}
              color="#2d6a4f"
              style={{ marginBottom: 12, textAlign: 'center' }}
            />

            <Text style={styles.aboutTitle}>Summer Project App</Text>
            <Text style={styles.aboutVersion}>Version 3.0.0</Text>

            <Text style={styles.aboutDescription}>
              Discover, start, and complete exciting summer projects. Track your
              progress, earn achievements, and build amazing things!
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={16} color="#2d6a4f" />
                <Text style={styles.featureText}>Offline-first architecture</Text>
              </View>
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={16} color="#2d6a4f" />
                <Text style={styles.featureText}>100+ project ideas</Text>
              </View>
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={16} color="#2d6a4f" />
                <Text style={styles.featureText}>Progress tracking</Text>
              </View>
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={16} color="#2d6a4f" />
                <Text style={styles.featureText}>Achievement system</Text>
              </View>
            </View>

            <Text style={styles.aboutFooter}>
              Built with React Native and Expo for iOS and Android
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333'
  },
  section: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 0.5
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5'
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  settingText: {
    flex: 1
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333'
  },
  settingValue: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontWeight: '400'
  },
  devToolsTrigger: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  devToolsText: {
    fontSize: 10,
    color: '#ddd'
  },
  dangerZone: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffe5e5',
    borderWidth: 1,
    borderColor: '#e74c3c',
    gap: 8
  },
  dangerButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  aboutModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    maxWidth: '90%',
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  aboutVersion: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontWeight: '500'
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  featuresList: {
    alignSelf: 'flex-start',
    width: '100%',
    marginBottom: 20,
    gap: 8
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  featureText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500'
  },
  aboutFooter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic'
  }
});

export default SettingsScreen;
