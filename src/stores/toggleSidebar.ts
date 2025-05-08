import { defineStore } from 'pinia'

export const useToggleSidebar = defineStore('toggleSidebar', {
  state: () => ({
    drawer: false,
    isSidebarVisible: false
  }),
  actions: {
    toggle() {
      this.drawer = !this.drawer      
    },
  },
})

