import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import {
    getResponsivePadding,
    getResponsiveSpacing,
    useResponsive
} from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
    children: ReactNode;
    style?: ViewStyle;
    padding?: number;
    margin?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
    maxWidth?: number;
    centerContent?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    style,
    padding = 16,
    margin,
    horizontalPadding,
    verticalPadding,
    maxWidth,
    centerContent = false,
}) => {
    const { width, breakpoint } = useResponsive();

    const responsiveStyle: ViewStyle = {
        paddingHorizontal: horizontalPadding
            ? getResponsiveSpacing(horizontalPadding, width, breakpoint)
            : padding
                ? getResponsivePadding(padding, breakpoint)
                : 0,
        paddingVertical: verticalPadding
            ? getResponsiveSpacing(verticalPadding, width, breakpoint)
            : padding
                ? getResponsivePadding(padding, breakpoint)
                : 0,
        marginHorizontal: margin ? getResponsiveSpacing(margin, width, breakpoint) : 0,
        maxWidth: maxWidth || width,
        alignSelf: centerContent ? 'center' : 'stretch',
        width: centerContent && maxWidth ? Math.min(maxWidth, width) : '100%',
    };

    return (
        <View style={[responsiveStyle, style]}>
            {children}
        </View>
    );
};

// Responsive Flex Container for better grid layouts
interface ResponsiveFlexProps {
    children: ReactNode;
    direction?: 'row' | 'column';
    wrap?: boolean;
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    gap?: number;
    style?: ViewStyle;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
    children,
    direction = 'row',
    wrap = false,
    justify = 'flex-start',
    align = 'flex-start',
    gap = 8,
    style,
}) => {
    const { width, breakpoint, isSmallPhone } = useResponsive();

    const flexStyle: ViewStyle = {
        flexDirection: isSmallPhone && direction === 'row' ? 'column' : direction,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent: justify,
        alignItems: align,
        gap: getResponsiveSpacing(gap, width, breakpoint),
    };

    return (
        <View style={[flexStyle, style]}>
            {children}
        </View>
    );
};

// Responsive Grid Item
interface ResponsiveGridItemProps {
    children: ReactNode;
    columns?: number;
    style?: ViewStyle;
}

export const ResponsiveGridItem: React.FC<ResponsiveGridItemProps> = ({
    children,
    columns = 2,
    style,
}) => {
    const { width, breakpoint, isSmallPhone } = useResponsive();
    const gap = getResponsiveSpacing(8, width, breakpoint);

    const itemWidth = isSmallPhone
        ? '100%'
        : `${(100 / columns) - (gap * (columns - 1) / columns)}%`;

    const gridItemStyle: ViewStyle = {
        width: itemWidth as any, // Cast to any to handle percentage string
        flexBasis: itemWidth as any,
    };

    return (
        <View style={[gridItemStyle, style]}>
            {children}
        </View>
    );
};
