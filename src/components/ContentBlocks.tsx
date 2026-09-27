import { StyleSheet, View } from 'react-native';

import { parseInline } from '@/content/blocks';
import type { Block } from '@/content/types';
import { radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Notice } from './Notice';

/** Text with `**fed**` rendered in bold. */
export function RichText({ text, color }: { text: string; color?: 'text' | 'textSecondary' }) {
  return (
    <AppText color={color}>
      {parseInline(text).map((span, index) =>
        span.bold ? (
          <AppText key={index} variant="bodyStrong" color={color}>
            {span.text}
          </AppText>
        ) : (
          span.text
        ),
      )}
    </AppText>
  );
}

/**
 * Renders the approved text blocks exactly as written: paragraphs, bullet
 * points, numbered steps and warnings. Nothing is shortened or reworded.
 */
export function ContentBlocks({ blocks }: { blocks: Block[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.stack}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return <RichText key={index} text={block.text} />;
          case 'warning':
            return (
              <Notice key={index} tone="warning">
                <RichText text={block.text} />
              </Notice>
            );
          case 'bullets':
            return (
              <View key={index} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <View style={styles.itemText}>
                      <RichText text={item} />
                    </View>
                  </View>
                ))}
              </View>
            );
          case 'steps':
            return (
              <View key={index} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.surfaceAlt }]}>
                      <AppText variant="caption" color="primary" style={styles.stepText}>
                        {itemIndex + 1}
                      </AppText>
                    </View>
                    <View style={styles.itemText}>
                      <RichText text={item} />
                    </View>
                  </View>
                ))}
              </View>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  list: { gap: spacing.sm },
  listItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 9, marginLeft: spacing.xs },
  stepNumber: { width: 24, height: 24, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontWeight: '700' },
  itemText: { flex: 1 },
});
