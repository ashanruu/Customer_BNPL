import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { MainText, SubText } from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  message?: string;
  cardType?: string;
  cardNumber?: string;
  cardHolderName?: string;
}

const CardAddedSuccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  
  const params = route.params as RouteParams || {};
  const {
    message = 'Card Adding Successful',
    cardType = 'Credit Card',
    cardNumber = '',
    cardHolderName = ''
  } = params;

  // Animation states
  const [checkmarkScale] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));
  const [cardSlide] = useState(new Animated.Value(50));

  useEffect(() => {
    // Start animations when component mounts
    const animationSequence = Animated.sequence([
      // Checkmark animation
      Animated.spring(checkmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
        delay: 300,
      }),
      // Content fade in
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start();
  }, []);

  const handleDone = () => {
    // Navigate back to cards list or previous screen
    navigation.goBack();
  };

  const handleAddAnotherCard = () => {
    // Navigate to add card screen again
    (navigation as any).navigate('AddCardScreen');
  };

  const getCardIcon = (type: string) => {
    const cardTypeLower = type.toLowerCase();
    if (cardTypeLower.includes('visa')) {
      return 'credit-card-outline';
    } else if (cardTypeLower.includes('master')) {
      return 'credit-card-outline';
    } else if (cardTypeLower.includes('american') || cardTypeLower.includes('amex')) {
      return 'credit-card-outline';
    }
    return 'credit-card-outline';
  };

  const maskCardNumber = (number: string) => {
    if (!number || number.length < 4) return '•••• •••• •••• ••••';
    const lastFour = number.slice(-4);
    return{lastFour};
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScale }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={100}
              color={Colors.light.tint}
            />
          </Animated.View>
        </View>

        {/* Success Content */}
        <Animated.View
          style={[
            styles.successContent,
            {
              opacity: contentOpacity,
              transform: [{ translateY: cardSlide }],
            },
          ]}
        >
          <MainText size="xlarge" weight="bold" style={styles.successTitle}>
            Success!
          </MainText>
          
          <SubText size="large" style={styles.successMessage}>
            {message}
          </SubText>

          {/* Card Preview */}
          {cardNumber && (
            <View style={styles.cardPreview}>
              <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name={getCardIcon(cardType)}
                    size={32}
                    color={Colors.light.tint}
                  />
                  <SubText size="medium" weight="semibold" style={styles.cardType}>
                    {cardType}
                  </SubText>
                </View>
                
                <View style={styles.cardDetails}>
                  <SubText size="medium" style={styles.cardNumber}>
                    {maskCardNumber(cardNumber)}
                  </SubText>
                  
                  {cardHolderName && (
                    <SubText size="small" style={styles.cardHolder}>
                      {cardHolderName.toUpperCase()}
                    </SubText>
                  )}
                </View>

                <View style={styles.cardStatus}>
                  <View style={styles.statusBadge}>
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color="#10B981"
                    />
                    <SubText size="small" style={styles.statusText}>
                      Active
                    </SubText>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Benefits List */}
          <View style={styles.benefitsContainer}>
            <SubText size="medium" weight="semibold" style={styles.benefitsTitle}>
              What's Next?
            </SubText>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="shopping-outline"
                  size={20}
                  color={Colors.light.tint}
                />
                <SubText size="small" style={styles.benefitText}>
                  Start shopping with Buy Now, Pay Later
                </SubText>
              </View>
              
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={20}
                  color={Colors.light.tint}
                />
                <SubText size="small" style={styles.benefitText}>
                  Flexible payment schedules
                </SubText>
              </View>
              
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={20}
                  color={Colors.light.tint}
                />
                <SubText size="small" style={styles.benefitText}>
                  Secure and protected transactions
                </SubText>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionsContainer,
            { opacity: contentOpacity },
          ]}
        >
          <CustomButton
            title="Done"
            onPress={handleDone}
            style={styles.doneButton}
            size="large"
          />
          
          <TouchableOpacity
            style={styles.addAnotherButton}
            onPress={handleAddAnotherCard}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={Colors.light.tint}
              style={styles.addIcon}
            />
            <Text style={styles.addAnotherText}>
              Add Another Card
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  animationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
  },
  successTitle: {
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    color: Colors.light.mutedText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  cardPreview: {
    width: '100%',
    marginBottom: 32,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardType: {
    color: Colors.light.text,
    marginLeft: 12,
  },
  cardDetails: {
    marginBottom: 16,
  },
  cardNumber: {
    color: Colors.light.text,
    fontFamily: 'monospace',
    fontSize: 18,
    marginBottom: 8,
    letterSpacing: 2,
  },
  cardHolder: {
    color: Colors.light.mutedText,
    fontFamily: 'monospace',
  },
  cardStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '600',
  },
  benefitsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  benefitsTitle: {
    color: Colors.light.text,
    marginBottom: 16,
  },
  benefitsList: {
    width: '100%',
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  benefitText: {
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  actionsContainer: {
    paddingTop: 20,
  },
  doneButton: {
    marginBottom: 16,
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    backgroundColor: 'transparent',
  },
  addIcon: {
    marginRight: 8,
  },
  addAnotherText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CardAddedSuccessScreen;