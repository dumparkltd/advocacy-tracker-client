import React from 'react';
import PropTypes from 'prop-types';
import icons from 'themes/icons';
import asArray from 'utils/as-array';

import SVG from './SVG';

class Icon extends React.PureComponent {
  render() {
    const {
      name,
      title,
      size,
      sizes,
      palette,
      paletteIndex,
      iconSize,
      text,
      textRight,
      textLeft,
      hasStroke,
      printHide,
    } = this.props;
    const icon = icons[name];

    if (icon) {
      const iSize = icon.size || iconSize;
      const iconPaths = icon.paths || icon.path || icon;
      return (
        <SVG
          viewBox={`0 0 ${iSize} ${iSize}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          palette={palette}
          paletteIndex={paletteIndex}
          size={size || `${iSize}px`}
          text={text}
          textLeft={textLeft}
          textRight={textRight}
          hasStroke={hasStroke}
          sizes={sizes}
          printHide={printHide}
        >
          <title>{title || `Icon: ${name}`}</title>
          <path d={asArray(iconPaths).reduce((memo, path) => `${memo}${path}`, '')}></path>
        </SVG>
      );
    }
    return null;
  }
}

Icon.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  palette: PropTypes.string,
  paletteIndex: PropTypes.number,
  size: PropTypes.string,
  iconSize: PropTypes.number,
  text: PropTypes.bool,
  textLeft: PropTypes.bool,
  textRight: PropTypes.bool,
  hasStroke: PropTypes.bool,
  sizes: PropTypes.object,
  printHide: PropTypes.bool,
};
Icon.defaultProps = {
  name: 'placeholder',
  iconSize: 24,
  textLeft: false,
  textRight: false,
};


export default Icon;
