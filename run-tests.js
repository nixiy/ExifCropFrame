/**
 * 単体テストと統合テストを順番に実行するスクリプト
 */
const { exec } = require('child_process');

// コマンド実行関数
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`実行中: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      if (error) {
        console.error(`エラー: ${error.message}`);
        reject(error);
        return;
      }
      
      resolve();
    });
  });
}

// メイン実行
async function run() {
  try {
    console.log('=== 単体テストの実行 ===');
    await runCommand('npx jest src/utils/__tests__/basic.test.js');
    
    console.log('\n=== exifUtilsのテスト実行 ===');
    await runCommand('npx jest src/utils/__tests__/exifUtils.test.js');
    
    console.log('\n=== imageProcessingのテスト実行 ===');
    await runCommand('npx jest src/utils/__tests__/imageProcessing.test.js');
    
    console.log('\n=== 統合テストの実行 ===');
    await runCommand('npx jest src/utils/__tests__/exif-integration.test.js');
    
    console.log('\n=== 全テスト完了 ===');
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました。');
    process.exit(1);
  }
}

// 実行
run();
