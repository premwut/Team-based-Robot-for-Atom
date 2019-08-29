export const state = () => ({
  list: [
    { id: 1, icon: "fa-user-cog", title: "Team Information", allowAll: false, feature: "MANAGE_TEAM_MEMBER", permission: "WRITE", link: "/admin/team/info", children: [] },
    { id: 2, icon: "fa-user-plus", title: "Team Member", allowAll: false, feature: "MANAGE_TEAM_MEMBER", permission: "WRITE", link: "/admin/team/member", children: [] },
    { id: 3, icon: "fa-user-tie", title: "Users", allowAll: true, feature: "MANAGE_USER", permission: "READ", link: "/admin/users", children: [] },
    { id: 4, icon: "fa-project-diagram", title: "Project", allowAll: true, feature: "MANAGE_PROJECT", permission: "READ", link: "/admin/projects", children: [] },
    { id: 5, icon: "fa-users", title: "Team", allowAll: true, feature: "MANAGE_TEAM", permission: "WRITE", link: "/admin/team", children: [] },
    { id: 6, icon: "fa-code", title: "Keywords", allowAll: true, feature: "MANAGE_KEYWORD", permission: "WRITE", link: "/admin/keywords", children: [] },
  ],
})

export const mutations = {

}

export const getters = {
  get (state) {
    return state.list
  },
}
