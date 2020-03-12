'use babel'
/** @jsx etch.dom */

import etch from "etch"
import { TextEditor, TextBuffer, CompositeDisposable } from "atom"
import { SHARE_TYPE, fuzzysearch } from '../utils'
import { editKeyword } from '../keywords'

export default class SearchKeywordView {

  constructor (props, teambaseInstance) {
    this.teambaseInstance = teambaseInstance
    this.connection = teambaseInstance.connection
    this.initProps()
    etch.initialize(this)
    this.panel = atom.workspace.addModalPanel({ item: this.element, visible: false, autoFocus: true })
    this.bufferContent = this.refs.editorContent.buffer
    this.bufferDesc = this.refs.editorDesc.buffer
    this.subscriptions = new CompositeDisposable()

    this.editorSearchSubscription = this.refs.editorSearch.onDidStopChanging(this.onEditorSearchChange.bind(this))

    // Set grammar to content editor
    const [robotGrammar] = atom.grammars.getGrammars().filter(x => x.name === "Robot Framework")
    if (robotGrammar) {
      this.refs.editorContent.setGrammar(robotGrammar)
    }
    this.refs.editorContent.element.setHeight(100)
    this.refs.editorReview.element.setHeight(100)
    console.log(this.refs)
    this.updateProps(props)
  }

  initProps() {
    this.keywords = []
    this.searchKeywords = []
    this.keywordSelectedIndex = 0
    this.isLoading = false
    this.isVerified = false
  }

  updateProps(props) {

  }

  initSubscriptions() {
    this.refs.editorSearch.element.focus()
    this.subscriptions.add(atom.commands.add(this.element, {
      'team-based-robot:close-search-keyword-view': () => this.hide(),
      'core:close': () => this.hide(),
      'core:cancel': () => this.hide(),
    }))

    this.tooltipSubscriptions = new CompositeDisposable(
        atom.tooltips.add(this.refs.closeButton, {
          title: 'Close',
          class: 'tbr-tooltip',
          placement: 'bottom',
          keyBindingCommand: 'team-based-robot:close-search-keyword-view',
          keyBindingTarget: this.refs.searchKeywordView.element
        })
    )
  }

  async verifySharedKeyword() {
    try {
      const keywordNames = this.keywords.map(k => k.name)
      const { keywords } = await this.connection.verifyKeywordName(keywordNames)
      this.keywords = this.keywords.map((keyword, index) => {
        const { isOwner } = keywords[index]
        return { ...keyword, isOwner }
      })
      this.isVerified = true
      console.log("verify complete");
      this.updateSearchKeywords()
      etch.update(this)
    } catch (e) {
      console.error("[SearchView] Verify keyword failure", e)
    }
  }

  displaySharingKeyword() {
    const keywords = this.teambaseInstance.sharingKeywords
    const sharingKeywords = keywords.map(k => {
      const content = k.kwd_doc === "" ? `${k.kwd_content}` : `\n\t[Documentation]\t${k.kwd_doc}${k.kwd_content}`
      const original = `${k.kwd_name}${content}`
      // console.log("In searchKey displaySharingKeyword Fn"); // new
      // console.log(k.kwd_review); // new
      return {
        id: k.kwd_id,
        name: k.kwd_name,
        doc: k.kwd_doc,
        desc: k.kwd_desc,
        content: k.kwd_content,
        isAprv: k.kwd_is_approved, // new
        review: k.kwd_review, // new
        isShared: true,
        original
      }
    })
    this.keywords = [...sharingKeywords]
    this.verifySharedKeyword()
    this.updateSearchKeywords()
    etch.update(this)
  }

  updateSearchKeywords(keywords = this.keywords) {
    this.searchKeywords = keywords
    this.focusFirstKeyword()
  }

  focusFirstKeyword() {
    const [firstKeyword] = this.searchKeywords
    this.onKeywordSelected(firstKeyword, 0)
  }

  onKeywordSelected(keyword, index) {
    this.keywordSelectedIndex = index
    // console.log("onKeywordSelected =>" + JSON.stringify(keyword));
    if (keyword) {
      this.bufferContent.setText(keyword.original)
      this.bufferDesc.setText(keyword.desc)
    } else {
      this.bufferContent.setText("")
      this.bufferDesc.setText("")
    }
    etch.update(this)
  }

  onEditorSearchChange() {
    const searchText = this.refs.editorSearch.getText()
    if (searchText === "") {
      this.updateSearchKeywords()
    } else {
      const keywordFilters = this.keywords.filter(x => fuzzysearch(searchText, x.name))
      this.updateSearchKeywords(keywordFilters)
    }
  }

  onEditKeywordClick(index) {
    const keyword = this.keywords[index]
    editKeyword(this.teambaseInstance.views.saveKeywordView, keyword.original)
    this.hide()
  }

  onDeleteKeywordClick(keyword, index) {
    atom.confirm({
      message: 'Confirm to delete',
      detail: 'Are you sure to delete this keyword?',
      buttons: ['Delete', 'Cancel']
    }, async response => {
      if (response === 0) { // delete
        try {
          await this.connection.deleteKeyword(keyword.id)
          this.hide()
          atom.notifications.addSuccess("Delete keyword success")
        } catch (e) {
          this.hide()
          atom.notifications.addError("Delete keyword failure")
        }
      }
    })
  }

  async onModalVisible() {
    const { usr_id } = this.teambaseInstance.user
    const test = {
      rw_status: "Approved",
      rw_comment: "Edit by narospol",
      kwd_id: 3,
      usr_id: usr_id
    }
    // const response = await this.connection.submitReview(test)
    const review = await this.connection.getReview(usr_id)
    console.log(review, "fetched review")
    // console.log(response)
  }

  get isVisible() {
    return this.panel.isVisible()
  }

  show(props = {}) {
    this.updateProps(props)
    this.panel.show()
    this.onModalVisible()
    atom.views.getView(atom.workspace).classList.add('search-keyword-visible')
    this.initSubscriptions()
    this.displaySharingKeyword()
  }

  hide() {
    if (this.tooltipSubscriptions) {
      this.tooltipSubscriptions.dispose()
      this.tooltipSubscriptions = null
    }
    this.panel.hide()
    this.initProps()
    const $workspace = atom.views.getView(atom.workspace)
    $workspace.focus();
    $workspace.classList.remove('search-keyword-visible')
  }

  render () {
    const keywordItems = this.searchKeywords.map((keyword, i) => {
      const itemClass = `list-item ${ i === this.keywordSelectedIndex ? 'selected' : ''}`
      let actionType = <div className="-verifying"><div className="spinner -warning"/>Verifying</div>
      let reviewClass = keyword.isAprv ? "icon icon-thumbsup" : !keyword.isAprv && !keyword.review ? "icon icon-unverified" : "icon icon-thumbsdown"
      if (this.isVerified && keyword.isShared) {
        if (keyword.isOwner) {
          actionType = <div className="actions-botton">
            <div className="-edit clickable icon icon-pencil"
            onClick={() => this.onEditKeywordClick(i)} />
            <div className="-delete clickable icon icon-trashcan"
            onClick={() => this.onDeleteKeywordClick(keyword, i)} />
          </div>
        } else {
          actionType = <div className="-info icon icon-cloud-download" />
        }
      }
      return (
        <li key={i} className={itemClass}>
          <div className="title" onClick={() => this.onKeywordSelected(keyword, i)}>
            <div style="margin-left: 5px" class={reviewClass}></div> { keyword.name }
          </div>
          <div className="actions">
            { actionType }
          </div>
        </li>
      )
    })
    // console.log(keywordItems)
    return (
      <div ref="searchKeywordView" className="search-keyword-view">
        <header className="header-wrapper">
          <div ref="closeButton" className="close-button pull-right">
            <span className="icon icon-x clickable" onClick={() => this.hide()} />
          </div>
          <div className="title">Keyword Sharing</div>
        </header>
        <div className="content-wrapper">
          <section className="keyword-block">
            <section className="search-control">
              <label>Search keyword by name</label>
              <TextEditor ref="editorSearch" mini={true} placeholderText="Keyword Name" />
            </section>
            <section className="keyword-list">
              <label>Keywords</label>
              <ol className="list-group">{ keywordItems }</ol>
            </section>
          </section>

          <section className="detail-block">
            <div className="input-block">
              <label>Keyword Code</label>
              <TextEditor ref="editorContent" readOnly={true} autoHeight={false} placeholderText="Keyword Code" />
            </div>
            <div className="input-block">
              <label>Keyword Description</label>
              <TextEditor ref="editorDesc" readOnly={true} mini={true} placeholderText="Keyword Description" />
            </div>
            <div className="input-block">
              <label>Keyword Review</label>
              <TextEditor ref="editorReview" placeholderText="Type your keyword review here..."/>
            </div>
          </section>
        </div>
      </div>
    )
  }

  update(props) {
    return etch.update(this)
  }

  destroy() {
    this.subscriptions && this.subscriptions.dispose()
    this.tooltipSubscriptions && this.tooltipSubscriptions.dispose()
    this.editorSearchSubscription && this.editorSearchSubscription.dispose()
    return etch.destroy(this)
  }
}
