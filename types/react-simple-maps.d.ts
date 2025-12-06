declare module 'react-simple-maps' {
  import { FC, ReactNode, CSSProperties } from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: any;
    width?: number;
    height?: number;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children?: (context: { geographies: any[] }) => ReactNode;
  }

  export interface GeographyProps {
    geography: any;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
  }

  export const ComposableMap: FC<ComposableMapProps>;
  export const ZoomableGroup: FC<ZoomableGroupProps>;
  export const Geographies: FC<GeographiesProps>;
  export const Geography: FC<GeographyProps>;
}
