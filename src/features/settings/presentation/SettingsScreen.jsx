import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  Linking, 
  Modal, 
  Share, 
  StatusBar 
} from 'react-native';
import { 
  Globe, 
  Bell, 
  Moon, 
  WifiOff, 
  Database, 
  Trash2, 
  Download, 
  FileText, 
  Mail, 
  Info, 
  LogOut, 
  User, 
  Key, 
  ChevronRight,
  Sparkles
} from 'lucide-react-native';

import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useSettings } from '../../../shared/services/SettingsContext';
import { useAuth } from '../../../shared/services/AuthContext';

const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Malayalam',
  'Kannada',
  'Assamese',
  'Odia'
];

export const SettingsScreen = ({ navigation }) => {
  const { settings, updateSetting } = useSettings();
  const { logout, myRecipes } = useAuth();
  
  // Local UI State for Modals
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  // Storage Cache Details (Mock/Pre-calculated)
  const [cacheSize, setCacheSize] = useState('86.4 MB');

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Clear cached food photography and temporary voice audio files? Your saved recipes and drafts will not be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive',
          onPress: () => {
            setCacheSize('0.0 KB');
            Alert.alert('Cache Cleared', 'All temporary media files have been cleared.');
          }
        }
      ]
    );
  };

  const handleExportData = async (format) => {
    if (format === 'JSON') {
      try {
        const payload = {
          contributorName: 'Heritage Contributor',
          exportDate: new Date().toISOString(),
          recipesCount: myRecipes.length,
          recipes: myRecipes,
        };
        await Share.share({
          message: JSON.stringify(payload, null, 2),
          title: 'Edible India Archived Contributor Records Export',
        });
      } catch (err) {
        Alert.alert('Export Failed', 'Unable to initiate export sharing sheet.');
      }
    } else {
      // PDF Mock
      Alert.alert(
        'Export PDF',
        'Archival PDF report generator is preparing your archive compilation. Download sheet ready shortly.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:info@edibleindia.in?subject=Edible%20India%20Contributor%20Support')
      .catch(() => {
        Alert.alert('Support Request', 'Please email us directly at info@edibleindia.in');
      });
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Edible India contributor account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Auth');
          }
        }
      ]
    );
  };

  const toggleNotifPref = (prefKey) => {
    const updated = {
      ...settings.notificationPreferences,
      [prefKey]: !settings.notificationPreferences[prefKey]
    };
    updateSetting('notificationPreferences', updated);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Settings" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PREFERENCES SECTION */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <Card variant="default" style={styles.groupCard}>
          {/* Language Selection Row */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setLangModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Globe size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Language Selection</Text>
                <Text style={styles.rowSub}>Current: {settings.language}</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Notifications Selection Row */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setNotifModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Bell size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Notification Preferences</Text>
                <Text style={styles.rowSub}>Configure system logs alerts</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Dark Mode Row */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Moon size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Dark Mode Theme</Text>
                <Text style={[styles.rowSub, { color: COLORS.primary }]}>Coming in a future update</Text>
              </View>
            </View>
            <Switch
              value={settings.darkModePreference}
              onValueChange={(val) => updateSetting('darkModePreference', val)}
              disabled={true}
              trackColor={{ false: '#e4e2dd', true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        {/* OFFLINE & STORAGE SECTION */}
        <Text style={styles.sectionTitle}>OFFLINE & STORAGE</Text>
        <Card variant="default" style={styles.groupCard}>
          {/* Offline Mode Row */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <WifiOff size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Offline Contribution Mode</Text>
                <Text style={styles.rowSub}>Keep saved drafts available offline</Text>
              </View>
            </View>
            <Switch
              value={settings.offlineMode}
              onValueChange={(val) => updateSetting('offlineMode', val)}
              trackColor={{ false: '#e4e2dd', true: COLORS.secondary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Cache Size Row */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Database size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Temporary Cache Size</Text>
                <Text style={styles.rowSub}>{cacheSize} occupied on device</Text>
              </View>
            </View>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={handleClearCache}
              style={styles.clearBtn}
            >
              <Trash2 size={13} color={COLORS.error} />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowDivider} />

          {/* Offline File Limit Row */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setLimitModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Database size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Offline Storage Limit</Text>
                <Text style={styles.rowSub}>Max limit: {settings.offlineFileLimit}</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* DATA & ARCHIVE SECTION */}
        <Text style={styles.sectionTitle}>DATA & ARCHIVAL COMPILATION</Text>
        <Card variant="default" style={styles.groupCard}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => handleExportData('JSON')}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Download size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Export Records as JSON</Text>
                <Text style={styles.rowSub}>Includes all recipes list payload metadata</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => handleExportData('PDF')}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Download size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Export Archive as PDF</Text>
                <Text style={styles.rowSub}>Compile printable museum catalog</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* ABOUT & SUPPORT SECTION */}
        <Text style={styles.sectionTitle}>ABOUT & SUPPORT</Text>
        <Card variant="default" style={styles.groupCard}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setAboutModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Info size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>About Edible India</Text>
                <Text style={styles.rowSub}>CULINARY ARCHIVE CHARTER</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setPolicyModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <FileText size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
                <Text style={styles.rowSub}>Archival copyright ownership policies</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setTermsModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <FileText size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Terms & Conditions</Text>
                <Text style={styles.rowSub}>Preservation usage licenses</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleEmailSupport}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Mail size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Contact Support Specialist</Text>
                <Text style={styles.rowSub}>info@edibleindia.in</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* App Version Row */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Sparkles size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>App Build Version</Text>
                <Text style={styles.rowSub}>Standalone APK ready</Text>
              </View>
            </View>
            <Text style={styles.versionLabel}>v1.0.0</Text>
          </View>
        </Card>

        {/* ACCOUNT MANAGEMENT */}
        <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
        <Card variant="default" style={styles.groupCard}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('ProfileSetup')}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <User size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Update Account Profile Info</Text>
                <Text style={styles.rowSub}>Configure name, biographic texts, and locations</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => Alert.alert('Change Password', 'Enter recovery links sent to verify identity.')}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Key size={18} color={COLORS.secondary} />
              <View style={styles.textCol}>
                <Text style={styles.rowTitle}>Change Account Password</Text>
                <Text style={styles.rowSub}>Update credential signatures</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleLogoutPress}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <LogOut size={18} color={COLORS.error} />
              <View style={styles.textCol}>
                <Text style={[styles.rowTitle, { color: COLORS.error }]}>Sign Out Account</Text>
                <Text style={styles.rowSub}>Unlink this testing terminal</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* ================= LANGUAGE MODAL ================= */}
        <Modal
          visible={langModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLangModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="heritage" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Choose Language</Text>
              <ScrollView style={styles.modalScroll}>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = settings.language === lang;
                  return (
                    <TouchableOpacity
                      key={lang}
                      activeOpacity={0.7}
                      onPress={() => {
                        updateSetting('language', lang);
                        setLangModalVisible(false);
                      }}
                      style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    >
                      <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                        {lang}
                      </Text>
                      {isSelected && <Text style={{ color: COLORS.primary }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Button title="Close" variant="outline" onPress={() => setLangModalVisible(false)} style={styles.modalCloseBtn} />
            </Card>
          </View>
        </Modal>

        {/* ================= NOTIFICATIONS MODAL ================= */}
        <Modal
          visible={notifModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setNotifModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="heritage" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Logs Alert Settings</Text>
              
              <View style={styles.modalRow}>
                <Text style={styles.modalRowText}>Recipe Approved Notification</Text>
                <Switch
                  value={settings.notificationPreferences.recipeApproved}
                  onValueChange={() => toggleNotifPref('recipeApproved')}
                  trackColor={{ false: '#e4e2dd', true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalRowText}>Recipe Changes Required Notification</Text>
                <Switch
                  value={settings.notificationPreferences.recipeRejected}
                  onValueChange={() => toggleNotifPref('recipeRejected')}
                  trackColor={{ false: '#e4e2dd', true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalRowText}>Reviewer Feedback Updates</Text>
                <Switch
                  value={settings.notificationPreferences.reviewerFeedback}
                  onValueChange={() => toggleNotifPref('reviewerFeedback')}
                  trackColor={{ false: '#e4e2dd', true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalRowText}>New Curated Collections</Text>
                <Switch
                  value={settings.notificationPreferences.newCollection}
                  onValueChange={() => toggleNotifPref('newCollection')}
                  trackColor={{ false: '#e4e2dd', true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalRowText}>Announcements & Releases</Text>
                <Switch
                  value={settings.notificationPreferences.appAnnouncements}
                  onValueChange={() => toggleNotifPref('appAnnouncements')}
                  trackColor={{ false: '#e4e2dd', true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <Button title="Save Preferences" variant="primary" onPress={() => setNotifModalVisible(false)} style={styles.modalCloseBtn} />
            </Card>
          </View>
        </Modal>

        {/* ================= STORAGE LIMIT MODAL ================= */}
        <Modal
          visible={limitModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLimitModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="heritage" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Offline File Space Limit</Text>
              {['250 MB', '500 MB', '1 GB', 'Unlimited'].map((limit) => {
                const isSelected = settings.offlineFileLimit === limit;
                return (
                  <TouchableOpacity
                    key={limit}
                    activeOpacity={0.7}
                    onPress={() => {
                      updateSetting('offlineFileLimit', limit);
                      setLimitModalVisible(false);
                    }}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {limit}
                    </Text>
                    {isSelected && <Text style={{ color: COLORS.primary }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
              <Button title="Close" variant="outline" onPress={() => setLimitModalVisible(false)} style={styles.modalCloseBtn} />
            </Card>
          </View>
        </Modal>

        {/* ================= ABOUT MODAL ================= */}
        <Modal
          visible={aboutModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setAboutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="heritage" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Culinary Archive Charter</Text>
              <ScrollView style={styles.modalContentScroll}>
                <Text style={styles.modalBodyText}>
                  Edible India is a dedicated digital museum platform focused on preserving, mapping, and celebrating India's rich culinary traditions.
                  {"\n\n"}
                  Our platform works with home chefs, community archivists, culinary experts, and culinary historians to document seasonal recipes, indigenous ingredients, and traditional preparation custom methods before they disappear.
                  {"\n\n"}
                  Through detailed oral history collections and exact coordinate geolocation records, we link our recipes to heritage curations.
                </Text>
              </ScrollView>
              <Button title="Close Guide" variant="primary" onPress={() => setAboutModalVisible(false)} style={styles.modalCloseBtn} />
            </Card>
          </View>
        </Modal>

        {/* ================= PRIVACY MODAL ================= */}
        <Modal
          visible={policyModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPolicyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="heritage" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <ScrollView style={styles.modalContentScroll}>
                <Text style={styles.modalBodyText}>
                  All submissions to the Edible India archive remain under the joint ownership of the contributor and the Edible India Historical Trust.
                  {"\n\n"}
                  We do not share private contact coordinates with commercial advertisers. All locations mapping coordinate data are masked for user protection.
                  {"\n\n"}
                  Archived voice and image assets are distributed strictly for educational and heritage preservation uses under creative commons licensing models.
                </Text>
              </ScrollView>
              <Button title="Close Policy" variant="primary" onPress={() => setPolicyModalVisible(false)} style={styles.modalCloseBtn} />
            </Card>
          </View>
        </Modal>

        {/* ================= TERMS MODAL ================= */}
        <Modal
          visible={termsModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTermsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="heritage" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <ScrollView style={styles.modalContentScroll}>
                <Text style={styles.modalBodyText}>
                  By submitting recipes, photos, and voice notes to Edible India, you verify that you hold the rights to the content, or it has been passed down under ancestral traditions.
                  {"\n\n"}
                  We do not permit commercial monetization of documented curations. Material from this digital platform must not be exported for marketing use without formal authorization.
                </Text>
              </ScrollView>
              <Button title="Close Terms" variant="primary" onPress={() => setTermsModalVisible(false)} style={styles.modalCloseBtn} />
            </Card>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
    letterSpacing: 1.5,
  },
  groupCard: {
    paddingVertical: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textCol: {
    marginLeft: 14,
    flex: 1,
  },
  rowTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  rowSub: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.sm,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: BORDERS.radiusSm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.error,
  },
  versionLabel: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 28, 25, 0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    maxHeight: '80%',
    padding: SPACING.md,
    borderColor: '#E7D8C5',
    ...SHADOWS.deep,
  },
  modalTitle: {
    ...FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalContentScroll: {
    maxHeight: 250,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    height: 48,
  },
  modalOptionSelected: {
    backgroundColor: COLORS.secondaryBackground,
  },
  modalOptionText: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
  modalOptionTextSelected: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    height: 48,
  },
  modalRowText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.text,
  },
  modalBodyText: {
    ...FONTS.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.text,
  },
  modalCloseBtn: {
    marginTop: SPACING.md,
  },
});

export default SettingsScreen;
