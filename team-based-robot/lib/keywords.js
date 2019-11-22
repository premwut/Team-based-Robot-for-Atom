'use babel';

import { parseKeywordSelection } from './autocomplete-robot/parse-robot'

export const parseKeywordContent = strKeyword => {
  const keywordInfo = parseKeywordSelection(strKeyword)
  const [keyword] = keywordInfo.filter(x => x.name !== "")
  return keyword
}

export const saveKeyword = view => {
  const editor = atom.workspace.getActiveTextEditor()
  if (editor) {
    let selection = editor.getSelectedText()
    if (selection === "") {
      selection = editor.getText()
    }
    editKeyword(view, selection)
  }
}

export const editKeyword = (view, content) => {
  const keywordInfo = parseKeywordSelection(content)
  const keywords = keywordInfo.filter(x => x.name !== "")
  .map(x => {
    return {
      ...x,
      original: `${x.name}${x.content}`
    }
  })
  console.log("editKeyword in keywords.js ");
  console.log(keywords);
  view.show({ keywords })
}

export const searchKeyword = view => {
  view.show()
}
