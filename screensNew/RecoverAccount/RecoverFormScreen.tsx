import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenTemplate from '../../components/ScreenTemplate';
import Icon from 'react-native-vector-icons/Feather'; // add this import

const RecoverFormScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [mobile, setMobile] = useState('');
    const [description, setDescription] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);

    const isMobileValid = mobile.replace(/\D/g, '').length >= 9;

    const handleSubmit = () => {
        console.log('handleSubmit fired', { mobile, description, fileName });
        navigation.navigate('RecoverSubmittedScreen' as any);
    };

    const handleUpload = () => {
        // no-op so tapping "Upload verification document" does not change UI
    };

    return (
        <ScreenTemplate
            showBackButton
            onBackPress={() => navigation.goBack()}
            showSkipButton={false}
            topTitle="Add your reachable"
            mainTitle="WhatsApp Number"
            description={undefined}
            buttonText="Submit"
            onButtonPress={handleSubmit}
            buttonDisabled={false}
            backgroundColor="#FFFFFF"
            scrollable
        // keep stacked buttons false (single primary)
        >
            <View style={styles.container}>
                {/* Reachable WhatsApp Number */}
                <View style={styles.phoneRow}>
                    <View style={styles.flagWrap}>
                        <Text style={styles.flagText}>🇱🇰 +94</Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        {mobile === '' && (
                            <View style={styles.placeholderContainer} pointerEvents="none">
                                <Text style={styles.placeholderText}>Mobile Number</Text>
                                <Text style={styles.placeholderAsterisk}>*</Text>
                            </View>
                        )}
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#4B5563"
                            value={mobile}
                            onChangeText={setMobile}
                            keyboardType="phone-pad"
                            maxLength={12}
                        />
                    </View>
                </View>

                {/* Description moved into placeholder inside the input */}
                <View style={{ marginTop: 18 }}>
                    <View style={{ position: 'relative' }}>
                        {description === '' && (
                            <View
                                style={[styles.placeholderContainer, { top: 18, left: 18 }]}
                                pointerEvents="none"
                            >
                                <Text style={styles.placeholderText}>Description (Optional)</Text>
                            </View>
                        )}
                        <TextInput
                            style={styles.descriptionInput}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            placeholder=""
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* Upload */}
                <TouchableOpacity style={styles.uploadBox} onPress={handleUpload} activeOpacity={1}>
                    <View style={styles.uploadLeft}>
                        {!fileName && (
                            <Text style={styles.uploadPlaceholder}>Upload verification document</Text>
                        )}
                        <Text style={styles.uploadDesc}>
                            Upload National Identity Card, Passport or Driving licence
                        </Text>
                    </View>

                    <View style={styles.uploadButton}>
                        <Icon name="upload" size={20} color="#111827" />
                    </View>
                </TouchableOpacity>
                {fileName ? (
                    <Text style={styles.fileName}>Selected: {fileName}</Text>
                ) : null}

            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flagWrap: {
        width: 62,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    flagText: {
        fontSize: 14,
    },
    inputWrapper: {
        flex: 1,
        position: 'relative',
    },
    placeholderContainer: {
        position: 'absolute',
        left: 14,
        top: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        zIndex: 1,
    },
    placeholderText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#4B5563',
    },
    placeholderAsterisk: {
        fontSize: 15,
        fontWeight: '400',
        color: '#EF4444',
        marginLeft: 4,
    },
    input: {
        width: '100%',
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: 18,
        fontSize: 15,
        color: '#111827',
        ...Platform.select({
            ios: { fontFamily: 'System' },
            android: { fontFamily: 'Roboto', includeFontPadding: false },
        }),
    },
    descriptionInput: {
        width: '100%',
        minHeight: 120,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 18,
        paddingTop: 14,
        fontSize: 15,
        color: '#111827',
        textAlignVertical: 'top',
        ...Platform.select({
            ios: { fontFamily: 'System' },
            android: { fontFamily: 'Roboto', includeFontPadding: false },
        }),
    },
    uploadBox: {
        marginTop: 18, // match spacing used between fields (same as description's marginTop)
        width: '100%',
        minHeight: 88,             // a little taller to accommodate placeholder + content
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        position: 'relative',     // allow absolute placeholder to sit on top
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    uploadLeft: {
        flex: 1,
        paddingRight: 12,
    },
    uploadPlaceholder: {
        fontSize: 15,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 6,
    },
    uploadDesc: {
        fontSize: 12,
        color: '#6B7280',
    },
    uploadButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#EBEBED',
        justifyContent: 'center',
        alignItems: 'center',
        // keep as regular right-side element (no absolute positioning)
    },
    fileName: {
        marginTop: 8,
        fontSize: 13,
        color: '#6B7280',
    },
});

export default RecoverFormScreen;