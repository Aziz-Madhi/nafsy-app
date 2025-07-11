import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 200;
const PADDING = 20;

interface MoodData {
  _id: string;
  rating: number;
  timestamp: number;
  factors?: string[];
  note?: string;
}

interface MoodChartProps {
  moodData: MoodData[];
  averageRating?: number;
  trend?: 'improving' | 'declining' | 'neutral';
}

export function MoodChart({ moodData, averageRating = 0, trend = 'neutral' }: MoodChartProps) {
  const { colors, isDark } = useTheme();
  const { locale } = useLocale();
  
  if (moodData.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          {locale === 'ar' ? 'لا توجد بيانات مزاج بعد' : 'No mood data yet'}
        </Text>
      </View>
    );
  }

  // Calculate chart dimensions
  const chartWidth = CHART_WIDTH - (PADDING * 2);
  const chartHeight = CHART_HEIGHT - (PADDING * 2);
  
  // Sort data by timestamp
  const sortedData = [...moodData].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate points for the line chart
  const maxRating = 10;
  const minRating = 1;
  const xStep = chartWidth / Math.max(sortedData.length - 1, 1);
  
  const points = sortedData.map((mood, index) => ({
    x: PADDING + (index * xStep),
    y: PADDING + (chartHeight - ((mood.rating - minRating) / (maxRating - minRating)) * chartHeight),
    rating: mood.rating,
    timestamp: mood.timestamp,
  }));
  
  // Create SVG path
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    // Use quadratic bezier curves for smooth lines
    const prevPoint = points[index - 1];
    const controlX = (prevPoint.x + point.x) / 2;
    return `${path} Q ${controlX} ${prevPoint.y} ${controlX} ${point.y} T ${point.x} ${point.y}`;
  }, '');

  // Create area path (filled area under the line)
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${PADDING + chartHeight} L ${PADDING} ${PADDING + chartHeight} Z`;

  // Get trend color
  const getTrendColor = () => {
    if (trend === 'improving') return '#4ADE80';
    if (trend === 'declining') return '#F87171';
    return colors.interactive.primary;
  };

  // Format date based on locale
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d', { locale: locale === 'ar' ? ar : enUS });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {locale === 'ar' ? 'تتبع المزاج' : 'Mood Tracking'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {locale === 'ar' ? `آخر ${sortedData.length} إدخال` : `Last ${sortedData.length} entries`}
          </Text>
        </View>
        
        {averageRating > 0 && (
          <View style={styles.statsContainer}>
            <Text style={[styles.avgLabel, { color: colors.text.secondary }]}>
              {locale === 'ar' ? 'المتوسط' : 'Average'}
            </Text>
            <Text style={[styles.avgValue, { color: getTrendColor() }]}>
              {averageRating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {/* Grid lines */}
            {[1, 3, 5, 7, 9].map(rating => {
              const y = PADDING + (chartHeight - ((rating - minRating) / (maxRating - minRating)) * chartHeight);
              return (
                <G key={rating}>
                  <Line
                    x1={PADDING}
                    y1={y}
                    x2={PADDING + chartWidth}
                    y2={y}
                    stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <SvgText
                    x={PADDING - 5}
                    y={y + 5}
                    textAnchor="end"
                    fill={colors.text.tertiary}
                    fontSize="12"
                  >
                    {rating}
                  </SvgText>
                </G>
              );
            })}
            
            {/* Area fill */}
            <Path
              d={areaPath}
              fill={colors.interactive.primary}
              fillOpacity="0.1"
            />
            
            {/* Line */}
            <Path
              d={pathData}
              stroke={getTrendColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <G key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill={getTrendColor()}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                {/* Date labels for first, middle, and last points */}
                {(index === 0 || index === Math.floor(points.length / 2) || index === points.length - 1) && (
                  <SvgText
                    x={point.x}
                    y={PADDING + chartHeight + 20}
                    textAnchor="middle"
                    fill={colors.text.tertiary}
                    fontSize="10"
                  >
                    {formatDate(point.timestamp)}
                  </SvgText>
                )}
              </G>
            ))}
          </Svg>
        </View>
      </ScrollView>

      {/* Trend indicator */}
      {trend !== 'neutral' && (
        <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '20' }]}>
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {trend === 'improving' 
              ? (locale === 'ar' ? '📈 تحسن' : '📈 Improving')
              : (locale === 'ar' ? '📉 انخفاض' : '📉 Declining')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'center',
  },
  avgLabel: {
    fontSize: 12,
  },
  avgValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  chartContainer: {
    marginHorizontal: 20,
  },
  emptyContainer: {
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
  },
  trendBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
});