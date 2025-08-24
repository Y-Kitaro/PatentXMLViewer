import React, { useState } from 'react';
import { parsePatentXml } from './xmlParser';
import PatentViewer from './PatentViewer';
import './App.css';

function App() {
  const [patentData, setPatentData] = useState(null);
  const [imageFiles, setImageFiles] = useState({});
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('XMLファイルと関連する画像ファイルを選択してください。');

  // ファイルが選択されたときのメイン処理
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // リセット処理
    setError('');
    setPatentData(null);
    setImageFiles({});

    // 1. XMLファイルを探す (一つだけあることを期待)
    const xmlFiles = files.filter(file => file.name.toLowerCase().endsWith('.xml'));

    if (xmlFiles.length === 0) {
      setError('XMLファイルが見つかりません。XMLファイルを必ず含めてください。');
      setStatusMessage('ファイル選択に失敗しました。');
      return;
    }
    if (xmlFiles.length > 1) {
      setError('XMLファイルが複数選択されています。XMLファイルは一つだけにしてください。');
      setStatusMessage('ファイル選択に失敗しました。');
      return;
    }
    const xmlFile = xmlFiles[0];

    // 2. 画像ファイルを探す
    const imageFileArray = files.filter(file => 
      !file.name.toLowerCase().endsWith('.xml')
    );
    const imageFileMap = imageFileArray.reduce((acc, file) => {
      acc[file.name] = file;
      return acc;
    }, {});
    
    setStatusMessage(`処理中: ${xmlFile.name} と ${imageFileArray.length}個の画像を読み込んでいます...`);

    // 3. XMLファイルを読み込んで解析する
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlString = e.target.result;
        const parsedData = parsePatentXml(xmlString);
        
        // 正常に処理が完了したらstateを更新
        setPatentData(parsedData);
        setImageFiles(imageFileMap);
        setStatusMessage(`読み込み完了: ${xmlFile.name} (${imageFileArray.length}個の画像)`);

      } catch (err) {
        console.error("XML Parse Error:", err);
        setError(`XMLの解析に失敗しました: ${err.message}`);
        setStatusMessage('ファイル解析中にエラーが発生しました。');
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
        
        {patentData && <PatentViewer data={patentData} images={imageFiles} />}
      </main>
    </div>
  );
}

export default App;
