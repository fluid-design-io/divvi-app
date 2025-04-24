import { useWindowDimensions } from 'react-native';

export const useIsCompactDevice = () => {
  const { height, width } = useWindowDimensions();
  return height < 700 || width < 375;
};
