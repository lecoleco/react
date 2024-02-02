import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Divider, IconButton, SvgIcon, useMediaQuery } from '@mui/material';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useSearchParams } from 'src/hooks/use-search-params';
import { Layout as AdminLayout } from 'src/layouts/admin';
import { ChatBlank } from 'src/sections/admin/chat/chat-blank';
import { ChatComposer } from 'src/sections/admin/chat/chat-composer';
import { ChatContainer } from 'src/sections/admin/chat/chat-container';
import { ChatSidebar } from 'src/sections/admin/chat/chat-sidebar';
import { ChatRoom } from 'src/sections/admin/chat/chat-room';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/chat';
import { useAuth } from 'src/hooks/use-auth';
import { LoadingDisabled } from 'src/components/loading-disabled';
import { useMounted } from 'src/hooks/use-mounted';
import { isNull } from 'lodash';
import { IconBtnLoading } from 'src/components/icon-btn-loading';
import { useTranslation } from 'react-i18next';
import { findRoomById } from 'src/helpers/find-room-by-id';
import { setRoomHouter } from 'src/helpers/set-room-houter';
import { logRegister } from 'src/helpers/log-register';
import { useUrlParam } from 'src/hooks/use-url-param';
import { useRouter } from 'src/hooks/use-router';

import { CHAT_LOCALE } from 'src/locales/chat';
import { SAVE, MENU } from 'src/settings/icon-constants';

const useDataContacts = () => {
  return useSelector((state) => state.connection.contacts);
};

const useDataRoomNotify = () => {
  return useSelector((state) => state.chat.roomNotify);
};

const useDataRooms = () => {
  return useSelector((state) => state.chat.rooms);
};

const useCurrentRoomId = () => {
  return useSelector((state) => state.chat.currentRoomId);
};

const useRooms = (roomNotify, currentRoomId, roomKey, router) => {
  const dispatch = useDispatch();
  const { user, updateUser } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const isMounted = useMounted();
  const accountId = user?.id;
  const avatar = user?.avatar;

  const onInChat = useCallback(
    async (inChat) => {
      try {
        const values = { inChat };

        await updateUser(values, accountId);
      } catch (error) {
        logRegister(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const handleRoomsGet = useCallback(
    async (params = {}) => {
      const { currentPage = 0, inChat = false } = params;

      try {
        setLoading(true);

        if (!isNull(currentPage)) {
          await dispatch(thunks.getRooms({ accountId, currentPage }));

          if (currentPage === 0) {
            setRoomHouter({ router });
          }
        }

        if (inChat) {
          await onInChat(true);
        }

        if (isMounted()) {
          setLoading(false);
        }
      } catch (error) {
        logRegister(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, dispatch]
  );

  useEffect(() => {
    handleRoomsGet({ inChat: true });

    //unmount
    return () => {
      onInChat(false);
      dispatch(thunks.setCurrentRoom(undefined));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const getRoomExec = async (roomId) => {
        const result = await dispatch(thunks.getRoom({ roomId, currentPage: 0, accountId }));

        if (!result && roomKey === roomId) {
          setRoomHouter({ router });
        }
      };

      if (roomNotify.id && !roomKey && (roomNotify.id !== currentRoomId || (roomNotify.id === currentRoomId && !roomNotify.visible))) {
        getRoomExec(roomNotify.id);
      }
    } catch (error) {
      logRegister(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, roomNotify, currentRoomId, roomKey, accountId]);

  return {
    isLoading,
    setLoading,
    accountId,
    avatar,
    handleRoomsGet,
  };
};

const useSidebar = () => {
  const searchParams = useSearchParams();
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [open, setOpen] = useState(mdUp);

  const handleScreenResize = useCallback(() => {
    if (!mdUp) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [mdUp]);

  useEffect(() => {
    handleScreenResize();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mdUp]);

  const handleParamsUpdate = useCallback(() => {
    if (!mdUp) {
      setOpen(false);
    }
  }, [mdUp]);

  useEffect(() => {
    handleParamsUpdate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleToggle = useCallback(() => {
    setOpen((prevState) => !prevState);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    handleToggle,
    handleClose,
    open,
  };
};

const useRecipient = (currentRoomId, rooms, accountId, router) => {
  const [recipients, setRecipients] = useState([]);
  const [groupName, setGroupName] = useState('');
  const dispatch = useDispatch();
  const [change, setChange] = useState(false);
  const [showSave, setShowSave] = useState(true);

  const handleRecipientRefresh = useCallback((refresh) => {
    setChange(false);

    if (refresh) {
      setGroupName(refresh.groupName);
      setRecipients(refresh.recipients);
    } else {
      setGroupName('');
      setRecipients([]);
    }
  }, []);

  const handleRecipientAdd = useCallback(
    (recipient) => {
      setRecipients((prevState) => {
        const found = prevState.find((_recipient) => _recipient.accountDetail.accountId === recipient.accountDetail.accountId);

        if (found) {
          return prevState;
        }

        setChange(!change);

        setShowSave(true);

        return [...prevState, recipient];
      });
    },
    [change]
  );

  const handleRecipientRemove = useCallback(
    (participantId) => {
      setRecipients((prevState) => {
        setChange(!change);

        const recipients = prevState.filter((recipient) => recipient.id !== participantId);

        if (recipients.length === 0) {
          setShowSave(false);
        }

        return recipients;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [change]
  );

  const handleChangeGroupName = useCallback((event) => {
    event.persist();

    const { value } = event.target;

    setGroupName(value);
  }, []);

  const handleSaveRecipientGroupName = useCallback(
    async () => {
      let oldParticipants = [];
      let participants = null;

      if (currentRoomId) {
        const room = findRoomById(rooms, currentRoomId);
        oldParticipants = room.participants;

        if (change) {
          if (room) {
            const participant = oldParticipants.find((participant) => participant.accountDetail.accountId === accountId);
            participants = [...recipients, participant];
          }

          participants = [
            ...participants.map((participant) => {
              return {
                id: participant?.id,
                accountId: participant?.accountDetail ? participant.accountDetail.accountId : participant?.accountId,
                unReadCount: participant?.unReadCount,
                createdAt: participant?.createdAt,
                updatedAt: participant?.updatedAt,
              };
            }),
          ];

          if (participants.length > oldParticipants.length) {
            oldParticipants = participants;
          }
        }

        setChange(false);
        setRoomHouter({ router, roomId: currentRoomId });
        await dispatch(
          thunks.updateGroupNameAndParticipants({
            roomId: currentRoomId,
            accountId,
            oldParticipants,
            participants,
            groupName,
          })
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, dispatch, currentRoomId, rooms, accountId, recipients, groupName, change]
  );

  return {
    recipients,
    groupName,
    showSave,
    handleRecipientAdd,
    handleRecipientRemove,
    handleRecipientRefresh,
    handleChangeGroupName,
    handleSaveRecipientGroupName,
  };
};

const Page = () => {
  const router = useRouter();
  const rootRef = useRef(null);
  const roomNotify = useDataRoomNotify();
  const contacts = useDataContacts();
  const rooms = useDataRooms();

  const type = useUrlParam('type'); //compose, roomId, rooms,
  const compose = type === 'compose' ? true : false;
  const roomKey = !compose && type !== 'rooms' ? type : null;

  if (!roomKey) {
    setRoomHouter({ router, rooms });
  }

  const currentRoomId = useCurrentRoomId();
  const sidebar = useSidebar();
  const { accountId, avatar, isLoading, setLoading, handleRoomsGet } = useRooms(roomNotify, currentRoomId, roomKey, router);
  const chatRecipient = useRecipient(currentRoomId, rooms, accountId, router);

  const { t } = useTranslation();

  usePageView();

  const view = roomKey ? 'room' : compose ? 'compose' : 'blank';

  return (
    <>
      <Seo title="Dashboard: Chat" />

      <Divider />
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.paper',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          ref={rootRef}
          sx={{
            bottom: 0,
            display: 'flex',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <LoadingDisabled
            loading={isLoading}
            inDiv={true}
          />

          <ChatSidebar
            container={rootRef.current}
            onClose={sidebar.handleClose}
            open={sidebar.open}
            contacts={contacts}
            accountId={accountId}
            rooms={rooms}
            currentRoomId={roomKey || currentRoomId}
            recipients={chatRecipient.recipients}
            onRecipientAdd={chatRecipient.handleRecipientAdd}
            onRecipientRefresh={chatRecipient.handleRecipientRefresh}
            onRoomsGet={handleRoomsGet}
            compose={compose}
          />

          <ChatContainer open={sidebar.open}>
            <Box sx={{ p: 1, m: 0 }}>
              <IconButton onClick={sidebar.handleToggle}>
                <SvgIcon>{MENU}</SvgIcon>
              </IconButton>

              {compose && currentRoomId && chatRecipient.showSave && (
                <IconBtnLoading
                  onClick={() => chatRecipient.handleSaveRecipientGroupName()}
                  btnOn={SAVE}
                  title={t(CHAT_LOCALE.chat.save)}
                />
              )}
            </Box>

            <Divider />

            {view === 'room' && (
              <ChatRoom
                roomKey={roomKey}
                currentRoomId={currentRoomId}
                contacts={contacts}
                accountId={accountId}
                avatar={avatar}
                rooms={rooms}
                roomNotify={roomNotify}
                onLoading={setLoading}
              />
            )}

            {view === 'compose' && (
              <ChatComposer
                accountId={accountId}
                currentRoomId={currentRoomId}
                avatar={avatar}
                rooms={rooms}
                recipients={chatRecipient.recipients}
                groupName={chatRecipient.groupName}
                onRecipientRemove={chatRecipient.handleRecipientRemove}
                onChangeGroupName={chatRecipient.handleChangeGroupName}
                onLoading={setLoading}
              />
            )}
            {view === 'blank' && <ChatBlank />}
          </ChatContainer>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Page;
