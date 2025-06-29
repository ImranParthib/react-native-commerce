import {
    getResponsiveBorderRadius,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getTypographyScale,
    useResponsive
} from '@/hooks/useResponsive';
import { wooCommerceApi } from '@/services/woocommerce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StoredOrder {
    id: number;
    orderNumber: string;
    total: string;
    status: string;
    dateCreated: string;
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<StoredOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { width, fontScale, breakpoint, isTablet } = useResponsive();

    const typography = getTypographyScale(breakpoint);

    const loadOrdersFromStorage = async () => {
        try {
            const storedOrders = await AsyncStorage.getItem('userOrders');
            if (storedOrders) {
                const orderIds: StoredOrder[] = JSON.parse(storedOrders);
                setOrders(orderIds);
            }
        } catch (error) {
            console.error('Error loading orders from storage:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrdersFromStorage();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadOrdersFromStorage();
    };

    const fetchOrderDetails = async (orderId: number) => {
        try {
            setLoading(true);
            const orderDetails = await wooCommerceApi.getOrder(orderId);

            Alert.alert(
                `Order #${orderDetails.number}`,
                `Status: ${orderDetails.status.toUpperCase()}\n` +
                `Total: $${orderDetails.total}\n` +
                `Date: ${new Date(orderDetails.date_created).toLocaleDateString()}\n` +
                `Items: ${orderDetails.line_items.length} product(s)\n` +
                `Payment: ${orderDetails.payment_method_title}`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Failed to load order details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return '#4CAF50';
            case 'processing':
                return '#FF9800';
            case 'pending':
                return '#2196F3';
            case 'cancelled':
                return '#F44336';
            default:
                return '#666';
        }
    };

    const renderOrder = ({ item }: { item: StoredOrder }) => (
        <TouchableOpacity
            style={dynamicStyles.orderCard}
            onPress={() => fetchOrderDetails(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <Text style={dynamicStyles.orderNumber}>Order #{item.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={dynamicStyles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.orderRow}>
                    <Text style={dynamicStyles.orderLabel}>Total:</Text>
                    <Text style={dynamicStyles.orderValue}>${item.total}</Text>
                </View>
                <View style={styles.orderRow}>
                    <Text style={dynamicStyles.orderLabel}>Date:</Text>
                    <Text style={dynamicStyles.orderValue}>
                        {new Date(item.dateCreated).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <Text style={dynamicStyles.tapToView}>Tap to view details</Text>
        </TouchableOpacity>
    );

    const dynamicStyles = {
        header: {
            ...styles.header,
            padding: getResponsiveSpacing(20, width, breakpoint),
            paddingTop: isTablet ? getResponsiveSpacing(40, width, breakpoint) : 60,
        },
        headerTitle: {
            ...styles.headerTitle,
            fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
        },
        headerSubtitle: {
            ...styles.headerSubtitle,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        orderCard: {
            ...styles.orderCard,
            borderRadius: getResponsiveBorderRadius(12, breakpoint),
            padding: getResponsiveSpacing(16, width, breakpoint),
            marginBottom: getResponsiveSpacing(12, width, breakpoint),
            marginHorizontal: getResponsiveSpacing(16, width, breakpoint),
        },
        orderNumber: {
            ...styles.orderNumber,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        statusText: {
            ...styles.statusText,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        orderValue: {
            ...styles.orderValue,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        orderLabel: {
            ...styles.orderLabel,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        tapToView: {
            ...styles.tapToView,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        loadingText: {
            ...styles.loadingText,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
            marginTop: getResponsiveSpacing(16, width, breakpoint),
        },
        emptyText: {
            ...styles.emptyText,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        emptySubtext: {
            ...styles.emptySubtext,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        listContainer: {
            ...styles.listContainer,
            padding: getResponsiveSpacing(16, width, breakpoint),
        },
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={dynamicStyles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerTitle}>My Orders</Text>
                <Text style={dynamicStyles.headerSubtitle}>
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </Text>
            </View>

            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item, index) => `order-${item.id}-${index}`}
                contentContainerStyle={dynamicStyles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={dynamicStyles.emptyText}>No orders found</Text>
                        <Text style={dynamicStyles.emptySubtext}>
                            Your orders will appear here after you make a purchase
                        </Text>
                    </View>
                )}
            />

            {loading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    orderDetails: {
        marginBottom: 12,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    orderLabel: {
        fontSize: 14,
        color: '#666',
    },
    orderValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    tapToView: {
        fontSize: 12,
        color: '#007AFF',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
