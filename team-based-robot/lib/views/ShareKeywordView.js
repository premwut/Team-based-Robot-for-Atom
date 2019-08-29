'use babel'
/** @jsx etch.dom */

import etch from "etch"
import { SHARE_TYPE } from '../utils'

export default class ShareKeywordView {

  constructor (props, children) {
    this.initProps(props)
    etch.initialize(this)
    this.updateProps(props, children)
  }

  initProps(props) {
    this.props = props
  }

  updateProps(props, children) {
    this.props = props
    this.children = children
  }

  onShareTypeClicked(shareType) {
    if (this.props.type === shareType) return;
    this.props.type = shareType
    this.props.onTypeChange(shareType)
    etch.update(this)
  }

  onSelectionChanged({ type, data }) {
    data.checked = !data.checked
    this.props.onSelectChange(type, data)
  }

  render () {
    const getSharingItemView = (params) => {
      let symbol = null
      const { checked, isMyTeam, isMyProject } = params.data
      if (isMyTeam || isMyProject) {
        symbol = <div className="owner icon icon-verified" />
      }
      return (
        <li key={`${params.type}_${params.value}`} className="list-item --hover">
          <div className="checkbox">
            <label>
              <input className="input-checkbox" type="checkbox"
                onChange={() => this.onSelectionChanged(params)}
                checked={checked}
                value={params.value}  />
              <div className="title">{params.title}</div>
            </label>
          </div>
          {  symbol }
        </li>
      )
    }

    let activeItems = []
    switch (this.props.type) {
      case SHARE_TYPE.PROJECT: {
        activeItems = this.props.shared.projects.map((x, index) => {
          const params = { data: x, title: x.proj_name, value: x.proj_id, type: this.props.type }
          return getSharingItemView(params)
        })
        break
      }
      case SHARE_TYPE.TEAM: {
        activeItems = this.props.shared.teams.map((x, index) => {
          const params = { data: x, title: x.team_name, value: x.team_id, type: this.props.type }
          return getSharingItemView(params)
        })
        break
      }
      case SHARE_TYPE.USER: {
        activeItems = this.props.shared.users.map((x, index) => {
          const params = { data: x, title: `${x.usr_fname} ${x.usr_lname}`, value: x.usr_id, type: this.props.type }
          return getSharingItemView(params)
        })
        break
      }
    }

    return (
      <div className="share-keyword-view">
        <label>Shared Options</label>
        <div className="shared-types">
          <button className={`btn icon icon-home ${this.props.type === SHARE_TYPE.PROJECT ? 'selected' : ''}`}
            onClick={() => this.onShareTypeClicked(SHARE_TYPE.PROJECT)}>Projects</button>
          <button className={`btn icon icon-organization ${this.props.type === SHARE_TYPE.TEAM ? 'selected' : ''}`}
            onClick={() => this.onShareTypeClicked(SHARE_TYPE.TEAM)}>Teams</button>
          <button className={`btn icon icon-person ${this.props.type === SHARE_TYPE.USER ? 'selected' : ''}`}
            onClick={() => this.onShareTypeClicked(SHARE_TYPE.USER)}>Users</button>
        </div>
        <div className="shared-list">
          <ol className="list-group">
            { activeItems }
          </ol>
        </div>
      </div>
    )
  }

  update (props, children) {
    console.log("ShareView update");
    this.updateProps(props, children)
    return etch.update(this)
  }

  destroy() {
    return etch.destroy(this)
  }
}
