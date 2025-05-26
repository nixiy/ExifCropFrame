import React, { useState, useEffect } from 'react';
import OptionGroup from '../molecules/OptionGroup';
import ColorPicker from '../atoms/ColorPicker';
import SegmentedControl from '../atoms/SegmentedControl';
import Button from '../atoms/Button';
import {
  BORDER_SIZE_OPTIONS,
  DEFAULT_COLORS,
  PORTRAIT_ASPECT_RATIOS,
  LANDSCAPE_ASPECT_RATIOS,
  ORIENTATION_OPTIONS,
} from '../../utils/constants';

/**
 * 埋め込みオプションパネルコンポーネント
 * @param {Object} props - props
 * @param {string} props.textColor - テキスト色
 * @param {Function} props.onTextColorChange - テキスト色変更ハンドラ
 * @param {string} props.backgroundColor - 背景色
 * @param {Function} props.onBackgroundColorChange - 背景色変更ハンドラ
 * @param {number} props.borderSize - 枠線サイズ
 * @param {Function} props.onBorderSizeChange - 枠線サイズ変更ハンドラ
 * @param {Function} props.onGenerateImage - 画像生成ハンドラ
 * @param {boolean} props.isProcessing - 処理中かどうか
 * @param {boolean} props.showCrop - クロップ領域表示フラグ
 * @param {Function} props.onShowCropChange - クロップ領域表示変更ハンドラ
 * @param {number} props.aspect - アスペクト比
 * @param {Function} props.onAspectChange - アスペクト比変更ハンドラ
 * @param {boolean} props.addFrame - フレームを追加するかどうかのフラグ
 * @param {Function} props.onAddFrameChange - フレーム追加オプション変更ハンドラ
 * @returns {JSX.Element} - オプションパネルコンポーネント
 */
const OptionPanel = ({
  textColor,
  onTextColorChange,
  backgroundColor,
  onBackgroundColorChange,
  borderSize,
  onBorderSizeChange,
  onGenerateImage,
  isProcessing,
  showCrop,
  onShowCropChange,
  aspect,
  onAspectChange,
  addFrame,
  onAddFrameChange,
}) => {
  // 縦向き/横向き切り替えのstate
  const [orientation, setOrientation] = useState('landscape');

  // 現在の向きに基づいたアスペクト比オプションを取得
  const currentAspectRatioOptions =
    orientation === 'landscape' ? LANDSCAPE_ASPECT_RATIOS : PORTRAIT_ASPECT_RATIOS;

  // 向き変更時に適切なアスペクト比を選択する
  useEffect(() => {
    // 前の向きでの選択が新しい向きにも存在する場合はそれを維持
    const aspectExists = currentAspectRatioOptions.some(option => option.value === aspect);
    if (!aspectExists) {
      // 存在しない場合は新しい向きの最初の値を選択（または1:1 など共通の値があればそれを選択）
      const defaultAspect =
        currentAspectRatioOptions.find(option => option.value === 1) ||
        currentAspectRatioOptions[0];
      onAspectChange(defaultAspect.value);
    }
  }, [orientation, aspect, onAspectChange, currentAspectRatioOptions]);

  return (
    <div className="embed-options simplified">
      <div className="options-compact">
        <div className="options-row options-color-row">
          <OptionGroup label="テキスト色" className="color-option-group">
            <ColorPicker
              value={textColor}
              onChange={e => onTextColorChange(e.target.value)}
              presets={DEFAULT_COLORS.PRESET_TEXT_COLORS}
            />
          </OptionGroup>
          <OptionGroup label="背景色" className="color-option-group">
            <ColorPicker
              value={backgroundColor}
              onChange={e => onBackgroundColorChange(e.target.value)}
              presets={DEFAULT_COLORS.PRESET_BACKGROUND_COLORS}
            />
          </OptionGroup>
        </div>
        <div className="options-row segmented-row">
          <OptionGroup label="枠サイズ" className="full-width">
            <SegmentedControl
              options={BORDER_SIZE_OPTIONS}
              value={borderSize}
              onChange={e => onBorderSizeChange(Number(e.target.value))}
            />
          </OptionGroup>
        </div>{' '}
        <div className="options-row segmented-row">
          <OptionGroup label="アスペクト比の向き" className="full-width">
            <SegmentedControl
              options={ORIENTATION_OPTIONS}
              value={orientation}
              onChange={e => setOrientation(e.target.value)}
            />
          </OptionGroup>
        </div>
        <div className="options-row segmented-row">
          {' '}
          <OptionGroup label="アスペクト比" className="full-width">
            <SegmentedControl
              options={currentAspectRatioOptions}
              value={aspect}
              onChange={e => onAspectChange(Number(e.target.value))}
              showIcons={true}
            />
          </OptionGroup>
        </div>{' '}
        <div className="options-row">
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={showCrop}
                onChange={e => onShowCropChange(e.target.checked)}
              />
              クロップ領域を表示
            </label>
          </div>
        </div>
        <div className="options-row">
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={addFrame}
                onChange={e => onAddFrameChange(e.target.checked)}
              />
              フレームを追加
            </label>
          </div>
        </div>
      </div>

      <div className="embed-buttons">
        <Button
          type="primary"
          onClick={onGenerateImage}
          disabled={isProcessing}
          isLoading={isProcessing}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 10 12 15 7 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          }
        >
          {isProcessing ? '処理中...' : '画像を生成'}
        </Button>
      </div>
    </div>
  );
};

export default OptionPanel;
