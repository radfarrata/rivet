import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faMagnifyingGlass, faFlask, faTrophy, faShieldHalved, faFolder, faUsers,
  faBookmark, faDatabase, faGear, faSquareCheck, faRobot, faBrain, faMicrochip,
  faArrowTrendUp, faMap, faWandMagicSparkles, faComments, faHashtag, faCalendarDays,
  faWallet, faLock, faArrowUp, faReceipt, faChevronRight, faBell, faBars, faPlus,
  faTrash, faFileLines, faUpload, faPlay, faPenToSquare, faLayerGroup, faCircleCheck,
  faClock, faCircleExclamation, faCircleXmark, faDna, faAtom, faStethoscope, faCode,
  faShield, faSpinner, faPaperclip, faTableColumns,
} from '@fortawesome/free-solid-svg-icons';

// Single central icon map — every icon in the app renders through this wrapper.
export const iconMap = {
  home: faHouse,
  search: faMagnifyingGlass,
  flask: faFlask,
  trophy: faTrophy,
  shield: faShieldHalved,
  'shield-plain': faShield,
  folder: faFolder,
  users: faUsers,
  bookmark: faBookmark,
  database: faDatabase,
  settings: faGear,
  tasks: faSquareCheck,
  bot: faRobot,
  brain: faBrain,
  cpu: faMicrochip,
  trending: faArrowTrendUp,
  map: faMap,
  sparkles: faWandMagicSparkles,
  discussions: faComments,
  hash: faHashtag,
  calendar: faCalendarDays,
  wallet: faWallet,
  lock: faLock,
  'arrow-up': faArrowUp,
  receipt: faReceipt,
  'chevron-right': faChevronRight,
  bell: faBell,
  menu: faBars,
  plus: faPlus,
  trash: faTrash,
  file: faFileLines,
  upload: faUpload,
  play: faPlay,
  edit: faPenToSquare,
  layers: faLayerGroup,
  check: faCircleCheck,
  clock: faClock,
  alert: faCircleExclamation,
  close: faCircleXmark,
  dna: faDna,
  atom: faAtom,
  medicine: faStethoscope,
  code: faCode,
  spinner: faSpinner,
  paperclip: faPaperclip,
  template: faTableColumns,
};

export default function Icon({ name, size = 16, className = '', ...props }) {
  const icon = iconMap[name];
  if (!icon) return null;
  return <FontAwesomeIcon icon={icon} className={className} style={{ fontSize: size, width: size }} {...props} />;
}