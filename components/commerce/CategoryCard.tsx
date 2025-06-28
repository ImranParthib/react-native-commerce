import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Category } from '../../services/woocommerce';

interface CategoryCardProps {
    category: Category;
    onPress: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(category)}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
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

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {category.name}
                </Text>
                <Text style={styles.count}>
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
    },
    imageContainer: {
        width: '100%',
        height: 120,
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
