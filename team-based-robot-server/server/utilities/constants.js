/* eslint-disable */

export const PORT       = 'port'
export const PRODUCTION = 'production'

export const FeatureType = Object.freeze({
  ALL: 'ALL',
  MANAGE_USER: 'MANAGE_USER',
  MANAGE_PROJECT: 'MANAGE_PROJECT',
  MANAGE_TEAM: 'MANAGE_TEAM',
  MANAGE_FEATURE: 'MANAGE_FEATURE',
  MANAGE_ROLE: 'MANAGE_ROLE',
  MANAGE_TEAM_MEMBER: 'MANAGE_TEAM_MEMBER',
  MANAGE_KEYWORD: 'MANAGE_KEYWORD',
})

export const PermissionType = Object.freeze({
  READ: 'READ',
  WRITE: 'WRITE',
})

export const RoleType = Object.freeze({
  ADMIN: 'ADMIN',
  TEAM_LEADER: 'TEAM_LEADER',
  TEAM_MEMBER: 'TEAM_MEMBER',
})

export const Tables = Object.freeze({
  FEATURE: 'feature',
  FEATURE_ROLE: 'feature_role',
  KEYWORD: 'keywords',
  KEYWORD_MAPPING: 'keyword_mapping',
  PERMISSION: 'permission',
  PROJECT: 'project',
  ROLE: 'role',
  TEAM: 'team',
  USER: 'users',
  TESTCASE: 'testcase',
})

export const Fields = Object.freeze({
  PMS_ID: 'pms_id',
  PMS_NAME: 'pms_name',
  PMS_TITLE: 'pms_title',
  PMS_DESC: 'pms_desc',

  FEA_ID: 'fea_id',
  FEA_NAME: 'fea_name',
  FEA_TITLE: 'fea_title',
  FEA_DESC: 'fea_desc',
  FEA_IS_SYS: 'fea_is_sys',

  FEA_ROLE_ID: 'fea_role_id',
  FEA_ROLE_ACTIVE: 'fea_role_active',

  KWD_MAP_ID: 'kwd_map_id',
  KWD_ID: 'kwd_id',
  KWD_NAME: 'kwd_name',
  KWD_CONTENT: 'kwd_content',
  KWD_DOC: 'kwd_doc',
  KWD_DESC: 'kwd_desc',
  KWD_DEPRECATE: 'kwd_deprecate',
  KWD_PARENT_ID: 'kwd_parent_id',

  PROJ_ID: 'proj_id',
  PROJ_NAME: 'proj_name',
  PROJ_DESC: 'proj_desc',

  ROLE_ID: 'role_id',
  ROLE_NAME: 'role_name',
  ROLE_TITLE: 'role_title',

  TEAM_ID: 'team_id',
  TEAM_NAME: 'team_name',

  USR_ID: 'usr_id',
  USR_FNAME: 'usr_fname',
  USR_LNAME: 'usr_lname',
  USERNAME: 'username',
  PASSWORD: 'password',
  EMAIL: 'email',

  TC_ID: 'tc_id',
  TC_NAME: 'tc_name',
  TC_VERSION: 'tc_version',
  TC_IS_PASSED: 'tc_is_passed',

})

export const Models = Object.freeze({
  FEATURE: 'Feature',
  FEATURE_ROLE: 'FeatureRole',
  KEYWORD: 'Keyword',
  KEYWORD_MAPPING: 'KeywordMapping',
  PERMISSION: 'Permission',
  PROJECT: 'Project',
  ROLE: 'Role',
  TEAM: 'Team',
  USER: 'User',
})


// API
export const API              = '/api'
export const AUTH_API         = '/auth'
export const USER_API         = '/user'
export const FEATURE_API      = '/feature'
export const ROLE_API         = '/role'
export const PERMISSION_API   = '/permission'
export const PROJECT_API      = '/project'
export const TEAM_API         = '/team'
export const KEYWORD_API      = '/keyword'
export const TESTCASE_API     = '/testcase'
