import { useEffect } from 'react';
import throttle from 'lodash/throttle';
import { nextPage } from 'src/helpers/next-page';
import { useDispatch } from 'src/store';
import { thunks } from 'src/thunks/chat';

export const useNextPage = (props) => {
  const dispatch = useDispatch();
  const { ref, data, others, handleNextPage, delay = 0, isInverter = false, visible } = props;

  useEffect(() => {
    const container = ref.current;
    container?.recalculate();
    const scrollElement = container?.getScrollElement();

    const scroll = () => {
      if (!isInverter ? scrollElement.scrollTop + scrollElement.clientHeight === scrollElement.scrollHeight : scrollElement.scrollTop === 0) {
        if (data) {
          const nxtPage = nextPage(data);

          if (nxtPage) {
            const lastScroll = {
              height: scrollElement.scrollHeight + 120,
              top: scrollElement.scrollTop,
            };
            handleNextPage({ currentPage: nxtPage, others, lastScroll });
          }
        }
      }

      if (isInverter) {
        const scrollSize = scrollElement.scrollHeight - scrollElement.clientHeight;

        if (!visible && scrollElement.scrollTop <= scrollSize - 100) {
          dispatch(thunks.setRoomNotify({ visible: true, newMessagesCount: 0 }));
        } else if (visible && scrollElement.scrollTop === scrollSize) {
          dispatch(thunks.setRoomNotify({ visible: false, newMessagesCount: 0 }));
        }
      }
    };

    const withThrottle = throttle(() => scroll(), delay);

    scrollElement?.addEventListener('scroll', withThrottle);

    return () => {
      scrollElement?.removeEventListener('scroll', withThrottle);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, data, visible]);
};
