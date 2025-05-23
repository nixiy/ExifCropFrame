import React, { useRef, useState, useEffect } from 'react';
import Cropper from 'react-cropper';
import CloseButton from '../atoms/CloseButton';

/**
 * react-cropperを使用した画像プレビューコンポーネント
 * @param {Object} props - props
 * @param {Object} props.image - 画像情報
 * @param {Function} props.onClear - クリアボタンハンドラ
 * @param {Function} props.onCropChange - クロップ範囲変更ハンドラ
 * @param {number} props.aspect - アスペクト比
 * @param {boolean} props.showCrop - クロップ表示フラグ
 * @returns {JSX.Element} - 画像プレビューコンポーネント
 */
const CropperImagePanel = ({ image, onClear, onCropChange, showCrop = true, aspect }) => {
  const cropperRef = useRef(null);
  // 画像のサイズ情報を保存
  const [imgData, setImgData] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    width: 0,
    height: 0,
  });

  /**
   * クロッパーインスタンスを取得
   * @returns {Object|null} - クロッパーインスタンス
   */
  const getCropper = () => {
    if (cropperRef.current) {
      return cropperRef.current.cropper;
    }
    return null;
  };
  // 画像のロード完了時
  const handleImageLoad = () => {
    const cropper = getCropper();
    if (cropper) {
      // 画像情報を取得
      const imageData = cropper.getImageData();
      setImgData({
        naturalWidth: imageData.naturalWidth,
        naturalHeight: imageData.naturalHeight,
        width: imageData.width,
        height: imageData.height,
      });

      // コンテナとキャンバスのデータを取得
      const canvasData = cropper.getCanvasData();

      // 最初にアスペクト比を設定
      cropper.setAspectRatio(aspect);

      // 画像とキャンバスのサイズを取得
      const canvasWidth = canvasData.width;
      const canvasHeight = canvasData.height;

      let cropBoxWidth, cropBoxHeight, cropBoxLeft, cropBoxTop;

      // 適切なクロップボックスサイズを計算
      if (aspect >= 1) {
        // 横長のアスペクト比
        cropBoxWidth = canvasWidth;
        cropBoxHeight = cropBoxWidth / aspect;

        // 高さが画像より大きい場合は調整
        if (cropBoxHeight > canvasHeight) {
          cropBoxHeight = canvasHeight;
          cropBoxWidth = cropBoxHeight * aspect;
        }

        cropBoxLeft = canvasData.left;
        cropBoxTop = canvasData.top + (canvasHeight - cropBoxHeight) / 2;
      } else {
        // 縦長のアスペクト比
        cropBoxHeight = canvasHeight;
        cropBoxWidth = cropBoxHeight * aspect;

        // 幅が画像より大きい場合は調整
        if (cropBoxWidth > canvasWidth) {
          cropBoxWidth = canvasWidth;
          cropBoxHeight = cropBoxWidth / aspect;
        }

        cropBoxLeft = canvasData.left + (canvasWidth - cropBoxWidth) / 2;
        cropBoxTop = canvasData.top;
      }

      // クロップボックスのサイズと位置を設定
      cropper.setCropBoxData({
        left: cropBoxLeft,
        top: cropBoxTop,
        width: cropBoxWidth,
        height: cropBoxHeight,
      });

      // 少し遅延させて確実に反映されるようにする
      setTimeout(() => {
        const cropData = cropper.getData(true);

        // ピクセル単位のクロップ情報
        const pixelCrop = {
          x: Math.round(cropData.x),
          y: Math.round(cropData.y),
          width: Math.round(cropData.width),
          height: Math.round(cropData.height),
        };

        // 画像参照情報
        const imageRef = {
          width: imageData.width,
          height: imageData.height,
          naturalWidth: imageData.naturalWidth,
          naturalHeight: imageData.naturalHeight,
        };

        // 親コンポーネントにクロップ情報を渡す
        if (onCropChange) {
          onCropChange(
            {
              unit: '%',
              x: (pixelCrop.x / imageRef.naturalWidth) * 100,
              y: (pixelCrop.y / imageRef.naturalHeight) * 100,
              width: (pixelCrop.width / imageRef.naturalWidth) * 100,
              height: (pixelCrop.height / imageRef.naturalHeight) * 100,
              aspect: aspect,
            },
            imageRef,
            pixelCrop
          );
        }
      }, 0); // 次のティックで処理実行
    }
  };
  // クロップ領域変更時のハンドラー
  const handleCropChange = () => {
    const cropper = getCropper();
    if (cropper && onCropChange) {
      const cropData = cropper.getData(true);

      const pixelCrop = {
        x: Math.round(cropData.x),
        y: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height),
      };

      const imageRef = {
        width: imgData.width,
        height: imgData.height,
        naturalWidth: imgData.naturalWidth,
        naturalHeight: imgData.naturalHeight,
      };

      onCropChange(
        // react-imageからreact-cropperへの互換性のために、percentCrop風のオブジェクトを作成
        {
          unit: '%',
          x: (pixelCrop.x / imageRef.naturalWidth) * 100,
          y: (pixelCrop.y / imageRef.naturalHeight) * 100,
          width: (pixelCrop.width / imageRef.naturalWidth) * 100,
          height: (pixelCrop.height / imageRef.naturalHeight) * 100,
          aspect: aspect,
        },
        imageRef,
        pixelCrop
      );
    }
  }; // アスペクト比が変更されたときの処理
  useEffect(() => {
    const cropper = getCropper();
    if (cropper && aspect) {
      // 画像とキャンバスのデータを取得
      const imageData = cropper.getImageData();
      const canvasData = cropper.getCanvasData();

      // 最初にアスペクト比を設定
      cropper.setAspectRatio(aspect);

      // 画像サイズを取得
      const imageWidth = imageData.width;
      const imageHeight = imageData.height;

      // 理想的なクロップボックスのサイズと位置を計算
      let cropBoxWidth, cropBoxHeight, cropBoxLeft, cropBoxTop;

      if (aspect >= 1) {
        // 横長のアスペクト比
        cropBoxWidth = Math.min(canvasData.width, imageWidth);
        cropBoxHeight = cropBoxWidth / aspect;

        // 高さが画像より大きい場合は調整
        if (cropBoxHeight > imageHeight) {
          cropBoxHeight = imageHeight;
          cropBoxWidth = cropBoxHeight * aspect;
        }

        cropBoxLeft = canvasData.left + (canvasData.width - cropBoxWidth) / 2;
        cropBoxTop = canvasData.top + (canvasData.height - cropBoxHeight) / 2;
      } else {
        // 縦長のアスペクト比
        cropBoxHeight = Math.min(canvasData.height, imageHeight);
        cropBoxWidth = cropBoxHeight * aspect;

        // 幅が画像より大きい場合は調整
        if (cropBoxWidth > imageWidth) {
          cropBoxWidth = imageWidth;
          cropBoxHeight = cropBoxWidth / aspect;
        }

        cropBoxLeft = canvasData.left + (canvasData.width - cropBoxWidth) / 2;
        cropBoxTop = canvasData.top + (canvasData.height - cropBoxHeight) / 2;
      }

      // クロップボックスが画像内に収まるように位置を調整
      if (cropBoxLeft < canvasData.left) cropBoxLeft = canvasData.left;
      if (cropBoxTop < canvasData.top) cropBoxTop = canvasData.top;

      // クロップボックスのサイズと位置を設定
      cropper.setCropBoxData({
        left: cropBoxLeft,
        top: cropBoxTop,
        width: cropBoxWidth,
        height: cropBoxHeight,
      });

      // クロップ変更処理を呼び出して親に通知
      setTimeout(handleCropChange, 0); // 次のティックで実行して、CropBoxDataが適用された後に実行
    }
  }, [aspect]);
  if (!image) return null;
  return (
    <div className="image-preview" style={{ lineHeight: 0, fontSize: 0 }}>
      <div
        style={{
          position: 'relative',
          lineHeight: 0,
          fontSize: 0,
          overflow: 'hidden',
          display: 'block',
        }}
      >
        {showCrop ? (
          <div
            style={{
              maxWidth: '100%',
              maxHeight: 500,
              lineHeight: 0,
              fontSize: 0,
              display: 'block',
            }}
          >
            <Cropper
              ref={cropperRef}
              src={image.previewSrc || image.src}
              style={{ height: 500, width: '100%', display: 'block', lineHeight: 0 }}
              aspectRatio={aspect}
              guides={true}
              autoCropArea={1}
              responsive={true}
              checkOrientation={true}
              ready={handleImageLoad}
              crop={handleCropChange}
              cropend={handleCropChange}
              cropmove={handleCropChange}
              zoomable={false}
              viewMode={1} // 0で自由、1で画像全体表示（拡大縮小可）
              minCropBoxWidth={10}
              minCropBoxHeight={10}
              background={false}
              movable={true}
              rotatable={false}
              scalable={false}
              dragMode="crop"
              toggleDragModeOnDblclick={false}
            />
          </div>
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
            }}
          />
        )}
        <CloseButton onClick={onClear} position="top-right" />
      </div>
    </div>
  );
};

export default CropperImagePanel;
