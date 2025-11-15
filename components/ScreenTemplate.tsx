import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';

interface ScreenTemplateProps {
  // Header
  showBackButton?: boolean;
  onBackPress?: () => void;
  showSkipButton?: boolean;
  onSkipPress?: () => void;
  skipButtonText?: string;
  
  // Title Section
  topTitle?: string;
  mainTitle: string;
  description?: string;
  
  // Content
  children: ReactNode;
  
  // Footer Button
  buttonText: string;
  onButtonPress: () => void;
  buttonDisabled?: boolean;
  buttonLoading?: boolean;
  
  // Customization
  backgroundColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  scrollable?: boolean;
  
  // Styling
  topTitleColor?: string;
  mainTitleColor?: string;
  descriptionColor?: string;
  backButtonColor?: string;
}

const ScreenTemplate: React.FC<ScreenTemplateProps> = ({
  showBackButton = true,
  onBackPress,
  showSkipButton = false,
  onSkipPress,
  skipButtonText = 'Skip',
  topTitle,
  mainTitle,
  description,
  children,
  buttonText,
  onButtonPress,
  buttonDisabled = false,
  buttonLoading = false,
  backgroundColor = '#FFFFFF',
  buttonColor = '#0066CC',
  buttonTextColor = '#FFFFFF',
  scrollable = true,
  topTitleColor = '#6B7280',
  mainTitleColor = '#1F2937',
  descriptionColor = '#757a85ff',
  backButtonColor = '#9CA3AF',
}) => {
  const ContentWrapper = scrollable ? ScrollView : View;
  const contentWrapperProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled' as const,
        contentContainerStyle: styles.scrollContent,
      }
    : { style: styles.content };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
        backgroundColor={backgroundColor}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header with Back Button and Skip Button */}
        <View style={styles.header}>
          {showBackButton ? (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: backButtonColor }]}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          {showSkipButton && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkipPress}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>{skipButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          {topTitle && (
            <Text style={[styles.topTitle, { color: topTitleColor }]}>
              {topTitle}
            </Text>
          )}
          <Text style={[styles.mainTitle, { color: mainTitleColor }]}>
            {mainTitle}
          </Text>
          {description && (
            <Text style={[styles.description, { color: descriptionColor }]}>
              {description}
            </Text>
          )}
        </View>

        {/* Content Area */}
        <ContentWrapper {...contentWrapperProps}>
          {children}
        </ContentWrapper>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: buttonColor },
              buttonDisabled && styles.buttonDisabled,
            ]}
            onPress={onButtonPress}
            disabled={buttonDisabled || buttonLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: buttonTextColor }]}>
              {buttonLoading ? 'Loading...' : buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 28 : 32,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButtonPlaceholder: {
    width: 48,
    height: 48,
  },
  backArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingTop: 0,
    paddingBottom: 0,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        marginTop: -2,
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 6,
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
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 10,
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
    fontWeight: '400',
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 50,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
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
});

export default ScreenTemplate;
