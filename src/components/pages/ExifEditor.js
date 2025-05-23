import React, { useState, useEffect, useCallback } from 'react';
import DropZone from '../organisms/DropZone';
import CropperImagePanel from '../organisms/CropperImagePanel';
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
  } = useImageProcessor(); /**
   * 初期クロップを設定する関数
   * 注: 実際のクロップ計算は ImagePreviewPanel コンポーネントに委任
   * @param {number} aspect - アスペクト比
   * @returns {Object} - 初期クロップ設定
   */
  const calculateInitialCrop = useCallback(aspect => {
    // アスペクト比がナンセンスな値の場合のフォールバック
    if (!aspect || aspect <= 0 || !Number.isFinite(aspect)) {
      aspect = 21 / 9; // デフォルト値
    }

    // 初期クロップはImagePreviewPanelで計算されるため、
    // ここでは最低限の情報だけ設定する
    return {
      unit: '%',
      aspect,
    };
  }, []);
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

        // CropperImagePanelで自動的に適切な初期サイズが設定されるため、
        // cropをリセットする（CropperImagePanelが内部で処理）
        setCropInfo(null);

        // EXIF情報の取得
        await fetchExifData(file);

        // オプション画面を即時表示
        setShowEmbedOptions(true);

        // クロップ表示を有効化
        setShowCrop(true);
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
  ]); // 画像変更時に初期化
  useEffect(() => {
    if (!image) return; // 画像がなければ何もしない

    // 基本的な初期クロップ設定
    // 実際のサイズと位置の計算はImagePreviewPanelに委任
  }, [image, aspect]); // 画像変更時のみ実行

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
