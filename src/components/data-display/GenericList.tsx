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
import { useAppTheme } from '@/theme';

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
const Separator = memo(({ style }: { style?: ViewStyle }) => {
  const appTheme = useAppTheme();
  const styles = createStyles(appTheme);
  return <View style={[styles.separator, style]} />;
});

Separator.displayName = 'GenericList.Separator';

/**
 * Loading footer component
 */
const LoadingFooter = memo(({ loading }: { loading: boolean }) => {
  const appTheme = useAppTheme();
  const styles = createStyles(appTheme);
  
  if (!loading) return null;
  
  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" color={appTheme.colors.interactive.primary} />
      <Text style={styles.loadingText}>Loading more...</Text>
    </View>
  );
});

LoadingFooter.displayName = 'GenericList.LoadingFooter';

/**
 * Empty state component
 */
const EmptyState = memo(({
  title = "No items found",
  description,
  icon: _icon,
  onRetry,
  error,
}: {
  title?: string;
  description?: string;
  icon?: string;
  onRetry?: () => void;
  error?: string | null;
}) => {
  const appTheme = useAppTheme();
  const styles = createStyles(appTheme);
  
  return (
    <View style={styles.emptyState}>
      {/* TODO: Add SF Symbol support when available */}
      <Text style={styles.emptyTitle}>
        {error ? "Something went wrong" : title}
      </Text>
      {(description || error) ? <Text style={styles.emptyDescription}>
          {error || description}
        </Text> : null}
      {error && onRetry ? <TouchableOpacity style={appTheme.styles.primaryButton} onPress={onRetry}>
          <Text style={appTheme.styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity> : null}
    </View>
  );
});

EmptyState.displayName = 'GenericList.EmptyState';

// Stable wrapper components to avoid inline definitions
// Note: These need to be external to avoid nested component issues

const GenericListComponent = memo(function GenericListComponent<T extends ListItem>({
  data,
  renderItem,
  
  // Loading states
  loading = false,
  refreshing = false,
  loadingMore: _loadingMore = false,
  
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
  onSearch: _onSearch,
  searchPlaceholder: _searchPlaceholder,
  
  // Styling
  contentContainerStyle,
  separatorStyle: _separatorStyle,
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
  const appTheme = useAppTheme();
  const styles = createStyles(appTheme);

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
          <ActivityIndicator size="large" color={appTheme.colors.interactive.primary} />
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
  }, [loading, EmptyComponent, emptyTitle, emptyDescription, emptyIcon, error, onRetry, styles.loadingState, styles.loadingText, appTheme.colors.interactive.primary]);

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
        tintColor={appTheme.colors.interactive.primary}
        colors={[appTheme.colors.interactive.primary]}
      />
    );
  }, [onRefresh, refreshing, appTheme.colors.interactive.primary]);

  // Use conditional rendering instead of inline components

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
      
      // UI components - using base components directly
      ItemSeparatorComponent={showSeparators ? Separator : undefined}
      ListEmptyComponent={EmptyListComponent}
      ListFooterComponent={LoadingFooter}
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

const createStyles = (appTheme: ReturnType<typeof useAppTheme>) => ({
  list: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: appTheme.colors.divider,
    marginLeft: appTheme.spacing.md,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: appTheme.spacing.xl,
  },
  emptyTitle: {
    fontSize: appTheme.fontSize.lg,
    fontWeight: appTheme.fontWeight.semibold,
    color: appTheme.colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: appTheme.spacing.xs,
  },
  emptyDescription: {
    fontSize: appTheme.fontSize.md,
    color: appTheme.colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: appTheme.spacing.lg,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: appTheme.spacing.xl * 2,
  },
  loadingFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: appTheme.spacing.md,
    gap: appTheme.spacing.xs,
  },
  loadingText: {
    fontSize: appTheme.fontSize.sm,
    color: appTheme.colors.text.secondary,
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

export const SimpleListItem = memo<SimpleListItemProps>(({ title, subtitle, icon: _icon, rightText }) => {
  const appTheme = useAppTheme();
  const simpleItemStyles = createSimpleItemStyles(appTheme);
  
  return (
    <View style={simpleItemStyles.container}>
      <View style={simpleItemStyles.content}>
        <Text style={simpleItemStyles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={simpleItemStyles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text> : null}
      </View>
      {rightText ? <Text style={simpleItemStyles.rightText} numberOfLines={1}>
          {rightText}
        </Text> : null}
    </View>
  );
});

SimpleListItem.displayName = 'SimpleListItem';

const createSimpleItemStyles = (appTheme: ReturnType<typeof useAppTheme>) => ({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    backgroundColor: appTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: appTheme.fontSize.md,
    fontWeight: appTheme.fontWeight.medium,
    color: appTheme.colors.text.primary,
  },
  subtitle: {
    fontSize: appTheme.fontSize.sm,
    color: appTheme.colors.text.secondary,
    marginTop: 2,
  },
  rightText: {
    fontSize: appTheme.fontSize.sm,
    color: appTheme.colors.text.secondary,
    marginLeft: appTheme.spacing.sm,
  },
});

