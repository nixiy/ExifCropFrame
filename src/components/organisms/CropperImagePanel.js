import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import CloseButton from '../atoms/CloseButton';
import { useExif } from '../../contexts/ExifContext';

/**
 * react-easy-cropを使用した画像プレビューコンポーネント
 * @param {Object} props - props
 * @param {Object} props.image - 画像情報
 * @param {Function} props.onClear - クリアボタンハンドラ
 * @param {Function} props.onCropChange - クロップ範囲変更ハンドラ
 * @param {number} props.aspect - アスペクト比
 * @param {boolean} props.showCrop - クロップ表示フラグ
 * @returns {JSX.Element} - 画像プレビューコンポーネント
 */
const CropperImagePanel = ({ image, onClear, onCropChange, showCrop = true, aspect }) => {
  const { rotation } = useExif();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [mediaDimensions, setMediaDimensions] = useState(null); // mediaSizeを保持するstate
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 }); // Add state for container dimensions

  // Effect to update container dimensions when the ref is available or changes
  useEffect(() => {
    if (containerRef.current) {
      setContainerDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, [containerRef.current]); // Dependency on containerRef.current

  const calculateAndSetZoom = useCallback(() => { // Remove currentMediaDimensions from params
    if (!mediaDimensions || !containerDimensions.width || !containerDimensions.height) return; // Use state for mediaDimensions and containerDimensions

    const { width, height } = mediaDimensions;
    const radians = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));

    // 回転後の画像のサイズを計算
    const rotatedWidth = width * cos + height * sin;
    const rotatedHeight = width * sin + height * cos;

    // コンテナのサイズを取得 (from state)
    const containerWidth = containerDimensions.width;
    const containerHeight = containerDimensions.height;

    // 画像がコンテナを覆うために必要なズームレベルを計算
    const zoomX = containerWidth / rotatedWidth;
    const zoomY = containerHeight / rotatedHeight;
    const newZoom = Math.max(zoomX, zoomY);

    console.log('calculateAndSetZoom:', {
      mediaDimensions,
      rotation,
      rotatedWidth,
      rotatedHeight,
      containerWidth,
      containerHeight,
      zoomX,
      zoomY,
      newZoom,
    });

    setZoom(newZoom);
  }, [rotation, mediaDimensions, containerDimensions]); // Add containerDimensions to dependencies

  const onMediaLoaded = useCallback((mediaSize) => {
    setMediaDimensions(mediaSize);
    // calculateAndSetZoom will be called by the useEffect below when mediaDimensions is set
  }, []); // No dependencies needed here, as it only sets state

  // rotation, mediaDimensions, or containerDimensions change, re-calculate zoom
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    calculateAndSetZoom(); // Call without arguments, as it uses state
  }, [rotation, mediaDimensions, containerDimensions, calculateAndSetZoom]); // Add containerDimensions to dependencies

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    if (onCropChange) {
      // react-image-cropの形式に合わせる
      onCropChange(
        {
          unit: 'px',
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
          aspect: aspect,
        },
        {
          width: image.width,
          height: image.height,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        },
        croppedAreaPixels
      );
    }
  }, [onCropChange, aspect, image]);

  if (!image) return null;

  return (
    <div className="image-preview" style={{ lineHeight: 0, fontSize: 0, width: '100%' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          lineHeight: 0,
          fontSize: 0,
          overflow: 'hidden',
          display: 'block',
          width: '100%',
          height: 500, // react-easy-cropには高さが必要
        }}
      >
        {showCrop ? (
          <Cropper
            image={image.previewSrc || image.src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={() => {}} // rotationは外部から制御するため空のハンドラ
            onMediaLoaded={onMediaLoaded}
            showGrid={true}
            restrictPosition={true}
          />
        ) : (
          <img
            src={image.previewSrc || image.src}
            alt={image.name}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              maxHeight: 500,
              lineHeight: 0,
              verticalAlign: 'bottom',
              transform: `rotate(${rotation}deg)`,
            }}
          />
        )}
        <CloseButton onClick={onClear} position="top-right" />
      </div>
    </div>
  );
};

export default CropperImagePanel;