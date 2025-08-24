import React, { useState } from 'react';
import { extractPatentData } from './patentDataExtractor';
import { parseXmlString, createImageFileMap } from './xmlUtils';
import PatentViewer from './PatentViewer';
import './App.css';

/**
 * 特許公報XMLビューワーのメインアプリケーションコンポーネント
 * @returns {JSX.Element}
 */
function App() {
  const [patentData, setPatentData] = useState(null);
  const [imageFiles, setImageFiles] = useState({});
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('XMLファイルと関連する画像ファイルを選択してください。');

  /**
   * ファイルインプットでファイルが選択されたときに実行されるハンドラ
   * @param {React.ChangeEvent<HTMLInputElement>} event - ファイル選択イベント
   */
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 状態をリセット
    setError('');
    setPatentData(null);
    setImageFiles({});

    const xmlFile = files.find(file => file.name.toLowerCase().endsWith('.xml'));
    if (!xmlFile) {
      setError('XMLファイルが見つかりません。XMLファイルを必ず含めてください。');
      setStatusMessage('ファイル選択に失敗しました。');
      return;
    }

    const imageMap = createImageFileMap(files);
    setStatusMessage(`処理中: ${xmlFile.name} と ${Object.keys(imageMap).length}個の画像を読み込んでいます...`);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlString = e.target.result;
        const xmlDoc = parseXmlString(xmlString);
        const extractedData = extractPatentData(xmlDoc);
        
        setPatentData(extractedData);
        setImageFiles(imageMap);
        setStatusMessage(`読み込み完了: ${xmlFile.name} (${Object.keys(imageMap).length}個の画像)`);
      } catch (err) {
        console.error("Data Extraction Error:", err);
        setError(`処理中にエラーが発生しました: ${err.message}`);
        setStatusMessage('ファイル処理中にエラーが発生しました。');
      }
    };
    reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました。');
        setStatusMessage('ファイル読み込みエラー。');
    }
    reader.readAsText(xmlFile);
  };

  return (
    <div className="container">
      <header>
        <h1>特許公報XMLビューワー</h1>
      </header>
      <main>
        <div className="upload-section">
          <div className="upload-box">
            <h2>ファイル選択</h2>
            <p>XMLファイルと、それに関連する全ての画像ファイル（tif, jpg, png等）を同時に選択してください。</p>
            <input 
              type="file" 
              multiple 
              accept=".xml,image/tiff,image/jpeg,image/png"
              onChange={handleFileSelect} 
            />
            <p className="status-message">{statusMessage}</p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        
        {patentData && <PatentViewer patentData={patentData} imageFiles={imageFiles} />}
      </main>
    </div>
  );
}

export default App;
