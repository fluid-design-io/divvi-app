import { UserWithAnonymous } from 'better-auth/plugins';
import { Session, User } from 'better-auth/types';
import { db } from '~/db/client';
import { groupMember } from '~/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Link an anonymous user to a new user
 *
 * Update group membership to new user id
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
  // update group membership to new user
  console.log('🔥 [linkAccount] updating group membership');
  await db
    .update(groupMember)
    .set({
      userId: newUser.user.id,
    })
    .where(eq(groupMember.userId, anonymousUser.user.id));
  console.log('[linkAccount] from', anonymousUser.user.id, 'to', newUser.user.id);
};
