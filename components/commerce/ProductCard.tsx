import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../services/woocommerce';

interface ProductCardProps {
    product: Product;
    onPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const { addToCart, getCartItem } = useCart();
    const cartItem = getCartItem(product.id);

    const handleAddToCart = () => {
        addToCart(product, 1);
    };

    const formatPrice = (price: string) => {
        const numPrice = parseFloat(price);
        return numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Free';
    };

    const mainImage = product.images && product.images.length > 0
        ? product.images[0].src
        : null;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress?.(product)}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {mainImage ? (
                    <Image
                        source={{ uri: mainImage }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}

                {product.on_sale && (
                    <View style={styles.saleTag}>
                        <Text style={styles.saleText}>SALE</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                <View style={styles.priceContainer}>
                    {product.on_sale && product.regular_price !== product.sale_price ? (
                        <>
                            <Text style={styles.regularPrice}>
                                ${parseFloat(product.regular_price).toFixed(2)}
                            </Text>
                            <Text style={styles.salePrice}>
                                {formatPrice(product.price)}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.price}>
                            {formatPrice(product.price)}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.addButton, cartItem && styles.addButtonInCart]}
                    onPress={handleAddToCart}
                >
                    <Text style={[styles.addButtonText, cartItem && styles.addButtonTextInCart]}>
                        {cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                    </Text>
                </TouchableOpacity>
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
        width: 180,
    },
    imageContainer: {
        width: '100%',
        height: 140,
        position: 'relative',
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
    saleTag: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ff4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    saleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        minHeight: 34,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
    },
    regularPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    salePrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ff4444',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    addButtonInCart: {
        backgroundColor: '#4CAF50',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    addButtonTextInCart: {
        color: '#fff',
    },
});
