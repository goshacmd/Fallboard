// @flow

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

type Props = {
  iconUrl: string;
  iconSize: number;
  appName: string;
};
const AppIcon = ({ iconUrl, iconSize, appName }: Props) => (
  <View style={{ alignItems: 'center' }}>
    <View style={styles.iconContainer}>
      <Image source={{ uri: iconUrl }} style={{ height: iconSize, width: iconSize, borderRadius: 10 }} />
    </View>
    <Text style={styles.label}>
      {appName}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 10,
    marginBottom: 5,
    shadowColor: '#222',
    shadowRadius: 4,
    shadowOpacity: 0.2,
    shadowOffset: { height: 2 },
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    shadowColor: '#222',
    shadowRadius: 4,
    shadowOpacity: 0.8,
    shadowOffset: { height: 1 },
  },
});

export default AppIcon;
