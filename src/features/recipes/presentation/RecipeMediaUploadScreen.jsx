import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, TouchableOpacity, Image, Platform, PermissionsAndroid } from 'react-native';
import { Camera, Image as ImageIcon, Mic, Play, Pause, Square, Trash2, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDERS, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import TransitionView from '../../../shared/components/TransitionView';
import { recipeApiService } from '../services/recipeApiService';

export const RecipeMediaUploadScreen = ({ navigation }) => {
  const { recipeDraft, saveRecipeDraft } = useAuth();
  
  // Custom Media Archive States
  const [images, setImages] = useState([]);
  
  // Voice Recorder States
  const [recorderState, setRecorderState] = useState('idle'); // idle, recording, paused, completed, playing, playing_paused
  const [recordTime, setRecordTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioUri, setAudioUri] = useState(null);
  const [oralHistoryAudio, setOralHistoryAudio] = useState(null);
  const [playbackError, setPlaybackError] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Timers Refs
  const recordingIntervalRef = React.useRef(null);
  const playbackIntervalRef = React.useRef(null);

  const uploadImageAsset = async (imageItem) => {
    try {
      const initRes = await recipeApiService.initiateUpload(
        'recipe_gallery',
        imageItem.fileName,
        imageItem.type,
        imageItem.fileSize,
        recipeDraft ? recipeDraft.draftId : null
      );

      const { asset, uploadInstructions } = initRes.data;
      const assetId = asset.assetId;

      await recipeApiService.uploadFile(
        uploadInstructions.uploadUrl,
        uploadInstructions.uploadMethod,
        uploadInstructions.fields,
        imageItem.uri,
        imageItem.type,
        imageItem.fileName,
        (progress) => {
          setImages(prev => prev.map(img => img.id === imageItem.id ? { ...img, progress } : img));
        }
      );

      await recipeApiService.completeUpload(assetId);

      setImages(prev => prev.map(img => img.id === imageItem.id ? {
        ...img,
        progress: 100,
        uploaded: true,
        assetId: assetId
      } : img));
    } catch (err) {
      console.error('Failed to upload image asset', err);
      setImages(prev => prev.map(img => img.id === imageItem.id ? { ...img, progress: 0, uploaded: false, error: true } : img));
      Alert.alert('Upload Error', `Failed to upload ${imageItem.fileName}. You can retry or continue offline.`);
    }
  };

  const uploadAudioCallback = async (audioItem) => {
    try {
      const initRes = await recipeApiService.initiateUpload(
        'oral_history',
        audioItem.fileName,
        audioItem.type,
        2 * 1024 * 1024,
        recipeDraft ? recipeDraft.draftId : null
      );

      const { asset, uploadInstructions } = initRes.data;
      const assetId = asset.assetId;

      await recipeApiService.uploadFile(
        uploadInstructions.uploadUrl,
        uploadInstructions.uploadMethod,
        uploadInstructions.fields,
        audioItem.uri,
        audioItem.type,
        audioItem.fileName
      );

      await recipeApiService.completeUpload(assetId);

      setOralHistoryAudio({
        ...audioItem,
        uploaded: true,
        assetId: assetId
      });
    } catch (err) {
      console.error('Failed to upload oral history audio', err);
      Alert.alert('Upload Error', 'Failed to upload audio narration. Please check connection and try again.');
    }
  };

  useEffect(() => {
    if (recipeDraft && !isHydrated) {
      if (recipeDraft.archiveImages) {
        setImages(recipeDraft.archiveImages);
      } else {
        // Hydrate from legacy toggles
        const initialImages = [];
        if (recipeDraft.hasHero) initialImages.push({ id: 'hero', name: 'thali.png', uri: 'thali.png', progress: 100, fileSize: 1.5 * 1024 * 1024, type: 'image/png', uploaded: false });
        if (recipeDraft.hasDish) initialImages.push({ id: 'dish', name: 'dal.png', uri: 'dal.png', progress: 100, fileSize: 0.8 * 1024 * 1024, type: 'image/jpeg', uploaded: false });
        if (recipeDraft.hasIngredients) initialImages.push({ id: 'ing', name: 'kesar.png', uri: 'kesar.png', progress: 100, fileSize: 1.2 * 1024 * 1024, type: 'image/jpeg', uploaded: false });
        if (recipeDraft.hasGallery) initialImages.push({ id: 'gal', name: 'chaicup.png', uri: 'chaicup.png', progress: 100, fileSize: 1.1 * 1024 * 1024, type: 'image/png', uploaded: false });
        setImages(initialImages);
      }

      if (recipeDraft.oralHistoryAudio) {
        setOralHistoryAudio(recipeDraft.oralHistoryAudio);
        setAudioUri(recipeDraft.oralHistoryAudio.uri);
        setRecordTime(recipeDraft.oralHistoryAudio.duration || 45);
        setRecorderState('completed');
      } else if (recipeDraft.audioUri) {
        const legacyAudio = {
          uri: recipeDraft.audioUri,
          fileName: 'oral_history_narration.mp4',
          duration: recipeDraft.audioDuration || 45,
          type: 'audio/mp4',
          uploaded: false,
          createdAt: new Date().toISOString()
        };
        setOralHistoryAudio(legacyAudio);
        setAudioUri(recipeDraft.audioUri);
        setRecordTime(recipeDraft.audioDuration || 45);
        setRecorderState('completed');
      }
      setIsHydrated(true);
    }
  }, [recipeDraft, isHydrated]);

  // Audio Recording Helpers
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const startRecording = async () => {
    if (recorderState === 'playing') {
      Alert.alert('Error', 'Please stop playback before recording.');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Edible India needs access to your microphone to record oral culinary history.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Microphone recording permission is required to capture oral histories.');
          return;
        }
      }

      setRecorderState('recording');
      setRecordTime(0);
      setAudioUri(null);
      setOralHistoryAudio(null);
      setPlaybackError(null);

      recordingIntervalRef.current = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 120) { // Limit to 2 minutes max
            clearInterval(recordingIntervalRef.current);
            setRecorderState('completed');
            const finishedAudio = {
              uri: 'oral_history_narration.mp4',
              fileName: 'oral_history_narration.mp4',
              duration: 120,
              type: 'audio/mp4',
              uploaded: false,
              createdAt: new Date().toISOString()
            };
            setAudioUri('oral_history_narration.mp4');
            setOralHistoryAudio(finishedAudio);
            uploadAudioCallback(finishedAudio);
            Alert.alert('Recording Limit', 'Maximum duration of 2 minutes reached.');
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      Alert.alert('Recording Failed', 'Unable to start audio recording. Please check microphone settings.');
    }
  };

  const pauseRecording = () => {
    setRecorderState('paused');
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (recorderState === 'playing') return;
    setRecorderState('recording');
    recordingIntervalRef.current = setInterval(() => {
      setRecordTime(prev => {
        if (prev >= 120) {
          clearInterval(recordingIntervalRef.current);
          setRecorderState('completed');
          const finishedAudio = {
            uri: 'oral_history_narration.mp4',
            fileName: 'oral_history_narration.mp4',
            duration: 120,
            type: 'audio/mp4',
            uploaded: false,
            createdAt: new Date().toISOString()
          };
          setAudioUri('oral_history_narration.mp4');
          setOralHistoryAudio(finishedAudio);
          uploadAudioCallback(finishedAudio);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setRecorderState('completed');
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    const finalDuration = recordTime || 5;
    const finishedAudio = {
      uri: 'oral_history_narration.mp4',
      fileName: 'oral_history_narration.mp4',
      duration: finalDuration,
      type: 'audio/mp4',
      uploaded: false,
      createdAt: new Date().toISOString()
    };
    setAudioUri('oral_history_narration.mp4');
    setOralHistoryAudio(finishedAudio);
    uploadAudioCallback(finishedAudio);
  };

  const startPlayback = () => {
    if (recorderState === 'recording') {
      Alert.alert('Error', 'Cannot play audio while recording.');
      return;
    }

    if (!audioUri && (!oralHistoryAudio || !oralHistoryAudio.uri)) {
      setPlaybackError('Unable to play this recording. Please try recording again.');
      return;
    }

    setPlaybackError(null);
    setRecorderState('playing');
    playbackIntervalRef.current = setInterval(() => {
      setPlaybackTime(prev => {
        if (prev >= recordTime) {
          clearInterval(playbackIntervalRef.current);
          setRecorderState('completed');
          setPlaybackTime(0);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pausePlayback = () => {
    setRecorderState('playing_paused');
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
  };

  const stopPlayback = () => {
    setRecorderState('completed');
    setPlaybackTime(0);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
  };

  const deleteAudio = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to discard this oral history recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setAudioUri(null);
            setOralHistoryAudio(null);
            setRecordTime(0);
            setPlaybackTime(0);
            setRecorderState('idle');
            setPlaybackError(null);
          }
        }
      ]
    );
  };

  const reRecord = () => {
    Alert.alert(
      'Re-record Voice Clip',
      'This will delete the existing recording. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Overwrite',
          style: 'destructive',
          onPress: () => {
            if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setAudioUri(null);
            setOralHistoryAudio(null);
            setRecordTime(0);
            setPlaybackTime(0);
            setPlaybackError(null);
            startRecording();
          }
        }
      ]
    );
  };

  // Image Gallery Reordering/Deletion
  const deleteImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[nextIndex];
    newImages[nextIndex] = temp;
    setImages(newImages);
  };

  const handleSelectImage = async (mode) => {
    let pickerLib;
    try {
      pickerLib = require('react-native-image-picker');
    } catch (e) {
      // not linked
    }

    if (pickerLib && pickerLib.launchImageLibrary) {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
      };

      const callback = (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Image Picker Error', response.errorMessage || 'Unknown error');
          return;
        }

        const picked = response.assets && response.assets[0];
        if (!picked) return;

        const sizeInMb = picked.fileSize ? picked.fileSize / (1024 * 1024) : 1.2;
        if (sizeInMb > 4.0) {
          Alert.alert('Validation Error', 'Image size must be less than 4 MB. Please choose a smaller image.');
          return;
        }

        const newId = Date.now().toString();
        const newImg = {
          id: newId,
          uri: picked.uri,
          fileName: picked.fileName || `image_${newId}.jpg`,
          name: picked.fileName || `image_${newId}.jpg`,
          type: picked.type || 'image/jpeg',
          fileSize: picked.fileSize || Math.round(sizeInMb * 1024 * 1024),
          progress: 0,
          uploaded: false
        };
        setImages(prev => [...prev, newImg]);
        uploadImageAsset(newImg);
      };

      if (mode === 'camera') {
        pickerLib.launchCamera(options, callback);
      } else {
        pickerLib.launchImageLibrary(options, callback);
      }
    } else {
      // Fallback picker simulation
      const mockFiles = [
        { uri: 'thali.png', type: 'image/png', size: 1.5, name: 'thali.png' },
        { uri: 'dal.png', type: 'image/jpeg', size: 0.8, name: 'dal.png' },
        { uri: 'kesar.png', type: 'image/jpeg', size: 5.2, name: 'kesar.png' }, // > 4MB
        { uri: 'chaicup.png', type: 'image/png', size: 1.1, name: 'chaicup.png' },
      ];

      const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      if (!picked) return;

      if (picked.size > 4.0) {
        Alert.alert('Validation Error', 'Image size must be less than 4 MB. Please choose a smaller image.');
        return;
      }

      const newId = Date.now().toString();
      const newImg = {
        id: newId,
        uri: picked.uri,
        fileName: picked.name,
        name: picked.name,
        type: picked.type,
        fileSize: picked.size * 1024 * 1024,
        progress: 0,
        uploaded: false
      };
      
      setImages(prev => [...prev, newImg]);
      uploadImageAsset(newImg);
    }
  };

  const saveCurrentDraft = (silent = true) => {
    const updatedDraft = {
      ...(recipeDraft || {}),
      archiveImages: images,
      oralHistoryAudio,
      audioUri: oralHistoryAudio ? oralHistoryAudio.uri : null,
      audioDuration: oralHistoryAudio ? oralHistoryAudio.duration : 0,
      hasHero: images.some(img => img.uri === 'thali.png'),
      hasDish: images.some(img => img.uri === 'dal.png'),
      hasIngredients: images.some(img => img.uri === 'kesar.png'),
      hasGallery: images.some(img => img.uri === 'chaicup.png'),
      heroImage: images.find(img => img.uri === 'thali.png') ? require('../../../assets/images/thali.png') : null,
      dishImage: images.find(img => img.uri === 'dal.png') ? require('../../../assets/images/dal.png') : null,
      ingredientsImage: images.find(img => img.uri === 'kesar.png') ? require('../../../assets/images/kesar.png') : null,
      galleryImage: images.find(img => img.uri === 'chaicup.png') ? require('../../../assets/images/chaicup.png') : null,
    };
    saveRecipeDraft(updatedDraft, 'RecipeMediaUpload');
    if (!silent) {
      Alert.alert(
        'Draft Saved',
        'Your progress has been saved locally.',
        [
          { text: 'Keep Curation', style: 'default' },
          { text: 'Continue Later', onPress: () => navigation.navigate('MainApp') }
        ]
      );
    }
    return updatedDraft;
  };

  const handleNext = () => {
    // Validate empty image uploads
    if (images.length === 0) {
      Alert.alert('Empty Image Upload', 'Please upload at least one traditional recipe image to progress.');
      return;
    }
    
    saveCurrentDraft(true);
    navigation.navigate('RecipePreview');
  };

  const getImageSource = (uri) => {
    if (!uri) return require('../../../assets/images/logo.png');
    if (uri.startsWith('http') || uri.startsWith('file://') || uri.startsWith('content://')) {
      return { uri };
    }
    if (uri === 'thali.png') return require('../../../assets/images/thali.png');
    if (uri === 'dal.png') return require('../../../assets/images/dal.png');
    if (uri === 'kesar.png') return require('../../../assets/images/kesar.png');
    if (uri === 'chaicup.png') return require('../../../assets/images/chaicup.png');
    return require('../../../assets/images/logo.png');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Add Recipe" showBack={true} showAvatar={false} />

      <TransitionView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>STEP 7 OF 8</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '87.5%' }]} />
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Media Archival</Text>
        <Text style={styles.sectionSubtitle}>
          Upload visual proof and audio histories. Tap blocks to select/simulate mock uploads.
        </Text>

        {/* Form Card */}
        <Card variant="default" style={styles.formCard}>
          <Text style={styles.label}>HERO COVER & DISH PREVIEWS *</Text>
          <Text style={styles.fieldDesc}>Attach up to 4 high-resolution traditional food images.</Text>

          <View style={styles.imagesGrid}>
            {images.map((img, idx) => (
              <View key={img.id} style={styles.imgCard}>
                <Image source={getImageSource(img.uri)} style={styles.gridThumb} />
                <View style={styles.imgCardInfo}>
                  <Text style={styles.imgCardName} numberOfLines={1}>{img.fileName || img.name}</Text>
                  {img.fileSize ? (
                    <Text style={styles.imgCardSize}>
                      {img.fileSize > 1024 * 1024 
                        ? `${(img.fileSize / (1024 * 1024)).toFixed(1)} MB` 
                        : `${(img.fileSize / 1024).toFixed(0)} KB`}
                    </Text>
                  ) : null}
                  {img.progress < 100 ? (
                    <View style={styles.progressRow}>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${img.progress}%` }]} />
                      </View>
                      <Text style={styles.progressPct}>{img.progress}%</Text>
                    </View>
                  ) : (
                    <View style={styles.imgActionRow}>
                      <View style={styles.arrowsRow}>
                        {idx > 0 && (
                          <TouchableOpacity onPress={() => moveImage(idx, -1)} style={styles.smallArrowBtn} activeOpacity={0.7}>
                            <ArrowLeft size={14} color={COLORS.secondary} />
                          </TouchableOpacity>
                        )}
                        {idx < images.length - 1 && (
                          <TouchableOpacity onPress={() => moveImage(idx, 1)} style={styles.smallArrowBtn} activeOpacity={0.7}>
                            <ArrowRight size={14} color={COLORS.secondary} />
                          </TouchableOpacity>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => deleteImage(img.id)} style={styles.smallRemoveBtn} activeOpacity={0.7}>
                        <Trash2 size={14} color={COLORS.error} style={{ marginRight: 4 }} />
                        <Text style={styles.removeText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {images.length < 4 && (
              <View style={styles.addButtonsRow}>
                <TouchableOpacity style={styles.mediaAddBtn} onPress={() => handleSelectImage('camera')} activeOpacity={0.7}>
                  <Camera size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.mediaBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaAddBtn} onPress={() => handleSelectImage('gallery')} activeOpacity={0.7}>
                  <ImageIcon size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.mediaBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Card>

        {/* Oral History Voice Recorder Section */}
        <Card variant="heritage" style={styles.recorderCard}>
          <Text style={styles.label}>ORAL HISTORY VOICE RECORDING</Text>
          <Text style={styles.recorderDesc}>
            Record local community elders, culinary custodians, or family members sharing the oral heritage of this recipe. Only 1 recording allowed.
          </Text>

          {/* Recording / Playback View */}
          <View style={styles.recordBox}>
            {/* Waveform / Status Line */}
            <View style={styles.waveformContainer}>
              {recorderState === 'recording' ? (
                <View style={styles.activeWaveform}>
                  <View style={[styles.waveBar, { height: 12 }]} />
                  <View style={[styles.waveBar, { height: 28 }]} />
                  <View style={[styles.waveBar, { height: 18 }]} />
                  <View style={[styles.waveBar, { height: 32 }]} />
                  <View style={[styles.waveBar, { height: 14 }]} />
                </View>
              ) : recorderState === 'playing' ? (
                <View style={styles.activeWaveform}>
                  <View style={[styles.waveBar, styles.playBar, { height: 10 }]} />
                  <View style={[styles.waveBar, styles.playBar, { height: 22 }]} />
                  <View style={[styles.waveBar, styles.playBar, { height: 12 }]} />
                  <View style={[styles.waveBar, styles.playBar, { height: 26 }]} />
                  <View style={[styles.waveBar, styles.playBar, { height: 8 }]} />
                </View>
              ) : (
                <Text style={styles.waveformPlaceholder}>
                  {audioUri ? 'Oral history audio track ready' : 'No audio recorded yet'}
                </Text>
              )}
            </View>

            {/* Timer */}
            <Text style={styles.timerText}>
              {audioUri && (recorderState === 'playing' || recorderState === 'playing_paused')
                ? formatTime(playbackTime) + ' / ' + formatTime(recordTime)
                : formatTime(recordTime)}
            </Text>

            {playbackError && (
              <Text style={styles.playbackErrorText}>⚠️ {playbackError}</Text>
            )}

            {/* Controls Row */}
            <View style={styles.controlsRow}>
              {/* Idle state -> Show Record Button */}
              {recorderState === 'idle' && (
                <TouchableOpacity style={styles.recordCircle} onPress={startRecording} activeOpacity={0.8}>
                  <Mic size={24} color={COLORS.white} />
                </TouchableOpacity>
              )}

              {/* Recording state -> Show Pause & Stop buttons */}
              {recorderState === 'recording' && (
                <View style={styles.dualControls}>
                  <TouchableOpacity style={styles.controlBtn} onPress={pauseRecording} activeOpacity={0.7}>
                    <Pause size={16} color={COLORS.secondary} style={{ marginRight: 4 }} />
                    <Text style={styles.controlText}>PAUSE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={stopRecording} activeOpacity={0.7}>
                    <Square size={16} color={COLORS.white} style={{ marginRight: 4 }} />
                    <Text style={[styles.controlText, styles.whiteText]}>STOP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Paused state -> Show Resume & Stop buttons */}
              {recorderState === 'paused' && (
                <View style={styles.dualControls}>
                  <TouchableOpacity style={styles.controlBtn} onPress={resumeRecording} activeOpacity={0.7}>
                    <Play size={16} color={COLORS.secondary} style={{ marginRight: 4 }} />
                    <Text style={styles.controlText}>RESUME</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={stopRecording} activeOpacity={0.7}>
                    <Square size={16} color={COLORS.white} style={{ marginRight: 4 }} />
                    <Text style={[styles.controlText, styles.whiteText]}>STOP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Completed / Playing states -> Show Play/Pause, Stop Playback, Re-record, and Delete */}
              {(recorderState === 'completed' || recorderState === 'playing' || recorderState === 'playing_paused') && (
                <View style={styles.tripleControls}>
                  <TouchableOpacity style={styles.controlBtn} onPress={deleteAudio} activeOpacity={0.7}>
                    <Trash2 size={15} color={COLORS.error} style={{ marginRight: 4 }} />
                    <Text style={styles.deleteText}>DELETE</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.playbackControlsRow}>
                    {recorderState === 'playing' ? (
                      <TouchableOpacity style={styles.playCircle} onPress={pausePlayback} activeOpacity={0.8}>
                        <Pause size={18} color={COLORS.white} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.playCircle} onPress={startPlayback} activeOpacity={0.8}>
                        <Play size={18} color={COLORS.white} style={{ marginLeft: 3 }} />
                      </TouchableOpacity>
                    )}

                    {(recorderState === 'playing' || recorderState === 'playing_paused') && (
                      <TouchableOpacity style={[styles.playCircle, styles.stopPlaybackBtn]} onPress={stopPlayback} activeOpacity={0.8}>
                        <Square size={14} color={COLORS.white} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity style={styles.controlBtn} onPress={reRecord} activeOpacity={0.7}>
                    <Mic size={15} color={COLORS.secondary} style={{ marginRight: 4 }} />
                    <Text style={styles.controlText}>RE-RECORD</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Footer Actions */}
        <View style={styles.buttonRow}>
          <Button
            title="Save Draft"
            variant="outline"
            onPress={() => saveCurrentDraft(false)}
            style={styles.actionBtn}
          />
          <Button
            title="Next Step"
            variant="primary"
            onPress={handleNext}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
      </TransitionView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fieldDesc: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  imagesGrid: {
    gap: SPACING.sm,
  },
  imgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.sm,
    gap: SPACING.md,
  },
  gridThumb: {
    width: 60,
    height: 60,
    borderRadius: BORDERS.radiusSm,
  },
  imgCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  imgCardName: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressPct: {
    ...FONTS.caption,
    fontSize: 11,
    color: COLORS.primary,
  },
  imgActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  arrowsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallArrowBtn: {
    padding: 6,
    backgroundColor: '#FAF5EE',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  smallRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#FFF0ED',
    borderRadius: 6,
  },
  removeText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.error,
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  mediaAddBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EE',
    borderColor: '#ECE3D7',
    borderWidth: 1.5,
    borderRadius: BORDERS.radiusMd,
  },
  mediaBtnText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  recorderCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  recorderDesc: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  recordBox: {
    backgroundColor: COLORS.white,
    borderColor: '#ECE3D7',
    borderWidth: 1,
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  waveformContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EE',
    marginBottom: SPACING.sm,
  },
  activeWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  playBar: {
    backgroundColor: COLORS.secondary,
  },
  waveformPlaceholder: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  timerText: {
    ...FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  controlsRow: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  recordCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  dualControls: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    backgroundColor: '#FAF5EE',
  },
  controlText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.secondary,
  },
  stopBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  whiteText: {
    color: COLORS.white,
  },
  tripleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.error,
  },
  playCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  playbackControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopPlaybackBtn: {
    backgroundColor: COLORS.error,
  },
  playbackErrorText: {
    ...FONTS.bodyBold,
    color: COLORS.error,
    fontSize: 12,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  imgCardSize: {
    ...FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  stepText: {
    ...FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    width: '100%',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    ...FONTS.titleLarge,
    fontSize: 26,
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  formCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  label: {
    ...FONTS.labelCaps,
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: SPACING.xs,
    letterSpacing: 1.2,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDERS.radiusMd,
    height: 110,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  heroUploadBox: {
    height: 160,
  },
  uploadedImg: {
    width: '100%',
    height: '100%',
  },
  boxContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  uploadIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  uploadTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  uploadDesc: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  gridItem: {
    flex: 1,
  },
  uploadIconSmall: {
    fontSize: 20,
    marginBottom: 2,
  },
  uploadTitleSmall: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.text,
  },
  selectedFeatureBox: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryBackground,
    borderStyle: 'solid',
    borderWidth: 2,
  },
  audioBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDERS.radiusMd,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginVertical: SPACING.sm,
  },
  audioIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    color: COLORS.primary,
  },
  audioTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
});

export default RecipeMediaUploadScreen;
