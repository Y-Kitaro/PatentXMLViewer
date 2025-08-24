// =======================================================
// 汎用ユーティリティ関数
// =======================================================

/**
 * XMLで使用される名前空間の定義
 * @type {Object<string, string>}
 */
const namespaces = {
  jppat: 'http://www.jpo.go.jp/standards/XMLSchema/ST96/JPPatent',
  pat: 'http://www.wipo.int/standards/XMLSchema/ST96/Patent',
  com: 'http://www.wipo.int/standards/XMLSchema/ST96/Common',
  jpcom: 'http://www.jpo.go.jp/standards/XMLSchema/ST96/JPCommon'
};

/**
 * XPathのための名前空間リゾルバ
 * @param {string} prefix - 名前空間の接頭辞
 * @returns {string|null} 対応する名前空間URI
 */
const nsResolver = (prefix) => namespaces[prefix] || null;

/**
 * XML文字列を解析してDocumentオブジェクトを生成する
 * @param {string} xmlString - 解析対象のXML文字列
 * @returns {Document} 解析済みのXML Documentオブジェクト
 * @throws {Error} XMLの解析に失敗した場合
 */
export const parseXmlString = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('XMLとして解析できませんでした。ファイルが破損している可能性があります。');
  }
  return xmlDoc;
};

/**
 * XPathを使って単一のノードのテキスト内容を取得する
 * @param {string} xpath - XPath式
 * @param {Node} contextNode - 検索の起点となるノード
 * @param {Document} xmlDoc - XML Documentオブジェクト
 * @returns {string} テキスト内容または空文字
 */
export const getTextByXpath = (xpath, contextNode, xmlDoc) => {
  if (!contextNode) return '';
  if (!xmlDoc) return [];
  const result = xmlDoc.evaluate(xpath, contextNode, nsResolver, XPathResult.STRING_TYPE, null);
  return result.stringValue.trim();
};

/**
 * XPathを使って複数のノードを取得する
 * @param {string} xpath - XPath式
 * @param {Node} contextNode - 検索の起点となるノード
 * @param {Document} xmlDoc - XML Documentオブジェクト
 * @returns {Node[]} 見つかったノードの配列
 */
export const getNodesByXpath = (xpath, contextNode, xmlDoc) => {
  if (!contextNode) return [];
  if (!xmlDoc) return [];
  const result = [];
  const iterator = xmlDoc.evaluate(xpath, contextNode, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  let node = iterator.iterateNext();
  while (node) {
    result.push(node);
    node = iterator.iterateNext();
  }
  return result;
};

/**
 * Fileオブジェクトの配列から画像ファイルのみを抽出し、ファイル名をキーとするマップを作成する
 * @param {File[]} files - ファイル選択インプットから得られたFileオブジェクトの配列
 * @returns {Object<string, File>} ファイル名をキー、Fileオブジェクトを値とするマップ
 */
export const createImageFileMap = (files) => {
  const imageFileExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff'];
  const imageFiles = files.filter(file => 
    imageFileExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  );

  return imageFiles.reduce((acc, file) => {
    acc[file.name] = file;
    return acc;
  }, {});
};
