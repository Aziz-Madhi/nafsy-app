import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  FlatListProps,
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import * as AC from '@bacons/apple-colors';
import { CommonStyles } from '@/utils/styles';

/**
 * GenericList - High-performance virtualized list component
 * Following LEVER framework - single component handling all list patterns
 * 
 * Features:
 * - Virtualization with FlatList for performance
 * - Built-in loading states and error handling
 * - Empty state management
 * - Pull-to-refresh support
 * - Search/filter support
 * - Pagination support
 * - iOS-optimized performance settings
 */

interface ListItem {
  id: string;
  [key: string]: any;
}

interface GenericListProps<T extends ListItem> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  // Data
  data: T[];
  renderItem: ListRenderItem<T>;
  
  // Loading states
  loading?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
  
  // Callbacks
  onRefresh?: () => void;
  onEndReached?: () => void;
  onItemPress?: (item: T) => void;
  
  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  EmptyComponent?: React.ComponentType;
  
  // Error state
  error?: string | null;
  onRetry?: () => void;
  
  // Search
  searchQuery?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  
  // Styling
  contentContainerStyle?: ViewStyle;
  separatorStyle?: ViewStyle;
  showSeparators?: boolean;
  
  // Performance
  estimatedItemHeight?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  
  // Accessibility
  accessibilityLabel?: string;
}

/**
 * Memoized separator component for performance
 */
const Separator = memo(({ style }: { style?: ViewStyle }) => (
  <View style={[styles.separator, style]} />
));

/**
 * Loading footer component
 */
const LoadingFooter = memo(({ loading }: { loading: boolean }) => {
  if (!loading) return null;
  
  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" color={AC.systemBlue} />
      <Text style={styles.loadingText}>Loading more...</Text>
    </View>
  );
});

/**
 * Empty state component
 */
const EmptyState = memo(({
  title = "No items found",
  description,
  icon,
  onRetry,
  error,
}: {
  title?: string;
  description?: string;
  icon?: string;
  onRetry?: () => void;
  error?: string | null;
}) => (
  <View style={styles.emptyState}>
    {/* TODO: Add SF Symbol support when available */}
    <Text style={styles.emptyTitle}>
      {error ? "Something went wrong" : title}
    </Text>
    {(description || error) && (
      <Text style={styles.emptyDescription}>
        {error || description}
      </Text>
    )}
    {error && onRetry && (
      <TouchableOpacity style={CommonStyles.primaryButton} onPress={onRetry}>
        <Text style={CommonStyles.primaryButtonText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
));

const GenericListComponent = memo(function GenericListComponent<T extends ListItem>({
  data,
  renderItem,
  
  // Loading states
  loading = false,
  refreshing = false,
  loadingMore = false,
  
  // Callbacks
  onRefresh,
  onEndReached,
  onItemPress,
  
  // Empty state
  emptyTitle,
  emptyDescription,
  emptyIcon,
  EmptyComponent,
  
  // Error state
  error,
  onRetry,
  
  // Search
  searchQuery,
  onSearch,
  searchPlaceholder,
  
  // Styling
  contentContainerStyle,
  separatorStyle,
  showSeparators = true,
  
  // Performance optimizations
  estimatedItemHeight,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  
  // Accessibility
  accessibilityLabel,
  
  // Rest of FlatList props
  ...flatListProps
}: GenericListProps<T>) {

  // Memoize filtered data to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item => 
      Object.values(item).some(value => 
        typeof value === 'string' && 
        value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  // Memoize render item with onPress support
  const memoizedRenderItem = useCallback<ListRenderItem<T>>(
    ({ item, index }) => {
      const originalComponent = renderItem({ item, index, separators: {} as any });
      
      if (!onItemPress) return originalComponent;
      
      return (
        <TouchableOpacity 
          onPress={() => onItemPress(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          {originalComponent}
        </TouchableOpacity>
      );
    },
    [renderItem, onItemPress]
  );

  // Memoize empty component
  const EmptyListComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={AC.systemBlue} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (EmptyComponent) {
      return <EmptyComponent />;
    }

    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        error={error}
        onRetry={onRetry}
      />
    );
  }, [loading, EmptyComponent, emptyTitle, emptyDescription, emptyIcon, error, onRetry]);

  // Performance: Get item layout for better scrolling performance
  const getItemLayout = useMemo(() => {
    if (!estimatedItemHeight) return undefined;
    
    return (data: any, index: number) => ({
      length: estimatedItemHeight,
      offset: estimatedItemHeight * index,
      index,
    });
  }, [estimatedItemHeight]);

  // Memoize refresh control
  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;
    
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={AC.systemBlue}
        colors={[AC.systemBlue]}
      />
    );
  }, [onRefresh, refreshing]);

  return (
    <FlatList
      data={filteredData}
      renderItem={memoizedRenderItem}
      keyExtractor={(item) => item.id}
      
      // Performance optimizations
      removeClippedSubviews
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      initialNumToRender={10}
      getItemLayout={getItemLayout}
      
      // UI components
      ItemSeparatorComponent={showSeparators ? () => <Separator style={separatorStyle} /> : undefined}
      ListEmptyComponent={EmptyListComponent}
      ListFooterComponent={() => <LoadingFooter loading={loadingMore} />}
      refreshControl={refreshControl}
      
      // Event handlers
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      
      // Styling
      contentContainerStyle={[
        filteredData.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      style={styles.list}
      
      // Accessibility
      accessibilityLabel={accessibilityLabel}
      
      // iOS optimizations
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      
      // Pass through remaining props
      {...flatListProps}
    />
  );
});

// Export the already memoized component
export const GenericList = GenericListComponent as <T extends ListItem>(
  props: GenericListProps<T>
) => React.ReactElement;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AC.separator,
    marginLeft: 16,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AC.label,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: AC.secondaryLabel,
  },
});

/**
 * Specialized list variants for common use cases
 */

// Simple item list (for basic data display)
export interface SimpleListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  rightText?: string;
}

export const SimpleListItem = memo<SimpleListItemProps>(({ title, subtitle, icon, rightText }) => (
  <View style={simpleItemStyles.container}>
    <View style={simpleItemStyles.content}>
      <Text style={simpleItemStyles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text style={simpleItemStyles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </View>
    {rightText && (
      <Text style={simpleItemStyles.rightText} numberOfLines={1}>
        {rightText}
      </Text>
    )}
  </View>
));

const simpleItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AC.systemBackground,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: AC.label,
  },
  subtitle: {
    fontSize: 14,
    color: AC.secondaryLabel,
    marginTop: 2,
  },
  rightText: {
    fontSize: 14,
    color: AC.secondaryLabel,
    marginLeft: 12,
  },
});

