import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  PermissionsAndroid
} from 'react-native';
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Eye,
  Check,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import TransitionView from '../../../shared/components/TransitionView';
import { useAuth } from '../../../shared/services/AuthContext';
import { API_BASE_URL } from '../../../core/config/apiConfig';
import { apiClient } from '../../../shared/services/apiClient';
import { recipeApiService } from '../services/recipeApiService';

export const RecipeImageImportScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft, clearRecipeDraft } = useAuth();
  const [pages, setPages] = useState([]);
  const [previewPage, setPreviewPage] = useState(null); // page to show in full preview modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load existing pages from active scan draft on mount
  useEffect(() => {
    if (recipeDraft?.scan?.pages) {
      setPages(recipeDraft.scan.pages);
    }
  }, [recipeDraft]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Edible India needs access to your camera to photograph handwritten recipes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const updateDraftPages = async (newPages) => {
    setPages(newPages);
    if (recipeDraft) {
      const updated = {
        ...recipeDraft,
        scan: {
          ...(recipeDraft.scan || {}),
          pages: newPages,
          lastSavedAt: Date.now()
        }
      };
      await saveRecipeDraft(updated, 'RecipeImageImport');
    }
  };

  const handleCaptureCamera = async () => {
    if (pages.length >= 5) {
      Alert.alert('Page limit reached', 'You can upload a maximum of 5 recipe pages per scan.');
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 2200,
        maxHeight: 2200,
        saveToPhotos: false
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        handlePickerError(result.errorCode);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        addPages(result.assets, 'camera');
      }
    } catch (err) {
      Alert.alert('Camera Error', 'Could not open camera on this device.');
    }
  };

  const handleSelectGallery = async () => {
    const remainingSlots = 5 - pages.length;
    if (remainingSlots <= 0) {
      Alert.alert('Page limit reached', 'You can upload a maximum of 5 recipe pages per scan.');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 2200,
        maxHeight: 2200,
        selectionLimit: remainingSlots
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        handlePickerError(result.errorCode);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        addPages(result.assets, 'gallery');
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open system photo library.');
    }
  };

  const handleRetakePage = async (index) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 2200,
        maxHeight: 2200,
        saveToPhotos: false
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        handlePickerError(result.errorCode);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newPages = [...pages];
        newPages[index] = {
          id: pages[index].id, // keep original ID
          uri: asset.uri,
          fileName: asset.fileName || `retake_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          fileSize: asset.fileSize || 0,
          width: asset.width || 0,
          height: asset.height || 0,
          source: 'camera',
          order: index,
          rotation: pages[index].rotation || 0
        };
        await updateDraftPages(newPages);
      }
    } catch (err) {
      Alert.alert('Camera Error', 'Could not open camera to retake page.');
    }
  };

  const handleRotatePage = async (index) => {
    const newPages = [...pages];
    const currentRot = newPages[index].rotation || 0;
    newPages[index] = {
      ...newPages[index],
      rotation: (currentRot + 90) % 360
    };
    await updateDraftPages(newPages);
  };

  const handlePickerError = (code) => {
    if (code === 'camera_unavailable') {
      Alert.alert('Unavailable', 'Camera is not available on this device.');
    } else if (code === 'permission') {
      Alert.alert('Permission Denied', 'Permission is required to access camera/photo library.');
    } else {
      Alert.alert('Picker Error', `An error occurred: ${code}`);
    }
  };

  const addPages = async (assets, source) => {
    const validAssets = [];
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      
      // Validate file size (10MB limit)
      const sizeMB = (asset.fileSize || 0) / (1024 * 1024);
      if (sizeMB > 10) {
        Alert.alert('File too large', `Image "${asset.fileName || 'Recipe'}" exceeds the 10MB file limit.`);
        continue;
      }

      // Check duplicates
      const isDuplicate = pages.some(
        (p) => p.uri === asset.uri || (p.fileSize > 0 && p.fileSize === asset.fileSize)
      );

      if (isDuplicate) {
        continue;
      }

      validAssets.push({
        id: `page-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
        uri: asset.uri,
        fileName: asset.fileName || `page_${pages.length + i + 1}.jpg`,
        type: asset.type || 'image/jpeg',
        fileSize: asset.fileSize || 0,
        width: asset.width || 0,
        height: asset.height || 0,
        source: source,
        order: pages.length + i,
        rotation: 0
      });
    }

    if (validAssets.length > 0) {
      const nextPages = [...pages, ...validAssets];
      await updateDraftPages(nextPages);
    }
  };

  const handleRemovePage = async (id) => {
    const nextPages = pages.filter((p) => p.id !== id).map((p, idx) => ({ ...p, order: idx }));
    await updateDraftPages(nextPages);
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[index - 1];
    newPages[index - 1] = temp;
    
    // Recalculate order fields
    const updated = newPages.map((p, idx) => ({ ...p, order: idx }));
    await updateDraftPages(updated);
  };

  const handleMoveDown = async (index) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[index + 1];
    newPages[index + 1] = temp;

    // Recalculate order fields
    const updated = newPages.map((p, idx) => ({ ...p, order: idx }));
    await updateDraftPages(updated);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear all pages',
      'Are you sure you want to remove all captured recipe pages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove All',
          style: 'destructive',
          onPress: async () => {
            await updateDraftPages([]);
          }
        }
      ]
    );
  };

  const normalizeError = (err) => {
    const errMsg = String(err.message || err || '');
    
    if (errMsg.includes('Network request failed') || errMsg.includes('Failed to fetch') || errMsg.includes('connection') || errMsg.includes('Network upload error')) {
      return {
        title: 'Connection Problem',
        message: 'The app could not reach the Edible India server. Confirm that the backend is running and that the selected device connection is configured correctly.',
        type: 'connection'
      };
    }
    
    if (errMsg.includes('aborted') || errMsg.includes('timeout') || errMsg.includes('timed out') || errMsg.includes('Upload request timed out')) {
      return {
        title: 'Processing Timed Out',
        message: 'Processing took longer than expected. Your selected images remain; please try again.',
        type: 'timeout'
      };
    }

    if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('session expired') || errMsg.includes('token') || errMsg.includes('unauthorized')) {
      return {
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        type: 'auth'
      };
    }

    if (errMsg.includes('Validation') || errMsg.includes('422')) {
      return {
        title: 'Validation Error',
        message: err.message || 'The server rejected the data validation. Please check your inputs.',
        type: 'validation'
      };
    }

    if (errMsg.includes('too large') || errMsg.includes('oversized') || errMsg.includes('413') || errMsg.includes('FILE_TOO_LARGE') || errMsg.includes('UNSUPPORTED_MIME_TYPE')) {
      return {
        title: 'Upload Rejected',
        message: 'The image size exceeds the limit or the file type is unsupported. Please try a smaller JPEG or PNG image.',
        type: 'upload_rejected'
      };
    }

    if (errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('UNAVAILABLE') || errMsg.includes('AI service')) {
      return {
        title: 'Service Unavailable',
        message: 'OCR processing is temporarily unavailable. Please retry later or continue manually.',
        type: 'ocr_unavailable'
      };
    }

    return {
      title: 'Processing Error',
      message: err.message || 'An unexpected error occurred during recipe scan setup.',
      type: 'generic'
    };
  };

  const handleNext = async () => {
    if (isProcessing || pages.length === 0) return;

    setIsProcessing(true);
    setError(null);
    try {
      // 1. Initialize import session on the backend
      const initController = new AbortController();
      const initTimeout = setTimeout(() => initController.abort(), 15000);
      
      let initSessionRes;
      try {
        initSessionRes = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports`, {
          method: 'POST',
          signal: initController.signal
        });
      } finally {
        clearTimeout(initTimeout);
      }
      
      const sessionData = await initSessionRes.json();
      if (!initSessionRes.ok || !sessionData.success) {
        throw new Error(sessionData.message || `Failed to initialize scan session with status ${initSessionRes.status}`);
      }
      
      const sessionId = sessionData.data.sessionId;

      // 2. Upload each page file and associate with session
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Upload file as MediaAsset
        const initRes = await recipeApiService.initiateUpload(
          'recipe_gallery',
          page.fileName,
          page.type,
          page.fileSize || 500 * 1024,
          recipeDraft?.draftId || null
        );

        const { asset, uploadInstructions } = initRes.data;
        const assetId = asset.assetId;

        await recipeApiService.uploadFile(
          uploadInstructions.uploadUrl,
          uploadInstructions.uploadMethod,
          uploadInstructions.fields,
          page.uri,
          page.type,
          page.fileName
        );

        await recipeApiService.completeUpload(assetId);

        // Associate with backend RecipeImportSession
        const linkController = new AbortController();
        const linkTimeout = setTimeout(() => linkController.abort(), 15000);
        let linkRes;
        try {
          linkRes = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports/${sessionId}/pages`, {
            method: 'POST',
            body: JSON.stringify({
              pageNumber: i + 1,
              assetId: assetId
            }),
            signal: linkController.signal
          });
        } finally {
          clearTimeout(linkTimeout);
        }

        if (!linkRes.ok) {
          throw new Error('Failed to link page asset to scan session.');
        }
      }

      // Save session id to draft scan state
      if (recipeDraft) {
        const updated = {
          ...recipeDraft,
          scan: {
            ...(recipeDraft.scan || {}),
            pages: pages,
            sessionId: sessionId,
            extractionStatus: 'upload_completed',
            lastSavedAt: Date.now()
          }
        };
        await saveRecipeDraft(updated, 'RecipeImageImport');
      }

      if (isMounted.current) {
        // Proceed to OCR review stage with sessionId
        navigation.navigate('OCRReview', { pages, sessionId });
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        const normalized = normalizeError(err);
        
        Alert.alert(
          normalized.title,
          normalized.message,
          [
            { text: 'Retry', onPress: () => handleNext() },
            { text: 'Enter Manually', onPress: () => navigation.navigate('RecipeIdentity') },
            { text: 'Replace Image', style: 'cancel' }
          ]
        );
        console.error('OCR Process Initiation Error:', err);
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  let buttonTitle = 'Process with OCR';
  if (isProcessing) {
    buttonTitle = 'Processing Recipe…';
  } else if (error) {
    buttonTitle = 'Retry Processing';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="Scan Heritage Recipe" showBack={true} showAvatar={false} />

      <TransitionView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Curation Guidance Panel */}
          <Card variant="heritage" style={styles.guideCard}>
            <View style={styles.guideHeader}>
              <HelpCircle size={18} color={COLORS.secondary} />
              <Text style={styles.guideTitle}>Guidelines for Best Quality Scan</Text>
            </View>
            <View style={styles.guideList}>
              <Text style={styles.guideItem}>• Place the recipe paper flat on a dark, plain surface.</Text>
              <Text style={styles.guideItem}>• Stand directly above the page to avoid angled distortion.</Text>
              <Text style={styles.guideItem}>• Ensure bright, even lighting; avoid glare and shadows.</Text>
              <Text style={styles.guideItem}>• Hold device steady so handwriting is completely legible.</Text>
              <Text style={styles.guideItem}>• Scan multi-page cookbooks sequentially, page by page.</Text>
            </View>
            <TouchableOpacity 
              style={styles.templateBtn} 
              onPress={() => setShowTemplateModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.templateBtnText}>View Recommended Recipe Format & Fields</Text>
            </TouchableOpacity>
          </Card>

          {/* Source Triggers Card */}
          <Card variant="default" style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Add Recipe Pages ({pages.length}/5)</Text>
            <Text style={styles.sectionSub}>Photograph or pick existing images of the recipe card.</Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.pickerBtn, pages.length >= 5 && styles.pickerBtnDisabled]}
                onPress={handleCaptureCamera}
                disabled={pages.length >= 5}
                activeOpacity={0.8}
              >
                <Camera size={26} color={pages.length >= 5 ? COLORS.textMuted : COLORS.primary} />
                <Text style={[styles.pickerBtnText, pages.length >= 5 && styles.pickerBtnTextDisabled]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerBtn, pages.length >= 5 && styles.pickerBtnDisabled]}
                onPress={handleSelectGallery}
                disabled={pages.length >= 5}
                activeOpacity={0.8}
              >
                <ImageIcon size={26} color={pages.length >= 5 ? COLORS.textMuted : COLORS.primary} />
                <Text style={[styles.pickerBtnText, pages.length >= 5 && styles.pickerBtnTextDisabled]}>Choose Gallery</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* List display section */}
          {pages.length > 0 && (
            <View style={styles.listSection}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeader}>Selected Pages ({pages.length})</Text>
                <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
                  <Text style={styles.clearBtnText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              
              {pages.map((item, index) => (
                <View key={item.id} style={styles.pageItem}>
                  <TouchableOpacity onPress={() => setPreviewPage(item)} activeOpacity={0.9}>
                    <View style={styles.thumbContainer}>
                      <Image 
                        source={{ uri: item.uri }} 
                        style={[styles.pageThumb, { transform: [{ rotate: `${item.rotation || 0}deg` }] }]} 
                        resizeMode="cover" 
                      />
                      <View style={styles.eyeOverlay}>
                        <Eye size={12} color={COLORS.white} />
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.pageDetails}>
                    <Text style={styles.pageLabel}>PAGE {index + 1}</Text>
                    <Text style={styles.pageName} numberOfLines={1}>{item.fileName}</Text>
                    <Text style={styles.pageSize}>Size: {formatSize(item.fileSize)} • Source: {item.source}</Text>
                  </View>

                  <View style={styles.controlsColumn}>
                    <View style={styles.reorderRow}>
                      <TouchableOpacity 
                        onPress={() => handleMoveUp(index)} 
                        disabled={index === 0} 
                        style={[styles.reorderBtn, index === 0 && styles.disabledBtn]}
                      >
                        <ArrowUp size={12} color={COLORS.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleMoveDown(index)} 
                        disabled={index === pages.length - 1} 
                        style={[styles.reorderBtn, index === pages.length - 1 && styles.disabledBtn]}
                      >
                        <ArrowDown size={12} color={COLORS.secondary} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => handleRotatePage(index)} style={styles.retakeBtn} title="Rotate">
                        <RotateCw size={12} color={COLORS.primary} />
                        <Text style={styles.retakeBtnText}>Rotate</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleRetakePage(index)} style={styles.retakeBtn} title="Retake">
                        <Camera size={12} color={COLORS.primary} />
                        <Text style={styles.retakeBtnText}>Retake</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleRemovePage(item.id)} style={styles.deleteBtn}>
                        <Trash2 size={14} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </TransitionView>

      {/* Primary continue footer */}
      <View style={styles.footer}>
        {isProcessing && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginBottom: 8 }} />}
        <Button
          title={buttonTitle}
          variant="primary"
          onPress={handleNext}
          disabled={pages.length === 0 || isProcessing}
          style={styles.nextBtn}
        />
      </View>

      {/* Full Page Preview Modal */}
      {previewPage && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewPage(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{previewPage.fileName}</Text>
                <TouchableOpacity onPress={() => setPreviewPage(null)} style={styles.closeModalBtn}>
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
              <Image 
                source={{ uri: previewPage.uri }} 
                style={[styles.modalImage, { transform: [{ rotate: `${previewPage.rotation || 0}deg` }] }]} 
                resizeMode="contain" 
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Recommended Format Guideline Modal */}
      <Modal
        visible={showTemplateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.guidelineOverlay}>
          <View style={styles.guidelineContent}>
            <View style={styles.guidelineHeader}>
              <Text style={styles.guidelineTitle}>Recommended Recipe Card Format</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)} style={styles.guidelineCloseBtn}>
                <X size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.guidelineScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.guidelineSub}>
                To help the AI extract details perfectly, we recommend writing down information in this format on your page before scanning:
              </Text>
              <Image 
                source={require('../../../assets/images/recipe_template_guideline.png')} 
                style={styles.templateImage} 
                resizeMode="contain" 
              />
              <View style={styles.formatGuidelines}>
                <Text style={styles.formatHeader}>Key Information to Include:</Text>
                <Text style={styles.formatText}>• <Text style={{fontWeight: 'bold'}}>Title & Local Name:</Text> e.g. Monsoon Kadhai Dal (Kadhai Paneer)</Text>
                <Text style={styles.formatText}>• <Text style={{fontWeight: 'bold'}}>Geography/Location:</Text> State, District, Village (e.g. Kerala, Kottayam)</Text>
                <Text style={styles.formatText}>• <Text style={{fontWeight: 'bold'}}>Heritage & History:</Text> e.g. Passed from Grandmother to Mother to Me</Text>
                <Text style={styles.formatText}>• <Text style={{fontWeight: 'bold'}}>Ingredients & Quantities:</Text> Clear lists with units (e.g. 250g Paneer)</Text>
                <Text style={styles.formatText}>• <Text style={{fontWeight: 'bold'}}>Step-by-step Steps:</Text> Sequential cooking instructions</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F1',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  guideCard: {
    padding: SPACING.md,
    backgroundColor: '#F7EFE5',
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: SPACING.md,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  guideTitle: {
    ...FONTS.bodyBold,
    fontSize: 13.5,
    color: COLORS.secondary,
  },
  guideList: {
    gap: 4,
  },
  guideItem: {
    ...FONTS.caption,
    fontSize: 11.5,
    color: COLORS.text,
    lineHeight: 16,
  },
  actionCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 16,
    ...SHADOWS.soft,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.titleMedium,
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSub: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    fontSize: 11.5,
    marginBottom: SPACING.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerBtn: {
    flex: 1,
    height: 90,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...SHADOWS.soft,
  },
  pickerBtnDisabled: {
    backgroundColor: '#F5EFE6',
    borderColor: '#E6DCCE',
  },
  pickerBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pickerBtnTextDisabled: {
    color: COLORS.textMuted,
  },
  listSection: {
    marginTop: SPACING.xs,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  listHeader: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  clearBtnText: {
    ...FONTS.caption,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  pageItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  thumbContainer: {
    position: 'relative',
  },
  pageThumb: {
    width: 65,
    height: 65,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#FAF5EE',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
  },
  eyeOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 3,
  },
  pageDetails: {
    flex: 1,
    marginRight: 6,
  },
  pageLabel: {
    ...FONTS.caption,
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  pageName: {
    ...FONTS.bodyBold,
    fontSize: 11.5,
    color: COLORS.text,
    marginBottom: 2,
  },
  pageSize: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  controlsColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  reorderRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reorderBtn: {
    padding: 4,
    backgroundColor: '#FAF5EE',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    borderRadius: 4,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF7F2',
    borderColor: '#E8D2BF',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 2,
  },
  retakeBtnText: {
    ...FONTS.caption,
    fontSize: 9.5,
    color: COLORS.primary,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: '#FBF7F1',
    borderTopWidth: 1,
    borderTopColor: '#ECE3D7',
  },
  nextBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    height: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#FAF5EE',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE3D7',
  },
  modalTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
    flex: 1,
    marginRight: 10,
  },
  closeModalBtn: {
    padding: 6,
  },
  closeModalText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.primary,
  },
  modalImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2F2B28',
  },
  templateBtn: {
    marginTop: SPACING.sm,
    backgroundColor: '#F5E6D3',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2C7A8',
  },
  templateBtnText: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  guidelineOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FBF7F1',
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  guidelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEDCC5',
    paddingBottom: SPACING.sm,
  },
  guidelineTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  guidelineCloseBtn: {
    padding: 4,
  },
  guidelineScroll: {
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  guidelineSub: {
    ...FONTS.caption,
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  templateImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#FAF5EE',
    borderRadius: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#EEDCC5',
  },
  formatGuidelines: {
    width: '100%',
    backgroundColor: '#FAF0E6',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EEDCC5',
  },
  formatHeader: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  formatText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.text,
    marginBottom: 5,
    lineHeight: 15,
  }
});

export default RecipeImageImportScreen;
