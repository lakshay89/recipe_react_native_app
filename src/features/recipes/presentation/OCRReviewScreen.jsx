import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { RefreshCw, Layout, Type, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import OCRTextEditor from './components/OCRTextEditor';
import ExtractionProgress from './components/ExtractionProgress';
import recipeOCRService from '../services/recipeOCRService';

export const OCRReviewScreen = ({ route, navigation }) => {
  const { pages } = route.params || { pages: [] };
  const [selectedScript, setSelectedScript] = useState('latin'); // 'latin' or 'devanagari'
  const [activePageIndex, setActivePageIndex] = useState(0);
  
  // OCR state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPage, setProgressPage] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [ocrTexts, setOcrTexts] = useState({}); // { [pageId]: text }
  const [ocrResults, setOcrResults] = useState({}); // Full result payload

  // Panel display switcher: 'split' (side-by-side image/text tabbed) or 'image' or 'text'
  const [activeTab, setActiveTab] = useState('split'); // 'image' or 'text' or 'split'

  const runOCRScan = useCallback(async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    const newTexts = {};
    const newResults = {};

    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        setProgressPage(i + 1);
        setProgressText(`Analyzing page ${i + 1} with ${selectedScript === 'devanagari' ? 'Hindi / Devanagari' : 'English / Latin'} script...`);
        
        const result = await recipeOCRService.recognizeText(page.uri, selectedScript);
        newTexts[page.id] = result.text;
        newResults[page.id] = result;
      }
      
      setOcrTexts(newTexts);
      setOcrResults(newResults);
    } catch (e) {
      Alert.alert('OCR Error', 'Failed to read text from one or more pages. You can manually type the recipe details.');
    } finally {
      setIsProcessing(false);
    }
  }, [pages, selectedScript]);

  // Trigger OCR sequential pipeline on mount or when script overrides
  useEffect(() => {
    runOCRScan();
  }, [runOCRScan]);

  const handleTextChange = (text) => {
    const activePage = pages[activePageIndex];
    if (activePage) {
      setOcrTexts({
        ...ocrTexts,
        [activePage.id]: text,
      });
    }
  };

  const handleScriptChange = (script) => {
    setSelectedScript(script);
  };

  const handleNextStep = async () => {
    // 1. Gather all reviewed text
    const combinedText = pages.map(p => ocrTexts[p.id] || '').join('\n\n').trim();
    if (!combinedText) {
      Alert.alert('Empty content', 'Please review/correct text. We cannot structure an empty recipe.');
      return;
    }

    // Pass to structured review screen
    navigation.navigate('StructuredRecipeReview', {
      rawText: combinedText,
      sourceImages: pages.map(p => p.uri),
      ocrConfidence: pages.reduce((acc, p) => acc + (ocrResults[p.id]?.confidence || 0.9), 0) / pages.length,
    });
  };

  const activePage = pages[activePageIndex];
  const activeText = activePage ? ocrTexts[activePage.id] || '' : '';

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
          {/* Script Options Segment control */}
          <View style={styles.scriptSegmentBar}>
            <TouchableOpacity
              style={[styles.segmentBtn, selectedScript === 'latin' && styles.segmentActiveBtn]}
              onPress={() => handleScriptChange('latin')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentBtnText, selectedScript === 'latin' && styles.segmentActiveBtnText]}>
                English / Latin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, selectedScript === 'devanagari' && styles.segmentActiveBtn]}
              onPress={() => handleScriptChange('devanagari')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentBtnText, selectedScript === 'devanagari' && styles.segmentActiveBtnText]}>
                Hindi / Devanagari
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab switcher: Image vs Text vs Split */}
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
              <Text style={[styles.panelTabText, activeTab === 'image' && styles.panelActiveTabText]}>Image View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.panelTabBtn, activeTab === 'text' && styles.panelActiveTabBtn]}
              onPress={() => setActiveTab('text')}
            >
              <Type size={14} color={activeTab === 'text' ? COLORS.primary : COLORS.secondary} />
              <Text style={[styles.panelTabText, activeTab === 'text' && styles.panelActiveTabText]}>Text Editor</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Split Panel side-by-side or stacked depending on layout */}
            {(activeTab === 'split' || activeTab === 'image') && activePage && (
              <Card variant="default" style={styles.imageCard}>
                <Image source={{ uri: activePage.uri }} style={styles.recipeImage} resizeMode="contain" />
              </Card>
            )}

            {(activeTab === 'split' || activeTab === 'text') && (
              <View style={styles.editorSection}>
                <View style={styles.editorHeader}>
                  <Text style={styles.editorTitle}>Extracted Text Page {activePageIndex + 1}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={runOCRScan} activeOpacity={0.8}>
                    <RefreshCw size={12} color={COLORS.primary} style={styles.retryIcon} />
                    <Text style={styles.retryText}>Retry OCR</Text>
                  </TouchableOpacity>
                </View>
                <OCRTextEditor value={activeText} onChangeText={handleTextChange} />
              </View>
            )}

            {/* Pagination Controls */}
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
                  {activePageIndex + 1} of {pages.length}
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

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Button
              title="Parse Recipe Fields"
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
  scriptSegmentBar: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    borderRadius: 8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActiveBtn: {
    backgroundColor: COLORS.white,
    ...SHADOWS.soft,
  },
  segmentBtnText: {
    ...FONTS.caption,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  segmentActiveBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
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
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editorTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF0E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: COLORS.primary,
  },
  retryIcon: {
    marginRight: 4,
  },
  retryText: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
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
