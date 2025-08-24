import React, { useEffect, useState, useRef } from 'react';
import * as TIFF from 'tiff.js';

const ImageViewer = ({ file }) => {
  const [fileUrl, setFileUrl] = useState('');
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  // ファイル名からTIF/TIFF形式か判定
  const isTiff = file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff');

  useEffect(() => {
    // エラーをリセット
    setError('');

    if (isTiff) {
      // TIFFファイルの処理
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          // 変更点 2: new TIFF.default() でコンストラクタを呼び出す
          const tiff = new TIFF.default({ buffer });
          const canvas = canvasRef.current;
          
          if (canvas) {
            canvas.width = tiff.width();
            canvas.height = tiff.height();
            tiff.toCanvas(canvas);
          }
        } catch (err) {
          console.error("Tiff Rendering Error:", err);
          setError('TIF画像の描画に失敗しました。');
        }
      };
      reader.onerror = () => {
        setError('TIFファイルの読み込みに失敗しました。');
      };
      reader.readAsArrayBuffer(file);

    } else {
      // TIF以外の画像形式(JPG, PNG等)の処理
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      
      // コンポーネントがアンマウントされる際にURLを解放
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isTiff]); // fileかisTiffが変更された時に再実行

  if (!file) {
    return null;
  }
  
  if (error) {
     return <div className="image-placeholder">{error}</div>;
  }

  // isTiffの値に応じて<img>タグか<canvas>タグを出し分ける
  if (isTiff) {
    return <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #eee', background: 'white' }} />;
  } else {
    return <img src={fileUrl} alt={file.name} style={{ maxWidth: '100%', border: '1px solid #eee', background: 'white' }} />;
  }
};

export default ImageViewer;
