/**
 * Exif情報取得の統合テスト
 * 実際のサンプル画像を使用してExif情報が正しく取得できるかテスト
 */
import fs from 'fs';
import path from 'path';
import ExifParser from 'exif-parser';
import { getExifData } from '../exifUtils';

// Node環境でのテストと、ブラウザ環境でのテストを区別
const isRunningInNode = typeof window === 'undefined';

describe('Exif統合テスト', () => {
  // この統合テストはNode環境でのみ実行
  (isRunningInNode ? describe : describe.skip)('実際の画像ファイルからExif情報を取得', () => {
    let imageBuffer;
    let exifData;

    // テスト前にサンプル画像を読み込む
    beforeAll(() => {
      try {
        // プロジェクトルートからの相対パス
        const sampleImagePath = path.resolve(process.cwd(), 'public', 'images', 'sample-image.jpg');
        imageBuffer = fs.readFileSync(sampleImagePath);

        const parser = ExifParser.create(imageBuffer);
        exifData = parser.parse();
      } catch (error) {
        console.error('サンプル画像の読み込みエラー:', error);
      }
    });

    test('サンプル画像を正常に読み込めること', () => {
      expect(imageBuffer).toBeDefined();
      expect(imageBuffer.length).toBeGreaterThan(0);
    });

    test('ExifParserでExifデータを正常に解析できること', () => {
      expect(exifData).toBeDefined();
      expect(exifData.tags).toBeDefined();
    });

    test('サンプル画像から主要なExif情報を取得できること', () => {
      const tags = exifData.tags;

      // 主要なタグの存在確認
      expect(tags.Make).toBe('SONY');
      expect(tags.Model).toBe('ILCE-7CM2');
      expect(tags.ISO).toBeDefined();
      expect(tags.FocalLength).toBeDefined();
      expect(tags.FNumber).toBeDefined();
      expect(tags.ExposureTime).toBeDefined();

      // 値の型確認
      expect(typeof tags.ISO).toBe('number');
      expect(typeof tags.FocalLength).toBe('number');
      expect(typeof tags.FNumber).toBe('number');
      expect(typeof tags.ExposureTime).toBe('number');
    });
  });

  // ブラウザ環境で実行されるテスト (実際のgetExifDataの機能をテスト)
  (isRunningInNode ? describe.skip : describe)('ブラウザ環境でのExif情報取得テスト', () => {
    test('getExifDataがPromiseを返すこと', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = getExifData(mockFile);
      expect(result instanceof Promise).toBe(true);
    });

    // 実際のブラウザ環境でのテストはここに追加
    // 注: ブラウザでは実際のファイルアクセスができないため、
    // 統合テストではモックを使用するか、テスト用のファイルを準備する必要があります
  });
});
