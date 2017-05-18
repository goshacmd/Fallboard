// @flow

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  PanResponder,
} from 'react-native';

import { range, moveToIdx } from '../lib/array';
import { doesOverlap, isPointInsideRect, moveRect } from '../lib/2d';

import AppIcon from './AppIcon';

type App = { id: string, icon: string, name: string };

type Props = {
  apps: Array<App>;
  isEditing: bool;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onRearrangeApps: (newApps: Array<App>) => void;
};
export default class AppGrid extends Component {
  props: Props;

  state: {
    width: number,
    height: number,
    currentIcon: ?number,
  };

  wiggle: Animated.Value;
  pressing: Animated.Value;
  dragPosition: Animated.ValueXY;
  appPositions: { [id: string]: Animated.ValueXY };

  _panResponder: PanResponder;
  _grantedAt: ?Date;
  _startEditingTimeout: any;
  _xCorrection: number;
  _yCorrection: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      width: 100,
      height: 100,
      currentIcon: null,
    };
    this._xCorrection = 0;
    this._yCorrection = 0;
  }

  componentWillMount() {
    this.wiggle = new Animated.Value(0);
    this.pressing = new Animated.Value(0);
    this.dragPosition = new Animated.ValueXY();

    this.appPositions = {};
    this.props.apps.forEach(app => {
      this.appPositions[app.id] = new Animated.ValueXY();
    });

    let prev = 0;
    const cycleAnimation = () => {
      const next = prev === -1 ? 0 : prev === 0 ? 1 : -1;
      prev = next;
      Animated.timing(this.wiggle, {
        duration: 100,
        toValue: next,
        easing: Easing.easeInOut,
      }).start(event => {
        cycleAnimation();
      });
    }

    cycleAnimation();

    const getCorrectedGestureState = (gestureState) => {
      return { dx: gestureState.dx + this._xCorrection, dy: gestureState.dy + this._yCorrection };
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        this._grantedAt = new Date;
        this._xCorrection = 0;
        this._yCorrection = 0;
        this.dragPosition.setValue({ x: 0, y: 0 });
        const iconPositions = this.getIconPositions();
        const pageX = evt.nativeEvent.pageX - 10;
        const pageY = evt.nativeEvent.pageY - 10 - 20;
        const currentIcon = iconPositions.find(pos => isPointInsideRect({ x: pageX, y: pageY }, pos));
        if (currentIcon && !this.props.isEditing) {
          this._startEditingTimeout = setTimeout(() => {
            this.props.onStartEditing();
            this.setState({ currentIcon: currentIcon.idx });
          }, 300);
        } else if (currentIcon) {
          this.setState({ currentIcon: currentIcon.idx });
        } else if (!currentIcon && this.props.isEditing) {
          this.props.onStopEditing();
          this.setState({ currentIcon: null });
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        clearTimeout(this._startEditingTimeout);
        this._startEditingTimeout = null;

        const currIcon = this.state.currentIcon;

        if (currIcon != null) {
          const { dx, dy } = getCorrectedGestureState(gestureState);
          this.dragPosition.setValue({ x: dx, y: dy });
          const iconPositions = this.getIconPositions();
          const currentIcon = iconPositions[currIcon];
          const draggedIcon = moveRect(currentIcon, dx, dy);
          let potentialNewPlace = iconPositions.find(icon => doesOverlap(draggedIcon, icon));
          const potentialEmptySpace = this.getGridPositions().slice(iconPositions.length).find(space => doesOverlap(draggedIcon, space));
          if (!potentialNewPlace && potentialEmptySpace) {
            potentialNewPlace = iconPositions[iconPositions.length - 1];
          }
          if (potentialNewPlace && potentialNewPlace.idx !== currentIcon.idx) {
            const newIdx = potentialNewPlace.idx;
            const currentId = this.props.apps[currentIcon.idx].id;
            const ids = this.props.apps.map(app => app.id);
            const newIds = moveToIdx(ids, currentIcon.idx, newIdx);
            this._xCorrection = this._xCorrection + currentIcon.x1 - potentialNewPlace.x1;
            this._yCorrection = this._yCorrection + currentIcon.y1 - potentialNewPlace.y1;
            // $FlowFixMe
            const newApps: Array<App> = newIds.map(id => this.props.apps.find(app => app.id === id));
            this.props.onRearrangeApps(newApps);
            this.setState({ currentIcon: newIdx });
            const { dx, dy } = getCorrectedGestureState(gestureState);
            this.dragPosition.setValue({ x: dx, y: dy });
          }
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        this._grantedAt = null;
        clearTimeout(this._startEditingTimeout);
        this._startEditingTimeout = null;
        this._xCorrection = 0;
        this._yCorrection = 0;
        Animated.timing(this.dragPosition, {
          toValue: { x: 0, y: 0 },
          duration: 100,
        }).start(() => {
          this.setState({ currentIcon: null });
        });
      },
    });
  }

  componentDidUpdate() {
    const positions = this.getGridPositions();
    Animated.parallel(
      this.props.apps.map((app, idx) => {
        const { x1, y1 } = positions[idx];
        if (this.state.currentIcon === idx) {
          this.appPositions[app.id].setValue({ x: x1, y: y1 });
          return null;
        }
        return Animated.spring(this.appPositions[app.id], {
          toValue: { x: x1, y: y1 },
        });
      }).filter(a => a)
    ).start();

    Animated.spring(this.pressing, {
      toValue: this.state.currentIcon != null ? 1 : 0,
    }).start();
  }

  handleLayout = (e: Object) => {
    const { height, width } = e.nativeEvent.layout;
    this.setState({ height, width });
  };

  getSizes() {
    const PER_ROW = 4;
    const NUM_ROWS = 6;

    const ITEM_WIDTH = Math.floor(this.state.width / PER_ROW) - 10;
    const ITEM_HEIGHT = Math.floor(this.state.height / NUM_ROWS);

    const ICON_SIZE = ITEM_WIDTH - 20;

    const perLine = Math.floor(this.state.width / ITEM_WIDTH);
    const padTotal = this.state.width - (perLine * ITEM_WIDTH);
    const padItem = padTotal / (perLine-1);

    return { PER_ROW, NUM_ROWS, ITEM_WIDTH, ITEM_HEIGHT, ICON_SIZE, perLine, padItem };
  }

  getIconPositions() {
    const { ITEM_WIDTH, ITEM_HEIGHT, ICON_SIZE, perLine, padItem } = this.getSizes();

    return this.props.apps.map((_, idx) => {
      const lineIdx = Math.floor(idx / perLine);
      const inLineIdx = idx % perLine;

      const top = lineIdx * ITEM_HEIGHT;
      const left = inLineIdx * (ITEM_WIDTH + padItem) + 20/2;

      return { idx, y1: top, y2: top+ICON_SIZE, x1: left, x2: left+ICON_SIZE };
    });
  }

  getGridPositions() {
    const { NUM_ROWS, ITEM_WIDTH, ITEM_HEIGHT, ICON_SIZE, perLine, padItem } = this.getSizes();
    const totalSize = NUM_ROWS * perLine;

    return range(totalSize).map((_, idx) => {
      const lineIdx = Math.floor(idx / perLine);
      const inLineIdx = idx % perLine;

      const top = lineIdx * ITEM_HEIGHT;
      const left = inLineIdx * (ITEM_WIDTH + padItem);

      return { idx, y1: top, y2: top+ITEM_HEIGHT, x1: left, x2: left+ITEM_WIDTH };
    });
  }

  render() {
    const { ITEM_WIDTH, ITEM_HEIGHT, ICON_SIZE } = this.getSizes();

    const { apps, isEditing } = this.props;

    const positions = this.getGridPositions();

    return (
      <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 10 }} {...this._panResponder.panHandlers}>
        <View style={{ flex: 1, backgroundColor: 'transparent', position: 'relative' }} onLayout={this.handleLayout}>
          {apps.map((app, idx) => {
            const rotations = [
              ['-3deg', '-1.5deg', '0deg', '1.5deg', '3deg'],
              ['-1.5deg', '0deg', '1.5deg', '3deg', '1.5deg'],
              ['3deg', '1.5deg', '0deg', '-1.5deg', '-3deg'],
              ['0deg', '3deg', '1.5deg', '0deg', '-1.5deg'],
              ['-1.5deg', '0deg', '1.5deg', '3deg', '1.5deg'],
            ];
            const animatedStyle = {
              transform: [
                ...(this.state.currentIcon !== idx ? [
                  {
                    rotate: this.wiggle.interpolate({
                      inputRange: [-1, -0.5, 0, 0.5, 1],
                      outputRange: rotations[idx % rotations.length],
                    }),
                  },
                ] : []),
                ...(this.state.currentIcon === idx ? [
                  { translateX: this.dragPosition.x },
                  { translateY: this.dragPosition.y },
                  {
                    scale: this.pressing.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.15],
                    }),
                  },
                ] : []),
              ],
              ...(this.state.currentIcon === idx ? {
                opacity: this.pressing.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.7],
                }),
              } : {}),
            };
            const { x, y } = this.appPositions[app.id];
            const itemStyle = {
              flex: 0,
              zIndex: this.state.currentIcon === idx ? 2 : 1,
              position: 'absolute',
              top: y,
              left: x,
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
            };
            return (
              <Animated.View key={app.id} style={[itemStyle, isEditing && animatedStyle]}>
                <AppIcon
                  iconSize={ICON_SIZE}
                  iconUrl={app.icon}
                  appName={app.name}
                />
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  }
}
