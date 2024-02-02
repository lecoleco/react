export const findRoomById = (rooms, roomId) => {
  let room = undefined;

  if (rooms) {
    room = rooms.data.find((x) => x.id === roomId);
    if (!room) room = undefined;
  }

  return room;
};
