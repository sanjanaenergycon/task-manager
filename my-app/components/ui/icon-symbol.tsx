// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'magnifyingglass': 'search',
  'person.fill': 'person',
  'checkmark.circle.fill': 'check-circle',
  'message.fill': 'message',
  'doc.fill': 'description',
  'doc.text.fill': 'article',
  'chart.pie.fill': 'pie-chart',
  'chart.bar.fill': 'bar-chart',
  'calendar': 'calendar-today',
  'tray.fill': 'inbox',
  'list.bullet': 'list',
  'square.and.pencil': 'edit',
  'ellipsis': 'more-vert',
  'plus': 'add',
  'clock': 'schedule',
  'checkmark.seal.fill': 'verified',
  'bell.fill': 'notifications',
  'moon.fill': 'dark-mode',
  'lock.fill': 'lock',
  'questionmark.circle.fill': 'help',
  'gear': 'settings',
  'arrow.right.square': 'logout',
  'person.badge.plus': 'person-add',
  'camera.fill': 'photo-camera',
  'paintbrush.fill': 'brush',
  'text.alignleft': 'text-format',
  'folder.fill': 'folder',
  'photo.fill': 'image',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'person.2.fill': 'people',
  'square.grid.2x2.fill': 'grid-view',
  'checkmark': 'check',
  'video.badge.checkmark': 'video-call',
  'video.fill': 'videocam',
  'phone.fill': 'phone',
  'xmark': 'close',
  'trash.fill': 'delete',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
