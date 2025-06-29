import { CategoryCard } from '@/components/commerce';
import {
  getGridColumns,
  getResponsiveFontSize,
  getResponsiveSpacing,
  getTypographyScale,
  useResponsive
} from '@/hooks/useResponsive';
import { Category, wooCommerceApi } from '@/services/woocommerce';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width, fontScale, breakpoint, isSmallPhone, isTablet } = useResponsive();

  const typography = getTypographyScale(breakpoint);
  const numColumns = getGridColumns(width, isSmallPhone ? 160 : isTablet ? 220 : 180);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await wooCommerceApi.getCategories();
      // Filter out categories with no products
      const categoriesWithProducts = fetchedCategories.filter(category => category.count > 0);
      setCategories(categoriesWithProducts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/explore',
      params: {
        categoryId: category.id.toString(),
        categoryName: category.name
      }
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard category={item} onPress={handleCategoryPress} containerWidth={width} />
  );

  const dynamicStyles = {
    headerTitle: {
      ...styles.headerTitle,
      fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
    },
    headerSubtitle: {
      ...styles.headerSubtitle,
      fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
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
        <Text style={dynamicStyles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Product Categories</Text>
        <Text style={dynamicStyles.headerSubtitle}>Choose a category to browse products</Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item, index) => `category-${item.id}-${index}`}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        contentContainerStyle={dynamicStyles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>No categories found</Text>
            <Text style={dynamicStyles.emptySubtext}>Pull to refresh and try again</Text>
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
    padding: 8,
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
  },
});
