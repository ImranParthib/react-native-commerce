import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    getOptimalCardWidth,
    getResponsiveBorderRadius,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getTypographyScale,
    useResponsive
} from '../../hooks/useResponsive';
import { Category } from '../../services/woocommerce';

interface CategoryCardProps {
    category: Category;
    onPress: (category: Category) => void;
    containerWidth?: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, containerWidth }) => {
    const { width, fontScale, breakpoint, isSmallPhone, isTablet } = useResponsive();

    // Calculate optimal card width using enhanced responsive utilities
    const cardWidth = containerWidth
        ? getOptimalCardWidth(containerWidth, isSmallPhone ? 160 : 180, isTablet ? 300 : 250, breakpoint)
        : getOptimalCardWidth(width, isSmallPhone ? 160 : 180, isTablet ? 300 : 250, breakpoint);

    const typography = getTypographyScale(breakpoint);

    const dynamicStyles = {
        container: {
            ...styles.container,
            width: cardWidth,
            borderRadius: getResponsiveBorderRadius(12, breakpoint),
            marginHorizontal: getResponsiveSpacing(8, width, breakpoint),
            marginVertical: getResponsiveSpacing(6, width, breakpoint),
        },
        imageContainer: {
            ...styles.imageContainer,
            height: cardWidth * (isSmallPhone ? 0.7 : 0.67), // Adjust aspect ratio for small phones
            borderTopLeftRadius: getResponsiveBorderRadius(12, breakpoint),
            borderTopRightRadius: getResponsiveBorderRadius(12, breakpoint),
        },
        name: {
            ...styles.name,
            fontSize: getResponsiveFontSize(typography.h3, fontScale, 1.3, breakpoint),
            lineHeight: getResponsiveFontSize(typography.h3, fontScale, 1.3, breakpoint) * 1.2,
        },
        count: {
            ...styles.count,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        content: {
            ...styles.content,
            padding: getResponsiveSpacing(12, width, breakpoint),
        },
    };

    return (
        <TouchableOpacity
            style={dynamicStyles.container}
            onPress={() => onPress(category)}
            activeOpacity={0.7}
        >
            <View style={dynamicStyles.imageContainer}>
                {category.image?.src ? (
                    <Image
                        source={{ uri: category.image.src }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
            </View>

            <View style={dynamicStyles.content}>
                <Text style={dynamicStyles.name} numberOfLines={2}>
                    {category.name}
                </Text>
                <Text style={dynamicStyles.count}>
                    {category.count} {category.count === 1 ? 'product' : 'products'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 8,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        // Remove fixed width to make it responsive
    },
    imageContainer: {
        width: '100%',
        // Height will be set dynamically
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#999',
        fontSize: 12,
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    count: {
        fontSize: 12,
        color: '#666',
    },
});
