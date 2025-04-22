import { UserWithAnonymous } from 'better-auth/plugins';
import { Session, User } from 'better-auth/types';

/**
 * Link an anonymous user to a new user
 *
 * The database will automatically handle updating all references
 * to the old user ID to the new user ID thanks to onUpdate: 'cascade'
 */
export const linkAccount = async (data: {
  anonymousUser: {
    user: UserWithAnonymous & Record<string, any>;
    session: Session & Record<string, any>;
  };
  newUser: {
    user: User & Record<string, any>;
    session: Session & Record<string, any>;
  };
}) => {
  const { anonymousUser, newUser } = data;
  console.log('[linkAccount] Linking account from', anonymousUser.user.id, 'to', newUser.user.id);
};
