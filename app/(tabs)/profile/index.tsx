import { useActionSheet } from '@expo/react-native-action-sheet';
import { Icon } from '@roninoss/icons';
import { Redirect, router, Stack } from 'expo-router';
import { Linking, Platform, View } from 'react-native';
import Loading from '~/components/core/loading';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { Button } from '~/components/nativewindui/Button';
import {
  List,
  ListItem,
  ListRenderItemInfo,
  ListSectionHeader,
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

const SCREEN_OPTIONS = {
  title: 'Profile',
  headerTransparent: Platform.OS === 'ios',
  headerBlurEffect: 'systemMaterial',
  headerShown: false,
} as const;

export default function Profile() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return <Loading expand />;
  if (!session) return <Redirect href="/sign-in" />;
  const DATA: DataItem[] = [
    ...(Platform.OS !== 'ios' ? ['Basic info'] : []),
    {
      id: 'name',
      title: 'Name',
      ...(Platform.OS === 'ios' ? { value: session.user.name } : { subTitle: session.user.name }),
      onPress: () => router.push('/profile/name'),
    },
    'Help',
    {
      id: '6',
      title: 'Support',
      ...(Platform.OS === 'ios' ? { value: 'Discord' } : { subTitle: 'Discord' }),
      onPress: () => Linking.openURL('https://nativewindui.com/discord'),
    },
    {
      id: '7',
      title: 'About',
      ...(Platform.OS === 'ios' ? { value: 'Divvi' } : { subTitle: 'Divvi' }),
      onPress: () => Linking.openURL('https://divvi-app.uing.dev'),
    },
    ...(session.user.isAnonymous
      ? [
          'Link Account',
          {
            id: '8',
            title: 'Link Account',
            onPress: () => router.push('/(auth)/link-account'),
          },
        ]
      : []),
  ];
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <List
        variant="insets"
        data={DATA}
        sectionHeaderAsGap={Platform.OS === 'ios'}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeaderComponent />}
        ListFooterComponent={<ListFooterComponent />}
      />
    </>
  );
}

function renderItem(info: ListRenderItemInfo<DataItem>) {
  return <Item info={info} />;
}

function Item({ info }: { info: ListRenderItemInfo<DataItem> }) {
  const { colors } = useColorScheme();

  if (typeof info.item === 'string') {
    return <ListSectionHeader {...info} />;
  }
  return (
    <ListItem
      titleClassName="text-lg"
      rightView={
        <View className="flex-1 flex-row items-center gap-0.5 px-2">
          {!!info.item.value && <Text className="text-muted-foreground">{info.item.value}</Text>}
          <Icon name="chevron-right" size={22} color={colors.grey2} />
        </View>
      }
      onPress={info.item.onPress}
      {...info}
    />
  );
}

function ListHeaderComponent() {
  const { data: session } = authClient.useSession();
  if (!session) return <Loading expand />;
  return (
    <View className="ios:pb-8 items-center pb-4  pt-8">
      <Avatar alt={`${session.user.name}'s Profile`} className="h-24 w-24">
        <AvatarFallback>
          <Text
            variant="largeTitle"
            className={cn(
              'font-medium text-white dark:text-background',
              Platform.OS === 'ios' && 'dark:text-foreground'
            )}>
            {session.user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Text>
        </AvatarFallback>
        <AvatarImage
          source={{
            uri: session?.user?.image ?? `https://ui-avatars.com/api/?name=${session?.user?.name}`,
          }}
        />
      </Avatar>
      <View className="p-1" />
      <Text variant="title1">{session.user.name}</Text>
      <Text className="px-4 text-muted-foreground" numberOfLines={1} ellipsizeMode="middle">
        {session.user.email}
      </Text>
    </View>
  );
}

function ListFooterComponent() {
  const { showActionSheetWithOptions } = useActionSheet();

  const onPress = () => {
    const options = ['Log Out', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            authClient.signOut();
            break;
          case cancelButtonIndex:
            break;
        }
      }
    );
  };
  return (
    <View className="ios:px-0 px-4 pt-8">
      <Button
        size="lg"
        variant={Platform.select({ ios: 'primary', default: 'secondary' })}
        className="border-border bg-card"
        onPress={onPress}>
        <Text className="text-destructive">Log Out</Text>
      </Button>
    </View>
  );
}

type DataItem =
  | string
  | {
      id: string;
      title: string;
      value?: string;
      subTitle?: string;
      onPress: () => void;
    };
