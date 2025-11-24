import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ChatItem {
  id: number;
  title: string;
  timeAgo: string;
  status: 'open' | 'urgent' | 'in-progress';
  statusColor: string;
  statusBgColor: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  expanded: boolean;
}

const SupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: 1,
      question: 'How does BNPL PayMedia work?',
      answer: 'BNPL PayMedia allows you to split your purchases into interest-free installments. Shop at partner stores, choose your payment plan, and make payments over time without any extra charges.',
      expanded: false,
    },
    {
      id: 2,
      question: 'Can I pay early?',
      answer: 'Yes, you can pay early without any penalties. Early payments will reduce your outstanding balance and may help improve your credit limit.',
      expanded: false,
    },
    {
      id: 3,
      question: 'How long does verification take?',
      answer: 'Account verification typically takes 1-2 business days. You will receive a notification once your account is verified and ready to use.',
      expanded: false,
    },
    {
      id: 4,
      question: 'How do I increase my spending limit?',
      answer: 'You can increase your spending limit by verifying additional documents, maintaining good payment history, or linking additional payment methods. Visit the Increase Spending Limit section in your profile.',
      expanded: false,
    },
  ]);

  const ongoingChats: ChatItem[] = [
    {
      id: 1,
      title: 'Purchase Issue',
      timeAgo: '2 hours ago',
      status: 'open',
      statusColor: '#0066CC',
      statusBgColor: '#E5F1FF',
    },
    {
      id: 2,
      title: 'Payment failed',
      timeAgo: '5 hours ago',
      status: 'urgent',
      statusColor: '#DC2626',
      statusBgColor: '#FEE2E2',
    },
    {
      id: 3,
      title: 'Login failure',
      timeAgo: '2 hours ago',
      status: 'in-progress',
      statusColor: '#F59E0B',
      statusBgColor: '#FEF3C7',
    },
  ];

  const toggleFAQ = (id: number) => {
    setFaqItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  const handleChatPress = (chat: ChatItem) => {
    console.log('Opening chat:', chat.title);
    // Navigate to chat detail screen
  };

  const handleNeedHelp = () => {
    console.log('Need Help pressed');
    // Navigate to create new support ticket
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'urgent':
        return 'Urgent';
      case 'in-progress':
        return 'In progress';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ongoing Chats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ongoing Chats</Text>
          
          {ongoingChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}
            >
              <View style={styles.chatContent}>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatTitle}>{chat.title}</Text>
                  <Text style={styles.chatTime}>{chat.timeAgo}</Text>
                </View>
                <View style={styles.chatRight}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: chat.statusBgColor }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: chat.statusColor }
                    ]}>
                      {getStatusLabel(chat.status)}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          
          {faqItems.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <Icon 
                  name={item.expanded ? 'minus' : 'plus'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {item.expanded && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Need Help Button */}
        <TouchableOpacity
          style={styles.needHelpButton}
          onPress={handleNeedHelp}
          activeOpacity={0.8}
        >
          <Text style={styles.needHelpText}>Need Help?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7b7f83ff',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    opacity: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  chatTime: {
    fontSize: 13,
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
  chatRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  needHelpButton: {
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  needHelpText: {
    fontSize: 16,
    fontWeight: '600',
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
});

export default SupportScreen;
