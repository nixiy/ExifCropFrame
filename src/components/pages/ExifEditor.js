import React, { useState, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);
  // カスタムフックの利用
  const { exifData, selectedExifTags, fetchExifData, resetExifData } = useExif();

  const {
    image,
    setImage,
    embeddedImage,
    isProcessing: isImageProcessing,
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
  // 開発環境用のサンプル画像
  const loadSampleImage = async () => {
    try {
      // サンプル画像のパス (publicフォルダ内の画像を直接参照)
      const sampleImgPath = '/images/sample-image.jpg'; // サンプル画像のURLをフェッチしてBlobに変換
      const response = await fetch(sampleImgPath);
      const blob = await response.blob();
      // Blobからファイルオブジェクトを作成
      const file = new File([blob], 'sample-image.jpg', { type: blob.type });
      handleFileSelect(file);
      // 自動的にオプション画面を即時表示
      setShowEmbedOptions(true);
    } catch (error) {
      console.error('サンプル画像のロード中にエラーが発生しました:', error);
    }
  };

  // 開発環境でのテスト用に自動的にサンプル画像をロード
  useEffect(() => {
    // 開発環境のみで実行し、画像がまだロードされていない場合のみ実行
    if (process.env.NODE_ENV === 'development' && !image) {
      loadSampleImage();
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
      // 待機なしで即時実行
      processImage(exifData, selectedExifTags);
    }
  }, [image, exifData, showEmbedOptions, embeddedImage, isImageProcessing]);

  /**
   * ファイル選択時のハンドラー
   * @param {File} file - 選択されたファイル
   */
  const handleFileSelect = async file => {
    try {
      // 画像情報の取得
      const imageInfo = await processImageFile(file);
      setImage(imageInfo);

      // EXIF情報の取得
      await fetchExifData(file);

      // オプション画面を即時表示
      setShowEmbedOptions(true);
    } catch (error) {
      console.error('ファイル処理中にエラーが発生しました:', error);
    }
  };

  /**
   * リセット処理
   */
  const handleClear = () => {
    resetImage();
    resetExifData();
    setShowEmbedOptions(false);
  };

  /**
   * 画像生成処理
   */
  const handleGenerateImage = () => {
    processImage(exifData, selectedExifTags);
  };

  return (
    <div>
      {' '}
      {process.env.NODE_ENV === 'development' && !image && (
        <div style={{ margin: '0 auto', maxWidth: '800px', textAlign: 'right' }}>
          <Button type="info" onClick={loadSampleImage}>
            テスト画像読込
          </Button>
        </div>
      )}
      <DropZone
        isDragging={isDragging}
        onDrop={({ isDragging }) => setIsDragging(isDragging)}
        onFileSelect={handleFileSelect}
        hasImage={!!image}
      >
        <ImagePreviewPanel
          image={image}
          onClear={handleClear}
          onEmbedClick={() => setShowEmbedOptions(true)}
          showEmbedOptions={showEmbedOptions}
          hasExifData={!!exifData && Object.keys(exifData).length > 0}
        />
        {showEmbedOptions && exifData && Object.keys(exifData).length > 0 && (
          <>
            {' '}
            <OptionPanel
              textColor={textColor}
              onTextColorChange={setTextColor}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              borderSize={borderSize}
              onBorderSizeChange={setBorderSize}
              onGenerateImage={handleGenerateImage}
              isProcessing={isImageProcessing}
            />{' '}
            <EmbeddedImagePreview embeddedImage={embeddedImage} onDownload={downloadImage} />
          </>
        )}
        {/* 非表示のCanvasエレメント */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DropZone>
    </div>
  );
};

export default ExifEditor;
