'use babel';

import autocompleteProvider from './autocomplete-robot/autocomplete-plus-provider';
import TeamBasedRobot from './team-based-robot';
import Setting from './setting';
import { PACKAGE_NAME } from './utils'

export default {
  instance: null,
  config: Setting,

  activate(state) {
    const languageRobot = atom.packages.resolvePackagePath('language-robot-framework')
    if(!languageRobot){
      require('atom-package-deps').install('team-based-robot', true)
      .catch((error) => {
        console.error(`Error occurred while installing dependencies: ${error.stack ? error.stack : error}`);
      })
    }

    state = {
      name: PACKAGE_NAME,
      endpoint: atom.config.get(`${PACKAGE_NAME}.server`),
      username: atom.config.get(`${PACKAGE_NAME}.username`),
      password: atom.config.get(`${PACKAGE_NAME}.password`)
    }

    this.instance = new TeamBasedRobot(state, autocompleteProvider);
    this.instance.initialize();
  },

  deactivate() {
    this.instance.autocomplete.unload();
  },

  getAutocompletePlusProvider() {
    return this.instance.autocomplete;
  },

  serialize() {  }

};
