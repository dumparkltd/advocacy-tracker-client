import coolorsToHex from 'coolors-to-hex';

// import headerLogo from 'themes/media/headerLogo.png';
// import headerLogo2x from 'themes/media/headerLogo@2x.png';

import graphicHome from 'themes/media/homeGraphic.png';
import graphicHome2x from 'themes/media/homeGraphic@2x.png';

// import impactossLogo from 'themes/media/impactoss.png';
// import impactossLogo2x from 'themes/media/impactoss@2x.png';

const theme = {};

// image files
// pass array for retina images: [normalSrc, retinaSrc],
// or single image: src
theme.media = {
  // headerLogo: [headerLogo, headerLogo2x],
  graphicHome: [graphicHome, graphicHome2x],
  // impactossLogo: [impactossLogo, impactossLogo2x],
};

// grid-styles settings https://github.com/jxnblk/grid-styled
theme.gutter = 20;

// global color palettes
// primary color palette: dark to light
// 0: main colour, darker, used for links and navigation elements, hover
// 1: main colour, used for links and navigation elements
// 2: main colour, light
// 3: main colour, background
// 4: white
const primary = coolorsToHex('https://coolors.co/08586c-00728f-00728f-f1f0f1-ffffff');
// secondary color palette: dark to light
// 0: dark header colour, darker
// 1: dark header colour
// 2: dark header colour, lighter (UNUSED)
// 3: white/placeholder
// 4: white/placeholder
const secondary = coolorsToHex('https://coolors.co/ffffff-ffffff-ffffff-ffffff-ffffff');
// dark grayscale: dark to light
// 0:  darkest
// 1:  darker
// 2:  dark
// 3:  medium gray 1 (AA conform)
// 4:  medium gray 2 (AA large conform on white)
const dark = coolorsToHex('https://coolors.co/1c2121-232b2b-323e3e-687271-8d9696');
// light grayscale: light to dark
// 0:  lightest gray (background colour) - also used in global-styles.js
// 1:  light gray (light lines, navigation filter panel)
// 2:  gray 1 (gray pattern)
// 3:  gray 2 (icons light)
// 4:  gray 3 (dark lines)
const light = coolorsToHex('https://coolors.co/f1f0f1-f1f0f1-d5dddd-cdd6d6-c7d1d1');

// other palettes
// 0: AA on light[0] and on error[3]
// 1: AA on white
const error = coolorsToHex('https://coolors.co/b20e0e-c10f0f-d31717-f2e3e3-ffffff');
const success = coolorsToHex('https://coolors.co/00632e-007034-007c3a-e1f2ed-ffffff');
const alert = coolorsToHex('https://coolors.co/ff8800-ffa200-ffb700-ffd000-ffea00');
// colour palettes, usage:
//   import { palette } from 'styled-theme';
//   color: ${palette('primary', 0)}
// styled-theme settings https://github.com/diegohaz/styled-theme
theme.palette = {
  // global theme colours
  primary,
  secondary,
  dark,
  light,

  // other palettes
  error,
  success,
  alert,
  // info,

  // taxonomy/category colours
  // taxonomies: ['#E8EAEB', '#6B3285', '#5149AD', '#75D6AC', '#26938C', '#55B542', '#0069A4', '#199CD4', '#40D7FF'],
  // taxonomiesAAL: ['#8C969B', '#6B3285', '#5149AD', '#31A573', '#26938C', '#4DA53B', '#0069A4', '#199CD4', '#8C969B'],
  // [#AA compliant]
  // taxonomiesHoverAAL: ['#6D787E', '#3A1D49', '#3B3681', '#28865D', '#21827B', '#3D832F', '#003A5C', '#147CA9', '#6D787E'],
  // taxonomy/category colours

  taxonomies: [
    '#8D95A0', // default, not used
    '#0059A3', // 1
    '#0077D8', // 2{onClose && (
    '#007C70', // 3
    '#05A763', // 4
    '#B7177A', // 5
    '#114060', // 6
    '#009ED8', // 7
    '#416680', // 8
    '#E56700', // 9
    '#007c3a', // 10
    '#333333', // 11
    '#555555', // 12
    '#555555', // 13
    '#555555', // 14
  ],
  taxonomiesHover: [
    '#656F75', // default, not used
    '#005296', // 1
    '#0070CC', // 2
    '#007267', // 3
    '#008740', // 4
    '#A5156E', // 5
    '#0F364C', // 6
    '#007FAD', // 7
    '#395970', // 8
    '#C75300', // 9
    '#007034', // 10
    '#111111', // 11
    '#444444', // 12
    '#444444', // 13
    '#444444', // 14
  ],

  // bg inactive, bg hover, icon
  smartInactive: [
    '#APIE1E1', // SMART inactive - NOT ACCESSIBLE
    '#656F75', // SMART inactive hover
    '#9BABAB', // SMART icon
  ],

  // other entities
  // [aqll #AA compliant]
  // maybe [#AA-Large compliant] 18pt/24px or 14pt/19px bold can suffice with AA com,pliant hover if agreed by customer

  // other entities
  parents: ['#C75300'],
  parentsHover: ['#ED7000'],
  actions: ['#C75300'],
  actionsHover: ['#ED7000'],
  actors: ['#033A89'], // accepted, noted
  actorsHover: ['#023066'],
  resources: ['#033A89'],
  resourcesHover: ['#023066'],
  indicators: ['#033A89'], // accepted, noted
  indicatorsHover: ['#023066'],
  users: ['#033A89'], // accepted, noted
  usersHover: ['#023066'],
  attributesHover: [dark[2]],
  attributes: [dark[3]],
  connectionAttributesHover: [dark[0]],
  connectionAttributes: [dark[0]],
  rolesHover: [dark[2]],
  roles: [dark[3]],

  //
  // UI PALETTES //////////////////////////////////////////////////////////////
  //

  // text
  // [#primaryFont, #secondaryFont, #inverse]
  text: [dark[0], dark[3], primary[4]],
  background: [primary[4], light[0], secondary[0]],

  // links
  // also see global-styles.js for default link "a"
  // [#primaryLink, #linkOnLightBackground, #textColorLink, #linkOnDark]
  link: [primary[2], primary[1], dark[0], primary[4]],
  linkHover: [primary[0], primary[0], primary[2], light[1]],
  // linkSecondary: [secondary[1]],
  // linkSecondaryHover: [secondary[0]],

  // home: [ '#bg' ],
  home: [primary[4]],
  homeIntro: [dark[2]],

  // footer: [ '#color, #bg-main', #bg-partners, #borderColor ],
  footer: [light[4], dark[2], light[0], dark[1]],
  footerLinks: [primary[4]],
  footerLinksHover: [primary[2]],

  // header: [ '#bg' ],
  header: [secondary[1]],

  // headerBrand: [ '#title', '#claim' ],
  headerBrand: [dark[0], dark[3]],
  headerBrandHover: [dark[1], dark[3]], // WARNING component sets opacity

  // headerNavPages: [ '#bg' ],
  headerNavPages: ['white'],
  // headerNavPagesItem: [ '#color', '#colorActive', '#bg', '#bgActive' ],
  headerNavPagesItem: [dark[3], primary[4], 'transparent', primary[2]],
  headerNavPagesItemHover: [dark[2], primary[4], 'transparent', primary[0]],

  // headerNavAccount: [ '#bg' ],
  headerNavAccount: ['transparent'],
  // headerNavAccountItem: ['#color', '#colorActive', '#bg', '#bgActive', '#border' ]
  headerNavAccountItem: [primary[4], primary[4], dark[1], primary[0], dark[0]],
  headerNavAccountItemHover: [primary[4], primary[4], primary[0], primary[0], dark[2]],

  // headerNavMain: [ '#bg', '#border'  ],
  headerNavMain: [secondary[4], secondary[4]],
  // headerNavMainItem: ['#color', '#colorActive', '#bg', '#bgActive'],
  headerNavMainItem: [dark[3], primary[1], 'transparent', dark[2]],
  headerNavMainItemHover: [primary[1], primary[1], 'transparent', dark[1]],
  //
  // SIDEBAR "PALETTES" //////////////////////////////////////////////////////////////
  //
  // aside: ['#bg']
  aside: [primary[4]],
  // asideHeader: ['#bg']
  asideHeader: [light[0]],

  // CATEGORY SIDEBAR "PALETTES" //////////////////////////////////////////////////////////////
  // asideCatNavItem: ['#color', '#colorActive', '#bg', '#bgActive', '#border'],
  asideCatNavItem: [dark[2], primary[2], primary[4], primary[2], light[0]],
  asideCatNavItemHover: [dark[1], primary[1], light[0], primary[2], light[0]],

  // ENTITYLIST SIDEBAR "PALETTES" //////////////////////////////////////////////////////////////
  // asideCatNavItem: ['#color', '#active', '#bg', '#bgactive', '#border'],
  asideListItem: [dark[2], primary[4], primary[4], dark[2], light[0]],
  asideListItemHover: [dark[1], primary[4], primary[4], dark[2], light[0]],

  // asideHeader: [#color, '#bg',]
  asideListGroup: [dark[2], light[1]],
  asideListGroupHover: [dark[3], light[0]],

  // mainListItem: [#color, '#bg',], eg category and entity list items
  mainListItem: [dark[0], primary[4]],
  mainListItemHover: [dark[3], primary[4]],

  // multiselect header [#color, #bg]
  // compare asideListItem
  multiSelectHeader: [primary[4], dark[2]],
  multiSelectFieldButton: [dark[0], light[2]],
  multiSelectFieldButtonHover: [dark[0], light[3]],
  //
  // BUTTONS / LINKS
  //
  // button: ['#colorPrimary', '#colorSecondary', #disabled],
  buttonFlat: [primary[1], dark[3], light[4]], // aka ghost button
  buttonFlatHover: [primary[0], primary[1]],
  buttonCancel: [dark[3]], // form footer cancel
  buttonCancelHover: [primary[1]],
  // buttonDefault: ['#text', '#bg'],
  buttonDefault: [primary[4], primary[2]], // with background
  buttonDefaultHover: [primary[4], primary[0]],
  buttonDefaultDisabled: [light[0], dark[3]], // with background disabled
  // buttonPrimary: ['#text', '#bg', '#border'],
  buttonDefaultIconOnly: [primary[4], primary[2], primary[1]], // with background, without text
  buttonDefaultIconOnlyHover: [primary[4], primary[0], primary[0]],
  // buttonSecondary: ['#text', '#bg'],
  // buttonSecondary: [secondary[4], secondary[1]],
  // buttonSecondaryHover: [secondary[4], secondary[0]],
  // buttonToggleInactive: ['#color', '#bg'],
  buttonToggleInactive: [dark[2], light[1]], // list sidebar filter/edit toggle button
  buttonToggleInactiveHover: [dark[2], light[2]],
  // ButtonInverse: ['#color', '#bg'],
  buttonInverse: [primary[2], primary[4]], // used for taxonomy tags, background only
  buttonInverseHover: [primary[0], primary[4]],
};

// fonts
theme.fonts = {
  // also see global-styles.js for primary font
  pre: 'Consolas, Liberation Mono, Menlo, Courier, monospace',
  quote: 'Georgia, serif',
  title: 'wwfregular, Helvetica Neue, Helvetica, Arial, sans-serif', // only used for fallback
  claim: 'Roboto, Helvetica Neue, Helvetica, Arial, sans-serif', // only used for fallback
};

// sizes
theme.sizes = {
  // also see global-styles.js for other sizes
  // px or em
  text: {
    aaLargeBold: '19px',
    aaLarge: '24px',
    mainListItem: '20px',
    listItemTop: '13px',
    listItemBottom: '12px',
    markdown: '18px',
    markdownMobile: '16px',
    small: '13px', // used for labels
    smaller: '12px', // used for labels
    smallMobile: '11px', // used for labels
    default: '16px', // used for labels
  },
  print: {
    mainListItem: '10pt',
    listItemTop: '7pt',
    listItemBottom: '7pt',
    markdown: '10pt',
    smallest: '7pt', // used for labels
    smaller: '8pt', // used for labels
    small: '9pt', // used for labels
    default: '10pt', // used for labels
    large: '11pt', // used for labels
    larger: '12pt', // used for labels
    largest: '14pt', // used for labels
  },
  // px only
  aside: {
    header: {
      height: 80,
    },
    width: {
      small: 300,
      large: 340,
    },
  },
  mainListItem: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerList: {
    banner: {
      height: 80,
      heightMobile: 30,
    },
  },
  navSecondary: {
    banner: {
      height: 120,
      heightMobile: 60,
    },
    nav: {
      height: 60,
      heightMobile: 60,
    },
  },
  header: {
    banner: {
      height: 60,
      heightPrint: 66,
      heightMobile: 50,
    },
    nav: {
      height: 30,
      heightMobile: 30,
    },
    // px or em
    text: {
      title: '16px',
      titleMobile: '16px',
      claim: '12px',
      claimMobile: '9px',
    },
    print: {
      title: '14pt',
      claim: '9pt',
    },
    paddingLeft: {
      mobile: 8,
      small: 8,
      large: 10,
    },
  },
  mapSearchBar: {
    height: 45,
    width: 250,
    searchIconSize: 24,
  },
  home: {
    // px or em
    text: {
      title: '2.8em',
      titleMobile: '1.4em',
      claim: '1em',
      claimMobile: '0.8em',
    },
    print: {
      title: '2.8em',
      claim: '1em',
    },
  },
};

// headerBrandMain: '2.2em',
// headerBrandClaim: '0.85em',

// end styled-theme settings

// other global theme variables
// eg transitions
theme.transitions = {
  mouseOver: '0.2s',
};
// requires image in data URI format (not base-64)
// eg use https://dopiaza.org/tools/datauri/index.php to generate string
// and paste between 'url("STRING_HERE")'

// theme.backgroundImages = {
//   header: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Actortypeww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20260%2088%22%3E%3Ctitle%3Epattern3%3C%2Ftitle%3E%3Cg%20id%3D%22Layer_5%22%20data-name%3D%22Layer%205%22%3E%3Cpath%20d%3D%22M35.42%2C30.74h-18V26.52h18Zm0%2C3.46v4.23H11.73V34.2h23.7Zm-.5.5h-5.2v3.23h5.2ZM59.17%2C68.93h-18v4.23h18Zm0%2C7.69v4.22H35.48V76.62h23.7Zm-.5.5h-5.2v3.22h5.2ZM100.17%2C4.93h-18V9.16h18Zm0%2C7.69v4.22H76.48V12.62h23.7Zm-.5.5h-5.2v3.22h5.2Zm26.49%2C41.81h-18v4.23h18Zm0%2C7.69v4.22h-23.7V62.62h23.7Zm-.5.5h-5.2v3.22h5.2Zm58.74-32.19h-18v4.23h18Zm0%2C7.69v4.22h-23.7V38.62h23.7Zm-.5.5h-5.2v3.22h5.2Zm40.62%2C30.69h-18V74h18Zm0%2C7.68v4.23h-23.7V77.49h23.7Zm-.5.5h-5.2v3.23h5.2Zm14.5-72.68h-18V9.54h18Zm0%2C7.68v4.23h-23.7V13h23.7Zm-.5.5h-5.2v3.23h5.2ZM80.25%2C23.17%22%20style%3D%22fill%3A%23f1f4f4%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")',
//   asideHeader: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Actortypeww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20226.82%2082.78%22%3E%3Ctitle%3Epattern3%3C%2Ftitle%3E%3Cg%20id%3D%22Layer_5%22%20data-name%3D%22Layer%205%22%3E%3Cpath%20d%3D%22M35.42%2C30.74h-18V26.52h18Zm0%2C3.46v4.23H11.73V34.2h23.7Zm-.5.5h-5.2v3.23h5.2ZM59.17%2C74.93h-18v4.23h18Zm0%2C7.69v4.22H35.48V82.62h23.7Zm-.5.5h-5.2v3.22h5.2ZM100.17%2C4.93h-18V9.16h18Zm0%2C7.69v4.22H76.48V12.62h23.7Zm-.5.5h-5.2v3.22h5.2Zm26.49%2C41.81h-18v4.23h18Zm0%2C7.69v4.22h-23.7V62.62h23.7Zm-.5.5h-5.2v3.22h5.2Zm58.74-32.19h-18v4.23h18Zm0%2C7.69v4.22h-23.7V38.62h23.7Zm-.5.5h-5.2v3.22h5.2Zm40.62%2C36.69h-18V80h18Zm0%2C7.68v4.23h-23.7V83.49h23.7Zm-.5.5h-5.2v3.23h5.2Zm14.5-78.68h-18V9.54h18Zm0%2C7.68v4.23h-23.7V13h23.7Zm-.5.5h-5.2v3.23h5.2ZM80.25%2C23.17%22%20transform%3D%22translate%28-11.73%20-4.93%29%22%20style%3D%22fill%3A%23f1f4f4%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")',
// };

theme.backgroundImages = {};

export const BREAKPOINTS = {
  small: {
    min: 0,
    max: 420, // inclusive
    name: 'mobile',
    index: 0,
  },
  ms: {
    min: 420, // exclusive
    max: 720,
    name: 'mobile (landscape)',
    index: 1,
  },
  medium: {
    min: 720, // exclusive
    max: 992,
    name: 'tablet (portrait)',
    index: 2,
  },
  large: {
    min: 992, // exclusive
    max: 1152,
    name: 'laptop/tablet (landscape)',
    index: 3,
  },
  xlarge: {
    min: 1152, // exclusive
    max: 1444,
    name: 'desktop',
    index: 4,
  },
  xxlarge: {
    min: 1444, // exclusive
    max: 99999999,
    name: 'large desktop',
    index: 5,
  },
};
theme.breakpoints = {
  small: `${BREAKPOINTS.small.min}px`, // max
  ms: `${BREAKPOINTS.ms.min}px`, // max
  medium: `${BREAKPOINTS.medium.min}px`, // min
  large: `${BREAKPOINTS.large.min}px`, // min
  xlarge: `${BREAKPOINTS.xlarge.min}px`, // min
  xxlarge: `${BREAKPOINTS.xxlarge.min}px`, // min
};
theme.breakpointsMin = {
  small: `${BREAKPOINTS.small.min + 1}px`, // min
  ms: `${BREAKPOINTS.ms.min + 1}px`, // min
  medium: `${BREAKPOINTS.medium.min + 1}px`, // min
  large: `${BREAKPOINTS.large.min + 1}px`, // min
  xlarge: `${BREAKPOINTS.xlarge.min + 1}px`, // min
  xxlarge: `${BREAKPOINTS.xxlarge.min + 1}px`, // min
};

// grommet
theme.global = {
  drop: {
    zIndex: 999999999,
  },
  breakpoints: {
    small: {
      value: BREAKPOINTS.small.max,
    },
    ms: {
      value: BREAKPOINTS.ms.max,
    },
    medium: {
      value: BREAKPOINTS.medium.max,
    },
    large: {
      value: BREAKPOINTS.large.max,
    },
    xlarge: {
      value: BREAKPOINTS.xlarge.max,
    },
    xxlarge: {},
  },
  colors: {
    icon: '#000000',
    actors: '#006076',
    brand: '#000000',
    highlight: '#00728f',
    primary: '#00728f',
    highlightHover: '#08586c',
    background: '#f1f0f1',
    backgroundLight: '#fcfcfc',
    inactive: '#f1f0f1', // on light background (empowerment)
    a: '#00728f',
    aHover: '#08586c',
    textLight: '#1c2121', // on light background (empowerment)
    textSecondary: '#6D7576', // on light background (empowerment)
    hint: '#687271',
    text: {
      hint: '#687271',
      brand: '#000000',
      dark: '#FFFFFF', //  on dark background
      light: '#1c2121', // on light background (empowerment)
      secondary: '#6D7576', // on light background (empowerment)
    },
    border: {
      light: '#CECED2',
      lighter: '#f1f0f1',
      dark: '#FFFFFF',
    },
    danger: '#DB5D37',
    private: '#DA1D52',
    archived: '#00728F',
    draft: '#BCB9B8',
    notifications: '#e6894b',
    dark: '#1c2121',
  },
  edgeSize: {
    hair: '1px',
    xxsmall: '3px',
    xsmall: '6px',
    small: '12px',
    ms: '16px',
    medium: '24px',
    ml: '36px',
    large: '48px',
    xlarge: '64px',
    xxlarge: '100px',
  },
};
// also grommet but not global somehow
theme.accordion = {
  border: {
    style: 'hidden',
    color: 'transparent',
  },
};
theme.layer = {
  zIndex: 999999999,
  overlay: {
    background: 'rgba(0, 0, 0, 0.80)',
  },
};

theme.text = {
  xxxlarge: { size: '48px', height: '60px', maxWidth: '800px' },
  xxlarge: { size: '30px', height: '36px', maxWidth: '800px' },
  xlarge: { size: '20px', height: '28px', maxWidth: '800px' },
  large: { size: '18px', height: '24px', maxWidth: '800px' },
  largeTall: { size: '18px', height: '26px', maxWidth: '800px' },
  medium: { size: '16px', height: '21px', maxWidth: '800px' },
  mediumTall: { size: '16px', height: '23px', maxWidth: '800px' },
  mediumTight: { size: '16px', height: '18px', maxWidth: '800px' },
  small: { size: '14px', height: '18px', maxWidth: '700px' },
  smallTight: { size: '14px', height: '16px', maxWidth: '700px' },
  xsmall: { size: '13px', height: '16px', maxWidth: '600px' },
  xsmallTight: { size: '13px', height: '14px', maxWidth: '600px' },
  xxsmall: { size: '12px', height: '14px', maxWidth: '500px' },
  xxxsmall: { size: '11px', height: '13px', maxWidth: '500px' },
};

theme.textPrint = {
  xxxlarge: { size: '24pt', height: '32pt' },
  xxlarge: { size: '14pt', height: '18pt' },
  xlarge: { size: '12pt', height: '16pt' },
  large: { size: '11pt', height: '14.5pt' },
  largeTall: { size: '11pt', height: '16pt' },
  medium: { size: '10pt', height: '14pt' },
  mediumTall: { size: '10pt', height: '16pt' },
  mediumTight: { size: '10pt', height: '11pt' },
  small: { size: '9pt', height: '12pt' },
  smallTight: { size: '9pt', height: '10.5pt' },
  xsmall: { size: '8pt', height: '10.5pt' },
  xsmallTight: { size: '8pt', height: '9pt' },
  xxsmall: { size: '7pt', height: '8.5pt' },
};

theme.icon = {
  size: {
    xxsmall: '14px',
    xsmall: '20px',
    small: '24px',
    medium: '36px',
    large: '48px',
    xlarge: '96px',
  },
};
theme.table = {
  header: {
    pad: {
      horizontal: 'xsmall',
      vertical: 'xsmall',
    },
  },
  body: {
    pad: {
      horizontal: 'xsmall',
      vertical: 'xsmall',
    },
  },
};

export default theme;
