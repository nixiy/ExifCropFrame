import React, { useState, useEffect, useCallback } from 'react';
import DropZone from '../organisms/DropZone';
import ImagePreviewPanel from '../organisms/ImagePreviewPanel';
import OptionPanel from '../organisms/OptionPanel';
import EmbeddedImagePreview from '../organisms/EmbeddedImagePreview';
import Button from '../atoms/Button';
import { useExif } from '../../contexts/ExifContext';
import { useImageProcessor } from '../../hooks/useImageProcessor';
import { processImageFile } from '../../utils/imageProcessing';

/**
 * ExifEditor ページコンポーネント
 * @returns {JSX.Element} - ExifEditorコンポーネント
 */
const ExifEditor = () => {
  // 状態管理
  const [isDragging, setIsDragging] = useState(false);
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);
  const [crop, setCrop] = useState();
  const [cropInfo, setCropInfo] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [aspect, setAspect] = useState(21 / 9); // デフォルト21:9
  const [hasSampleLoaded, setHasSampleLoaded] = useState(false); // サンプル画像読み込み済みフラグ

  // カスタムフックの利用
  const { exifData, selectedExifTags, fetchExifData, resetExifData } = useExif();
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
        // 画像の最大枠でcrop初期化
        setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 });

        // EXIF情報の取得
        await fetchExifData(file);

        // オプション画面を即時表示
        setShowEmbedOptions(true);
      } catch (error) {
        console.error('ファイル処理中にエラーが発生しました:', error);
      }
    },
    [fetchExifData, setImage]
  );

  /**
   * 開発環境用のサンプル画像読み込み
   */
  const loadSampleImage = useCallback(async () => {
    try {
      // サンプル画像のパス (publicフォルダ内の画像を直接参照)
      const sampleImgPath = '/images/sample-image.jpg';
      const response = await fetch(sampleImgPath);
      const blob = await response.blob();
      // Blobからファイルオブジェクトを作成
      const file = new File([blob], 'sample-image.jpg', { type: blob.type });
      handleFileSelect(file);
    } catch (error) {
      console.error('サンプル画像のロード中にエラーが発生しました:', error);
    }
  }, [handleFileSelect]);
  // 開発環境でのテスト用に自動的にサンプル画像をロード
  useEffect(() => {
    // 開発環境のみで実行し、まだサンプル画像を読み込んでいない場合のみ実行
    if (process.env.NODE_ENV === 'development' && !hasSampleLoaded && !image) {
      loadSampleImage();
      setHasSampleLoaded(true);
    }
  }, []); // 空の依存配列で初回のみ実行

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
      // 待機なしで即時実行
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

  // アスペクト比変更時にcropも即座に合わせる
  useEffect(() => {
    if (!crop) return;
    // 幅を基準に高さを再計算
    const newHeight = crop.width / aspect;
    // height が実際に変更された場合のみ setCrop を呼び出す
    // また、newHeightが有限数であること、および浮動小数点誤差を考慮する
    if (Number.isFinite(newHeight) && Math.abs((crop.height || 0) - newHeight) > 1e-5) {
      setCrop(prevCrop => ({ ...prevCrop, aspect, height: newHeight }));
    }
  }, [aspect, crop]);

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
    setCrop(newCrop);
    if (imgEl) {
      setCropInfo({ crop: newCrop, imageRef: imgEl, pixelCrop });
    }
  }, []);

  /**
   * 画像生成処理
   */
  const handleGenerateImage = useCallback(() => {
    processImage(exifData, selectedExifTags, cropInfo);
  }, [processImage, exifData, selectedExifTags, cropInfo]);

  /**
   * ダウンロード時の処理（元画像で再生成）
   */
  const handleDownload = useCallback(() => {
    downloadImage(exifData, selectedExifTags, cropInfo);
  }, [downloadImage, exifData, selectedExifTags, cropInfo]);

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
      )}{' '}
      <DropZone
        isDragging={isDragging}
        onDrop={handleDragChange}
        onFileSelect={handleFileSelect}
        hasImage={!!image}
      >
        <div className="editor-vertical-row editor-horizontal-row">
          <ImagePreviewPanel
            image={image}
            onClear={handleClear}
            crop={crop}
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
