import React, { ReactNode } from 'react';
import { ScrollView, ScrollViewProps, View, ViewStyle } from 'react-native';
import { BREAKPOINTS, useResponsive } from '../../hooks/useResponsive';
import { ResponsiveBodyText, ResponsiveHeading1 } from './ResponsiveText';

interface ResponsiveLayoutProps {
    children: ReactNode;
    scrollable?: boolean;
    maxWidth?: number;
    centerContent?: boolean;
    style?: ViewStyle;
    scrollViewProps?: Partial<ScrollViewProps>;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
    children,
    scrollable = false,
    maxWidth,
    centerContent = false,
    style,
    scrollViewProps,
}) => {
    const { width, isTablet, isLargeTablet } = useResponsive();

    // Calculate responsive max width
    const getMaxWidth = () => {
        if (maxWidth) return maxWidth;
        if (isLargeTablet) return BREAKPOINTS.lg;
        if (isTablet) return BREAKPOINTS.md;
        return width;
    };

    const layoutStyle: ViewStyle = {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: centerContent ? 'center' : 'stretch',
    };

    const contentStyle: ViewStyle = {
        flex: 1,
        width: '100%',
        maxWidth: getMaxWidth(),
        alignSelf: centerContent ? 'center' : 'stretch',
    };

    const containerProps = {
        style: [contentStyle, style],
    };

    if (scrollable) {
        return (
            <View style={layoutStyle}>
                <ScrollView
                    {...containerProps}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={!centerContent ? { flexGrow: 1 } : undefined}
                    {...scrollViewProps}
                >
                    {children}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={layoutStyle}>
            <View {...containerProps}>
                {children}
            </View>
        </View>
    );
};

// Specific layout for product grids with responsive columns
interface ResponsiveGridLayoutProps {
    children: ReactNode;
    itemMinWidth?: number;
    maxColumns?: number;
    gap?: number;
    style?: ViewStyle;
}

export const ResponsiveGridLayout: React.FC<ResponsiveGridLayoutProps> = ({
    children,
    itemMinWidth = 180,
    maxColumns = 5,
    gap = 16,
    style,
}) => {
    const { width, isSmallPhone, isTablet } = useResponsive();

    // Adjust item min width based on device
    const adjustedMinWidth = isSmallPhone ? 160 : isTablet ? 200 : itemMinWidth;

    // Calculate number of columns
    const calculateColumns = () => {
        const availableWidth = width - (gap * 2); // Account for outer padding
        const itemWidth = adjustedMinWidth + gap;
        const columns = Math.floor(availableWidth / itemWidth);

        if (isSmallPhone) return Math.max(1, Math.min(columns, 2));
        if (isTablet) return Math.max(2, Math.min(columns, 4));
        return Math.max(1, Math.min(columns, maxColumns));
    };

    const numColumns = calculateColumns();

    const gridStyle: ViewStyle = {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: numColumns === 1 ? 'center' : 'space-between',
        padding: gap,
        gap: gap,
    };

    return (
        <View style={[gridStyle, style]}>
            {children}
        </View>
    );
};

// Header layout with responsive padding and typography
interface ResponsiveHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    style?: ViewStyle;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
    title,
    subtitle,
    children,
    style,
}) => {
    const { isTablet, breakpoint } = useResponsive();

    const headerStyle: ViewStyle = {
        backgroundColor: '#fff',
        paddingHorizontal: isTablet ? 32 : 20,
        paddingTop: isTablet ? 40 : 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    };

    return (
        <View style={[headerStyle, style]}>
            <ResponsiveHeading1 breakpoint={breakpoint}>
                {title}
            </ResponsiveHeading1>
            {subtitle && (
                <ResponsiveBodyText color="#666" style={{ marginTop: 4 }}>
                    {subtitle}
                </ResponsiveBodyText>
            )}
            {children}
        </View>
    );
};
