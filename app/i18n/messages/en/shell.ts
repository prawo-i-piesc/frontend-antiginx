/** The dashboard and admin chrome: sidebar, top bar, mobile drawer. */
const shell = {
  dashboardNav: "Dashboard navigation",
  adminNav: "Admin navigation",

  sections: {
    menu: "Menu",
    other: "Other",
    management: "Management",
  },

  links: {
    overview: "Overview",
    scanner: "Scanner",
    schedules: "Schedules",
    charts: "Charts",
    profile: "Profile",
    users: "Users",
    scans: "Scans",
    system: "System",
    userDashboard: "User dashboard",
    adminPanel: "Admin panel",
  },

  plans: { free: "Free", pro: "Pro" },
  /** After a menu link whose page needs the Pro plan; a lock on screen. */
  proOnly: "Pro plan",
  administrator: "Administrator",
  defaultUserName: "User",
  defaultAdminName: "Admin",
  logout: "Log out",

  areaSwitch: "Switch area",
  areas: { dashboard: "Dashboard", admin: "Admin" },
  collapseSidebar: "Collapse menu",
  expandSidebar: "Expand menu",
  menu: "Menu",
  /** Completes the plan name under the account, which links to the pricing page. */
  seePlans: "See plans",
  closeMenu: "Close menu",
  lightTheme: "Switch to light theme",
  darkTheme: "Switch to dark theme",
  notifications: "Notifications — coming soon",
};

export default shell;
