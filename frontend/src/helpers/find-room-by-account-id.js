const ONE = 'ONE_TO_ONE';
export const findRoomByAccountId = (accountId, rooms) => {
  return rooms.data.find((room) => {
    if (room.type === ONE) {
      if (room.participants.findIndex((participant) => participant.accountDetail.accountId === accountId) !== -1) {
        return room;
      }
    }
  });
};
