import { paths } from 'src/settings/paths';
import { logRegister } from 'src/helpers/log-register';
import { useRouter } from 'src/hooks/use-router';

export const setRoomHouter = async (params = {}) => {
  const { router, roomId, rooms } = params;

  try {
    if (rooms && rooms.data.length > 0) {
      router.push(paths.admin.chat.replace('rooms', rooms.data[0].id));
    } else if (roomId) {
      router.push(paths.admin.chat.replace('rooms', roomId));
    } else if (!window.location.pathname.includes(paths.admin.chat)) {
      router.push(paths.admin.chat);
    }
  } catch (error) {
    logRegister(error);
  }

  return;
};
