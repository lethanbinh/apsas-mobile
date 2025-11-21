import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Pressable } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import Feather from 'react-native-vector-icons/Feather';
import CustomModal from '../modals/CustomModal';
import AppButton from '../buttons/AppButton';

interface ReadMoreTextProps {
  text: string;
  numberOfLines?: number;
  style?: any;
  textStyle?: any;
}

const ReadMoreText = ({ text, numberOfLines = 1, style, textStyle }: ReadMoreTextProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [fullTextHeight, setFullTextHeight] = useState(0);
  const [truncatedTextHeight, setTruncatedTextHeight] = useState(0);

  // Check if text needs truncation by comparing heights
  const onFullTextLayout = (e: any) => {
    setFullTextHeight(e.nativeEvent.layout.height);
  };

  const onTruncatedTextLayout = (e: any) => {
    setTruncatedTextHeight(e.nativeEvent.layout.height);
  };

  // Re-check when both heights are available
  React.useEffect(() => {
    if (fullTextHeight > 0 && truncatedTextHeight > 0) {
      setShowReadMore(fullTextHeight > truncatedTextHeight);
    }
  }, [fullTextHeight, truncatedTextHeight]);

  const handleReadMore = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <View style={style}>
        {/* Hidden full text to measure height */}
        <View
          onLayout={onFullTextLayout}
          style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '100%' }}
        >
          <AppText style={textStyle} numberOfLines={undefined}>
            {text}
          </AppText>
        </View>
        
        {/* Visible truncated text */}
        <View onLayout={onTruncatedTextLayout}>
          <AppText
            style={textStyle}
            numberOfLines={numberOfLines}
          >
            {text}
          </AppText>
        </View>
        
        {showReadMore && (
          <TouchableOpacity onPress={handleReadMore} style={styles.readMoreButton}>
            <AppText style={styles.readMoreText}>Read more</AppText>
            <Feather name="chevron-down" size={s(14)} color={AppColors.pr500} />
          </TouchableOpacity>
        )}
      </View>

      <CustomModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        title="Description"
        disableScrollView={false}
      >
        <View>
          <AppText style={styles.modalText}>{text}</AppText>
          <AppButton
            title="Close"
            onPress={handleCloseModal}
            style={styles.closeButton}
            textVariant="body14pxBold"
          />
        </View>
      </CustomModal>
    </>
  );
};

const styles = StyleSheet.create({
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(8),
    gap: s(4),
  },
  readMoreText: {
    color: AppColors.pr500,
    fontSize: s(14),
    fontWeight: '600',
  },
  modalText: {
    fontSize: s(16),
    lineHeight: vs(24),
    color: AppColors.n900,
    textAlign: 'left',
    marginBottom: vs(20),
  },
  closeButton: {
    marginTop: vs(20),
    alignSelf: 'center',
    minWidth: s(100),
  },
});

export default ReadMoreText;
