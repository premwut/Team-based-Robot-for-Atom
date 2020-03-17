'use babel'

import pathUtils from 'path'

export const PACKAGE_NAME = "team-based-robot"
export const SHARE_TYPE = { PROJECT: 1, TEAM: 2, USER: 3 }
export const RUN_TYPE = { ALL: 1, SUITE: 2, TAG: 3 }
export const PROJECT_TYPE = { SIMPLE: "Simple", LARGE: "Large" }
export const ROLE_TYPE = { LEADER: "TEAM_LEADER", MEMBER: "TEAM_MEMBER" }
export const KEYWORD_STATUS = { APPROVED: 'Approved', DISAPPROVED: 'Disapproved' }

export const isTeamBaseProject = () => {
  const [projectDir] =  atom.project.rootDirectories
  if (projectDir) {
    const robotFilePath = atom.config.get(`${PACKAGE_NAME}.robotFilePath`)
    const targetFile = projectDir.getFile(robotFilePath)
    return targetFile.existsSync()
  }
  return false
}

// Return rootPath + robotFilePath config
export const getTeamBaseRobotFilePath = () => {
  const robotFilePath = atom.config.get(`${PACKAGE_NAME}.robotFilePath`)
  const [projectDir] =  atom.project.rootDirectories
  return pathUtils.join(projectDir.path, robotFilePath)
}

export const getRootDirPath = () => {
  const [rootDir] = atom.project.rootDirectories
  return rootDir.path
}

export const getHomeRepository = () => {
  return process.env.ATOM_REPOS_HOME || atom.config.get('core.projectHome')
}

export const fuzzysearch = (needle, haystack) => {
  const hlen = haystack.length
  const nlen = needle.length
  if (nlen > hlen) {
    return false
  }
  needle = needle.toLowerCase()
  haystack = haystack.toLowerCase()
  if (nlen === hlen) {
    return needle === haystack
  }
  outer: for (let i = 0, j = 0; i < nlen; i++) {
    const nch = needle.charCodeAt(i)
    while (j < hlen) {
      if (haystack.charCodeAt(j++) === nch) {
        continue outer
      }
    }
    return false
  }
  return true
}
