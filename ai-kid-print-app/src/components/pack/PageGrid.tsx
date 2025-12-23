import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontFamily, fontSize, borderRadius, borderWidth } from '../../theme';
import { GeneratedPage } from '../../types';

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const GRID_SPACING = spacing.sm;
const ITEM_WIDTH = (screenWidth - spacing.lg * 2 - GRID_SPACING) / GRID_COLUMNS;

interface PageGridProps {
  pages: GeneratedPage[];
  onPagePress?: (page: GeneratedPage) => void;
}

const PageGrid: React.FC<PageGridProps> = ({ pages, onPagePress }) => {
  const [selectedPage, setSelectedPage] = useState<GeneratedPage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePagePress = (page: GeneratedPage, index: number) => {
    setSelectedPage(page);
    setCurrentIndex(index);
    onPagePress?.(page);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedPage(pages[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedPage(pages[currentIndex + 1]);
    }
  };

  const renderPageItem = ({ item, index }: { item: GeneratedPage; index: number }) => (
    <TouchableOpacity
      onPress={() => handlePagePress(item, index)}
      activeOpacity={0.8}
      style={styles.pageItem}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.pageImage}
          resizeMode="cover"
        />
        <View style={styles.pageNumber}>
          <Text style={styles.pageNumberText}>{item.order}</Text>
        </View>
      </View>
      <View style={styles.pageInfo}>
        <Text style={styles.pageTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.pageType}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pages}
        renderItem={renderPageItem}
        keyExtractor={(item) => `page-${item.order}`}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* 全屏预览 Modal */}
      <Modal
        visible={selectedPage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPage(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 关闭按钮 */}
            <TouchableOpacity
              onPress={() => setSelectedPage(null)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* 页面信息 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                第 {selectedPage?.order} 页
              </Text>
              <Text style={styles.modalSubtitle}>
                {selectedPage?.title}
              </Text>
            </View>

            {/* 图片 */}
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: selectedPage?.imageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>

            {/* 导航按钮 */}
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                onPress={handlePrevious}
                disabled={currentIndex === 0}
                style={[
                  styles.navButton,
                  currentIndex === 0 && styles.navButtonDisabled,
                ]}>
                <Text style={styles.navButtonText}>◀ 上一页</Text>
              </TouchableOpacity>
              
              <Text style={styles.pageIndicator}>
                {currentIndex + 1} / {pages.length}
              </Text>
              
              <TouchableOpacity
                onPress={handleNext}
                disabled={currentIndex === pages.length - 1}
                style={[
                  styles.navButton,
                  currentIndex === pages.length - 1 && styles.navButtonDisabled,
                ]}>
                <Text style={styles.navButtonText}>下一页 ▶</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: GRID_SPACING,
  },
  pageItem: {
    width: ITEM_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.thick,
    borderColor: colors.black,
    overflow: 'hidden',
    // Brutal shadow
    shadowColor: colors.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 0.77, // Letter paper ratio
  },
  pageImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray100,
  },
  pageNumber: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.duckYellow,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: colors.black,
  },
  pageNumberText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  pageInfo: {
    padding: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.black,
  },
  pageTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.black,
  },
  pageType: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    padding: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.black,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.black,
    fontWeight: 'bold',
  },
  modalHeader: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  modalSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.gray300,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  navButton: {
    backgroundColor: colors.duckYellow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.black,
  },
  navButtonDisabled: {
    backgroundColor: colors.gray400,
    borderColor: colors.gray500,
  },
  navButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.black,
  },
  pageIndicator: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.white,
  },
});

export default PageGrid;
