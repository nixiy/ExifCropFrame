import React, { useState, useEffect, useCallback } from 'react';
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
  const [hasSampleLoaded, setHasSampleLoaded] = useState(false); // サンプル画像読み込み済みフラグ

  // カスタムフックの利用
  const { exifData, selectedExifTags, fetchExifData, resetExifData } = useExif();
  const { sendEvent } = useGoogleAnalytics();
  const {
    image,
    setImage,
    embeddedImage,
    isProcessing: isImageProcessing,
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
  /**
   * ファイル選択時のハンドラー
   * @param {File} file - 選択されたファイル
   */
  const handleFileSelect = useCallback(
    async file => {
      try {
        // 画像情報の取得
        const imageInfo = await processImageFile(file);
        setImage(imageInfo);

        // Google Analyticsにイベント送信
        sendEvent('select_image', {
          file_type: file.type,
          file_size: file.size,
          is_sample: false,
        });

        // CropperImagePanelで自動的に適切な初期サイズが設定されるため、
        // cropをリセットする（CropperImagePanelが内部で処理）
        setCropInfo(null);

        // EXIF情報の取得
        await fetchExifData(file); // オプション画面を即時表示
        setShowEmbedOptions(true);

        setShowCrop(false);
      } catch (error) {
        console.error('ファイル処理中にエラーが発生しました:', error);

        // エラー発生時もイベント送信
        sendEvent('file_processing_error', {
          error_message: error.message,
        });
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

      // サンプル画像読み込み時のイベント送信
      sendEvent('load_sample_image', {
        environment: process.env.NODE_ENV,
      });

      handleFileSelect(file);
    } catch (error) {
      console.error('サンプル画像のロード中にエラーが発生しました:', error);

      // エラー発生時もイベント送信
      sendEvent('sample_image_error', {
        error_message: error.message,
      });
    }
  }, [handleFileSelect, sendEvent]);
  // 開発環境でのテスト用に自動的にサンプル画像をロード
  useEffect(() => {
    // 開発環境のみで実行し、まだサンプル画像を読み込んでいない場合のみ実行
    if (process.env.NODE_ENV === 'development' && !hasSampleLoaded && !image) {
      loadSampleImage();
      setHasSampleLoaded(true);
      // クロップ表示を明示的に無効化
      setShowCrop(false);
    }
  }, []);

  // 画像とEXIFデータが揃ったら自動的に画像生成を実行
  useEffect(() => {
    // 画像とEXIFデータが存在し、canvasが準備できている場合
    if (
      image &&
      exifData &&
      canvasRef.current &&
      showEmbedOptions &&
      !embeddedImage &&
      !isImageProcessing
    ) {
      processImage(exifData, selectedExifTags);
    }
  }, [
    image,
    exifData,
    showEmbedOptions,
    embeddedImage,
    isImageProcessing,
    canvasRef,
    processImage,
    selectedExifTags,
  ]);
  /**
   * リセット処理
   */
  const handleClear = useCallback(() => {
    resetImage();
    resetExifData();
    setShowEmbedOptions(false);
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

    // 画像生成イベントを送信
    sendEvent('generate_image', {
      has_exif: !!exifData && Object.keys(exifData).length > 0,
      has_crop: !!cropInfo,
      selected_tags_count: selectedExifTags ? selectedExifTags.length : 0,
    });
  }, [processImage, exifData, selectedExifTags, cropInfo, sendEvent]);
  /**
   * ダウンロード時の処理（元画像で再生成）
   */
  const handleDownload = useCallback(() => {
    downloadImage(exifData, selectedExifTags, cropInfo);

    // ダウンロードイベントを送信
    sendEvent('download_image', {
      has_exif: !!exifData && Object.keys(exifData).length > 0,
      has_crop: !!cropInfo,
      selected_tags_count: selectedExifTags ? selectedExifTags.length : 0,
    });
  }, [downloadImage, exifData, selectedExifTags, cropInfo, sendEvent]);

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
          {showEmbedOptions && exifData && Object.keys(exifData).length > 0 && (
            <OptionPanel
              textColor={textColor}
              onTextColorChange={setTextColor}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              borderSize={borderSize}
              onBorderSizeChange={setBorderSize}
              onGenerateImage={handleGenerateImage}
              isProcessing={isImageProcessing}
              addFrame={addFrame}
              onAddFrameChange={setAddFrame}
              showCrop={showCrop}
              onShowCropChange={setShowCrop}
              aspect={aspect}
              onAspectChange={setAspect}
            />
          )}
        </div>
        {showEmbedOptions && exifData && Object.keys(exifData).length > 0 && (
          <EmbeddedImagePreview
            embeddedImage={embeddedImage}
            onDownload={handleDownload}
            isDownloadProcessing={isDownloadProcessing}
            downloadProgress={downloadProgress}
          />
        )}
        {/* 非表示のCanvasエレメント */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DropZone>
    </div>
  );
};

export default ExifEditor;
