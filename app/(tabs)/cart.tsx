import { Cart } from '@/components/commerce';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function CartScreen() {
    const handleCheckout = () => {
        router.push('../checkout');
    };

    return (
        <View style={styles.container}>
            <Cart onCheckout={handleCheckout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 44, // For status bar
    },
});
