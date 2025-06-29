import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import {
    BreakpointKey,
    getResponsiveFontSize,
    getTypographyScale,
    useResponsive
} from '../../hooks/useResponsive';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';

interface ResponsiveTextProps extends TextProps {
    variant?: TypographyVariant;
    fontSize?: number;
    maxScale?: number;
    color?: string;
    weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    align?: 'left' | 'center' | 'right' | 'justify';
    breakpoint?: BreakpointKey;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
    children,
    variant = 'body',
    fontSize,
    maxScale = 1.3,
    color = '#333',
    weight = 'normal',
    align = 'left',
    breakpoint,
    style,
    ...props
}) => {
    const { fontScale, breakpoint: currentBreakpoint } = useResponsive();
    const activeBreakpoint = breakpoint || currentBreakpoint;
    const typography = getTypographyScale(activeBreakpoint);

    const baseSize = fontSize || typography[variant];

    const responsiveStyle: TextStyle = {
        fontSize: getResponsiveFontSize(baseSize, fontScale, maxScale, activeBreakpoint),
        color,
        fontWeight: weight,
        textAlign: align,
        lineHeight: getResponsiveFontSize(baseSize, fontScale, maxScale, activeBreakpoint) * 1.4,
    };

    return (
        <Text style={[responsiveStyle, style]} {...props}>
            {children}
        </Text>
    );
};

// Predefined heading components for convenience
export const ResponsiveHeading1: React.FC<Omit<ResponsiveTextProps, 'variant'>> = (props) => (
    <ResponsiveText {...props} variant="h1" weight="700" />
);

export const ResponsiveHeading2: React.FC<Omit<ResponsiveTextProps, 'variant'>> = (props) => (
    <ResponsiveText {...props} variant="h2" weight="600" />
);

export const ResponsiveHeading3: React.FC<Omit<ResponsiveTextProps, 'variant'>> = (props) => (
    <ResponsiveText {...props} variant="h3" weight="600" />
);

export const ResponsiveBodyText: React.FC<Omit<ResponsiveTextProps, 'variant'>> = (props) => (
    <ResponsiveText {...props} variant="body" />
);

export const ResponsiveCaption: React.FC<Omit<ResponsiveTextProps, 'variant'>> = (props) => (
    <ResponsiveText {...props} variant="caption" color="#666" />
);
