import Svg, { SvgProps, Mask, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useColorScheme } from '~/lib/useColorScheme';

const SvgComponent = (props: SvgProps & { active?: boolean }) => {
  const { colors } = useColorScheme();
  return (
    <Svg width={27} height={27} fill="none" {...props}>
      <Mask
        id="a"
        width={27}
        height={27}
        x={0}
        y={0}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: 'alpha',
        }}>
        <Path
          fill="#fff"
          d="M13.5 0c1.15 0 2.252.46 3.06 1.272l.943.942c.304.302.714.471 1.141.471h1.35a4.32 4.32 0 0 1 4.321 4.321v1.35c0 .427.17.837.469 1.138l.942.943a4.322 4.322 0 0 1 .003 6.124l-.943.943a1.62 1.62 0 0 0-.47 1.14v1.35a4.32 4.32 0 0 1-4.322 4.321h-1.35a1.62 1.62 0 0 0-1.138.469l-.942.942a4.322 4.322 0 0 1-6.125.003l-.942-.943a1.62 1.62 0 0 0-1.141-.47h-1.35a4.32 4.32 0 0 1-4.321-4.321v-1.35a1.62 1.62 0 0 0-.469-1.139l-.942-.942a4.32 4.32 0 0 1-.003-6.124l.943-.943a1.62 1.62 0 0 0 .47-1.14V7.005l.008-.246a4.32 4.32 0 0 1 4.314-4.075h1.35a1.62 1.62 0 0 0 1.138-.468l.942-.942A4.32 4.32 0 0 1 13.5 0Z"
        />
      </Mask>
      <G mask="url(#a)">
        <Path fill="#D9D9D9" d="M0 0h27v27H0z" />
        <Path fill="url(#b)" d="M0 0h27v27H0z" />
        <Path
          fill="#fff"
          d="M7.5 13.5c0-.76.616-1.37 1.37-1.37h3.26V8.87a1.37 1.37 0 1 1 2.74 0v3.26h3.26c.76 0 1.37.61 1.37 1.37 0 .76-.61 1.37-1.37 1.37h-3.26v3.26a1.37 1.37 0 1 1-2.738 0v-3.26H8.868c-.753 0-1.369-.61-1.369-1.37Z"
        />
      </G>
      <Defs>
        <LinearGradient id="b" x1={13.5} x2={13.5} y1={0} y2={27} gradientUnits="userSpaceOnUse">
          <Stop stopColor={colors.primary} />
          <Stop offset={1} stopColor="#5EB326" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
export default SvgComponent;
