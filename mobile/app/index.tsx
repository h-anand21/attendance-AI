import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, shadows, borders } from '../src/theme';
import { BrutalButton } from '../src/components/ui/BrutalButton';
import { DotPattern, GeometricSquare, DiagonalStripes } from '../src/components/ui/BrutalDecorations';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'SMART\nATTENDANCE.',
    subtitle: 'EVERY TIME.',
    tagline: 'SCAN. TRACK. REPEAT.',
    description: 'AI-powered attendance system for modern classrooms.',
    icon: 'scan-outline' as const,
    accentColor: colors.yellow,
  },
  {
    id: '2',
    title: 'YOUR CLASS\nIS JUST A',
    highlight: 'SCAN AWAY',
    description: 'Take attendance anytime with face scan, photo upload, or QR codes.',
    icon: 'camera-outline' as const,
    accentColor: colors.orange,
  },
  {
    id: '3',
    title: 'REPORTS\n& INSIGHTS',
    subtitle: 'POWERED BY AI',
    description: 'Get detailed analytics, anomaly detection, and export to Excel.',
    icon: 'bar-chart-outline' as const,
    accentColor: colors.yellow,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(Number(viewableItems[0].index));
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleGetStarted = () => {
    router.replace('/login');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={[styles.slide, { width }]}>
      {/* Decorative elements */}
      <DotPattern size={60} style={styles.dotTopRight} />
      <GeometricSquare size={20} color={item.accentColor} style={styles.squareDecor1} />
      <GeometricSquare size={12} color={colors.black} style={styles.squareDecor2} />
      
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: item.accentColor }]}>
        <Ionicons name={item.icon} size={48} color={colors.black} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>
      {item.highlight && (
        <View style={[styles.highlightBg, { backgroundColor: item.accentColor }]}>
          <Text style={styles.highlightText}>{item.highlight}</Text>
        </View>
      )}
      {item.subtitle && (
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      )}
      {item.tagline && (
        <View style={styles.taglineContainer}>
          <DiagonalStripes style={{ marginRight: 8 }} />
          <Text style={styles.tagline}>{item.tagline}</Text>
        </View>
      )}

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <View style={styles.header}>
        <View />
        {currentIndex < slides.length - 1 && (
          <Text style={styles.skip} onPress={handleGetStarted}>SKIP</Text>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Pagination & Button */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <BrutalButton
          title={currentIndex === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
          onPress={handleNext}
          variant={currentIndex === slides.length - 1 ? 'primary' : 'yellow'}
          size="lg"
          showArrow
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  skip: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    justifyContent: 'center',
  },
  dotTopRight: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  squareDecor1: {
    position: 'absolute',
    top: 60,
    right: 50,
  },
  squareDecor2: {
    position: 'absolute',
    top: 85,
    right: 40,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 4,
    ...borders.thick,
    ...shadows.brutal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.hero,
    fontSize: 40,
    lineHeight: 44,
    color: colors.black,
    marginBottom: 8,
  },
  highlightBg: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    ...borders.medium,
  },
  highlightText: {
    ...typography.hero,
    fontSize: 32,
    color: colors.black,
  },
  subtitle: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...borders.medium,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  tagline: {
    ...typography.label,
    color: colors.black,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: colors.black,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.borderMedium,
  },
});
