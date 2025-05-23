import React, { useRef, useState, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CloseButton from '../atoms/CloseButton';

/**
 * 画像プレビューコンポーネント
 * @param {Object} props - props
 * @param {Object} props.image - 画像情報
 * @param {Function} props.onClear - クリアボタンハンドラ
 * @param {Function} props.onCropChange - クロップ範囲変更ハンドラ
 * @param {Object} props.crop - クロップ範囲
 * @param {boolean} props.isDownloadProcessing - ダウンロード画像生成中フラグ
 * @param {number} props.downloadProgress - ダウンロード進捗（%）
 * @returns {JSX.Element} - 画像プレビューコンポーネント
 */
const ImagePreviewPanel = ({ image, onClear, crop, onCropChange, showCrop = true, aspect }) => {
  const imgRef = useRef(null);
  const [internalCrop, setInternalCrop] = useState(crop);
  // 画像の表示サイズを管理
  const [imgDisplaySize, setImgDisplaySize] = useState({ width: 0, height: 0 });

  // crop propが変わったときのみ反映
  useEffect(() => {
    setInternalCrop(crop);
  }, [crop]); // React Image Cropのヘルパー関数を使用して適切なクロップを計算
  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    // 初期クロップのデフォルトサイズ（%単位）
    const width = 90; // 画像幅の90%を使用

    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  };

  // 左右maxのクロップを計算（横長の場合は左右最大、縦長の場合は上下最大）
  const maxWidthAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    let crop;

    if (aspect >= 1) {
      // 横長のアスペクト比
      // 左右最大
      crop = makeAspectCrop(
        {
          unit: '%',
          width: 100,
        },
        aspect,
        mediaWidth,
        mediaHeight
      );

      // 上下中央
      crop.y = (100 - crop.height) / 2;
    } else {
      // 縦長のアスペクト比
      // 上下最大
      crop = makeAspectCrop(
        {
          unit: '%',
          height: 100,
        },
        aspect,
        mediaWidth,
        mediaHeight
      );

      // 左右中央
      crop.x = (100 - crop.width) / 2;
    }

    return crop;
  };

  // 画像読み込み時に表示サイズを取得し、初期クロップ領域を調整
  const handleImgLoad = e => {
    const el = e.target;
    const newSize = { width: el.width, height: el.height };
    setImgDisplaySize(newSize);

    // 初期クロップ領域の調整（アスペクト比を正確に保つ）
    if (aspect) {
      // ライブラリのヘルパー関数を使用して左右maxのクロップを計算
      const newCrop = maxWidthAspectCrop(el.width, el.height, aspect);

      setInternalCrop(newCrop);
      if (onCropChange) {
        // ピクセル単位のクロップを計算
        const pixelCrop = {
          x: Math.round((newCrop.x / 100) * el.width),
          y: Math.round((newCrop.y / 100) * el.height),
          width: Math.round((newCrop.width / 100) * el.width),
          height: Math.round((newCrop.height / 100) * el.height),
          unit: 'px',
        };

        onCropChange(newCrop, el, pixelCrop);
      }
    }
  };

  // ウィンドウリサイズ時にも画像表示サイズを再取得
  useEffect(() => {
    const updateImgSize = () => {
      if (imgRef.current) {
        setImgDisplaySize({ width: imgRef.current.width, height: imgRef.current.height });
      }
    };
    window.addEventListener('resize', updateImgSize);
    updateImgSize();
    return () => window.removeEventListener('resize', updateImgSize);
  }, [image]);

  // クロップ値を画像枠内に収める補正関数
  const clampCropToImage = (crop, imgEl) => {
    if (!imgEl) return crop;
    const displayWidth = imgEl.width;
    const displayHeight = imgEl.height;
    let x = Math.max(0, crop.x ?? 0);
    let y = Math.max(0, crop.y ?? 0);
    let width = crop.width ?? 1;
    let height = crop.height ?? 1;
    // x, y, width, heightが画像枠を超えないように補正
    if (x + width > displayWidth) width = displayWidth - x;
    if (y + height > displayHeight) height = displayHeight - y;
    return { ...crop, x, y, width, height };
  }; // クロップ値を画像枠内に収める補正関数（UI最大枠用）
  const clampCropToDisplay = crop => {
    // アスペクト比固定時の特別な処理
    if (aspect && crop.width && crop.height) {
      // 現在のアスペクト比を計算
      const currentAspect = crop.width / crop.height;
      const expectedAspect = aspect;

      // 現在のクロップ値を保存
      let { x, y, width, height } = crop;

      // まず位置の補正: 画像内に完全に収める
      const maxX = Math.max(0, imgDisplaySize.width - width);
      const maxY = Math.max(0, imgDisplaySize.height - height);
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      // 画像の端に当たった場合はリサイズせず、位置だけを調整
      // 画像外にはみ出さないようにするが、サイズは維持する
      return { ...crop, x, y };
    }

    // アスペクト比固定でない場合は通常の補正
    let x = Math.max(0, crop.x ?? 0);
    let y = Math.max(0, crop.y ?? 0);
    let width = crop.width ?? 1;
    let height = crop.height ?? 1;

    // 画像の範囲を超えないように制限
    const maxWidth = imgDisplaySize.width;
    const maxHeight = imgDisplaySize.height;

    // 幅と高さの上限を設定
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);

    // 位置が画像の外に出ないように制限
    if (x + width > maxWidth) x = maxWidth - width;
    if (y + height > maxHeight) y = maxHeight - height;
    x = Math.max(0, x);
    y = Math.max(0, y);

    // 最小値の保証
    width = Math.max(10, width);
    height = Math.max(10, height);

    return { ...crop, x, y, width, height };
  };

  // クロップ完了時にピクセル値も親に渡す
  const handleCropComplete = c => {
    if (imgRef.current && c.width && c.height) {
      const imageEl = imgRef.current;
      // 補正
      const clampedCrop = clampCropToImage(c, imageEl);
      const displayWidth = imageEl.width;
      const displayHeight = imageEl.height;
      const naturalWidth = imageEl.naturalWidth;
      const naturalHeight = imageEl.naturalHeight;
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      const pixelCrop = {
        x: Math.round(clampedCrop.x * scaleX),
        y: Math.round(clampedCrop.y * scaleY),
        width: Math.round(clampedCrop.width * scaleX),
        height: Math.round(clampedCrop.height * scaleY),
      };
      if (onCropChange) onCropChange(clampedCrop, imageEl, pixelCrop);
    } else {
      if (onCropChange) onCropChange(c, imgRef.current, null);
    }
  };
  // アスペクト比が変更された時のeffect
  useEffect(() => {
    if (!imgRef.current || !aspect) return;

    // 画像がロードされている場合、アスペクト比変更に応じて左右maxのクロップ領域を再計算
    const el = imgRef.current;
    const newCrop = maxWidthAspectCrop(el.width, el.height, aspect);

    setInternalCrop(newCrop);
    if (onCropChange) {
      // ピクセル単位のクロップを計算
      const pixelCrop = {
        x: Math.round((newCrop.x / 100) * el.width),
        y: Math.round((newCrop.y / 100) * el.height),
        width: Math.round((newCrop.width / 100) * el.width),
        height: Math.round((newCrop.height / 100) * el.height),
        unit: 'px',
      };

      onCropChange(newCrop, el, pixelCrop);
    }
  }, [aspect, maxWidthAspectCrop, onCropChange]);

  // ReactCropに渡す前にundefinedを補正
  const safeCrop = internalCrop
    ? {
        ...internalCrop,
        x: internalCrop.x ?? 0,
        y: internalCrop.y ?? 0,
        width: internalCrop.width ?? 1,
        height: internalCrop.height ?? 1,
      }
    : undefined;
  if (!image) return null;
  return (
    <div className="image-preview">
      <div style={{ position: 'relative', lineHeight: 0, fontSize: 0, overflow: 'hidden' }}>
        {showCrop ? (
          <ReactCrop
            crop={safeCrop}
            onChange={c => {
              // UI上の最大枠で補正
              const clampedCrop = clampCropToDisplay(c);
              setInternalCrop(clampedCrop);
              if (
                onCropChange &&
                (clampedCrop.x !== internalCrop.x ||
                  clampedCrop.y !== internalCrop.y ||
                  clampedCrop.width !== internalCrop.width ||
                  clampedCrop.height !== internalCrop.height)
              ) {
                onCropChange(clampedCrop, imgRef.current, null);
              }
            }}
            onComplete={handleCropComplete}
            aspect={aspect}
            style={{ maxWidth: '100%', maxHeight: 500, display: 'block' }}
            minWidth={10} // 最小幅を設定
            minHeight={10} // 最小高さを設定
            keepSelection={true} // 選択範囲を保持
            ruleOfThirds={true} // 三分割線を表示
            circularCrop={false} // 円形クロップを無効化
            locked={false} // ロックしない（移動可能）
            disabled={false} // 操作を許可
            renderSelectionAddon={() => null} // 追加UIなし
            className="react-crop-wrapper" // カスタムクラス名を追加
          >
            <img
              ref={imgRef}
              src={image.previewSrc || image.src}
              alt={image.name}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onLoad={handleImgLoad}
            />
          </ReactCrop>
        ) : (
          <img
            ref={imgRef}
            src={image.previewSrc || image.src}
            alt={image.name}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        )}
        <CloseButton onClick={onClear} position="top-right" />
      </div>
    </div>
  );
};

export default ImagePreviewPanel;
