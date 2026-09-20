export const manifest = {
  screens: {
    scr_ni41ef: { name: "Welcome", route: "/", position: { "x": 160, "y": 220 } },
    scr_qoshek: { name: "Home dashboard", route: "/home", position: { "x": 160, "y": 2200 } },
    scr_qjj9lu: { name: "Inbox", route: "/inbox", position: { "x": 1560, "y": 2200 } },
    scr_371n9w: { name: "Shipment 4821 comparison", route: "/shipment/4821", position: { "x": 160, "y": 4180 } },
    scr_cj1vyz: { name: "Shipment 3902 comparison", route: "/shipment/3902", position: { "x": 1560, "y": 4180 } },
    scr_513q2c: { name: "Review queue", route: "/review", position: { "x": 160, "y": 6160 } },
    scr_r68pjd: { name: "Human review — Missing evidence", route: "/review/rv-1", position: { "x": 1560, "y": 6160 } },
    scr_uxouqh: { name: "Human review — Low confidence", route: "/review/rv-2", position: { "x": 2960, "y": 6160 } },
    scr_gfvnhk: { name: "Analytics", route: "/analytics", position: { "x": 160, "y": 8140 } },
    scr_wmro36: { name: "Settings", route: "/settings", position: { "x": 1560, "y": 8140 } }
  },
  sections: {
    sec_nhkplw: { name: "Welcome & Auth", x: 0, y: 0, width: 1520, height: 1180 },
    sec_zoeu5m: { name: "Main Navigation", x: 0, y: 1980, width: 2920, height: 1180 },
    sec_6l3w6q: { name: "Shipment Details", x: 0, y: 3960, width: 2920, height: 1180 },
    sec_gonbui: { name: "Review Workflow", x: 0, y: 5940, width: 4320, height: 1180 },
    sec_zgnal9: { name: "Analytics & Settings", x: 0, y: 7920, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_nhkplw", children: [
    { kind: "screen", id: "scr_ni41ef" }]
  },
  { kind: "section", id: "sec_zoeu5m", children: [
    { kind: "screen", id: "scr_qoshek" },
    { kind: "screen", id: "scr_qjj9lu" }]
  },
  { kind: "section", id: "sec_6l3w6q", children: [
    { kind: "screen", id: "scr_371n9w" },
    { kind: "screen", id: "scr_cj1vyz" }]
  },
  { kind: "section", id: "sec_gonbui", children: [
    { kind: "screen", id: "scr_513q2c" },
    { kind: "screen", id: "scr_r68pjd" },
    { kind: "screen", id: "scr_uxouqh" }]
  },
  { kind: "section", id: "sec_zgnal9", children: [
    { kind: "screen", id: "scr_gfvnhk" },
    { kind: "screen", id: "scr_wmro36" }]
  }]

};