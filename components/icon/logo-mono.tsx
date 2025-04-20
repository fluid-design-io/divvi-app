import Svg, { SvgProps, Path } from 'react-native-svg';
import { useColorScheme } from '~/lib/useColorScheme';
const LogoMono = (props: SvgProps) => {
  const { colors } = useColorScheme();
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={colors.primary}
        d="M12 1.5a3.36 3.36 0 0 1 2.38.99l.734.732c.236.235.554.366.887.367h1.05a3.36 3.36 0 0 1 3.36 3.36V8c0 .332.133.651.365.886l.733.732a3.359 3.359 0 0 1 .002 4.764l-.733.733a1.26 1.26 0 0 0-.366.887v1.05a3.36 3.36 0 0 1-3.36 3.36h-1.05c-.332.001-.65.132-.886.365l-.733.733a3.36 3.36 0 0 1-4.764.002l-.733-.733A1.26 1.26 0 0 0 8 20.412h-1.05a3.36 3.36 0 0 1-3.36-3.36v-1.05c-.001-.332-.132-.65-.365-.886l-.733-.733a3.36 3.36 0 0 1-.002-4.763l.733-.733a1.26 1.26 0 0 0 .366-.888V6.95l.006-.191a3.36 3.36 0 0 1 3.355-3.17h1.05c.331 0 .65-.13.885-.364l.733-.733A3.36 3.36 0 0 1 12 1.5Z"
      />
      <Path fill="#fff" d="M9.682 9.697a1.5 1.5 0 1 0-2.121-2.122 1.5 1.5 0 0 0 2.121 2.122Z" />
      <Path
        fill="#fff"
        fillOpacity={0.3}
        d="M9.682 9.697a1.5 1.5 0 1 0-2.121-2.122 1.5 1.5 0 0 0 2.121 2.122Z"
      />
      <Path fill="#fff" d="M16.682 16.697a1.5 1.5 0 1 0-2.121-2.122 1.5 1.5 0 0 0 2.121 2.122Z" />
      <Path
        fill="#fff"
        fillOpacity={0.3}
        d="M16.682 16.697a1.5 1.5 0 1 0-2.121-2.122 1.5 1.5 0 0 0 2.121 2.122Z"
      />
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.4}
        d="m8 16.136 7.955-7.955"
      />
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.3}
        strokeWidth={2.4}
        d="m8 16.136 7.955-7.955"
      />
    </Svg>
  );
};
export default LogoMono;
