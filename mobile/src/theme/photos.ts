export const PHOTOS = {
  sara: require('../../assets/photos/sara.jpg'), omar: require('../../assets/photos/omar.jpg'),
  lina: require('../../assets/photos/lina.jpg'), rashid: require('../../assets/photos/rashid.jpg'),
  maya: require('../../assets/photos/maya.jpg'), karim: require('../../assets/photos/karim.jpg'),
  nadia: require('../../assets/photos/nadia.jpg'), site1: require('../../assets/photos/site1.jpg'),
  site2: require('../../assets/photos/site2.jpg'), drawings: require('../../assets/photos/drawings.jpg'),
  port1: require('../../assets/photos/port1.jpg'), port2: require('../../assets/photos/port2.jpg'),
  port3: require('../../assets/photos/port3.jpg'),
} as const;
export type PhotoKey = keyof typeof PHOTOS;
