import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ImageSourcePropType,
} from 'react-native';

interface UserProfileHeaderProps {
  greeting?: string;
  userName: string;
  avatarSource: ImageSourcePropType;
  onEditPress?: () => void;
  onUserPress?: () => void;
  backgroundColor?: string;
  greetingColor?: string;
  userNameColor?: string;
  editIconColor?: string;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  greeting = 'Member Since 12.10.2023',
  userName,
  avatarSource,
  onEditPress,
  onUserPress,
  backgroundColor = '#FFFFFF',
  greetingColor = '#9CA3AF',
  userNameColor = '#1F2937',
  editIconColor = '#6B7280',
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={onUserPress}
        disabled={!onUserPress}
        activeOpacity={onUserPress ? 0.7 : 1}
      >
        <Image
          source={avatarSource}
          style={styles.avatar}
        />
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: userNameColor }]}>
            {userName}
          </Text>
          <Text style={[styles.greeting, { color: greetingColor }]}>
            {greeting}
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.editButton}
        onPress={onEditPress}
      >
        <Image
          source={require('../assets/images/Frame 1686552504.png')}
          style={styles.editIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    marginLeft: 24,
    marginRight: 24,
    borderRadius: 12,   
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.05,
    //     shadowRadius: 4,
    //   },
    //   android: {
    //     elevation: 2,
    //   },
    // }),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  greeting: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  editButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    width: 36,
    height: 36,
  },
});

export default UserProfileHeader;
