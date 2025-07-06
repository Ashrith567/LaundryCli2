import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Appbar, TextInput, useTheme, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  ServiceSelection: undefined;
  YourOrders: undefined;
  // Add other routes here
};

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const name = 'User Name';
  const email = 'username@example.com';
  const phone = '9876543210';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />

      <Appbar.Header style={{ marginTop: 8, backgroundColor: colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" titleStyle={{ fontWeight: 'bold', color: colors.onBackground }} />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>

            <TextInput
              label="Name"
              value={name}
              disabled
              style={styles.input}
              outlineColor={colors.outline}
              textColor={colors.onSurface}
            />

            <TextInput
              label="Email"
              value={email}
              disabled
              style={styles.input}
              outlineColor={colors.outline}
              textColor={colors.onSurface}
            />

            <TextInput
              label="Phone Number"
              value={phone}
              disabled
              style={styles.input}
              keyboardType="phone-pad"
              outlineColor={colors.outline}
              textColor={colors.onSurface}
            />
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: width - 32,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
});

export default ProfileScreen;
