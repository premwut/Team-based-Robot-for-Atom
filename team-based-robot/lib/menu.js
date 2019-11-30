'use babel';

const teamMemberMenu = [
  {
    "label": "New Project",
    "submenu": [
      {
        "label": "Simple Project",
        "command": "team-based-robot:new-project-simple"
      },
      {
        "label": "Large Project",
        "command": "team-based-robot:new-project-large"
      }
    ]
  },
  // {
  //   "label": "Reload Keywords",
  //   "submenu": [
  //     {
  //       "label": "Reload All Keywords",
  //       "command": "team-based-robot:keyword-reload"
  //     },
  //     {
  //       "label": "Reload Approved Keywords",
  //       "command": "team-based-robot:keyword-reload-approved"
  //     }
  //   ]
  // },
  {
    "label": "Search Keywords",
    "command": "team-based-robot:keyword-search"
  }
]

const teamLeaderMenu = [
  {
    "label": "Manage Members",
    "command": "team-based-robot:manage-member"
  },
  {
    "label": "Assign team to project",
    "command": "team-based-robot:assign-team"
  }
]

export const updateTeamBaseMenu = (features = []) => {
  console.log("features ", features);
  const isManageTeamMember = x => x.feature === "MANAGE_TEAM_MEMBER"
  const { permission = "READ" } = features.find(isManageTeamMember) || {}
  const submenu = permission === "WRITE" ? [...teamMemberMenu, ...teamLeaderMenu] : [...teamMemberMenu]
  const items = [
    {
      "label": "TeamBased Robot",
      "submenu": submenu
    }
  ]
  // atom.menu.add([])
  // atom.menu.update()
  atom.menu.add(items)
  atom.menu.update()
}
