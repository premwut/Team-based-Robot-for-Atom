'use babel'
/** @jsx etch.dom */

import etch from "etch"
import { TextEditor, TextBuffer, CompositeDisposable } from "atom"
import { SHARE_TYPE, ROLE_TYPE, KEYWORD_STATUS, fuzzysearch } from '../utils'
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
    this.bufferReview = this.refs.editorReview.buffer
    this.subscriptions = new CompositeDisposable()

    this.editorSearchSubscription = this.refs.editorSearch.onDidStopChanging(this.onEditorSearchChange.bind(this))
    this.creatorFilterSubscription = this.refs.creatorFilter.addEventListener("change", this.onCreatorFilterChange.bind(this))
    this.statusFilterSubscription = this.refs.statusFilter.addEventListener("change", this.onStatusFilterChange.bind(this))

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
    this.creators = []
    this.filters = {"status":"", "creator":-1}
    this.searchKeywords = []
    this.keywordSelectedIndex = 0
    this.isLoading = false
    this.isVerified = false
    this.reviewButtonDisplay = 'none'
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

  async displaySharingKeyword() {
    const keywords = this.teambaseInstance.sharingKeywords
    const reviews = await this.connection.getReview(this.teambaseInstance.user.usr_id)
    const sharingKeywords = keywords.map(k => {
      const content = k.kwd_doc === "" ? `${k.kwd_content}` : `\n\t[Documentation]\t${k.kwd_doc}${k.kwd_content}`
      const original = `${k.kwd_name}${content}`
      let review = reviews.filter(rw => rw.kwd_id === k.kwd_id)
      if (review) review = review.pop()
      return {
        id: k.kwd_id,
        name: k.kwd_name,
        doc: k.kwd_doc,
        desc: k.kwd_desc,
        content: k.kwd_content,
        // isAprv: k.kwd_is_approved,
        // review: k.kwd_review,
        created_at: k.created_at,
        usr_id: k.usr_id,
        comment: (review) ? review.rw_comment : undefined,
        status: (review) ? review.rw_status : undefined,
        isShared: true,
        original
      }
    })
    this.keywords = [...sharingKeywords]
    this.verifySharedKeyword()
    this.updateSearchKeywords()
    this.updateKeywordCreators()
    etch.update(this)
  }

  updateSearchKeywords(keywords = this.keywords) {
    this.searchKeywords = keywords
    this.focusFirstKeyword()
  }

  updateKeywordCreators() {
    const { team_id } = this.teambaseInstance.user
    const members = this.teambaseInstance.memberList
    this.creators = members.map((creator) => {
      console.log("creator ===>", creator)
      const { usr_id, usr_fname, usr_lname } = creator
      const fullname = usr_fname + " " + usr_lname
      console.log("fullname ===>", fullname)
      return { usr_id, fullname }
    })

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
      if (keyword.comment) this.bufferReview.setText(keyword.comment)
      else this.bufferReview.setText("")
      this.checkKeywordStatus(keyword.status)
    } else {
      this.bufferContent.setText("")
      this.bufferDesc.setText("")
      this.bufferReview.setText("")
    }
    etch.update(this)
  }

  onOrderFilterBtnClicked() {
    let temp = this.refs.orderFilterBtn.childNodes[1].className
    let iconClass
    if (temp.includes("icon-arrow-up")) {
      iconClass = temp.replace("icon-arrow-up", "icon-arrow-down")
    } else {
      iconClass = temp.replace("icon-arrow-down", "icon-arrow-up")
    }
    this.refs.orderFilterBtn.childNodes[1].className = iconClass
  }

  onStatusFilterChange() {
    let x = document.getElementById("statusFilterSelect").value
    console.log("Status Option ===>", x)
    const caseNo = parseInt(x)
    switch (caseNo) {
      case 0:
        this.filters.status = undefined
        break;
      case 1:
        this.filters.status = KEYWORD_STATUS.APPROVED
        break;
      case 2:
        this.filters.status = KEYWORD_STATUS.DISAPPROVED
        break;
      default:
        this.filters.status = ""
    }
    this.onEditorSearchChange()
  }

  onCreatorFilterChange() {
    let x = document.getElementById("creatorFilterSelect").value
    console.log("Creator Option ===>", x)
    const idNo = parseInt(x)
    const creator_id = idNo === -1 ? -1 : idNo
    this.filters.creator = creator_id
    this.onEditorSearchChange()
  }

  onEditorSearchChange() {
    const searchText = this.refs.editorSearch.getText()
    const test = 1
    const keywordFilters = this.keywords.filter(x => {
      const result = fuzzysearch(searchText, x.name) && this.statusFilter(x.status) && this.creatorFilter(x.usr_id)
      console.log("kwd ===>", x)
      console.log("filters ===>", this.filters)
      console.log("result ===>", result)
      return result
    })
    this.updateSearchKeywords(keywordFilters)
  }

  statusFilter(status) {
    console.log("statusFilter ===>", status)
    const selected = this.filters.status
    if (selected === "") return true
    return status === selected
  }

  creatorFilter(usr_id) {
    console.log("craetorFilter ===>", usr_id)
    const selected = this.filters.creator
    if (selected === -1) return true
    return usr_id === selected
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

  //fucntions for Keyword Review features
  async onSubmitReviewClick() {
    try {
      const currentKeyword = this.searchKeywords[this.keywordSelectedIndex]
      const reviewData = {
        usr_id: this.teambaseInstance.user.usr_id,
        kwd_id: currentKeyword.id,
        rw_comment: this.bufferReview.getText(),
        rw_status: currentKeyword.status
      }
      await this.connection.submitReview(reviewData)
      this.hide()
      atom.notifications.addSuccess("Keyword review was updated")
    } catch (e) {
      atom.notifications.addError("Keyword review error")
    }

  }

  checkKeywordStatus(status) {
    this.searchKeywords[this.keywordSelectedIndex].status = status
    switch (status) {
      case KEYWORD_STATUS.APPROVED:
        this.refs.approveButton.classList.add("selected")
        this.refs.disButton.classList.remove("selected")
        break
      case KEYWORD_STATUS.DISAPPROVED:
        this.refs.disButton.classList.add("selected")
        this.refs.approveButton.classList.remove("selected")
        break
    }
  }

  async setReviewOnVisible() {
    const { usr_id } = this.teambaseInstance.user
    const test = {
      rw_status: "Approved",
      rw_comment: "Edit by narospol",
      kwd_id: 3,
      usr_id: usr_id
    }
    // const response = await this.connection.submitReview(test)
    const review = await this.connection.getReview(usr_id)
    // const shit = await this.connection.getRoleById(usr_id)
    const { role } = this.teambaseInstance.user

    if (this.teambaseInstance.user) {
      const { role } = this.teambaseInstance.user
      if (role === ROLE_TYPE.LEADER) {
        this.reviewButtonDisplay = 'flex'
      } else {
        this.reviewButtonDisplay = 'none'
      }
    }

    if (role === ROLE_TYPE.LEADER) {
      this.refs.editorReview.readOnly = false
    } else {
      this.refs.editorReview.readOnly = true
    }
    etch.update(this)
    console.log(review, "fetched review")
    // console.log(shit, 'shit')
    // console.log(this.teambaseInstance.user)
    // console.log(response)
  }

  get isVisible() {
    return this.panel.isVisible()
  }

  show(props = {}) {
    this.updateProps(props)
    this.panel.show()
    this.setReviewOnVisible()
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
      let reviewClass
       // = keyword.status ? "icon icon-thumbsup" : !keyword.status && !keyword.comment ? "icon icon-unverified" : "icon icon-thumbsdown"
      if (keyword.status === KEYWORD_STATUS.APPROVED) {
          reviewClass = "icon icon-thumbsup"
      } else if (keyword.status === KEYWORD_STATUS.DISAPPROVED) {
        reviewClass = "icon icon-thumbsdown"
      } else {
        reviewClass = "icon icon-unverified"
      }

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
            <div style="margin-left: 5px" className={reviewClass}></div> { keyword.name }
          </div>
          <div className="actions">
            { actionType }
          </div>
        </li>
      )
    })
    const creatorItems = this.creators.map((creator) => {
      return (
        <option value={creator.usr_id}>{creator.fullname}</option>
      )
    })
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
            <section ref="editorFilter" className="filter-control">
              <label>Filters</label>
              <span class="btn clickable orderFilterBtn" ref="orderFilterBtn"
              onClick={() => this.onOrderFilterBtnClicked()}>Created at
              <span className="icon-arrow-up" style="margin-left: 5px"></span>
              </span>

              <span class="custom-select">Status:
                <select ref="statusFilter" id="statusFilterSelect" class="input-select"
                  >
                  <option value="-1">All</option>
                  <option value="0">Pending</option>
                  <option value="1">Approved</option>
                  <option value="2">Refused</option>
                </select>
              </span>

              <span class="custom-select">Created by:
                <select ref="creatorFilter" id="creatorFilterSelect" class="input-select"
                  >
                  <option value="-1">All</option>
                  { creatorItems }
                </select>
              </span>

            </section>
            <section className="keyword-list">
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
            <div className="input-block" style={{overflow: 'scroll'}}>
              <label>Keyword Review</label>
              <TextEditor ref="editorReview" placeholderText="Type your keyword review here..."/>
              <div class="review-button-container" style={ { display: this.reviewButtonDisplay } }>
                <div className="btn-group">
                  <label ref="approveButton" onClick={() => this.checkKeywordStatus(KEYWORD_STATUS.APPROVED)} class="btn btn-success">
                    <span class="icon icon-thumbsup"></span>
                  </label>
                  <label ref="disButton" onClick={() => this.checkKeywordStatus(KEYWORD_STATUS.DISAPPROVED)} class="btn btn-error">
                    <span class="icon icon-thumbsdown"></span>
                  </label>
                </div>
                <label onClick={() => this.onSubmitReviewClick()} className="btn"> Submit </label>
              </div>
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
    this.creatorFilterSubscription && this.creatorFilterSubscription.dispose()
    this.statusFilterSubscription && this.statusFilterSubscription.dispose()
    return etch.destroy(this)
  }
}
