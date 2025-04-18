import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Contacts from 'expo-contacts';

import { Text } from '~/components/nativewindui/Text';
import { TonalIcon } from '~/components/core/icon';
import { AlertCircle } from 'lucide-react-native';
import { Button } from '~/components/nativewindui/Button';
import { BottomSheetFlashList, BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import { renderContactListItem } from './render-contact-list-item';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from '~/components/nativewindui/Sheet';
import { useColorScheme } from '~/lib/useColorScheme';

export type Contact = Contacts.Contact;

export const ContactsPicker = ({
  onSelectContacts,
  onDismiss,
  ref,
}: {
  onSelectContacts: (contacts: Contact[]) => void;
  onDismiss: () => void;
  ref: React.RefObject<BottomSheetModal | null>;
}) => {
  const { colors } = useColorScheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Contacts.PermissionStatus | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
            Contacts.Fields.Image,
          ],
          sort: Contacts.SortTypes.FirstName,
        });

        if (data.length > 0) {
          setContacts(data);
        } else {
          setError('No contacts found');
        }
      } else {
        setError('Permission to access contacts was denied');
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadContacts();
  };

  const handleSelectContact = (contact: Contact) => {
    if (selectedContacts.includes(contact)) {
      setSelectedContacts(selectedContacts.filter((c) => c !== contact));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text>Loading contacts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <TonalIcon Icon={AlertCircle} />
        <Text className="mt-4 text-center text-muted-foreground">{error}</Text>
        <Button variant="secondary" className="mt-4" onPress={handleRetry}>
          Retry
        </Button>
      </View>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <TonalIcon Icon={AlertCircle} />
        <Text className="mt-4 text-center text-muted-foreground">
          Permission to access contacts was denied. Please enable it in your device settings.
        </Text>
        <Button variant="secondary" className="mt-4" onPress={handleRetry}>
          Retry
        </Button>
      </View>
    );
  }
  return (
    <Sheet
      ref={ref}
      onDismiss={onDismiss}
      footerComponent={(props) => (
        <BottomSheetFooter
          {...props}
          style={{
            paddingTop: 8,
            paddingHorizontal: 40,
            backgroundColor: colors.background,
          }}>
          <View style={{ paddingBottom: insets.bottom + 8 }}>
            <Button onPress={() => onSelectContacts(selectedContacts)} size="lg">
              <Text>
                {`Add ${selectedContacts.length} member${selectedContacts.length === 1 ? '' : 's'}`}
              </Text>
            </Button>
          </View>
        </BottomSheetFooter>
      )}>
      <BottomSheetFlashList
        //! BUG Scorll Locked for some reason
        data={contacts}
        renderItem={(items) =>
          renderContactListItem({
            ...items,
            item: {
              title: items.item.name || 'Unknown',
              subTitle: items.item.phoneNumbers?.[0]?.number || items.item.emails?.[0]?.email || '',
              onPress: () => handleSelectContact(items.item),
              selected: selectedContacts.includes(items.item),
            },
          })
        }
        ListHeaderComponent={() => (
          <View className="px-4 py-2">
            <Text variant="title3" className="mb-4 font-semibold">
              Add from Contacts
            </Text>
          </View>
        )}
        estimatedItemSize={60}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
        }}
      />
    </Sheet>
  );
};
