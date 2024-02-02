export const accountDetail = async (destiny, origin = null) => {
  if (origin) {
    origin['accountDetail'] = {
      accountId: destiny.id || destiny.accountId,
      fullName: destiny.fullName,
      name: destiny.firstName + ' ' + destiny.lastName,
      avatar: destiny.avatar,
      telephone: destiny.telephone,
      email: destiny.email,
      occupation: destiny.occupation,
      role: destiny.role,
      gender: destiny.gender,
      active: destiny.active,
      lastConnectedActivity: destiny.lastConnectedActivity,
      inChat: destiny.inChat,
    };
  } else {
    return {
      accountDetail: {
        accountId: destiny.id || destiny.accountId,
        fullName: destiny.fullName,
        name: destiny.firstName + ' ' + destiny.lastName,
        avatar: destiny.avatar,
        telephone: destiny.telephone,
        email: destiny.email,
        occupation: destiny.occupation,
        role: destiny.role,
        gender: destiny.gender,
        active: destiny.active,
        lastConnectedActivity: destiny.lastConnectedActivity,
        inChat: destiny.inChat,
      },
    };
  }
};
