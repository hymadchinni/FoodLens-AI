import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Video,
  VideoOff,
  Utensils,
  Mic,
  MicOff,
  Barcode,
  Sparkles,
  ArrowRightLeft,
  ShieldAlert,
  FileText,
  Zap,
} from 'lucide-react';
import {
  ScannedFoodCandidate,
  VerifiedFoodItem,
  DashboardBundle,
  UserAccountBundle,
} from '../types.ts';
import {
  VERIFIED_FOOD_DATABASE,
  calculateNutrientsForPortion,
  evaluateMealHealthAndSwaps,
  VerifiedFoodSeed,
} from '../data/indianAndUsdaFoods.ts';

interface FoodScannerModuleProps {
  account?: UserAccountBundle | null;
  foodsCatalog: VerifiedFoodItem[];
  selectedDate: string;
  getAuthToken: () => Promise<string | null>;
  onScanConfirmed: (updatedDashboard: DashboardBundle) => void;
}

const STUDIO_PRESETS = [
  {
    id: 'indian_thali',
    label: 'North Indian Thali',
    imageUrl: '/src/assets/images/hero_indian_thali_scan_1794224048744.jpg',
  },
  {
    id: 'south_indian_breakfast',
    label: 'Idli & Dosa Platter',
    imageUrl: '/src/assets/images/sample_scan_south_indian_1794224050613.jpg',
  },
  {
    id: 'high_protein_bowl',
    label: 'Paneer & Chana Bowl',
    imageUrl: '/src/assets/images/sample_scan_protein_bowl_1794224050378.jpg',
  },
];

const BARCODE_PRESETS = [
  {
    code: '8901058851243',
    label: 'Packaged Masala Oats (45g Pouch)',
    query: '180g masala oats',
  },
  {
    code: '8901262010023',
    label: 'Amul High-Protein Paneer Pack (100g)',
    query: '100g paneer tikka',
  },
  {
    code: '8904004400112',
    label: 'Roasted Chana Snack Pack (50g)',
    query: '50g roasted chana',
  },
];

// Ultra-fast client-side image compression (max 640px, JPEG 0.78) for immediate upload & recognition
async function compressAndResizeImage(
  file: File,
  maxDimension = 640,
  quality = 0.78
): Promise<{ dataUrl: string; savedPct: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const originalDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid or corrupted image file.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: originalDataUrl, savedPct: 0 });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        const savedPct = Math.max(
          0,
          Math.min(
            92,
            Math.round((1 - compressedUrl.length / originalDataUrl.length) * 100)
          )
        );
        resolve({ dataUrl: compressedUrl, savedPct });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// Helper to compute nutrients for either a catalog item or a custom AI-detected photo item
function computeItemNutrients(item: ScannedFoodCandidate, grams: number) {
  if (item.per100g) {
    const pseudoSeed: VerifiedFoodSeed = {
      code: item.foodCode,
      name: item.name,
      hindiName: item.hindiName,
      category: (item.category as any) || 'complete_dish',
      dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
      allergenTags: '',
      sourceDatabase: item.sourceDatabase,
      defaultServingG: item.estimatedPortionG || 150,
      servingUnitLabel: item.servingUnitLabel,
      ...item.per100g,
    };
    return calculateNutrientsForPortion(pseudoSeed, grams);
  }
  const verified =
    VERIFIED_FOOD_DATABASE.find((f) => f.code === item.foodCode) ||
    VERIFIED_FOOD_DATABASE[0];
  return calculateNutrientsForPortion(verified, grams);
}

export const FoodScannerModule: React.FC<FoodScannerModuleProps> = ({
  account,
  foodsCatalog,
  selectedDate,
  getAuthToken,
  onScanConfirmed,
}) => {
  const [scanInputMode, setScanInputMode] = useState<
    'photo' | 'text_voice' | 'barcode_ocr'
  >('photo');
  const [previewUrl, setPreviewUrl] = useState<string>(STUDIO_PRESETS[0].imageUrl);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [activePresetId, setActivePresetId] = useState<string | null>('indian_thali');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [compressionBadge, setCompressionBadge] = useState<string | null>(null);
  const [scanDurationLabel, setScanDurationLabel] = useState<string | null>(null);
  const [imageSummary, setImageSummary] = useState<string>(
    'North Indian Thali containing Steamed Basmati Rice, Yellow Dal Tadka, Chargrilled Paneer, Whole Wheat Roti, Fresh Kachumber Salad, and Plain Curd.'
  );

  // Text / Voice / Barcode state
  const [textQuery, setTextQuery] = useState<string>('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState<string>('8901058851243');

  // Camera & Voice hardware refs
  const [cameraState, setCameraState] = useState<
    'off' | 'live_stream' | 'simulated_viewfinder'
  >('off');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const latestTranscriptRef = useRef<string>('');

  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'snack' | 'dinner'>(
    'lunch'
  );
  const [detectedItems, setDetectedItems] = useState<ScannedFoodCandidate[]>([]);

  const catalog = foodsCatalog.length > 0 ? foodsCatalog : VERIFIED_FOOD_DATABASE;

  // Cleanly stop all media tracks and turn off camera hardware
  const turnOffCamera = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setCameraState('off');
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (cameraState === 'live_stream' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn('Video play warning:', err);
      });
    }
  }, [cameraState]);

  const turnOnCamera = async () => {
    setErrorMsg(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
        streamRef.current = stream;
        setCameraState('live_stream');
        return;
      } catch (err) {
        console.warn('Webcam hardware unavailable, opening optical viewfinder:', err);
      }
    }
    setCameraState('simulated_viewfinder');
  };

  const runAnalysisForPayload = useCallback(
    async (opts: {
      base64: string | null;
      mime: string;
      presetId: string | null;
      fileName?: string | null;
    }) => {
      const startTime = performance.now();
      setScanning(true);
      setErrorMsg(null);
      try {
        const token = await getAuthToken();
        const res = await fetch('/api/scan-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageBase64: opts.base64,
            mimeType: opts.mime,
            samplePresetId: opts.presetId,
            fileName: opts.fileName || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to analyze food image');
        }
        const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);
        setScanDurationLabel(`${elapsedSec}s`);
        setDetectedItems(data.items || []);
        if (data.imageSummary) {
          setImageSummary(data.imageSummary);
        }
      } catch (err: any) {
        setErrorMsg(
          err.message || 'Analysis failed. Please retry with a clearer photo.'
        );
      } finally {
        setScanning(false);
      }
    },
    [getAuthToken]
  );

  const runTextOrBarcodeScan = useCallback(
    async (inputString: string) => {
      const cleaned = inputString.trim();
      if (!cleaned) {
        setErrorMsg('Please type or speak any food item or meal first.');
        return;
      }
      const startTime = performance.now();
      setScanning(true);
      setErrorMsg(null);
      setDetectedItems([]);
      setImageSummary(`Analyzing "${cleaned}"...`);
      try {
        const token = await getAuthToken();
        const res = await fetch('/api/scan-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ queryText: cleaned }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to parse food description');
        }
        const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);
        setScanDurationLabel(`${elapsedSec}s`);
        setDetectedItems(data.items || []);
        if (data.imageSummary) {
          setImageSummary(data.imageSummary);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not parse meal text.');
      } finally {
        setScanning(false);
      }
    },
    [getAuthToken]
  );

  useEffect(() => {
    runAnalysisForPayload({
      base64: null,
      mime: 'image/jpeg',
      presetId: 'indian_thali',
    });
  }, [runAnalysisForPayload]);

  const processSelectedImageFile = async (file: File) => {
    turnOffCamera();
    setErrorMsg(null);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image exceeds 15 MB. Please choose a smaller photo.');
      return;
    }

    try {
      const { dataUrl, savedPct } = await compressAndResizeImage(file, 512, 0.74);
      setPreviewUrl(dataUrl);
      setImageBase64(dataUrl);
      setMimeType('image/jpeg');
      setActivePresetId(null);
      setUploadedFileName(file.name);
      setImgError(false);
      setDetectedItems([]);
      setImageSummary(`Analyzing uploaded photo (${file.name})...`);
      setCompressionBadge(
        savedPct > 0 ? `Fast-compressed (-${savedPct}%)` : 'Fast-optimized'
      );
      runAnalysisForPayload({
        base64: dataUrl,
        mime: 'image/jpeg',
        presetId: null,
        fileName: file.name,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedImageFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedImageFile(file);
    }
  };

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors
      }
      recognitionRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore stop errors
      }
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    setIsListeningVoice(false);
    setVoiceStatusText(null);
  }, []);

  const startAudioRecorderFallback = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(
        'Microphone access is not available on this device. Please type your food item below.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
        setIsListeningVoice(false);
        const chunks = audioChunksRef.current;
        if (chunks.length === 0) {
          setVoiceStatusText(null);
          return;
        }

        const audioBlob = new Blob(chunks, {
          type: recorder.mimeType || 'audio/webm',
        });
        setVoiceStatusText('Transcribing voice & calculating nutrition...');
        setScanning(true);
        setDetectedItems([]);
        const startTime = performance.now();

        try {
          const base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Audio read error'));
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
          });

          const token = await getAuthToken();
          const res = await fetch('/api/scan-voice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: audioBlob.type || 'audio/webm',
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Voice nutrition analysis failed');
          }
          const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);
          setScanDurationLabel(`${elapsedSec}s`);
          if (data.transcript) {
            setTextQuery(data.transcript);
          }
          setDetectedItems(data.items || []);
          if (data.imageSummary) {
            setImageSummary(data.imageSummary);
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Could not process voice audio.');
        } finally {
          setScanning(false);
          setVoiceStatusText(null);
        }
      };

      recorder.start();
      setIsListeningVoice(true);
      setVoiceStatusText('Listening via microphone... Click "Stop & Analyze" when done.');
    } catch {
      setIsListeningVoice(false);
      setVoiceStatusText(null);
      setErrorMsg(
        'Microphone permission was denied or no microphone was found. Please allow microphone access or type your food below.'
      );
    }
  };

  const toggleVoiceInput = () => {
    setErrorMsg(null);

    if (isListeningVoice) {
      const pendingTranscript = latestTranscriptRef.current.trim();
      stopVoiceInput();
      if (pendingTranscript) {
        setTextQuery(pendingTranscript);
        runTextOrBarcodeScan(pendingTranscript);
      }
      return;
    }

    latestTranscriptRef.current = '';
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      void startAudioRecorderFallback();
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setVoiceStatusText('Listening... Speak any food item or meal now.');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';
        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalStr += piece;
          } else {
            interim += piece;
          }
        }
        const combined = (finalStr || interim).trim();
        if (combined) {
          latestTranscriptRef.current = combined;
          setTextQuery(combined);
        }
        if (finalStr.trim()) {
          stopVoiceInput();
          runTextOrBarcodeScan(finalStr.trim());
        }
      };

      recognition.onerror = (ev: any) => {
        recognitionRef.current = null;
        if (
          ev?.error === 'network' ||
          ev?.error === 'service-not-allowed' ||
          ev?.error === 'language-not-supported'
        ) {
          void startAudioRecorderFallback();
          return;
        }
        setIsListeningVoice(false);
        setVoiceStatusText(null);
        if (ev?.error === 'not-allowed') {
          void startAudioRecorderFallback();
        } else if (ev?.error !== 'aborted') {
          setErrorMsg('No speech detected. Speak clearly or type your food below.');
        }
      };

      recognition.onend = () => {
        const finalSpoken = latestTranscriptRef.current.trim();
        setIsListeningVoice(false);
        setVoiceStatusText(null);
        recognitionRef.current = null;
        if (finalSpoken && !scanning) {
          runTextOrBarcodeScan(finalSpoken);
        }
      };

      recognition.start();
    } catch {
      void startAudioRecorderFallback();
    }
  };

  const captureCameraFrame = () => {
    if (cameraState === 'live_stream' && videoRef.current) {
      const canvas = document.createElement('canvas');
      const vw = videoRef.current.videoWidth || 640;
      const vh = videoRef.current.videoHeight || 480;
      const scale = Math.min(1, 640 / Math.max(vw, vh));
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        setPreviewUrl(dataUrl);
        setImageBase64(dataUrl);
        setMimeType('image/jpeg');
        setActivePresetId(null);
        setUploadedFileName('camera_capture.jpg');
        setImgError(false);
        setCompressionBadge('Camera frame optimized');
        turnOffCamera();
        runAnalysisForPayload({
          base64: dataUrl,
          mime: 'image/jpeg',
          presetId: null,
          fileName: 'camera_capture.jpg',
        });
        return;
      }
    }

    turnOffCamera();
    runAnalysisForPayload({
      base64: imageBase64,
      mime: mimeType,
      presetId: activePresetId || 'indian_thali',
      fileName: uploadedFileName,
    });
  };

  const selectStudioPreset = (preset: (typeof STUDIO_PRESETS)[0]) => {
    turnOffCamera();
    setErrorMsg(null);
    setCompressionBadge(null);
    setPreviewUrl(preset.imageUrl);
    setImageBase64(null);
    setUploadedFileName(null);
    setActivePresetId(preset.id);
    setImgError(false);
    runAnalysisForPayload({
      base64: null,
      mime: 'image/jpeg',
      presetId: preset.id,
    });
  };

  const handleFoodCodeChange = (index: number, newCode: string) => {
    const chosen =
      VERIFIED_FOOD_DATABASE.find((f) => f.code === newCode) ||
      VERIFIED_FOOD_DATABASE[0];
    setDetectedItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const grams = chosen.defaultServingG;
        const nutrients = calculateNutrientsForPortion(chosen, grams);
        return {
          ...item,
          foodCode: chosen.code,
          name: chosen.name,
          customLabel: undefined,
          hindiName: chosen.hindiName,
          whatItContains: `Contains ${nutrients.caloriesKcal} kcal, ${nutrients.proteinG}g protein, ${nutrients.carbsG}g carbs, ${nutrients.fatG}g fat`,
          category: chosen.category,
          sourceDatabase: chosen.sourceDatabase,
          servingUnitLabel: chosen.servingUnitLabel,
          confirmedPortionG: grams,
          nutrients,
          per100g: {
            caloriesPer100g: chosen.caloriesPer100g,
            proteinPer100g: chosen.proteinPer100g,
            carbsPer100g: chosen.carbsPer100g,
            fatPer100g: chosen.fatPer100g,
            fiberPer100g: chosen.fiberPer100g,
            sugarPer100g: chosen.sugarPer100g,
            sodiumMgPer100g: chosen.sodiumMgPer100g,
            ironMgPer100g: chosen.ironMgPer100g,
            calciumMgPer100g: chosen.calciumMgPer100g,
            vitaminAMcgPer100g: chosen.vitaminAMcgPer100g,
            vitaminCMgPer100g: chosen.vitaminCMgPer100g,
            vitaminDMcgPer100g: chosen.vitaminDMcgPer100g,
            vitaminB12McgPer100g: chosen.vitaminB12McgPer100g,
          },
        };
      })
    );
  };

  const handleCustomRename = (index: number, customName: string) => {
    setDetectedItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, customLabel: customName } : item
      )
    );
  };

  const handlePortionChange = (index: number, newGrams: number) => {
    const clampedGrams = Math.max(5, Math.min(1200, Math.round(newGrams || 0)));
    setDetectedItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return {
          ...item,
          confirmedPortionG: clampedGrams,
          nutrients: computeItemNutrients(item, clampedGrams),
        };
      })
    );
  };

  const handleApplyHealthSwap = (fromCode: string, toCode: string) => {
    const targetSeed = VERIFIED_FOOD_DATABASE.find((f) => f.code === toCode);
    if (!targetSeed) return;
    setDetectedItems((prev) =>
      prev.map((item) => {
        if (item.foodCode !== fromCode) return item;
        const grams = item.confirmedPortionG;
        const nutrients = calculateNutrientsForPortion(targetSeed, grams);
        return {
          ...item,
          foodCode: targetSeed.code,
          name: targetSeed.name,
          customLabel: undefined,
          hindiName: targetSeed.hindiName,
          whatItContains: `Swapped healthier choice: ${nutrients.caloriesKcal} kcal, ${nutrients.proteinG}g protein`,
          category: targetSeed.category,
          sourceDatabase: targetSeed.sourceDatabase,
          servingUnitLabel: targetSeed.servingUnitLabel,
          nutrients,
          per100g: {
            caloriesPer100g: targetSeed.caloriesPer100g,
            proteinPer100g: targetSeed.proteinPer100g,
            carbsPer100g: targetSeed.carbsPer100g,
            fatPer100g: targetSeed.fatPer100g,
            fiberPer100g: targetSeed.fiberPer100g,
            sugarPer100g: targetSeed.sugarPer100g,
            sodiumMgPer100g: targetSeed.sodiumMgPer100g,
            ironMgPer100g: targetSeed.ironMgPer100g,
            calciumMgPer100g: targetSeed.calciumMgPer100g,
            vitaminAMcgPer100g: targetSeed.vitaminAMcgPer100g,
            vitaminCMgPer100g: targetSeed.vitaminCMgPer100g,
            vitaminDMcgPer100g: targetSeed.vitaminDMcgPer100g,
            vitaminB12McgPer100g: targetSeed.vitaminB12McgPer100g,
          },
        };
      })
    );
  };

  const handleAddExtraFoodItem = () => {
    const defaultFood = VERIFIED_FOOD_DATABASE[5]; // Yellow Dal Tadka
    const grams = defaultFood.defaultServingG;
    setDetectedItems((prev) => [
      ...prev,
      {
        foodCode: defaultFood.code,
        name: defaultFood.name,
        hindiName: defaultFood.hindiName,
        whatItContains: 'Yellow lentils with cumin-garlic tempering, rich in plant protein & iron',
        category: defaultFood.category,
        sourceDatabase: defaultFood.sourceDatabase,
        servingUnitLabel: defaultFood.servingUnitLabel,
        estimatedPortionG: grams,
        confirmedPortionG: grams,
        confidenceScore: 0.99,
        visualRegion: 'User Added',
        nutrients: calculateNutrientsForPortion(defaultFood, grams),
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setDetectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmAndSaveMeal = async () => {
    if (detectedItems.length === 0) return;
    setConfirming(true);
    setErrorMsg(null);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/scans/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealType,
          logDate: selectedDate,
          imageSummary:
            imageSummary ||
            detectedItems.map((i) => i.customLabel || i.name).join(', '),
          detectionMethod:
            scanInputMode === 'photo'
              ? 'AI Vision Scanner'
              : scanInputMode === 'text_voice'
              ? 'Voice/Text Meal Parser'
              : 'Barcode/Label OCR',
          items: detectedItems.map((i) => ({
            foodCode: i.foodCode,
            foodName: i.customLabel || i.name,
            confirmedPortionG: i.confirmedPortionG,
            estimatedPortionG: i.estimatedPortionG,
            confidenceScore: i.confidenceScore,
            nutrients: i.nutrients,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to log meal');
      }
      onScanConfirmed(data.dashboard);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save meal.');
    } finally {
      setConfirming(false);
    }
  };

  const mealTotals = detectedItems.reduce(
    (acc, item) => ({
      calories: Math.round(acc.calories + item.nutrients.caloriesKcal),
      protein: Math.round((acc.protein + item.nutrients.proteinG) * 10) / 10,
      carbs: Math.round((acc.carbs + item.nutrients.carbsG) * 10) / 10,
      fat: Math.round((acc.fat + item.nutrients.fatG) * 10) / 10,
      fiber: Math.round((acc.fiber + item.nutrients.fiberG) * 10) / 10,
      sugar: Math.round((acc.sugar + item.nutrients.sugarG) * 10) / 10,
      sodium: Math.round(acc.sodium + item.nutrients.sodiumMg),
      iron: Math.round((acc.iron + item.nutrients.ironMg) * 10) / 10,
      calcium: Math.round(acc.calcium + item.nutrients.calciumMg),
      vitA: Math.round(acc.vitA + (item.nutrients.vitaminAMcg || 0)),
      vitC: Math.round((acc.vitC + (item.nutrients.vitaminCMg || 0)) * 10) / 10,
      vitD: Math.round((acc.vitD + (item.nutrients.vitaminDMcg || 0)) * 10) / 10,
      vitB12:
        Math.round((acc.vitB12 + (item.nutrients.vitaminB12Mcg || 0)) * 100) / 100,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      iron: 0,
      calcium: 0,
      vitA: 0,
      vitC: 0,
      vitD: 0,
      vitB12: 0,
    }
  );

  const mealInsights = evaluateMealHealthAndSwaps(detectedItems, {
    dietaryPreference: account?.profile.dietaryPreference,
    allergies: account?.profile.allergies,
    restrictions: account?.profile.restrictions,
    goalType: account?.goal.goalType,
  });

  const isCameraActive = cameraState !== 'off';

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-5 min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* LEFT PANEL: Upload / Camera / Voice / Barcode Controls */}
      <div className="lg:col-span-5 lg:h-full scroll-pane bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shrink-0">
        <div className="space-y-4">
          {/* Top Row: Scan Mode Tabs + Meal Slot Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setScanInputMode('photo')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                  scanInputMode === 'photo'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>Photo / Cam</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  turnOffCamera();
                  setScanInputMode('text_voice');
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                  scanInputMode === 'text_voice'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>Text / Voice</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  turnOffCamera();
                  setScanInputMode('barcode_ocr');
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                  scanInputMode === 'barcode_ocr'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Barcode className="w-3 h-3" />
                <span>Barcode / Label</span>
              </button>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setMealType(slot)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    mealType === slot
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-900 dark:text-red-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-700 dark:text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  runAnalysisForPayload({
                    base64: imageBase64,
                    mime: mimeType,
                    presetId: activePresetId || 'indian_thali',
                    fileName: uploadedFileName,
                  })
                }
                className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 rounded text-[10px] font-semibold shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* MODE 1: PHOTO / LIVE CAMERA / DRAG-AND-DROP */}
          {scanInputMode === 'photo' && (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                className={`aspect-16/10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border transition-all ${
                  isDraggingOver
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-200/60 dark:border-slate-700'
                }`}
              >
                {cameraState === 'live_stream' ? (
                  <div className="w-full h-full relative bg-slate-950">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-4 border border-white/40 rounded-lg pointer-events-none" />
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={captureCameraFrame}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        Capture & Scan Now
                      </button>
                      <button
                        type="button"
                        onClick={turnOffCamera}
                        className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        Turn Off Camera
                      </button>
                    </div>
                  </div>
                ) : cameraState === 'simulated_viewfinder' ? (
                  <div className="w-full h-full relative bg-slate-950 flex flex-col justify-between p-4">
                    {!imgError && previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Camera viewfinder"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover opacity-85"
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white bg-black/50 px-2.5 py-1 rounded-md w-fit">
                      <span>CAMERA ON · AI OPTICAL VIEWFINDER</span>
                    </div>
                    <div className="relative z-10 inset-x-6 h-28 border border-emerald-400/70 rounded-lg pointer-events-none mx-4" />
                    <div className="relative z-10 flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={captureCameraFrame}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        Capture & Scan Now
                      </button>
                      <button
                        type="button"
                        onClick={turnOffCamera}
                        className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        Turn Off Camera
                      </button>
                    </div>
                  </div>
                ) : !imgError && previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Food preview"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 bg-slate-900/75 text-white text-[10px] rounded">
                        Upload or drop any photo
                      </span>
                      {compressionBadge && (
                        <span className="px-2 py-0.5 bg-emerald-800/90 text-white text-[10px] font-mono rounded">
                          {compressionBadge}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                    <Utensils className="w-6 h-6" />
                    <span className="text-[11px]">Drop any photo or click Upload</span>
                  </div>
                )}

                {scanning && (
                  <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <div className="px-3.5 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-md flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                      <span>Recognizing photo & calculating nutrients...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload & Camera Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Any Photo</span>
                </button>

                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={turnOffCamera}
                    className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <VideoOff className="w-3.5 h-3.5" />
                    <span>Turn Off Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={turnOnCamera}
                    className="py-2.5 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
                  </button>
                )}
              </div>

              {/* Sample Plates */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-400 mb-2">
                  Or Test with Instant Sample Plates
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {STUDIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => selectStudioPreset(preset)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                        activePresetId === preset.id && !isCameraActive
                          ? 'bg-slate-900 dark:bg-emerald-700 text-white'
                          : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span className="text-[10px] opacity-75">
                        {activePresetId === preset.id && !isCameraActive
                          ? 'Active'
                          : 'Select →'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MODE 2: TEXT & VOICE INPUT */}
          {scanInputMode === 'text_voice' && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Type or Speak Any Food Item
                  </label>
                  <div className="flex items-center gap-1.5">
                    {textQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => setTextQuery('')}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isListeningVoice
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                          : 'bg-slate-900 dark:bg-emerald-700 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isListeningVoice ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Stop &amp; Analyze</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Start Voice Input</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {voiceStatusText && (
                  <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>{voiceStatusText}</span>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (textQuery.trim()) {
                        runTextOrBarcodeScan(textQuery);
                      }
                    }
                  }}
                  placeholder="Type or speak any food in the world (e.g., 2 samosas and 1 cup chai, 150g grilled chicken, 1 medium banana, pizza slice)..."
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />

                <div className="flex flex-wrap gap-1.5">
                  {[
                    '2 aloo paratha + 100g curd',
                    '150g chicken biryani + salad',
                    '2 samosa + 1 cup masala chai',
                    '3 idli + 1 bowl sambar',
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setTextQuery(sample);
                        runTextOrBarcodeScan(sample);
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={scanning || !textQuery.trim()}
                onClick={() => runTextOrBarcodeScan(textQuery)}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Food &amp; Nutrition...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Calculate Nutrition Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* MODE 3: BARCODE & NUTRITION LABEL OCR */}
          {scanInputMode === 'barcode_ocr' && (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 rounded-xl space-y-2.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Packaged Food Barcode (EAN-13) or Label OCR
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Enter EAN-13 barcode or label text..."
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Scan Label Photo</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  Verified Packaged Indian Food Barcodes:
                </p>
                <div className="space-y-1.5">
                  {BARCODE_PRESETS.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => {
                        setBarcodeInput(b.code);
                        runTextOrBarcodeScan(b.query);
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-left flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {b.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        #{b.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Primary Scan Trigger + Required Medical/Privacy Disclaimer */}
        <div className="space-y-2.5">
          {scanInputMode === 'photo' && (
            <button
              type="button"
              disabled={scanning}
              onClick={() =>
                runAnalysisForPayload({
                  base64: imageBase64,
                  mime: mimeType,
                  presetId: activePresetId,
                  fileName: uploadedFileName,
                })
              }
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{scanning ? 'Scanning Photo...' : 'Re-Scan Current Photo'}</span>
            </button>
          )}
          <p className="text-[10px] text-slate-400 leading-relaxed text-center">
            Nutrition values are AI & IFCT/USDA estimates, not medical advice. Uploaded
            food photos are processed in-memory and never sold or shared.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Immediate Photo Recognition Summary + Full Nutrient Contents + Items */}
      <div className="lg:col-span-7 lg:h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Photo Recognition & Nutrition ({detectedItems.length} items)
                </h2>
                {scanDurationLabel && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                    <Zap className="w-2.5 h-2.5" />
                    {scanDurationLabel}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Instant breakdown of what is in the photo and all nutrients it contains
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {detectedItems.length > 0 && (
              <div
                title={mealInsights.scoreReason}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
                  mealInsights.healthScore >= 7.5
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : mealInsights.healthScore >= 5.5
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}
              >
                <span>Score: {mealInsights.healthScore}/10</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddExtraFoodItem}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dish</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 scroll-pane p-5 space-y-3">
          {/* IMMEDIATE PHOTO RECOGNITION SUMMARY CARD ("WHAT IS IN THE PHOTO & WHAT IT CONTAINS") */}
          {detectedItems.length > 0 && (
            <div className="p-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    What is in this photo
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-snug mt-0.5">
                    {imageSummary}
                  </p>
                </div>
              </div>

              {/* Complete Macro + Vitamin/Mineral Contents Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-700/80 font-mono tabular-nums">
                <div className="bg-slate-800/90 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Calories
                  </span>
                  <strong className="text-xs text-white">
                    {mealTotals.calories} kcal
                  </strong>
                </div>
                <div className="bg-slate-800/90 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Protein
                  </span>
                  <strong className="text-xs text-emerald-400">
                    {mealTotals.protein}g
                  </strong>
                </div>
                <div className="bg-slate-800/90 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Carbs
                  </span>
                  <strong className="text-xs text-white">
                    {mealTotals.carbs}g
                  </strong>
                </div>
                <div className="bg-slate-800/90 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Fat
                  </span>
                  <strong className="text-xs text-white">{mealTotals.fat}g</strong>
                </div>
                <div className="bg-slate-800/90 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Fiber / Sugar
                  </span>
                  <strong className="text-xs text-white">
                    {mealTotals.fiber}g / {mealTotals.sugar}g
                  </strong>
                </div>
                <div className="bg-slate-800/90 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Sodium
                  </span>
                  <strong className="text-xs text-white">
                    {mealTotals.sodium}mg
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-slate-300">
                <span className="text-emerald-400 font-sans font-semibold">
                  Vitamins & Minerals:
                </span>
                <span>Iron {mealTotals.iron}mg</span>
                <span>·</span>
                <span>Calcium {mealTotals.calcium}mg</span>
                <span>·</span>
                <span>Vit A {mealTotals.vitA}µg</span>
                <span>·</span>
                <span>Vit C {mealTotals.vitC}mg</span>
                <span>·</span>
                <span>Vit D {mealTotals.vitD}µg</span>
                <span>·</span>
                <span>Vit B12 {mealTotals.vitB12}µg</span>
              </div>
            </div>
          )}

          {/* Diet / Allergy / Health-Condition Conflict Warnings */}
          {mealInsights.conflictAlerts.length > 0 && (
            <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>Personalized Diet, Allergy & Health Alerts</span>
              </div>
              {mealInsights.conflictAlerts.map((alert, idx) => (
                <p
                  key={idx}
                  className="text-[11px] text-amber-800 dark:text-amber-300 pl-5"
                >
                  • {alert.message}
                </p>
              ))}
            </div>
          )}

          {detectedItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xs text-slate-400">
                Upload any photo or open the camera to immediately see what is in
                the photo and its full nutrition.
              </p>
            </div>
          ) : (
            detectedItems.map((item, idx) => {
              const seed = VERIFIED_FOOD_DATABASE.find(
                (f) => f.code === item.foodCode
              );
              const baseServing = seed
                ? seed.defaultServingG
                : item.estimatedPortionG || 150;
              const smallGrams = Math.round((baseServing * 0.7) / 5) * 5;
              const medGrams = baseServing;
              const largeGrams = Math.round((baseServing * 1.35) / 5) * 5;
              const confidencePct = Math.round(
                (item.confidenceScore > 1
                  ? item.confidenceScore
                  : item.confidenceScore * 100) || 95
              );

              return (
                <div
                  key={`${item.foodCode}-${item.name}-${idx}`}
                  className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 rounded-xl space-y-2 transition-colors"
                >
                  {/* Top Row: Recognized Dish Selector / Custom Name + AI Confidence % + Portion Size Presets (S/M/L) + Grams */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={item.foodCode}
                      onChange={(e) => handleFoodCodeChange(idx, e.target.value)}
                      className="flex-1 min-w-[170px] px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                    >
                      {item.foodCode === 'custom_detected' && (
                        <option value="custom_detected">
                          {item.customLabel || item.name}{' '}
                          {item.hindiName ? `(${item.hindiName})` : ''}
                        </option>
                      )}
                      {catalog.map((f) => (
                        <option key={f.code} value={f.code}>
                          {f.name} ({f.hindiName})
                        </option>
                      ))}
                    </select>

                    {/* AI Confidence Badge */}
                    <span
                      title={`AI Detection Confidence (${item.visualRegion})`}
                      className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 rounded-md text-[10px] font-mono font-semibold text-emerald-800 dark:text-emerald-300"
                    >
                      {confidencePct}% AI
                    </span>

                    {/* Small / Medium / Large Portion Preset Buttons */}
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-[10px] font-semibold">
                      {[
                        { label: 'S', grams: smallGrams, title: `Small (${smallGrams}g)` },
                        { label: 'M', grams: medGrams, title: `Medium (${medGrams}g)` },
                        { label: 'L', grams: largeGrams, title: `Large (${largeGrams}g)` },
                      ].map((preset) => {
                        const isPresetActive =
                          Math.abs(item.confirmedPortionG - preset.grams) <= 5;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            title={preset.title}
                            onClick={() => handlePortionChange(idx, preset.grams)}
                            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                              isPresetActive
                                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Grams Stepper */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          handlePortionChange(idx, item.confirmedPortionG - 20)
                        }
                        className="px-1 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={5}
                        max={1200}
                        step={5}
                        value={item.confirmedPortionG}
                        onChange={(e) =>
                          handlePortionChange(idx, Number(e.target.value))
                        }
                        className="w-12 text-center text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
                      />
                      <span className="text-[11px] text-slate-400">g</span>
                      <button
                        type="button"
                        onClick={() =>
                          handlePortionChange(idx, item.confirmedPortionG + 20)
                        }
                        className="px-1 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      aria-label="Remove item"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* What this item contains (Ingredients & Nutrients description) */}
                  {item.whatItContains && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Contains:{' '}
                      </span>
                      {item.whatItContains}
                    </p>
                  )}

                  {/* Custom Item Rename Toggle */}
                  {editingIndex === idx ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.customLabel ?? item.name}
                        onChange={(e) => handleCustomRename(idx, e.target.value)}
                        placeholder="Custom dish name..."
                        className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  ) : null}

                  {/* Second Row: Slider + Primary Macros */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono tabular-nums">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={20}
                        max={450}
                        step={5}
                        value={Math.min(450, item.confirmedPortionG)}
                        onChange={(e) =>
                          handlePortionChange(idx, Number(e.target.value))
                        }
                        className="w-28 sm:w-36 accent-slate-900 dark:accent-emerald-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingIndex(editingIndex === idx ? null : idx)
                        }
                        className="text-[10px] font-sans text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer"
                      >
                        {item.customLabel ? `"${item.customLabel}"` : 'Rename'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.nutrients.caloriesKcal} kcal
                      </span>
                      <span>·</span>
                      <span className="text-emerald-800 dark:text-emerald-400 font-semibold">
                        {item.nutrients.proteinG}g P
                      </span>
                      <span>·</span>
                      <span>{item.nutrients.carbsG}g C</span>
                      <span>·</span>
                      <span>{item.nutrients.fatG}g F</span>
                    </div>
                  </div>

                  {/* Third Row: Micros, Fiber, Sugar, Sodium & Vitamins (A, C, D, B12, Iron, Calcium) */}
                  <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Fiber: {item.nutrients.fiberG}g</span>
                    <span>Sugar: {item.nutrients.sugarG}g</span>
                    <span>Sodium: {item.nutrients.sodiumMg}mg</span>
                    <span>Iron: {item.nutrients.ironMg}mg</span>
                    <span>Calcium: {item.nutrients.calciumMg}mg</span>
                    <span>Vit A: {item.nutrients.vitaminAMcg || 0}µg</span>
                    <span>Vit C: {item.nutrients.vitaminCMg || 0}mg</span>
                    <span>Vit D: {item.nutrients.vitaminDMcg || 0}µg</span>
                    <span>Vit B12: {item.nutrients.vitaminB12Mcg || 0}µg</span>
                  </div>
                </div>
              );
            })
          )}

          {/* Smart AI Insight Card: Health Score Explanation & 2-3 Healthier Swaps */}
          {detectedItems.length > 0 && mealInsights.healthierSwaps.length > 0 && (
            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  Healthier Swaps
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {mealInsights.scoreReason}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {mealInsights.healthierSwaps.map((swap, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Swap <span className="underline">{swap.fromFoodName}</span> →{' '}
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {swap.toFoodName}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {swap.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyHealthSwap(swap.fromFoodCode, swap.toFoodCode)
                      }
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Swap (-{swap.caloriesSavedKcal} kcal)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pinned Bottom Summary & Confirm Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3.5 font-mono tabular-nums text-xs">
            <div>
              <span className="text-slate-400 font-sans">Total </span>
              <strong className="text-white text-sm">
                {mealTotals.calories} kcal
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-sans">P </span>
              <strong className="text-emerald-400">{mealTotals.protein}g</strong>
            </div>
            <div>
              <span className="text-slate-400 font-sans">C </span>
              <strong className="text-white">{mealTotals.carbs}g</strong>
            </div>
            <div>
              <span className="text-slate-400 font-sans">F </span>
              <strong className="text-white">{mealTotals.fat}g</strong>
            </div>
            <div className="hidden md:block">
              <span className="text-slate-400 font-sans">Fib </span>
              <strong className="text-slate-200">{mealTotals.fiber}g</strong>
            </div>
          </div>

          <button
            type="button"
            disabled={confirming || detectedItems.length === 0}
            onClick={handleConfirmAndSaveMeal}
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {confirming ? 'Logging...' : `Confirm & Log to ${mealType}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
