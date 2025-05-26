/**
 * デフォルトで選択されるEXIFタグ
 */
export const DEFAULT_SELECTED_TAGS = [
  'Make',
  'Model',
  'ExposureTime',
  'FNumber',
  'ISOSpeedRatings',
  'FocalLength',
  'LensModel',
  'LensInfo',
  'LensID',
];

/**
 * 白枠サイズのオプション
 */
export const BORDER_SIZE_OPTIONS = [
  { value: 1, label: '極細' },
  { value: 2, label: '細い' },
  { value: 3, label: '標準' },
  { value: 4, label: '太い' },
  { value: 5, label: '極太' },
];

/**
 * デフォルト色の設定
 */
export const DEFAULT_COLORS = {
  TEXT: '#808080',
  BACKGROUND: '#ffffff',
  PRESET_TEXT_COLORS: [
    { value: '#000000', label: '黒' },
    { value: '#FFFFFF', label: '白' },
    { value: '#0000FF', label: '青' },
    { value: '#FF0000', label: '赤' },
    { value: '#007500', label: '緑' },
  ],
  PRESET_BACKGROUND_COLORS: [
    { value: '#FFFFFF', label: '白' },
    { value: '#000000', label: '黒' },
    { value: '#F0F0F0', label: '薄灰色' },
    { value: '#FFF0E0', label: '薄橙色' },
    { value: '#F0FFFF', label: '薄水色' },
  ],
};

/**
 * アスペクト比のオプション
 */
export const PORTRAIT_ASPECT_RATIOS = [
  { value: 9 / 21, label: '9:21' },
  { value: 9 / 16, label: '9:16' },
  { value: 3 / 4, label: '3:4' },
  { value: 2 / 3, label: '2:3' },
  { value: 1, label: '1:1' },
];

// 横向きのアスペクト比
export const LANDSCAPE_ASPECT_RATIOS = [
  { value: 1, label: '1:1' },
  { value: 3 / 2, label: '3:2' },
  { value: 4 / 3, label: '4:3' },
  { value: 16 / 9, label: '16:9' },
  { value: 21 / 9, label: '21:9' },
];

// アスペクト比の向き
export const ORIENTATION_OPTIONS = [
  { value: 'landscape', label: '横' },
  { value: 'portrait', label: '縦' },
];
