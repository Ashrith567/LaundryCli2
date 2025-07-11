import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

type RootStackParamList = {
  Checkout: undefined;
};

const SteamIron: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const backgroundColor = colors.background;
  const textColor = colors.onBackground;
  const inputBackground = colors.surface;
  const borderColor = colors.background;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />
      <Appbar.Header style={{ marginTop: 8, backgroundColor }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Steam Iron" titleStyle={{ fontWeight: 'bold', color: textColor }} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.onBackground }]}>
          Service Unavailable - Coming Soon!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 19,
    fontWeight: '600',
  },
});

export default SteamIron;
