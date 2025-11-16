import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingCardProps {
  // Image
  image: ImageSourcePropType;
  imageHeight?: number;
  
  // Background
  backgroundColor?: string;
  topBackgroundColor?: string;
  
  // Text Content
  title: string;
  subtitle: string;
  description?: string;
  
  // Step Indicator
  currentStep: number;
  totalSteps: number;
  activeIndicatorColor?: string;
  inactiveIndicatorColor?: string;
  
  // Navigation
  onNext?: () => void;
  onSkip?: () => void;
  nextButtonText?: string;
  showSkipButton?: boolean;
  showNextButton?: boolean;
  skipButtonText?: string;
  
  // Customization
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  nextButtonColor?: string;
  nextButtonTextColor?: string;
  isFullScreen?: boolean;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  image,
  imageHeight = height * 0.45,
  backgroundColor = '#FFFFFF',
  topBackgroundColor = '#FFB5B5',
  title,
  subtitle,
  description,
  currentStep,
  totalSteps,
  activeIndicatorColor = '#1F2937',
  inactiveIndicatorColor = '#E5E7EB',
  onNext,
  onSkip,
  nextButtonText = 'Next',
  showSkipButton = true,
  showNextButton = true,
  skipButtonText = 'Skip',
  titleColor = '#1F2937',
  subtitleColor = '#0066CC',
  descriptionColor = '#6B7280',
  nextButtonColor = '#0066CC',
  nextButtonTextColor = '#FFFFFF',
  isFullScreen = false,
}) => {
  return (
    <View style={[styles.container, isFullScreen && { backgroundColor }]}>
      {/* Top Section with Image */}
      <View
        style={[
          styles.topSection,
          { backgroundColor: topBackgroundColor },
          isFullScreen && styles.topSectionFull,
        ]}
      >
        {/* Skip Button */}
        {showSkipButton && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>{skipButtonText}</Text>
          </TouchableOpacity>
        )}

        {/* Status Bar Spacing */}
        <View style={styles.statusBarSpacer} />

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={image}
            style={styles.image}
          />
        </View>
      </View>

      {/* Bottom Section with Content */}
      <View
        style={[
          styles.bottomSection,
          { backgroundColor },
          isFullScreen && styles.bottomSectionFull,
        ]}
      >
        {/* Text Content */}
        <View style={styles.contentContainer}>
          {/* Decorative Line */}
          <View style={styles.decorativeLine} />
          
          <Text style={[styles.title, { color: titleColor }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {subtitle}
          </Text>
          {description && (
            <Text style={[styles.description, { color: descriptionColor }]}>
              {description}
            </Text>
          )}
        </View>

        {/* Step Indicators and Next Button */}
        <View style={styles.bottomControls}>
          {/* Step Indicators */}
          <View style={styles.indicatorContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep
                    ? {
                        backgroundColor: activeIndicatorColor,
                        width: 32,
                      }
                    : {
                        backgroundColor: inactiveIndicatorColor,
                      },
                ]}
              />
            ))}
          </View>

          {/* Next Button */}
          {showNextButton && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: nextButtonColor }]}
              onPress={onNext}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextButtonText, { color: nextButtonTextColor }]}>
                {nextButtonText}
              </Text>
              <View style={styles.arrowIcon}>
                <Text style={[styles.arrowText, { color: nextButtonTextColor }]}>→</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 1.5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  topSectionFull: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 44 : 24,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 35,
    right: 12,
    backgroundColor: '#e8e5e589',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 30,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    width: '140%',
    height: '160%',
    position: 'absolute',
    top: 0,
    resizeMode: 'cover',
  },
  bottomSection: {
    paddingHorizontal: 35,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomSectionFull: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 0,
      },
    }),
  },
  contentContainer: {
    marginBottom: 45,
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 100,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  arrowIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default OnboardingCard;
