import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'react-native';

type RootStackParamList = {
  ServiceSelection: { name: string };
};

export default function LoginPage() {
  const { colors } = useTheme();
  const backgroundColor = colors.background;
  const textColor = colors.onBackground;
  const inputBackground = colors.surface;

  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [isNewUser, setIsNewUser] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resentMessage, setResentMessage] = useState(false);

  const mobileInputRef = useRef<any>(null);
  const otpInputsRef = useRef<any[]>([]);
  const firstNameInputRef = useRef<any>(null);
  const emailInputRef = useRef<any>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, timer]);

  useEffect(() => {
    if (otpSent) {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }
  }, [otpSent]);

  useEffect(() => {
    if (otpVerified && isNewUser) {
      setTimeout(() => firstNameInputRef.current?.focus(), 100);
    }
  }, [otpVerified, isNewUser]);

  const formatTimer = (time: number) => {
    if (time === 0) return 'Code expired. Click resend code';
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendOtp = () => {
    Keyboard.dismiss();
    const mobilePattern = /^[6-9]\d{9}$/;
    if (mobilePattern.test(mobile)) {
      setLoading(true);
      setTimeout(() => {
        setOtpSent(true);
        setTimer(120);
        setLoading(false);
      }, 1000);
    } else {
      setOtpError('Enter a valid 10-digit mobile number');
      mobileInputRef.current?.focus();
    }
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '']);
    setTimer(120);
    setOtpError('');
    setResentMessage(true);
    setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
  };

  const handleVerifyOtp = () => {
    Keyboard.dismiss();
    if (otp.join('').length < 4) {
      setOtpError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (otp.join('') === '1234') {
        setOtpVerified(true);
        setOtpError('');
        const isUserNew = mobile === '9876543210';
        setIsNewUser(isUserNew);
        if (!isUserNew) {
          navigation.navigate('ServiceSelection', { name: firstName });
        }
      } else {
        setOtpError('Invalid OTP. Please try again.');
        startShake();
      }
      setLoading(false);
    }, 1000);
  };

  const handleProfileSubmit = () => {
    Keyboard.dismiss();
    if (!firstName.trim()) {
      firstNameInputRef.current?.focus();
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      emailInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      navigation.replace('ServiceSelection', { name: firstName });
      setLoading(false);
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 40, backgroundColor }}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />
      {!otpSent && (
        <>
          <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 20, color: textColor }}>
            Mobile Verification
          </Text>
          <TextInput
            ref={mobileInputRef}
            mode="outlined"
            label="Enter Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(text) => {
              setMobile(text);
              setOtpError('');
            }}
            style={{ marginBottom: 20, backgroundColor: inputBackground }}
            autoFocus
            onSubmitEditing={handleSendOtp}
            error={!!otpError}
          />
          {otpError && (
            <Text style={{ color: 'red', marginBottom: 10 }}>{otpError}</Text>
          )}
          <Button
            mode="contained"
            onPress={handleSendOtp}
            buttonColor={colors.primary}
            textColor={backgroundColor}
            loading={loading}
            disabled={loading}
          >
            Send OTP
          </Button>
        </>
      )}
      {otpSent && !otpVerified && (
        <>
          <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 20, color: textColor }}>
            {resentMessage ? `OTP resent to +91 ${mobile}` : `Enter OTP sent to +91 ${mobile}`}
          </Text>

          <Animated.View
            style={{
              transform: [{ translateX: shakeAnimation }],
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref: any) => (otpInputsRef.current[index] = ref)}
                mode="outlined"
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                style={{
                  width: 60,
                  height: 60,
                  fontSize: 24,
                  textAlign: 'center',
                  backgroundColor: inputBackground,
                }}
                error={!!otpError}
              />
            ))}
          </Animated.View>

          {otpError && (
            <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{otpError}</Text>
          )}

          <Text style={{
            marginBottom: 16,
            color: timer === 0 ? 'red' : textColor,
            textAlign: 'center',
          }}>
            {timer === 0
              ? 'Code Expired. Click resend code.'
              : `Code Expires in: ${formatTimer(timer)}`}
          </Text>

          <Button
            mode="contained"
            onPress={handleVerifyOtp}
            buttonColor={colors.primary}
            textColor={backgroundColor}
            style={{ marginBottom: 16 }}
            loading={loading}
            disabled={loading}
          >
            Verify OTP
          </Button>

          <View style={{ marginTop: 5, marginBottom: 12, alignItems: 'center' }}>
            <Text style={{ color: textColor }}>
              Didn't receive code?{' '}Click {' '}
              <Text style={{ fontWeight: 'bold', color: textColor }}>
                Resend Code
              </Text> {' '}
              below.
            </Text>
          </View>


          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              onPress={handleResendOtp}
              textColor={textColor}
            >
              Resend Code
            </Button>
            <Button
              onPress={() => {
                setOtpSent(false);
                setOtp(['', '', '', '']);
                setOtpError('');
                setResentMessage(false);
              }}
              textColor={textColor}
            >
              Change Number
            </Button>
          </View>
        </>
      )}

      {otpVerified && isNewUser && (
        <>
          <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 20, color: textColor }}>
            Create Your Profile
          </Text>
          <TextInput
            ref={firstNameInputRef}
            mode="outlined"
            label="First Name (Required)"
            value={firstName}
            onChangeText={setFirstName}
            style={{ marginBottom: 15, backgroundColor: inputBackground }}
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
          <TextInput
            mode="outlined"
            label="Surname"
            value={lastName}
            onChangeText={setLastName}
            style={{ marginBottom: 15, backgroundColor: inputBackground }}
          />
          <TextInput
            ref={emailInputRef}
            mode="outlined"
            label="Email (Required)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 20, backgroundColor: inputBackground }}
            onSubmitEditing={handleProfileSubmit}
          />
          <Button
            mode="contained"
            onPress={handleProfileSubmit}
            buttonColor={colors.primary}
            textColor={backgroundColor}
            loading={loading}
            disabled={loading}
          >
            Continue
          </Button>
        </>
      )}
    </View>
  );
}
