import { ProductCard } from '@/components/commerce';
import {
  getGridColumns,
  getResponsiveBorderRadius,
  getResponsiveFontSize,
  getResponsiveSpacing,
  getTypographyScale,
  useResponsive
} from '@/hooks/useResponsive';
import { Product, wooCommerceApi } from '@/services/woocommerce';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProductsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { width, fontScale, breakpoint, isSmallPhone, isTablet } = useResponsive();

  const typography = getTypographyScale(breakpoint);
  const numColumns = getGridColumns(width, isSmallPhone ? 160 : isTablet ? 200 : 180);

  const fetchProducts = useCallback(async (pageNum = 1, search = '', reset = false) => {
    try {
      let fetchedProducts: Product[];

      if (categoryId && !search) {
        // Fetch products by category
        fetchedProducts = await wooCommerceApi.getProductsByCategory(
          Number(categoryId),
          { per_page: 20, page: pageNum }
        );
      } else {
        // Fetch all products or search
        fetchedProducts = await wooCommerceApi.getProducts({
          per_page: 20,
          page: pageNum,
          search
        });
      }

      if (reset || pageNum === 1) {
        setProducts(fetchedProducts);
      } else {
        setProducts(prev => [...prev, ...fetchedProducts]);
      }

      setHasMore(fetchedProducts.length === 20);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(1, searchQuery, true);
  }, [categoryId, searchQuery, fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts(1, searchQuery, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, searchQuery, false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} containerWidth={width} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const dynamicStyles = {
    headerTitle: {
      ...styles.headerTitle,
      fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
    },
    searchInput: {
      ...styles.searchInput,
      fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
      paddingHorizontal: getResponsiveSpacing(16, width, breakpoint),
      paddingVertical: getResponsiveSpacing(12, width, breakpoint),
      borderRadius: getResponsiveBorderRadius(8, breakpoint),
    },
    clearButton: {
      ...styles.clearButton,
      marginLeft: getResponsiveSpacing(12, width, breakpoint),
      paddingVertical: getResponsiveSpacing(8, width, breakpoint),
      paddingHorizontal: getResponsiveSpacing(12, width, breakpoint),
      borderRadius: getResponsiveBorderRadius(6, breakpoint),
    },
    clearButtonText: {
      ...styles.clearButtonText,
      fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
    },
    header: {
      ...styles.header,
      padding: getResponsiveSpacing(20, width, breakpoint),
      paddingTop: isTablet ? getResponsiveSpacing(40, width, breakpoint) : 60,
    },
    listContainer: {
      ...styles.listContainer,
      padding: getResponsiveSpacing(8, width, breakpoint),
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
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={dynamicStyles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>
          {categoryName ? `${categoryName}` : 'All Products'}
        </Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={dynamicStyles.clearButton} onPress={clearSearch}>
              <Text style={dynamicStyles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item, index) => `product-${item.id}-${index}`}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        contentContainerStyle={dynamicStyles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>
              {searchQuery ? 'No products found for your search' : 'No products found'}
            </Text>
            <Text style={dynamicStyles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Pull to refresh and try again'}
            </Text>
          </View>
        )}
      />
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
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
