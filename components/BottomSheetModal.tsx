import React, { ReactNode, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  Dimensions,
} from 'react-native';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  
  // Header
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showCloseButton?: boolean;
  headerRight?: ReactNode;
  
  // Content
  children: ReactNode;
  scrollable?: boolean;
  
  // Footer
  footerContent?: ReactNode;
  
  // Customization
  height?: number | 'auto' | 'full';
  backgroundColor?: string;
  showHandle?: boolean;
  closeOnBackdropPress?: boolean;
  
  // Styling
  contentPadding?: number;
  borderRadius?: number;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  title,
  showBackButton = false,
  onBackPress,
  showCloseButton = true,
  headerRight,
  children,
  scrollable = true,
  footerContent,
  height = 'auto',
  backgroundColor = '#FFFFFF',
  showHandle = true,
  closeOnBackdropPress = true,
  contentPadding = 24,
  borderRadius = 24,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = React.useRef(new Animated.Value(0)).current;
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e: any) => {
      const h = e?.endCoordinates?.height || 0;
      setKeyboardHeight(h);
      Animated.timing(translateY, {
        toValue: -h,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const onKeyboardHide = () => {
      setKeyboardHeight(0);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY]);

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      onClose();
    }
  };

  const getContainerHeight = () => {
    if (height === 'full') {
      return '100%';
    }
    if (height === 'auto') {
      return undefined;
    }
    return height;
  };

  // compute a dynamic maxHeight so when keyboard appears the sheet can extend/shift
  const computedMaxHeight =
    height === 'auto'
      ? Math.max(windowHeight * 0.3, windowHeight * 0.9 - keyboardHeight) // ensure a min height
      : height === 'full'
      ? windowHeight - keyboardHeight
      : (height as number);

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentWrapperProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        bounces: false,
        contentContainerStyle: [
          styles.scrollContent,
          { paddingHorizontal: contentPadding },
        ],
      }
    : {
        style: [styles.content, { paddingHorizontal: contentPadding }],
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor,
                  borderTopLeftRadius: borderRadius,
                  borderTopRightRadius: borderRadius,
                  height: getContainerHeight(),
                  maxHeight: computedMaxHeight,
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* Handle Bar */}
              {showHandle && (
                <View style={styles.handleContainer}>
                  <View style={styles.handle} />
                </View>
              )}

              {/* Header */}
              {(showBackButton || title || showCloseButton || headerRight) && (
                <View style={styles.header}>
                  {showBackButton && (
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={handleBack}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                  )}
                  
                  {title && (
                    <Text
                      style={[
                        styles.title,
                        showBackButton && styles.titleWithBack,
                      ]}
                    >
                      {title}
                    </Text>
                  )}

                  <View style={styles.headerRight}>
                    {headerRight}
                    {showCloseButton && !showBackButton && (
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.closeIcon}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Content */}
              <ContentWrapper {...contentWrapperProps}>
                {children}
              </ContentWrapper>

              {/* Footer */}
              {footerContent && (
                <View style={[styles.footer, { paddingHorizontal: contentPadding }]}>
                  {footerContent}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    minHeight: 40,
    position: 'relative',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'absolute',
    right: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
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
  titleWithBack: {
    textAlign: 'left',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default BottomSheetModal;
