import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    BREAKPOINTS,
    getGridColumns,
    getTypographyScale,
    useResponsive
} from '../../hooks/useResponsive';
import {
    ResponsiveContainer,
    ResponsiveFlex,
    ResponsiveHeading1,
    ResponsiveHeading2,
    ResponsiveLayout,
    ResponsiveText
} from '../ui';

export const ResponsiveDemo: React.FC = () => {
    const {
        width,
        height,
        breakpoint,
        isTablet,
        isSmallPhone,
        isLandscape,
        aspectRatio
    } = useResponsive();

    const typography = getTypographyScale(breakpoint);
    const columns = getGridColumns(width);

    return (
        <ResponsiveLayout scrollable maxWidth={1200} centerContent>
            <ResponsiveContainer padding={20}>
                <ResponsiveHeading1 align="center" color="#007AFF">
                    📱 Responsive Design Demo
                </ResponsiveHeading1>

                <ResponsiveContainer padding={16} style={styles.infoCard}>
                    <ResponsiveHeading2>Device Information</ResponsiveHeading2>

                    <ResponsiveFlex direction="column" gap={8}>
                        <ResponsiveText>
                            <ResponsiveText weight="600">Screen Size:</ResponsiveText> {width} × {height}
                        </ResponsiveText>

                        <ResponsiveText>
                            <ResponsiveText weight="600">Breakpoint:</ResponsiveText> {breakpoint.toUpperCase()}
                        </ResponsiveText>

                        <ResponsiveText>
                            <ResponsiveText weight="600">Device Type:</ResponsiveText>{' '}
                            {isSmallPhone ? 'Small Phone' : isTablet ? 'Tablet' : 'Phone'}
                        </ResponsiveText>

                        <ResponsiveText>
                            <ResponsiveText weight="600">Orientation:</ResponsiveText>{' '}
                            {isLandscape ? 'Landscape' : 'Portrait'}
                        </ResponsiveText>

                        <ResponsiveText>
                            <ResponsiveText weight="600">Aspect Ratio:</ResponsiveText> {aspectRatio.toFixed(2)}
                        </ResponsiveText>

                        <ResponsiveText>
                            <ResponsiveText weight="600">Grid Columns:</ResponsiveText> {columns}
                        </ResponsiveText>
                    </ResponsiveFlex>
                </ResponsiveContainer>

                <ResponsiveContainer padding={16} style={styles.infoCard}>
                    <ResponsiveHeading2>Typography Scale</ResponsiveHeading2>

                    <ResponsiveFlex direction="column" gap={12}>
                        <View>
                            <ResponsiveText variant="h1">H1: {typography.h1}px</ResponsiveText>
                        </View>
                        <View>
                            <ResponsiveText variant="h2">H2: {typography.h2}px</ResponsiveText>
                        </View>
                        <View>
                            <ResponsiveText variant="h3">H3: {typography.h3}px</ResponsiveText>
                        </View>
                        <View>
                            <ResponsiveText variant="body">Body: {typography.body}px</ResponsiveText>
                        </View>
                        <View>
                            <ResponsiveText variant="caption">Caption: {typography.caption}px</ResponsiveText>
                        </View>
                    </ResponsiveFlex>
                </ResponsiveContainer>

                <ResponsiveContainer padding={16} style={styles.infoCard}>
                    <ResponsiveHeading2>Breakpoints</ResponsiveHeading2>

                    <ResponsiveFlex direction="column" gap={8}>
                        {Object.entries(BREAKPOINTS).map(([key, value]) => (
                            <ResponsiveFlex key={key} direction="row" justify="space-between">
                                <ResponsiveText weight="600">{key.toUpperCase()}:</ResponsiveText>
                                <ResponsiveText>{value}px+</ResponsiveText>
                            </ResponsiveFlex>
                        ))}
                    </ResponsiveFlex>
                </ResponsiveContainer>

                <ResponsiveContainer padding={16} style={styles.infoCard}>
                    <ResponsiveHeading2>Responsive Grid Demo</ResponsiveHeading2>

                    <ResponsiveFlex direction="row" wrap gap={12}>
                        {Array.from({ length: 8 }, (_, i) => (
                            <View key={i} style={[styles.gridItem, {
                                width: `${(100 / columns) - 2}%`,
                                backgroundColor: i % 2 === 0 ? '#007AFF' : '#4CAF50'
                            }]}>
                                <ResponsiveText color="white" align="center" weight="600">
                                    {i + 1}
                                </ResponsiveText>
                            </View>
                        ))}
                    </ResponsiveFlex>
                </ResponsiveContainer>

                <ResponsiveContainer padding={16} style={styles.infoCard}>
                    <ResponsiveHeading2>Responsive Features</ResponsiveHeading2>

                    <ResponsiveFlex direction="column" gap={8}>
                        <ResponsiveText>✅ Dynamic grid columns based on screen size</ResponsiveText>
                        <ResponsiveText>✅ Breakpoint-aware typography scaling</ResponsiveText>
                        <ResponsiveText>✅ Responsive spacing and padding</ResponsiveText>
                        <ResponsiveText>✅ Adaptive component layouts</ResponsiveText>
                        <ResponsiveText>✅ Orientation-aware design adjustments</ResponsiveText>
                        <ResponsiveText>✅ Device-specific optimizations</ResponsiveText>
                        <ResponsiveText>✅ Accessibility-compliant touch targets</ResponsiveText>
                        <ResponsiveText>✅ Smooth scaling across all devices</ResponsiveText>
                    </ResponsiveFlex>
                </ResponsiveContainer>
            </ResponsiveContainer>
        </ResponsiveLayout>
    );
};

const styles = StyleSheet.create({
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gridItem: {
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
});
