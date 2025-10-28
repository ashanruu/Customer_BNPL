import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide: () => void;
  visible: boolean;
}

const { width, height } = Dimensions.get('window');

const CustomNotification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible,
}) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top right with fade in animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -width,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
      default:
        return '#3B82F6';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.notification}
        onPress={hideNotification}
        activeOpacity={0.95}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
            <Text style={styles.icon}>{getIcon()}</Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 0,
    left: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  notification: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  icon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    color: '#6b727eff',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default CustomNotification;
