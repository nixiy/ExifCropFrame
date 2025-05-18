/**
 * 日本語のタグ名マッピング
 */
export const JAPANESE_TAG_NAMES = {
  Make: 'メーカー',
  Model: '機種',
  DateTime: '撮影日時',
  ExposureTime: '露出時間',
  FNumber: 'F値',
  ISOSpeedRatings: 'ISO感度',
  FocalLength: '焦点距離',
  WhiteBalance: 'ホワイトバランス',
  Flash: 'フラッシュ',
  ExposureProgram: '露出プログラム',
  MeteringMode: '測光モード',
  Resolution: '解像度',
  LensModel: 'レンズ',
  LensInfo: 'レンズ情報',
  LensID: 'レンズID',
  GPSLatitude: '緯度',
  GPSLongitude: '経度',
  GPSAltitude: '高度',
};

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
