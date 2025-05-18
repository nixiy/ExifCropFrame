import { getExifData } from '../exifUtils';

// FileReaderのモック
class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }

  readAsArrayBuffer() {
    // 成功した場合は非同期でonloadを呼び出す
    setTimeout(() => {
      if (this.onload) {
        this.result = mockExifBuffer;
        this.onload();
      }
    }, 0);
  }
}

// exif-parserのモック
const mockExifData = {
  tags: {
    Make: 'SONY',
    Model: 'ILCE-7CM2',
    ExposureTime: 0.03333333333333333,
    FNumber: 4,
    ISO: 125,
    FocalLength: 58,
    DateTimeOriginal: 1739296216,
    LensModel: 'FE 20-70mm F4 G',
  },
};

const mockExifBuffer = new ArrayBuffer(100);

jest.mock('exif-parser', () => ({
  create: () => ({
    parse: () => ({ tags: mockExifData.tags }),
  }),
}));

// テスト実行前にFileReaderをモックに置き換え
global.FileReader = MockFileReader;

describe('exifUtils', () => {
  describe('getExifData', () => {
    test('getExifDataが関数であることを確認', () => {
      expect(typeof getExifData).toBe('function');
    });

    test('正しいEXIFデータを取得できること', async () => {
      // テスト用の画像ファイルをモック
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      const exifData = await getExifData(mockFile);

      // 期待されるExifデータのチェック
      expect(exifData).toHaveProperty('Make', 'SONY');
      expect(exifData).toHaveProperty('Model', 'ILCE-7CM2');
      expect(exifData).toHaveProperty('FNumber', 4);
      expect(exifData).toHaveProperty('FocalLength', 58);
    });

    test('ExifパーサーがエラーをスローしてもPromiseは解決されること', async () => {
      // エラーを発生させるためのモック
      const originalCreate = require('exif-parser').create;
      jest.mock('exif-parser', () => ({
        create: () => ({
          parse: () => {
            throw new Error('Parser error');
          },
        }),
      }));

      const mockFile = new File([''], 'error.jpg', { type: 'image/jpeg' });

      // エラーがスローされず、空のオブジェクトが返されることを期待
      const exifData = await getExifData(mockFile);
      expect(exifData).toEqual({});

      // モックを元に戻す
      jest.mock('exif-parser', () => ({
        create: originalCreate,
      }));
    });
  });
});
