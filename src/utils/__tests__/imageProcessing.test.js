import { processImageFile, embedTextInImage } from '../imageProcessing';

// HTMLCanvasElementとそのAPIのモック
class MockCanvasElement {
  constructor() {
    this.width = 0;
    this.height = 0;
  }

  getContext() {
    return {
      drawImage: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      font: '',
      fillText: jest.fn(),
      measureText: () => ({ width: 100 }),
      clearRect: jest.fn(),
      toDataURL: jest.fn(() => 'data:image/jpeg;base64,mockImageData'),
    };
  }
}

// 画像のロードイベントをシミュレート
function simulateImageLoad(image) {
  image.width = 800;
  image.height = 600;
  if (image.onload) {
    setTimeout(() => image.onload(), 0);
  }
}

// 環境ごとにモックを分ける
let originalImage;
let originalCanvas;

beforeAll(() => {
  // グローバルオブジェクトの保存とモック設定
  if (typeof window !== 'undefined') {
    originalImage = window.Image;
    originalCanvas = window.HTMLCanvasElement;

    window.Image = class {
      constructor() {
        this.width = 0;
        this.height = 0;
        this.onload = null;
        this.onerror = null;

        // src設定時に自動的にロードイベントをシミュレート
        Object.defineProperty(this, 'src', {
          set(value) {
            this._src = value;
            simulateImageLoad(this);
          },
          get() {
            return this._src;
          },
        });
      }
    };

    window.HTMLCanvasElement = MockCanvasElement;
  } else {
    // Node環境での実行時はグローバルにモックを設定
    global.Image = class {
      constructor() {
        this.width = 0;
        this.height = 0;
        this.onload = null;
        this.onerror = null;

        // src設定時に自動的にロードイベントをシミュレート
        Object.defineProperty(this, 'src', {
          set(value) {
            this._src = value;
            simulateImageLoad(this);
          },
          get() {
            return this._src;
          },
        });
      }
    };

    global.HTMLCanvasElement = MockCanvasElement;
  }
});

afterAll(() => {
  // モックを元に戻す
  if (typeof window !== 'undefined') {
    window.Image = originalImage;
    window.HTMLCanvasElement = originalCanvas;
  } else {
    delete global.Image;
    delete global.HTMLCanvasElement;
  }
});

// exifUtilsのモック
jest.mock('../exifUtils', () => ({
  getExifData: jest.fn().mockResolvedValue({
    Make: 'SONY',
    Model: 'ILCE-7CM2',
    FNumber: 4,
    ExposureTime: 0.03333333333333333,
    ISOSpeedRatings: 125,
    FocalLength: 58,
    LensModel: 'FE 20-70mm F4 G',
  }),
}));

describe('imageProcessing', () => {
  describe('関数の存在チェック', () => {
    test('processImageFileが関数であること', () => {
      expect(typeof processImageFile).toBe('function');
    });

    test('embedTextInImageが関数であること', () => {
      expect(typeof embedTextInImage).toBe('function');
    });
  });

  describe('processImageFile', () => {
    test('画像以外のファイルを拒否すること', async () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });

      // rejectsを使用してPromiseのエラーをテスト
      await expect(processImageFile(mockFile)).rejects.toEqual('画像ファイルを選択してください');
    });

    test('画像ファイルを正常に処理できること', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockSelectedExifTags = [
        'Make',
        'Model',
        'FNumber',
        'ExposureTime',
        'ISOSpeedRatings',
        'FocalLength',
        'LensModel',
      ];
      const mockExifOptions = { color: '#ffffff', bgColor: '#000000', opacity: 0.7, fontSize: 16 };

      const result = await processImageFile(mockFile, mockSelectedExifTags, mockExifOptions);

      // 結果の検証
      expect(result).toBeDefined();
      expect(result.originalImageUrl).toBe('data:image/jpeg;base64,mockImageData');
      expect(result.processedImageUrl).toBe('data:image/jpeg;base64,mockImageData');
      expect(result.exifData).toBeDefined();
    });
  });

  describe('embedTextInImage', () => {
    test('画像とExifテキストを受け取り、埋め込み画像を返すこと', () => {
      const mockImage = new Image();
      const exifData = {
        Make: 'SONY',
        Model: 'ILCE-7CM2',
        FNumber: 4,
        ExposureTime: '1/30',
        ISOSpeedRatings: 125,
        FocalLength: '58mm',
        LensModel: 'FE 20-70mm F4 G',
      };
      const selectedTagKeys = [
        'Make',
        'Model',
        'FNumber',
        'ExposureTime',
        'ISOSpeedRatings',
        'FocalLength',
        'LensModel',
      ];
      const options = { color: '#ffffff', bgColor: '#000000', opacity: 0.7, fontSize: 16 };

      const result = embedTextInImage(mockImage, exifData, selectedTagKeys, options);

      // 結果の検証
      expect(result).toBe('data:image/jpeg;base64,mockImageData');
    });
  });
});
