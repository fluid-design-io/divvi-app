import { AfterIdentityCreated, models } from '@teamkeel/sdk';

// This synchronous hook will execute after successful authentication and a new identity record created
export default AfterIdentityCreated(async (ctx) => {
  const identity = ctx.identity!;
  await models.user.create({
    identityId: identity.id,
    email: identity.email ?? '',
    // we don't have these data yet
    name: '',
    avatar: '',
  });
});
