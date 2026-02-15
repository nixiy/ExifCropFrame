import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DropZone from '../organisms/DropZone';
import CropperImagePanel from '../organisms/CropperImagePanel';
import OptionPanel from '../organisms/OptionPanel';
import EmbeddedImagePreview from '../organisms/EmbeddedImagePreview';
import Button from '../atoms/Button';
import { useExif } from '../../contexts/ExifContext';
import { useImageProcessor } from '../../hooks/useImageProcessor';
import useGoogleAnalytics from '../../hooks/useGoogleAnalytics';
import { processImageFile } from '../../utils/imageProcessing';

/**
 * ExifEditor ページコンポーネント
 * @returns {JSX.Element} - ExifEditorコンポーネント
 */
const ExifEditor = () => {
  // 状態管理
  const [isDragging, setIsDragging] = useState(false);
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);
  const [cropInfo, setCropInfo] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [aspect, setAspect] = useState(21 / 9); // デフォルト21:9
  const [hasSampleLoaded, setHasSampleLoaded] = useState(false);

  // カスタムフックの利用
  const { exifData, selectedExifTags, fetchExifData, resetExifData } = useExif();
  const { sendEvent } = useGoogleAnalytics();
  const {
    image,
    setImage,
    embeddedImage,
    isProcessing,
    isDownloadProcessing,
    downloadProgress,
    canvasRef,
    textColor,
    setTextColor,
    backgroundColor,
    setBackgroundColor,
    borderSize,
    setBorderSize,
    addFrame,
    setAddFrame,
    processImage,
    downloadImage,
    resetImage,
  } = useImageProcessor();

  // EXIFデータが存在するか判定
  const hasExifData = useMemo(() =>
    exifData && Object.keys(exifData).length > 0,
    [exifData]);

  /**
   * ファイル選択時のハンドラー
   */
  const handleFileSelect = useCallback(
    async file => {
      try {
        const imageInfo = await processImageFile(file);
        setImage(imageInfo);

        sendEvent('select_image', {
          file_type: file.type,
          file_size: file.size,
          is_sample: false,
        });

        // 状態をリセット
        setCropInfo(null);
        setShowCrop(false);

        // EXIF情報の取得
        await fetchExifData(file);
        setShowEmbedOptions(true);
      } catch (error) {
        console.error('ファイル処理中にエラーが発生しました:', error);
        sendEvent('file_processing_error', { error_message: error.message });
      }
    },
    [fetchExifData, setImage, sendEvent]
  );

  /**
   * 開発環境用のサンプル画像読み込み
   */
  const loadSampleImage = useCallback(async () => {
    try {
      const sampleImgPath = '/images/sample-image.jpg';
      const response = await fetch(sampleImgPath);
      const blob = await response.blob();
      const file = new File([blob], 'sample-image.jpg', { type: blob.type });

      sendEvent('load_sample_image', { environment: process.env.NODE_ENV });
      handleFileSelect(file);
    } catch (error) {
      console.error('サンプル画像のロード中にエラーが発生しました:', error);
      sendEvent('sample_image_error', { error_message: error.message });
    }
  }, [handleFileSelect, sendEvent]);

  // 開発環境での自動サンプルロード
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !hasSampleLoaded && !image) {
      loadSampleImage();
      setHasSampleLoaded(true);
      setShowCrop(false);
    }
  }, [hasSampleLoaded, image, loadSampleImage]);

  // 画像とEXIFデータが揃ったら自動的にプレビュー生成
  useEffect(() => {
    if (image && exifData && canvasRef.current && showEmbedOptions && !embeddedImage && !isProcessing) {
      processImage(exifData, selectedExifTags);
    }
  }, [image, exifData, showEmbedOptions, embeddedImage, isProcessing, canvasRef, processImage, selectedExifTags]);

  /**
   * リセット処理
   */
  const handleClear = useCallback(() => {
    resetImage();
    resetExifData();
    setShowEmbedOptions(false);
    setCropInfo(null);
    setShowCrop(false);
  }, [resetImage, resetExifData]);

  /**
   * クロップ変更時のハンドラ
   */
  const handleCropChange = useCallback((newCrop, imgEl, pixelCrop) => {
    if (imgEl) {
      setCropInfo({ crop: newCrop, imageRef: imgEl, pixelCrop });
    }
  }, []);

  /**
   * 画像生成処理
   */
  const handleGenerateImage = useCallback(() => {
    processImage(exifData, selectedExifTags, cropInfo);
    sendEvent('generate_image', {
      has_exif: hasExifData,
      has_crop: !!cropInfo,
      selected_tags_count: selectedExifTags ? selectedExifTags.length : 0,
    });
  }, [processImage, exifData, selectedExifTags, cropInfo, sendEvent, hasExifData]);

  /**
   * ダウンロード時の処理
   */
  const handleDownload = useCallback(() => {
    downloadImage(exifData, selectedExifTags, cropInfo);
    sendEvent('download_image', {
      has_exif: hasExifData,
      has_crop: !!cropInfo,
      selected_tags_count: selectedExifTags ? selectedExifTags.length : 0,
    });
  }, [downloadImage, exifData, selectedExifTags, cropInfo, sendEvent, hasExifData]);

  /**
   * ドラッグ状態の変更ハンドラ
   */
  const handleDragChange = useCallback(({ isDragging }) => {
    setIsDragging(isDragging);
  }, []);

  return (
    <div>
      {process.env.NODE_ENV === 'development' && !image && (
        <div style={{ margin: '0 auto', maxWidth: '800px', textAlign: 'right' }}>
          <Button type="info" onClick={loadSampleImage}>
            テスト画像読込
          </Button>
        </div>
      )}
      <DropZone
        isDragging={isDragging}
        onDrop={handleDragChange}
        onFileSelect={handleFileSelect}
        hasImage={!!image}
      >
        <div className="editor-vertical-row editor-horizontal-row">
          <CropperImagePanel
            image={image}
            onClear={handleClear}
            onCropChange={handleCropChange}
            showCrop={showCrop}
            aspect={aspect}
          />
          {showEmbedOptions && hasExifData && (
            <OptionPanel
              textColor={textColor}
              onTextColorChange={setTextColor}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              borderSize={borderSize}
              onBorderSizeChange={setBorderSize}
              onGenerateImage={handleGenerateImage}
              isProcessing={isProcessing}
              addFrame={addFrame}
              onAddFrameChange={setAddFrame}
              showCrop={showCrop}
              onShowCropChange={setShowCrop}
              aspect={aspect}
              onAspectChange={setAspect}
            />
          )}
        </div>
        {showEmbedOptions && hasExifData && (
          <EmbeddedImagePreview
            embeddedImage={embeddedImage}
            onDownload={handleDownload}
            isDownloadProcessing={isDownloadProcessing}
            downloadProgress={downloadProgress}
          />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DropZone>
    </div>
  );
};

export default ExifEditor;
