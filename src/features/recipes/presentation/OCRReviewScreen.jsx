import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
  Platform
} from 'react-native';
import {
  RefreshCw,
  Layout,
  Type,
  ChevronLeft,
  ChevronRight,
  Save,
  Languages,
  AlertCircle
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import ExtractionProgress from './components/ExtractionProgress';
import { useAuth } from '../../../shared/services/AuthContext';
import { API_BASE_URL } from '../../../core/config/apiConfig';
import { apiClient } from '../../../shared/services/apiClient';

export const OCRReviewScreen = ({ route, navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  const { pages, sessionId } = route.params || { pages: [], sessionId: null };

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPage, setProgressPage] = useState(1);
  const [progressText, setProgressText] = useState('Preparing recipe pages...');
  
  // OCR Content States
  const [pageTranscriptions, setPageTranscriptions] = useState([]); // Array of { pageNumber, text, detectedLanguages, uncertainSegments }
  const [ocrTexts, setOcrTexts] = useState({}); // { [pageNumber]: text }
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [detectedLanguages, setDetectedLanguages] = useState([]);
  
  // Tab selector: 'split' or 'image' or 'text'
  const [activeTab, setActiveTab] = useState('split');

  const runImageExtraction = useCallback(async () => {
    if (!sessionId) return;
    setIsProcessing(true);
    setProgressText('Extracting handwriting from recipe images...');

    try {
      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports/${sessionId}/process-ocr`, {
        method: 'POST',
        body: JSON.stringify({
          ocrLanguageHint: 'hi' // default multilingual hint
        })
      });

      const resJson = await response.json();

      if (!response.ok) {
        let msg = 'Failed to extract text from images.';
        if (resJson.message) {
          msg = resJson.message;
        }
        throw new Error(msg);
      }

      if (resJson.success && resJson.data) {
        const data = resJson.data;
        // Map rawOCR/correctedText from backend pages schema
        const mappedPages = (data.pages || []).map(p => ({
          pageNumber: p.pageNumber,
          text: p.correctedText || p.rawOCR || '',
          detectedLanguages: p.detectedLanguages || [],
          uncertainSegments: p.uncertainSegments || []
        }));

        setPageTranscriptions(mappedPages);
        
        // Initialize editable texts mapping
        const textMap = {};
        mappedPages.forEach(p => {
          textMap[p.pageNumber] = p.text || '';
        });
        setOcrTexts(textMap);
        setOriginalText(data.rawOCRTextCombined || '');
        setCorrectedText(data.correctedOCRTextCombined || '');
        
        const allLangs = Array.from(new Set(mappedPages.flatMap(p => p.detectedLanguages)));
        setDetectedLanguages(allLangs);

        // Save progress to active draft state
        if (recipeDraft) {
          const updated = {
            ...recipeDraft,
            scan: {
              ...(recipeDraft.scan || {}),
              pages: pages,
              sessionId: sessionId,
              extractionStatus: 'ocr_completed',
              pageTranscriptions: mappedPages,
              originalText: data.rawOCRTextCombined || '',
              correctedText: data.correctedOCRTextCombined || '',
              detectedLanguages: allLangs,
              lastSavedAt: Date.now()
            }
          };
          await saveRecipeDraft(updated, 'RecipeImageImport');
        }
      }
    } catch (e) {
      Alert.alert(
        'Scan Failed',
        e.message || 'An error occurred during text extraction. You can retry or write manually.',
        [
          { text: 'Write manually', onPress: () => navigation.navigate('RecipeIdentity') },
          { text: 'Retry', onPress: () => runImageExtraction() }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [pages, sessionId, recipeDraft]);

  // Load pages on mount
  useEffect(() => {
    if (recipeDraft?.scan?.extractionStatus === 'ocr_completed' && recipeDraft?.scan?.correctedText) {
      // Re-load from saved completed draft
      const scan = recipeDraft.scan;
      setPageTranscriptions(scan.pageTranscriptions || []);
      const textMap = {};
      (scan.pageTranscriptions || []).forEach(p => {
        textMap[p.pageNumber] = p.text || '';
      });
      setOcrTexts(textMap);
      setOriginalText(scan.originalText || '');
      setCorrectedText(scan.correctedText || '');
      setDetectedLanguages(scan.detectedLanguages || []);
    } else {
      // Trigger upload
      runImageExtraction();
    }
  }, []);

  const handleTextChange = async (text) => {
    const pageNum = activePageIndex + 1;
    const nextOcrTexts = {
      ...ocrTexts,
      [pageNum]: text
    };
    setOcrTexts(nextOcrTexts);

    // Calculate combined corrected text
    const nextCombined = pages.map((p, idx) => nextOcrTexts[idx + 1] || '').join('\n\n').trim();
    setCorrectedText(nextCombined);

    // Debounce save draft
    if (recipeDraft) {
      const updated = {
        ...recipeDraft,
        scan: {
          ...(recipeDraft.scan || {}),
          correctedText: nextCombined,
          pageTranscriptions: pageTranscriptions.map(p => p.pageNumber === pageNum ? { ...p, text } : p),
          lastSavedAt: Date.now()
        }
      };
      await saveRecipeDraft(updated, 'RecipeImageImport');
    }
  };

  const handleNextStep = async () => {
    if (!correctedText.trim()) {
      Alert.alert('Empty Text', 'Cannot parse empty recipe. Please enter the text.');
      return;
    }

    setIsProcessing(true);
    setProgressText('Saving transcription corrections...');

    try {
      // Link page corrections to import session
      const mappedPages = pages.map((p, idx) => ({
        pageNumber: idx + 1,
        correctedText: ocrTexts[idx + 1] || ''
      }));

      const response = await apiClient.fetch(`${API_BASE_URL}/api/v1/recipe-imports/${sessionId}/transcription`, {
        method: 'PATCH',
        body: JSON.stringify({
          correctedOCRTextCombined: correctedText,
          pages: mappedPages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save transcription updates on server.');
      }

      setIsProcessing(false);
      navigation.navigate('StructuredRecipeReview', {
        sessionId,
        rawText: correctedText,
        sourceImages: pages.map(p => p.uri),
        ocrConfidence: 0.95
      });
    } catch (err) {
      setIsProcessing(false);
      console.error('Transcription save error:', err);
      Alert.alert('Save Failed', err.message || 'Could not update corrected text.');
    }
  };

  const activePage = pages[activePageIndex];
  const activePageData = pageTranscriptions.find(p => p.pageNumber === (activePageIndex + 1));
  const activeText = ocrTexts[activePageIndex + 1] || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7F1" />
      <Header title="OCR Text Review" showBack={true} showAvatar={false} />

      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ExtractionProgress
            currentPage={progressPage}
            totalPages={pages.length}
            statusText={progressText}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          
          {/* Metadata/Language Indicator row */}
          <View style={styles.metaBadgeRow}>
            <View style={styles.langBadge}>
              <Languages size={13} color={COLORS.secondary} />
              <Text style={styles.langText}>
                Languages: {detectedLanguages.length > 0 ? detectedLanguages.join(', ').toUpperCase() : 'Detecting...'}
              </Text>
            </View>
            <TouchableOpacity style={styles.retryHeaderBtn} onPress={runImageExtraction}>
              <RefreshCw size={11} color={COLORS.primary} />
              <Text style={styles.retryHeaderText}>Re-scan All</Text>
            </TouchableOpacity>
          </View>

          {/* Tab switches */}
          <View style={styles.panelTabs}>
            <TouchableOpacity
              style={[styles.panelTabBtn, activeTab === 'split' && styles.panelActiveTabBtn]}
              onPress={() => setActiveTab('split')}
            >
              <Layout size={14} color={activeTab === 'split' ? COLORS.primary : COLORS.secondary} />
              <Text style={[styles.panelTabText, activeTab === 'split' && styles.panelActiveTabText]}>Side-by-Side</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.panelTabBtn, activeTab === 'image' && styles.panelActiveTabBtn]}
              onPress={() => setActiveTab('image')}
            >
              <Layout size={14} color={activeTab === 'image' ? COLORS.primary : COLORS.secondary} />
              <Text style={[styles.panelTabText, activeTab === 'image' && styles.panelActiveTabText]}>Image Only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.panelTabBtn, activeTab === 'text' && styles.panelActiveTabBtn]}
              onPress={() => setActiveTab('text')}
            >
              <Type size={14} color={activeTab === 'text' ? COLORS.primary : COLORS.secondary} />
              <Text style={[styles.panelTabText, activeTab === 'text' && styles.panelActiveTabText]}>Text Only</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Image Preview Block */}
            {(activeTab === 'split' || activeTab === 'image') && activePage && (
              <Card variant="default" style={styles.imageCard}>
                <Image source={{ uri: activePage.uri }} style={styles.recipeImage} resizeMode="contain" />
              </Card>
            )}

            {/* Editable OCR text blocks */}
            {(activeTab === 'split' || activeTab === 'text') && (
              <View style={styles.editorSection}>
                <Text style={styles.editorTitle}>Extracted Text Page {activePageIndex + 1}</Text>
                
                {/* Uncertain segment warnings display */}
                {activePageData?.uncertainSegments && activePageData.uncertainSegments.length > 0 && (
                  <View style={styles.uncertainBox}>
                    <AlertCircle size={14} color="#C55A11" />
                    <View style={styles.uncertainContent}>
                      <Text style={styles.uncertainTitle}>Uncertain segment detected:</Text>
                      {activePageData.uncertainSegments.map((seg, sIdx) => (
                        <Text key={sIdx} style={styles.uncertainText}>
                          • "{seg.text}" ({seg.reason})
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textArea}
                    value={activeText}
                    onChangeText={handleTextChange}
                    multiline={true}
                    placeholder="Extracted recipe text will appear here. Edit as needed..."
                    placeholderTextColor={COLORS.textMuted}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}

            {/* Bottom Pagination */}
            {pages.length > 1 && (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.pageBtn, activePageIndex === 0 && styles.disabledPageBtn]}
                  disabled={activePageIndex === 0}
                  onPress={() => setActivePageIndex(activePageIndex - 1)}
                >
                  <ChevronLeft size={16} color={COLORS.secondary} />
                  <Text style={styles.pageBtnText}>Prev Page</Text>
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>
                  Page {activePageIndex + 1} of {pages.length}
                </Text>

                <TouchableOpacity
                  style={[styles.pageBtn, activePageIndex === pages.length - 1 && styles.disabledPageBtn]}
                  disabled={activePageIndex === pages.length - 1}
                  onPress={() => setActivePageIndex(activePageIndex + 1)}
                >
                  <Text style={styles.pageBtnText}>Next Page</Text>
                  <ChevronRight size={16} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>

          {/* Footer Forward Actions */}
          <View style={styles.footer}>
            <Button
              title="Confirm & Parse Recipe"
              variant="primary"
              onPress={handleNextStep}
              style={styles.submitBtn}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  langText: {
    ...FONTS.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  retryHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryHeaderText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  panelTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: SPACING.md,
  },
  panelTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FAF5EE',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    gap: 6,
  },
  panelActiveTabBtn: {
    backgroundColor: '#FAF0E6',
    borderColor: COLORS.primary,
  },
  panelTabText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.secondary,
  },
  panelActiveTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 110,
  },
  imageCard: {
    height: 250,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    backgroundColor: '#FAF8F4',
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  editorSection: {
    marginBottom: SPACING.md,
  },
  editorTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 6,
  },
  uncertainBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF2CC',
    borderColor: '#FFE699',
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    gap: 6,
  },
  uncertainContent: {
    flex: 1,
  },
  uncertainTitle: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#7F6000',
  },
  uncertainText: {
    ...FONTS.caption,
    fontSize: 10,
    color: '#7F6000',
  },
  textInputContainer: {
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 180,
    padding: 10,
    ...SHADOWS.soft,
  },
  textArea: {
    ...FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text,
    minHeight: 160,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: SPACING.md,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#FAF5EE',
    borderWidth: 0.5,
    borderColor: '#ECE3D7',
    gap: 4,
  },
  disabledPageBtn: {
    opacity: 0.4,
  },
  pageBtnText: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  pageIndicator: {
    ...FONTS.caption,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
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
  submitBtn: {
    width: '100%',
  },
});

export default OCRReviewScreen;
