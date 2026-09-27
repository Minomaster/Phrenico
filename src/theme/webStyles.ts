import { Platform, type TextStyle } from 'react-native';

/**
 * Removes the browser's own focus outline from text fields in the web
 * preview. The fields draw their own, clearer focus border.
 */
export const noWebOutline: TextStyle = Platform.OS === 'web' ? { outlineWidth: 0 } : {};
