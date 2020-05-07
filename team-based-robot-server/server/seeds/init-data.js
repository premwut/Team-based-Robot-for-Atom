/* eslint-disable */
const moment = require('moment')
const extend = require('util')._extend

const isClearOnly = false

const user = 'users'
const userData = [
  {
    username: 'admin',
    password: '$2a$10$x4aSQymqECRgXzEu4MJ6DefUXktgQS.Wy8a1QgYF5iaOAeQh/tn4S',  // AdminP@ssw0rd
    usr_fname: 'administrator',
    usr_lname: 'admin of system',
    email: 'naros.pol@gmail.com',
  },
  {
    username: 'premwut',
    password: '$2a$10$QJ6fRmtaVf4tjadKTyv.FOErh8K0X3Z/EV5moSdl0.K4qCr/3avAi',  // premwut
    usr_fname: 'Premwut',
    usr_lname: 'Klaychim',
    email: 'premwut.k@gmail.com',
  },
  {
    username: 'panudet',
    password: '$2a$10$UiVs93ZCRlopYrORLj93L.vKV1z.fiXpSzs0hnFfwVtxZdHj29CrS',  // panudet
    usr_fname: 'Panudet',
    usr_lname: 'Sukontasuchot',
    email: 'pndskuchte40@gmail.com',
  },
  {
    username: 'narospol2',
    password: '$2a$10$u3tvNXYvjWb6jjKIO0sH7e1TvyM06bTT7XzPpNCCvVAvyZVi9CQLK',  // narospol
    usr_fname: 'narospol2',
    usr_lname: 'pathong2',
    email: 'naros.develop2@gmail.com',
  },
  {
    username: 'somchai',
    password: '$2a$10$8EjHMzIbFmeSYIufLp1SL.VMvfwOSIjMrT7Ns4PbEFH1e1yqo/SFO',  // somchai
    usr_fname: 'somchai',
    usr_lname: 'jaidee',
    email: 'somchai@test.com',
  },
  {
    username: 'somsak',
    password: '$2a$10$PrGzhAiSlqeoTLIakmEl0.D.ZRGd4hMwuwbkt6Ustxu1QIQomeYAy',
    usr_fname: 'somsak',
    usr_lname: 'jaidee',
    email: 'somsak@test.com',
  },
  {
    username: 'puwadon',
    password: '$2a$10$P2ZeNPuZp/0vLccAgpylE.pmMClsXGUku4BAG/NZVPf9irUqgCXIu',
    usr_fname: 'puwadon',
    usr_lname: 'deengam',
    email: 'puwadon@test.com',
  },
  {
    username: 'dana',
    password: '$2a$10$IehrfQ7JSfP0ZU0aB45Btu6OrnUVXWRmxA5JOQiVAzFuKcciRn41q',
    usr_fname: 'dana',
    usr_lname: 'lane',
    email: 'dana@test.com',
  },
  {
    username: 'michael',
    password: '$2a$10$vve9tXCGqvOAoTvXHsc9VOhzBHcavbwnzW6a5EwhBOMRT3cA41Ya2',
    usr_fname: 'Michael',
    usr_lname: 'Williams',
    email: 'michael@test.com',
  },
  {
    username: 'sophie',
    password: '$2a$10$RUw3/4omCQKzeWTR5XTq3uk01LOacmaVlA02aXApttPduYBP8UiRu',
    usr_fname: 'Sophie',
    usr_lname: 'Harrison',
    email: 'sophie.harrison47@example.com',
  },
  {
    username: 'anne',
    password: '$2a$10$BD2mRjSSbSrUDhJiIQKdcuGQKm.jPshucdnPN.c9BZE5xU6OrTMq.',
    usr_fname: 'anne',
    usr_lname: 'evans',
    email: 'anne.evans37@example.com',
  },
]

const role = 'role'
const roleData = [
  { role_id: 1, role_name: 'ADMIN', role_title: 'Administrator' },
  { role_id: 2, role_name: 'TEAM_LEADER', role_title: 'Team Leader' },
  { role_id: 3, role_name: 'TEAM_MEMBER', role_title: 'Team Member' },
]

const project = 'project'
const projectData = [
  { proj_id: 1, proj_name: 'ShopSmart', proj_desc: 'E-commerce website' },
  { proj_id: 2, proj_name: 'ShopSmart on mobile', proj_desc: 'E-commerce mobile application' },
]

const team = 'team'
const teamData = [
  { team_id: 1, team_name: 'Iron man' },
  { team_id: 2, team_name: 'Ant man' },
  { team_id: 3, team_name: 'Black panther' },
  { team_id: 4, team_name: 'Deadpool' },
]

const feature = 'feature'
const featureData = [
  { fea_id:  1, fea_name: 'ALL', fea_title: 'Manage All', fea_is_sys: true, fea_desc: 'for manage all' },
  { fea_id:  2, fea_name: 'MANAGE_USER', fea_title: 'Manage Users', fea_is_sys: true, fea_desc: 'for manage users' },
  { fea_id:  3, fea_name: 'MANAGE_PROJECT', fea_title: 'Manage Project', fea_is_sys: true, fea_desc: 'for manage project' },
  { fea_id:  4, fea_name: 'MANAGE_TEAM', fea_title: 'Manage Team', fea_is_sys: true, fea_desc: 'for manage team' },
  { fea_id:  5, fea_name: 'MANAGE_FEATURE', fea_title: 'Manage Feature', fea_is_sys: true, fea_desc: 'for manage feature' },
  { fea_id:  6, fea_name: 'MANAGE_TEAM_MEMBER', fea_title: 'Manage Team Member', fea_is_sys: true, fea_desc: 'for manage team' },
  { fea_id:  7, fea_name: 'MANAGE_KEYWORD', fea_title: 'Manage Keyword', fea_is_sys: true, fea_desc: 'for manage keyword' },
  { fea_id:  8, fea_name: 'MANAGE_ROLE', fea_title: 'Manage Role', fea_is_sys: true, fea_desc: 'for manage role' },
  { fea_id:  9, fea_name: 'MANAGE_TEST', fea_title: 'Manage Test', fea_is_sys: true, fea_desc: 'for manage test' },
  { fea_id: 10, fea_name: 'MANAGE_REVIEW', fea_title: 'Manage Review', fea_is_sys: true, fea_desc: 'for manage review' },
]

const permission = 'permission'
const permissionData = [
  { pms_id: 1, pms_name: 'READ', pms_title: 'Read', pms_desc: 'for access to resource' },
  { pms_id: 2, pms_name: 'WRITE', pms_title: 'Write', pms_desc: 'for manage resource' },
]

const featureRole = 'feature_role'
const featureRoleData = [
  { fea_role_id: 1, fea_role_active: true },
  { fea_role_id: 2, fea_role_active: true },
  { fea_role_id: 3, fea_role_active: true },
  { fea_role_id: 4, fea_role_active: true },
  { fea_role_id: 5, fea_role_active: true },
  { fea_role_id: 6, fea_role_active: true },
  { fea_role_id: 7, fea_role_active: true },
  { fea_role_id: 8, fea_role_active: true },
  { fea_role_id: 9, fea_role_active: true },
  { fea_role_id: 10, fea_role_active: true },
  { fea_role_id: 11, fea_role_active: true },
  { fea_role_id: 12, fea_role_active: true },
  { fea_role_id: 13, fea_role_active: true },
  { fea_role_id: 14, fea_role_active: true },
  { fea_role_id: 15, fea_role_active: true },
  { fea_role_id: 16, fea_role_active: true },
]

const keywordMapping = 'keyword_mapping'

const keywords = 'keywords'

const testMapping = 'test_mapping'

const tests = 'tests'

exports.seed = function (knex, Promise) {

  const deleteTables = [
    testMapping,
    tests,
    keywordMapping,
    keywords,
    featureRole,
    permission,
    feature,
    user,
    role,
    team,
    project,
  ]
  const insertDataSet = [
    { table: role, data: roleData },
    { table: permission, data: permissionData },
    { table: feature, data: featureData },
    { table: project, data: projectData },
    { table: team, data: teamData },
    { table: user, data: userData },
    { table: featureRole, data: featureRoleData },
  ]

  const deleteCommands = deleteTables.map(table => knex(table).del());
  const insertCommands = insertDataSet.map(({ table, data }) => {
    const includeDateData = data.map(item => {
      return extend(item, { created_at: moment(), updated_at: moment() })
    })
    return knex(table).insert(includeDateData)
  })

  return Promise.race(deleteCommands)
  .then(function() {
    console.log('================ Delete data complete ================')
    return true
  })
  .then(function() {
    if (!isClearOnly) {
      return Promise.all(insertCommands)
      .then(function() {
        console.log('================ Insert data complete ================')
        console.log('================ Update feature role')
        return Promise.all([
          // admin
          knex(featureRole).where({ fea_role_id: 1 }).update({ role_id: 1, fea_id: 1, pms_id: 2 }),

          // team leader
          knex(featureRole).where({ fea_role_id: 2 }).update({ role_id: 2, fea_id:  7, pms_id: 2 }),   // write keyword
          knex(featureRole).where({ fea_role_id: 3 }).update({ role_id: 3, fea_id: 10, pms_id: 2 }),   // write review
          knex(featureRole).where({ fea_role_id: 4 }).update({ role_id: 2, fea_id:  9, pms_id: 2 }),   // write test
          knex(featureRole).where({ fea_role_id: 5 }).update({ role_id: 2, fea_id:  6, pms_id: 2 }),   // write team member
          knex(featureRole).where({ fea_role_id: 6 }).update({ role_id: 2, fea_id:  2, pms_id: 1 }),   // read user
          knex(featureRole).where({ fea_role_id: 7 }).update({ role_id: 2, fea_id:  3, pms_id: 1 }),   // read project
          knex(featureRole).where({ fea_role_id: 8 }).update({ role_id: 2, fea_id:  4, pms_id: 1 }),   // read team
          knex(featureRole).where({ fea_role_id: 9 }).update({ role_id: 2, fea_id:  8, pms_id: 1 }),   // read role
          

          // team member
          knex(featureRole).where({ fea_role_id: 10 }).update({ role_id: 3, fea_id:  7, pms_id: 2 }),   // write keyword
          knex(featureRole).where({ fea_role_id: 11 }).update({ role_id: 3, fea_id: 10, pms_id: 2 }),   // write review
          knex(featureRole).where({ fea_role_id: 12 }).update({ role_id: 3, fea_id:  9, pms_id: 2 }),   // write test
          knex(featureRole).where({ fea_role_id: 13 }).update({ role_id: 3, fea_id:  2, pms_id: 1 }),   // read user
          knex(featureRole).where({ fea_role_id: 14 }).update({ role_id: 3, fea_id:  3, pms_id: 1 }),   // read project
          knex(featureRole).where({ fea_role_id: 15 }).update({ role_id: 3, fea_id:  4, pms_id: 1 }),   // read team
          knex(featureRole).where({ fea_role_id: 16 }).update({ role_id: 3, fea_id:  8, pms_id: 1 }),   // read role
          
        ])
      })
      .then(function() {
        console.log('================ Update project to team')
        return Promise.all([
          knex(team).where({ team_id: 1 }).update({ proj_id: 1 }),
          knex(team).where({ team_id: 2 }).update({ proj_id: 1 }),
          knex(team).where({ team_id: 3 }).update({ proj_id: 2 }),
          knex(team).where({ team_id: 4 }).update({ proj_id: 2 }),
        ])
      })
      .then(function() {
        console.log('================ Update role of users')
        return Promise.all([
          knex(user).where({ username: 'admin' }).update('role_id', 1),
          knex(user).where({ username: 'somchai' }).update({ role_id: 2, team_id: 1 }),
          knex(user).where({ username: 'narospol' }).update({ role_id: 3, team_id: 1 }),
          knex(user).where({ username: 'panudet' }).update({ role_id: 3, team_id: 1 }),
          knex(user).where({ username: 'premwut' }).update({ role_id: 3, team_id: 1 }),
          knex(user).where({ username: 'somsak' }).update({ role_id: 2, team_id: 3 }),
          knex(user).where({ username: 'puwadon' }).update({ role_id: 3, team_id: 3 }),
        ])
      })
      .then(function() {
        console.log('================ Update sequence')
        return Promise.all([
          knex.schema.raw(`ALTER SEQUENCE team_team_id_seq RESTART WITH ${++teamData.length}`),
          knex.schema.raw(`ALTER SEQUENCE project_proj_id_seq RESTART WITH ${++projectData.length}`),
          knex.schema.raw(`ALTER SEQUENCE role_role_id_seq RESTART WITH ${++roleData.length}`),
          knex.schema.raw(`ALTER SEQUENCE feature_fea_id_seq RESTART WITH ${++featureData.length}`),
          knex.schema.raw(`ALTER SEQUENCE feature_role_fea_role_id_seq RESTART WITH ${++featureRoleData.length}`),
          knex.schema.raw(`ALTER SEQUENCE permission_pms_id_seq RESTART WITH ${++permissionData.length}`),
        ])
      })
      .then(function() {
        console.log('================ Update data complete ================')
        return true
      })
    } else {
      return true
    }
  })
};
