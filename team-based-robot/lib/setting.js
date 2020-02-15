'use babel';

const Setting = {
  server: {
    title: 'Server URL',
    type: 'string',
    default: 'http://localhost:3000',
    order: 2
  },
  username: {
    title: 'Username',
    type: 'string',
    default: 'guest',
    order: 3
  },
  password: {
    title: 'Password',
    type: 'string',
    default: '',
    order: 4
  },
  robotFilePath: {
    title: 'Robot file path for syncing your keywords from server',
    type: 'string',
    default: '/resources/team-based.robot',
    order: 5
  },
  runnerVariable: {
    title: 'Robot variable for running robot script',
    type: 'string',
    default: 'env:local',
    order: 6
  },
  runnerTestcasePath: {
    title: 'Test case path',
    type: 'string',
    default: '/testcases',
    order: 7
  },
  runnerOutputPath: {
    title: 'Output path',
    type: 'string',
    default: '/test-results',
    order: 8
  },
  debug: {
    title: 'Print debug messages in console',
    type: 'boolean',
    default: false,
    order: 200
  },
  autoReload: {
    title: 'Enable Auto-reload keywords',
    type: 'boolean',
    default: true,
    order:200
  },
  showNotify: {
    title: 'Show notifications from your team',
    type: 'boolean',
    default: true,
    order: 200
  },
};

export default Setting;
