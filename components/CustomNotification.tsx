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

const { width } = Dimensions.get('window');

const CustomNotification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible,
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from right and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
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
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
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

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          borderLeftColor: '#2E7D32',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          borderLeftColor: '#C62828',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          borderLeftColor: '#E65100',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#2196F3',
          borderLeftColor: '#1565C0',
        };
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
        style={[styles.notification, getNotificationStyle()]}
        onPress={hideNotification}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={3}>
            {message}
          </Text>
        </View>
        
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 10,
    left: 10,
    zIndex: 9999,
    elevation: 9999,
  },
  notification: {
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 60,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  icon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    marginRight: 8,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomNotification;
